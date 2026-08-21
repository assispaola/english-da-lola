// Orchestrates cloud sync on top of cloudStore.js: debounced push on every
// write, one-time migration of pre-existing localStorage data, a full pull
// on login, and a localStorage-backed retry queue for offline writes.
//
// Local-first, not real-time: writes go to localStorage immediately (as
// before) and are pushed to Firestore in the background; the cloud is only
// pulled (and overwrites local) once, right after signing in. No onSnapshot
// listeners — this app is used on one device at a time, so a simple
// push/pull model avoids multi-tab/multi-device race conditions.

import { setDoc } from 'firebase/firestore'
import { isFirebaseConfigured } from '../firebase'
import * as cloud from './cloudStore'
import { LEVELS, DEFAULT_LEVEL } from './levels'

export const SYNCED_COLLECTIONS = {
  flashcards: 'ej_flashcards',
  diario: 'ej_diario',
  glossario: 'ej_glossario',
  notes: 'ej_notes',
  errorLog: 'ej_error_log',
  attempts: 'ej_attempts',
}

const SETTINGS_KEYS = {
  nextClass: 'ej_next_class',
  vipCurrent: 'ej_vip_current',
  vipSessions: 'ej_vip_sessions',
  metas: 'ej_metas',
}

let currentUid = null
export function setSyncUser(uid) { currentUid = uid }
export function getSyncUser() { return currentUid }

// Wipes every piece of synced/account-scoped local state. MUST run on
// sign-out, before another account can sign in on the same browser —
// otherwise the next login's migration step would read this account's
// leftover localStorage and push it into a DIFFERENT uid's Firestore data,
// or the new account would briefly render this account's data before its
// own pull finishes. Static/reseeded keys (ej_topics, ej_exercises) are
// left alone since they hold no user data and get overwritten on next read.
export function clearLocalData() {
  for (const storageKey of Object.values(SYNCED_COLLECTIONS)) localStorage.removeItem(storageKey)
  for (const storageKey of Object.values(SETTINGS_KEYS)) localStorage.removeItem(storageKey)
  for (const level of LEVELS) localStorage.removeItem(`ej_roadmap__${level}`)
  localStorage.removeItem('ej_roadmap')
  localStorage.removeItem('ej_current_level')
  localStorage.removeItem('ej_levels_unlocked')
  localStorage.removeItem(QUEUE_KEY)
  setSyncStatus('idle')
}

// ─── Sync status pub/sub — lets the UI show a discreet "salvando…" / "erro
// ao salvar" indicator instead of failing silently when offline. ─────────

let syncStatus = 'idle' // 'idle' | 'saving' | 'error'
const statusListeners = new Set()
let idleTimer = null

function setSyncStatus(status) {
  syncStatus = status
  statusListeners.forEach(cb => cb(status))
  clearTimeout(idleTimer)
  if (status === 'saved') {
    idleTimer = setTimeout(() => setSyncStatus('idle'), 2000)
  }
}

export function getSyncStatus() { return syncStatus }
export function onSyncStatusChange(cb) {
  statusListeners.add(cb)
  return () => statusListeners.delete(cb)
}

const QUEUE_KEY = 'ej_sync_queue'
function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { return [] }
}
function writeQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)) } catch {}
}
function queueRetry(op) {
  const q = readQueue()
  q.push(op)
  writeQueue(q)
  setSyncStatus('error')
}

export async function flushRetryQueue() {
  if (!isFirebaseConfigured || !currentUid) return
  const queue = readQueue()
  if (!queue.length) return
  writeQueue([])
  setSyncStatus('saving')
  let anyFailed = false
  for (const op of queue) {
    try {
      if (op.type === 'setItem') await cloud.setItem(currentUid, op.name, op.item)
      else if (op.type === 'removeItem') await cloud.removeItem(currentUid, op.name, op.id)
      else if (op.type === 'settings') await setDoc(cloud.settingsRef(currentUid, op.settingsKey), { value: op.value })
      else if (op.type === 'roadmap') await setDoc(cloud.roadmapRef(currentUid, op.level), op.roadmap)
    } catch {
      anyFailed = true
      queueRetry(op) // still offline/failing — keep for the next flush
    }
  }
  if (!anyFailed) setSyncStatus('saved')
}

export function retrySyncNow() {
  return flushRetryQueue()
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => flushRetryQueue())
}

// ─── Push (debounced per key so rapid edits collapse into one write) ────

const pushTimers = {}
function debounced(timerKey, fn, delay = 800) {
  clearTimeout(pushTimers[timerKey])
  pushTimers[timerKey] = setTimeout(fn, delay)
}

export function pushCollectionItem(name, item) {
  if (!isFirebaseConfigured || !currentUid) return
  debounced(`${name}:${item.id}`, () => {
    setSyncStatus('saving')
    cloud.setItem(currentUid, name, item)
      .then(() => setSyncStatus('saved'))
      .catch(() => queueRetry({ type: 'setItem', name, item }))
  })
}

