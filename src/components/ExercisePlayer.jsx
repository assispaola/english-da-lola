import { useState, useEffect, useMemo, useRef } from 'react'
import { Check, X, ArrowRight, Clock, RotateCcw, SkipForward } from 'lucide-react'
import { COLOR_SETS } from '../utils/colors'
import { addAttempt } from '../utils/attempts'
import { recordErrorOccurrence } from '../utils/errorLog'
import { findRoadmapTopic } from '../data/roadmapData'
import { checkAnswer, shuffle } from '../utils/exerciseEngine'

const pc = COLOR_SETS.b1 // brand pink

const TYPE_LABELS = {
  'multipla-escolha': 'múltipla escolha',
  'fill-blank':        'complete a frase',
  'reorder':           'organize a frase',
  'matching':          'associe',
  'correction':        'correção',
  'listening':         'listening',
}

const SUPPORTED_TYPES = ['multipla-escolha', 'fill-blank', 'reorder']

function errorTypeForTopic(topic) {
  if (!topic) return 'gramática'
  if (topic.category === 'Fala') return 'pronúncia'
  if (topic.category === 'Vocabulário') return 'vocabulário'
  return 'gramática'
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function DifficultyDots({ level }) {
  return (
    <span className="inline-flex gap-0.5 items-center" aria-label={`dificuldade ${level}`}>
      {[1, 2, 3].map(n => (
        <span key={n} style={{
          width: 6, height: 6, borderRadius: '50%',
          backgroundColor: n <= level ? pc.primary : '#F3D4E4',
          display: 'inline-block',
        }} />
      ))}
    </span>
  )
}

function MultipleChoice({ exercise, value, onChange, disabled }) {
  return (
    <div className="space-y-2.5 mt-5">
      {(exercise.options || []).map((opt, i) => {
        const selected = value === opt
        return (
          <button key={i} disabled={disabled} onClick={() => onChange(opt)}
            className="w-full text-left px-4 py-3 font-body text-sm transition-all"
            style={{
              borderRadius: '12px',
              border: `2px solid ${selected ? pc.primary : '#F8BBD0'}`,
              backgroundColor: selected ? pc.accent : 'white',
              color: selected ? pc.text : '#1A1A2E',
              fontWeight: selected ? 700 : 500,
              cursor: disabled ? 'default' : 'pointer',
            }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function FillBlank({ value, onChange, disabled, onSubmit }) {
  return (
    <div className="mt-5">
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSubmit() }}
        placeholder="digite sua resposta…"
        className="input-field text-center font-body text-base"
        autoFocus
      />
    </div>
  )
}

function ReorderWords({ exercise, tokens, setTokens, disabled }) {
  const { bank, answer } = tokens

  const addToAnswer = (token) => {
    if (disabled) return
    setTokens(t => ({ bank: t.bank.filter(x => x.id !== token.id), answer: [...t.answer, token] }))
  }
  const removeFromAnswer = (token) => {
    if (disabled) return
    setTokens(t => ({ answer: t.answer.filter(x => x.id !== token.id), bank: [...t.bank, token] }))
  }

  const dragToken = (e, token, from) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: token.id, from }))
  }
  const allowDrop = (e) => e.preventDefault()
  const dropOn = (zone) => (e) => {
    e.preventDefault()
    if (disabled) return
    try {
      const { id, from } = JSON.parse(e.dataTransfer.getData('text/plain'))
      if (from === zone) return
      if (zone === 'answer') {
        const token = bank.find(x => x.id === id)
        if (token) addToAnswer(token)
      } else {
        const token = answer.find(x => x.id === id)
        if (token) removeFromAnswer(token)
      }
    } catch {}
  }

  return (
    <div className="mt-5">
      <div
        onDragOver={allowDrop}
        onDrop={dropOn('answer')}
        className="flex flex-wrap gap-2 p-3 min-h-[56px]"
        style={{ borderRadius: '12px', border: `2px dashed ${pc.border}`, backgroundColor: pc.accent }}>
        {answer.length === 0 && (
          <span className="font-body text-xs self-center" style={{ color: '#9CA3AF' }}>
            arraste ou toque nas palavras abaixo para montar a frase
          </span>
        )}
        {answer.map(token => (
          <button key={token.id} draggable={!disabled}
            onDragStart={(e) => dragToken(e, token, 'answer')}
            onClick={() => removeFromAnswer(token)}
            className="px-3 py-1.5 font-body text-sm font-semibold transition-all"
            style={{ borderRadius: '8px', backgroundColor: 'white', border: `2px solid ${pc.primary}`, color: pc.primary, cursor: disabled ? 'default' : 'grab' }}>
            {token.word}
          </button>
        ))}
      </div>

      <div
        onDragOver={allowDrop}
        onDrop={dropOn('bank')}
        className="flex flex-wrap gap-2 mt-3 p-3 min-h-[56px]"
        style={{ borderRadius: '12px', border: '2px solid #F3F4F6', backgroundColor: '#FAFAFA' }}>
        {bank.map(token => (
          <button key={token.id} draggable={!disabled}
            onDragStart={(e) => dragToken(e, token, 'bank')}
            onClick={() => addToAnswer(token)}
            className="px-3 py-1.5 font-body text-sm font-semibold transition-all hover:scale-[1.03]"
            style={{ borderRadius: '8px', backgroundColor: 'white', border: '2px solid #E5E7EB', color: '#1A1A2E', cursor: disabled ? 'default' : 'grab' }}>
            {token.word}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ExercisePlayer({ exercises, onExit }) {
  const [index,       setIndex]       = useState(0)
  const [selected,    setSelected]    = useState(null)   // MC/fill-blank draft answer
  const [tokens,      setTokens]      = useState({ bank: [], answer: [] }) // reorder draft
  const [feedback,    setFeedback]    = useState(null)    // { correct, message }
  const [correctCount, setCorrectCount] = useState(0)
  const [reviewTopicIds, setReviewTopicIds] = useState([])
  const [done,         setDone]        = useState(false)
  const startTimeRef = useRef(Date.now())
  const [endTime,      setEndTime]     = useState(null)

  const exercise = exercises[index]
  const isReorder = exercise?.type === 'reorder'
  const supported = exercise && SUPPORTED_TYPES.includes(exercise.type)

  useEffect(() => {
    if (!exercise) return
    setSelected(exercise.type === 'fill-blank' ? '' : null)
    setFeedback(null)
    if (exercise.type === 'reorder') {
      const words = Array.isArray(exercise.correctAnswer)
        ? exercise.correctAnswer
        : String(exercise.correctAnswer ?? '').split(' ')
      const bank = shuffle(words.map((word, i) => ({ id: `${exercise.id}-${i}`, word })))
      setTokens({ bank, answer: [] })
    }
  }, [exercise])

  const canSubmit = !exercise ? false
    : exercise.type === 'fill-blank' ? String(selected ?? '').trim().length > 0
    : exercise.type === 'multipla-escolha' ? selected !== null
    : exercise.type === 'reorder' ? tokens.bank.length === 0 && tokens.answer.length > 0
    : false

  const submitAnswer = () => {
    if (!exercise || feedback) return
    const userAnswer = exercise.type === 'reorder' ? tokens.answer.map(t => t.word) : selected
    const correct = checkAnswer(exercise, userAnswer)

    addAttempt({ exerciseId: exercise.id, userAnswer, correct, level: exercise.level })

    if (correct) {
      setCorrectCount(c => c + 1)
    } else {
      const topic = exercise.topicId ? findRoadmapTopic(exercise.topicId, exercise.level) : null
      recordErrorOccurrence({
        description: exercise.question || 'erro em exercício',
        type: errorTypeForTopic(topic),
        topicId: exercise.topicId || null,
        level: exercise.level,
      })
      if (exercise.topicId) setReviewTopicIds(ids => [...ids, { topicId: exercise.topicId, level: exercise.level }])
    }

    setFeedback({
      correct,
      message: exercise.explanation || (correct ? 'Boa!' : `Resposta correta: ${
        Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer.join(' ') : exercise.correctAnswer
      }`),
    })
  }

  const goNext = () => {
    if (index + 1 < exercises.length) {
      setIndex(i => i + 1)
    } else {
      setEndTime(Date.now())
      setDone(true)
    }
  }

  const skipUnsupported = () => goNext()

  const restart = () => {
    setIndex(0); setSelected(null); setTokens({ bank: [], answer: [] }); setFeedback(null)
    setCorrectCount(0); setReviewTopicIds([]); setDone(false)
    startTimeRef.current = Date.now(); setEndTime(null)
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-4">📝</div>
        <p className="font-heading text-xl lowercase" style={{ color: '#D1D5DB', fontWeight: 500 }}>nenhum exercício disponível</p>
      </div>
    )
  }

  /* ── Summary screen ── */
  if (done) {
    const total = exercises.length
    const timeSpent = formatTime((endTime ?? Date.now()) - startTimeRef.current)
    const reviewCounts = new Map()
    reviewTopicIds.forEach(({ topicId, level }) => {
      const key = `${topicId}__${level}`
      const prev = reviewCounts.get(key)
      reviewCounts.set(key, { topicId, level, count: (prev?.count || 0) + 1 })
    })
    const topicsToReview = [...reviewCounts.values()].map(({ topicId, level, count }) => ({
      id: topicId, count, topic: findRoadmapTopic(topicId, level),
    }))

    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="card p-8">
          <div className="text-6xl mb-4">{correctCount === total ? '🏆' : '📊'}</div>
          <h2 className="font-heading text-2xl mb-1 lowercase" style={{ color: pc.secondary, fontWeight: 700 }}>resumo do treino</h2>
          <p className="font-body mb-6" style={{ color: '#9CA3AF' }}>
            <Clock size={13} className="inline -mt-0.5 mr-1" /> tempo: {timeSpent}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-xl p-4" style={{ backgroundColor: '#D1FAE5' }}>
              <div className="font-heading text-3xl" style={{ color: '#059669' }}>{correctCount}/{total}</div>
              <div className="text-xs font-body mt-0.5" style={{ color: '#059669' }}>corretas</div>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: pc.accent }}>
              <div className="font-heading text-3xl" style={{ color: pc.primary }}>{Math.round((correctCount / total) * 100)}%</div>
              <div className="text-xs font-body mt-0.5" style={{ color: pc.text }}>aproveitamento</div>
            </div>
          </div>

          {topicsToReview.length > 0 && (
            <div className="text-left mb-6">
              <p className="font-heading text-sm mb-2 lowercase" style={{ color: '#1A1A2E', fontWeight: 700 }}>tópicos para revisar</p>
              <div className="space-y-1.5">
                {topicsToReview.map(({ id, count, topic }) => (
                  <div key={id} className="flex items-center justify-between px-3 py-2" style={{ borderRadius: '10px', backgroundColor: '#FEF3C7' }}>
                    <span className="font-body text-sm" style={{ color: '#92400E' }}>{topic?.title || 'tópico removido'}</span>
                    <span className="pill" style={{ backgroundColor: '#FDE68A', color: '#92400E' }}>{count} erro{count > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={restart} className="btn-secondary flex-1 justify-center"><RotateCcw size={14} /> refazer</button>
            {onExit && <button onClick={onExit} className="btn-primary flex-1 justify-center">concluir</button>}
          </div>
        </div>
      </div>
    )
  }

  /* ── Player screen ── */
  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-3">
        {onExit
          ? <button onClick={onExit} className="btn-secondary text-sm py-2 px-4">← sair</button>
          : <span />}
        <span className="font-body text-sm" style={{ color: '#9CA3AF' }}>{index + 1} / {exercises.length}</span>
      </div>

      <div className="progress-track mb-6">
        <div className="progress-fill" style={{ width: `${(index / exercises.length) * 100}%` }} />
      </div>

      <div className="card p-6" style={{ borderColor: pc.border }}>
        <div className="flex items-center justify-between mb-3">
          <span className="pill" style={{ backgroundColor: pc.accent, color: pc.text }}>
            {TYPE_LABELS[exercise.type] || exercise.type}
          </span>
          <DifficultyDots level={exercise.difficulty || 1} />
        </div>

        <p className="font-heading text-xl" style={{ color: '#1A1A2E', fontWeight: 500 }}>{exercise.question}</p>

        {!supported ? (
          <div className="mt-6 text-center py-6">
            <p className="font-body text-sm" style={{ color: '#9CA3AF' }}>
              este tipo de exercício ({TYPE_LABELS[exercise.type] || exercise.type}) ainda não é suportado pelo player.
            </p>
            <button onClick={skipUnsupported} className="btn-secondary mt-4">
              <SkipForward size={14} /> pular
            </button>
          </div>
        ) : (
          <>
            {exercise.type === 'multipla-escolha' && (
              <MultipleChoice exercise={exercise} value={selected} onChange={setSelected} disabled={!!feedback} />
            )}
            {exercise.type === 'fill-blank' && (
              <FillBlank value={selected ?? ''} onChange={setSelected} disabled={!!feedback} onSubmit={submitAnswer} />
            )}
            {isReorder && (
              <ReorderWords exercise={exercise} tokens={tokens} setTokens={setTokens} disabled={!!feedback} />
            )}

            {feedback && (
              <div className="mt-5 p-4 flex items-start gap-3" style={{
                borderRadius: '12px',
                backgroundColor: feedback.correct ? '#D1FAE5' : '#FEE2E2',
                border: `2px solid ${feedback.correct ? '#A7F3D0' : '#FECACA'}`,
              }}>
                <div className="flex-shrink-0 mt-0.5" style={{ color: feedback.correct ? '#059669' : '#DC2626' }}>
                  {feedback.correct ? <Check size={18} /> : <X size={18} />}
                </div>
                <div>
                  <p className="font-heading text-sm lowercase" style={{ color: feedback.correct ? '#059669' : '#DC2626', fontWeight: 700 }}>
                    {feedback.correct ? 'certo!' : 'errado'}
                  </p>
                  <p className="font-body text-sm mt-0.5" style={{ color: feedback.correct ? '#065F46' : '#991B1B' }}>{feedback.message}</p>
                </div>
              </div>
            )}

            <div className="mt-5">
              {!feedback ? (
                <button onClick={submitAnswer} disabled={!canSubmit} className="btn-primary w-full justify-center">
                  responder
                </button>
              ) : (
                <button onClick={goNext} className="btn-primary w-full justify-center">
                  {index + 1 < exercises.length ? <>próxima <ArrowRight size={14} /></> : 'ver resumo'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
