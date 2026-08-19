// Low-level Firestore read/write primitives for one user's data. Layout:
//
//   users/{uid}                          — profile: current_level, levels_unlocked, migratedAt
//   users/{uid}/{collection}/{id}        — flashcards, diario, glossario, notes, errorLog, attempts
//   users/{uid}/settings/{settingsKey}   — { value: ... } for nextClass, vipCurrent, vipSessions, metas
//   users/{uid}/roadmapProgress/{level}  — one doc per CEFR level
//
// Everything here is a thin wrapper; orchestration (debouncing, migration,
// retry) lives in syncEngine.js.

import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'

export function profileRef(uid) {
  return doc(db, 'users', uid)
}

export function collectionRef(uid, name) {
  return collection(db, 'users', uid, name)
}

export function itemRef(uid, name, id) {
  return doc(db, 'users', uid, name, String(id))
}

export function settingsRef(uid, settingsKey) {
  return doc(db, 'users', uid, 'settings', settingsKey)
}

export function roadmapRef(uid, level) {
  return doc(db, 'users', uid, 'roadmapProgress', level)
}

export async function getCollectionItems(uid, name) {
  const snap = await getDocs(collectionRef(uid, name))
  return snap.docs.map(d => d.data())
}

export async function setItem(uid, name, item) {
  await setDoc(itemRef(uid, name, item.id), item)
}

export async function removeItem(uid, name, id) {
  await deleteDoc(itemRef(uid, name, id))
}

export async function setItemsBatch(uid, name, items) {
  if (!items.length) return
  const batch = writeBatch(db)
  items.forEach(item => batch.set(itemRef(uid, name, item.id), item))
  await batch.commit()
}

export async function getDocData(ref) {
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}