export function pushCollectionRemove(name, id) {
  if (!isFirebaseConfigured || !currentUid) return
  setSyncStatus('saving')
  cloud.removeItem(currentUid, name, id)
    .then(() => setSyncStatus('saved'))
    .catch(() => queueRetry({ type: 'removeItem', name, id }))
}

export function pushSettings(settingsKey, value) {
  if (!isFirebaseConfigured || !currentUid) return
  debounced(`settings:${settingsKey}`, () => {
    setSyncStatus('saving')
    setDoc(cloud.settingsRef(currentUid, settingsKey), { value })
      .then(() => setSyncStatus('saved'))
      .catch(() => queueRetry({ type: 'settings', settingsKey, value }))
  })
}

export function pushRoadmap(level, roadmap) {
  if (!isFirebaseConfigured || !currentUid) return
  debounced(`roadmap:${level}`, () => {
    setSyncStatus('saving')
    setDoc(cloud.roadmapRef(currentUid, level), roadmap)
      .then(() => setSyncStatus('saved'))
      .catch(() => queueRetry({ type: 'roadmap', level, roadmap }))
  })
}

export function pushProfile(patch) {
  if (!isFirebaseConfigured || !currentUid) return
  setDoc(cloud.profileRef(currentUid), patch, { merge: true }).catch(() => {})
}

// ─── Pull (once, right after login — cloud overwrites local) ────────────

export async function pullAllFromCloud() {
  if (!isFirebaseConfigured || !currentUid) return

  for (const [name, storageKey] of Object.entries(SYNCED_COLLECTIONS)) {
    const items = await cloud.getCollectionItems(currentUid, name)
    if (items.length) localStorage.setItem(storageKey, JSON.stringify(items))
  }

  for (const [settingsKey, storageKey] of Object.entries(SETTINGS_KEYS)) {
    const data = await cloud.getDocData(cloud.settingsRef(currentUid, settingsKey))
    if (data) localStorage.setItem(storageKey, JSON.stringify(data.value))
  }

  for (const level of LEVELS) {
    const data = await cloud.getDocData(cloud.roadmapRef(currentUid, level))
    if (data) localStorage.setItem(`ej_roadmap__${level}`, JSON.stringify(data))
  }

  const profile = await cloud.getDocData(cloud.profileRef(currentUid))
  if (profile?.current_level) localStorage.setItem('ej_current_level', JSON.stringify(profile.current_level))
  if (profile?.levels_unlocked) localStorage.setItem('ej_levels_unlocked', JSON.stringify(profile.levels_unlocked))
}

// ─── One-time migration: push whatever's already in localStorage up to the
// cloud (tagging anything missing `level` as A1), then mark migratedAt so
// this never runs again and future logins just pull instead. ────────────

export async function migrateLocalToCloudIfNeeded() {
  if (!isFirebaseConfigured || !currentUid) return false
  const profile = await cloud.getDocData(cloud.profileRef(currentUid))
  if (profile?.migratedAt) return false

  for (const [name, storageKey] of Object.entries(SYNCED_COLLECTIONS)) {
    let items = []
    try { items = JSON.parse(localStorage.getItem(storageKey) || '[]') } catch {}
    if (!items.length) continue
    const tagged = items.map(item => item.level ? item : { ...item, level: DEFAULT_LEVEL })
    await cloud.setItemsBatch(currentUid, name, tagged)
  }

  for (const [settingsKey, storageKey] of Object.entries(SETTINGS_KEYS)) {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) await setDoc(cloud.settingsRef(currentUid, settingsKey), { value: JSON.parse(raw) })
    } catch {}
  }

  for (const level of LEVELS) {
    try {
      // A1 progress may still be under the legacy un-suffixed key if the
      // per-level key was never written (e.g. user never opened Roadmap).
      const raw = localStorage.getItem(`ej_roadmap__${level}`)
        || (level === DEFAULT_LEVEL ? localStorage.getItem('ej_roadmap') : null)
      if (raw) await setDoc(cloud.roadmapRef(currentUid, level), JSON.parse(raw))
    } catch {}
  }

  let currentLevel = DEFAULT_LEVEL, levelsUnlocked = [DEFAULT_LEVEL]
  try { currentLevel = JSON.parse(localStorage.getItem('ej_current_level')) || DEFAULT_LEVEL } catch {}
  try { levelsUnlocked = JSON.parse(localStorage.getItem('ej_levels_unlocked')) || [DEFAULT_LEVEL] } catch {}

  await setDoc(cloud.profileRef(currentUid), {
    current_level: currentLevel,
    levels_unlocked: levelsUnlocked,
    migratedAt: new Date().toISOString(),
  }, { merge: true })

  return true
}
