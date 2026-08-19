// Answer-checking logic for the Exercise Player, kept separate from the UI
// so each exercise type's validation rule can be tested/reused independently.

export function normalize(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// fill-blank accepts either an exact string or a "/pattern/flags" regex string.
function checkFillBlank(correctAnswer, userAnswer) {
  const raw = String(correctAnswer ?? '')
  const regexMatch = raw.match(/^\/(.*)\/([a-z]*)$/i)
  if (regexMatch) {
    try {
      return new RegExp(regexMatch[1], regexMatch[2]).test(String(userAnswer ?? '').trim())
    } catch {
      return false
    }
  }
  return normalize(userAnswer) === normalize(correctAnswer)
}

function checkReorder(correctAnswer, userAnswer) {
  const target = Array.isArray(correctAnswer) ? correctAnswer : String(correctAnswer ?? '').split(' ')
  const given  = Array.isArray(userAnswer) ? userAnswer : []
  if (target.length !== given.length) return false
  return target.every((word, i) => normalize(word) === normalize(given[i]))
}

export function checkAnswer(exercise, userAnswer) {
  switch (exercise.type) {
    case 'fill-blank':
      return checkFillBlank(exercise.correctAnswer, userAnswer)
    case 'reorder':
      return checkReorder(exercise.correctAnswer, userAnswer)
    case 'multipla-escolha':
    default:
      return normalize(userAnswer) === normalize(exercise.correctAnswer)
  }
}
