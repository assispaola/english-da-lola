import {
  GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail,
  getAdditionalUserInfo, deleteUser,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase'
import { isEmailAllowed } from './allowlist'

const provider = new GoogleAuthProvider()

// Thrown (instead of a Firebase auth error) when the authenticated email
// isn't in the allowlist. Distinct `code` so Login.jsx can show a specific
// message instead of the generic Firebase-error mapping.
export class NotAllowedError extends Error {
  constructor() {
    super('This email is not authorized to use this app.')
    this.code = 'app/not-allowed'
  }
}

// Runs after EVERY sign-in/sign-up (Google or email/password): checks the
// authenticated email against the allowlist and, if it fails, undoes the
// sign-in before the app ever sees a signed-in user. A brand-new account
// (first Google sign-in, or a fresh email/password signup) gets deleted
// outright rather than left behind unauthorized; an existing-but-unlisted
// account is just signed back out.
async function enforceAllowlist(credential) {
  const user = credential.user
  const allowed = await isEmailAllowed(user.email)
  if (allowed) return credential

  const info = getAdditionalUserInfo(credential)
  if (info?.isNewUser) {
    try { await deleteUser(user) } catch { await signOut(auth) }
  } else {
    await signOut(auth)
  }
  throw new NotAllowedError()
}

export function signInWithGoogle() {
  if (!isFirebaseConfigured) return Promise.reject(new Error('Firebase não configurado'))
  return signInWithPopup(auth, provider).then(enforceAllowlist)
}

export function signUpWithEmail(email, password) {
  if (!isFirebaseConfigured) return Promise.reject(new Error('Firebase não configurado'))
  return createUserWithEmailAndPassword(auth, email, password).then(enforceAllowlist)
}

export function signInWithEmail(email, password) {
  if (!isFirebaseConfigured) return Promise.reject(new Error('Firebase não configurado'))
  return signInWithEmailAndPassword(auth, email, password).then(enforceAllowlist)
}

export function resetPassword(email) {
  if (!isFirebaseConfigured) return Promise.reject(new Error('Firebase não configurado'))
  return sendPasswordResetEmail(auth, email)
}

export function signOutUser() {
  if (!isFirebaseConfigured) return Promise.resolve()
  return signOut(auth)
}

// Calls cb(user | null) once immediately and again on every auth state
// change. Returns the unsubscribe function.
export function onAuthChange(cb) {
  if (!isFirebaseConfigured) { cb(null); return () => {} }
  return onAuthStateChanged(auth, cb)
}
