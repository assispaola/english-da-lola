// Firebase app init. Config comes from Vite env vars (see .env.example) —
// never hardcode real keys here. These values are safe to ship in the
// client bundle by Firebase's own design (they identify the project, they
// don't grant access); real security comes from firestore.rules.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Cloud sync silently no-ops when the app isn't configured (e.g. a fresh
// clone without a .env yet) instead of crashing the whole app.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export const app  = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
export const auth = isFirebaseConfigured ? getAuth(app) : null
export const db   = isFirebaseConfigured ? getFirestore(app) : null
