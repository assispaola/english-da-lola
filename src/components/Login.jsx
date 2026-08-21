import { useState } from 'react'
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from '../utils/auth'
import WavyBackground from './WavyBackground'

const ERROR_MESSAGES = {
  'app/not-allowed': 'este app é de uso restrito — acesso não autorizado para este email.',
  'auth/email-already-in-use': 'já existe uma conta com este e-mail. Tente entrar.',
  'auth/invalid-email': 'e-mail inválido.',
  'auth/weak-password': 'a senha precisa ter pelo menos 6 caracteres.',
  'auth/invalid-credential': 'e-mail ou senha incorretos.',
  'auth/wrong-password': 'e-mail ou senha incorretos.',
  'auth/user-not-found': 'e-mail ou senha incorretos.',
  'auth/too-many-requests': 'muitas tentativas. Aguarde um pouco e tente de novo.',
}

function friendlyError(err) {
  return ERROR_MESSAGES[err?.code] || 'algo deu errado. Tente novamente.'
}

export default function Login({ initialNotice = '' }) {
  const [mode,     setMode]     = useState('login') // 'login' | 'signup' | 'forgot'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(initialNotice)
  const [info,     setInfo]     = useState('')

  const handleGoogle = async () => {
    setError(''); setInfo(''); setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError('Não foi possível entrar. Tente novamente.')
      console.error('Sign-in failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError(''); setInfo('')
    if (!email || !password) { setError('preencha e-mail e senha.'); return }
    setLoading(true)
    try {
      if (mode === 'signup') await signUpWithEmail(email, password)
      else await signInWithEmail(email, password)
    } catch (err) {
      setError(friendlyError(err))
      console.error('Email auth failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setError(''); setInfo('')
    if (!email) { setError('digite seu e-mail primeiro.'); return }
    setLoading(true)
    try {
      await resetPassword(email)
      setInfo('enviamos um link de redefinição de senha para o seu e-mail.')
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m) => { setMode(m); setError(''); setInfo(''); setPassword('') }

  return (
    <div className="flex h-screen items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#F8F9FA' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #E91E8C 0%, #FF9F1C 100%)', opacity: 0.06 }} />
      <div className="card p-8 max-w-sm w-full mx-4 text-center relative" style={{ borderColor: '#F8BBD0' }}>
        <p className="font-heading text-3xl leading-tight lowercase mb-1" style={{ fontWeight: 900, color: '#E91E8C' }}>
          english journey
        </p>
        <p className="font-body text-sm mb-6" style={{ color: '#9CA3AF' }}>
          {mode === 'forgot' ? 'digite seu e-mail para redefinir a senha' : 'entre para sincronizar seu progresso em qualquer dispositivo'}
        </p>

        {mode !== 'forgot' && (
          <>
            <button onClick={handleGoogle} disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 font-body font-semibold text-sm py-3 transition-all hover:scale-[1.02]"
              style={{ borderRadius: '10px', border: '1.5px solid #E5E7EB', backgroundColor: 'white', color: '#1A1A2E', minHeight: '48px' }}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05z"/>
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95L3.97 7.28C4.68 5.16 6.66 3.58 9 3.58z"/>
              </svg>
              {loading ? 'entrando…' : 'entrar com Google'}
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
              <span className="font-body text-xs" style={{ color: '#9CA3AF' }}>ou</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#E5E7EB' }} />
            </div>
          </>
        )}

        <form onSubmit={mode === 'forgot' ? handleForgot : handleEmailSubmit} className="flex flex-col gap-3 text-left">
          <input
            type="email"
            placeholder="e-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-field"
            autoComplete="email"
          />
          {mode !== 'forgot' && (
            <input
              type="password"
              placeholder="senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'aguarde…' : mode === 'signup' ? 'criar conta' : mode === 'forgot' ? 'enviar link' : 'entrar'}
          </button>
        </form>

        {error && <p className="font-body text-xs mt-3" style={{ color: '#DC2626' }}>{error}</p>}
        {info  && <p className="font-body text-xs mt-3" style={{ color: '#16A34A' }}>{info}</p>}

        <div className="font-body text-xs mt-5" style={{ color: '#9CA3AF' }}>
          {mode === 'login' && (
            <>
              <button onClick={() => switchMode('forgot')} className="underline" style={{ color: '#9CA3AF' }}>esqueci minha senha</button>
              <span className="mx-2">·</span>
              <button onClick={() => switchMode('signup')} className="underline" style={{ color: '#E91E8C' }}>criar conta</button>
            </>
          )}
          {mode === 'signup' && (
            <button onClick={() => switchMode('login')} className="underline" style={{ color: '#E91E8C' }}>já tenho conta, entrar</button>
          )}
          {mode === 'forgot' && (
            <button onClick={() => switchMode('login')} className="underline" style={{ color: '#E91E8C' }}>voltar para o login</button>
          )}
        </div>

        <p className="font-body text-xs mt-6" style={{ color: '#D1D5DB' }}>
          seus dados de hoje no localStorage são migrados automaticamente no primeiro login
        </p>
      </div>
      <WavyBackground color1="rgba(233,30,140,0.05)" color2="rgba(255,159,28,0.05)" />
    </div>
  )
}
