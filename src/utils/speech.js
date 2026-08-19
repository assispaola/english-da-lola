// Thin wrapper over the browser's Web Speech API (speechSynthesis) — no
// external service, works fully offline/client-side.

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speakEnglish(text) {
  if (!isSpeechSupported() || !text) return
  window.speechSynthesis.cancel() // stop any utterance already in progress
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
}
