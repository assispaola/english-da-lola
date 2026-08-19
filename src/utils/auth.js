import {
  GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase'

const provider = new GoogleAuthProvider()

export function signInWithGoogle() {
  if (!isFirebaseConfigured) return Promise.reject(new Error('Firebase não configurado'))
  return signInWithPopup(auth, provider)
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
