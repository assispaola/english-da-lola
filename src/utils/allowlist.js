// Client-side half of the access allowlist. The source of truth is the
// Firestore collection `allowed_users/{lowercased email}` — a document
// existing (any content) means that email may use the app. Firestore rules
// (firestore.rules) only let a signed-in user read their OWN doc in this
// collection (so this check works) and deny all writes from the client —
// the list itself is only editable from the Firebase console, never from
// app code. The SAME rules also gate every users/{uid} read/write server
// side, so this client check is a UX nicety (clear message, no wasted
// account), not the actual security boundary.
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

export async function isEmailAllowed(email) {
  if (!email) return false
  const ref = doc(db, 'allowed_users', email.toLowerCase())
  const snap = await getDoc(ref)
  return snap.exists()
}
