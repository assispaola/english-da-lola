import { useState } from 'react'
import { pushSettings } from '../utils/syncEngine'

// `syncSettingsKey`, when given, pushes every write to Firestore under
// users/{uid}/settings/{syncSettingsKey} (see syncEngine.js). Used for the
// handful of "single object" entities (next class, VIP session, metas) that
// aren't a list of items and so don't go through storage.js's createStore.
export function useLocalStorage(key, initialValue, syncSettingsKey) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
      if (syncSettingsKey) pushSettings(syncSettingsKey, valueToStore)
    } catch (error) {
      console.error('useLocalStorage error:', error)
    }
  }

  return [storedValue, setValue]
}
