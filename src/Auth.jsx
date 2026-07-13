import { useState } from 'react'
import { supabase } from './supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modo, setModo] = useState('login') // 'login' | 'registro'
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email || !password) { setError('Ingresa tu correo y contraseña.'); return }
    setCargando(true); setError(''); setMensaje('')
    try {
      if (modo === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : error.message)
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
        else setMensaje('¡Cuenta creada! Ya puedes iniciar sesión.')
      }
    } catch (e) {
      setError('Error inesperado. Intenta de nuevo.')
    }
    setCargando(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F1F3EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=IBM+Plex+Sans:wght@400;500&display=swap');`}</style>
      <div style={{ background: 'white', borderRadius: 16, padding: 40, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2F5D50', fontWeight: 600, marginBottom: 4 }}>Finanzas personales</div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, margin: '0 0 24px', color: '#1F2E28' }}>Eliana Posada</h1>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button onClick={() => setModo('login')} style={{ flex: 1, padding: '8px 0', borderRadius: 999, border: '1px solid', borderColor: modo === 'login' ? '#2F5D50' : '#D8DCCF', background: modo === 'login' ? '#2F5D50' : 'white', color: modo === 'login' ? 'white' : '#55605A', cursor: 'pointer', fontSize: 13 }}>Iniciar sesión</button>
          <button onClick={() => setModo('registro')} style={{ flex: 1, padding: '8px 0', borderRadius: 999, border: '1px solid', borderColor: modo === 'registro' ? '#2F5D50' : '#D8DCCF', background: modo === 'registro' ? '#2F5D50' : 'white', color: modo === 'registro' ? 'white' : '#55605A', cursor: 'pointer', fontSize: 13 }}>Crear cuenta</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#55605A' }}>
            Correo electrónico
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="tu@correo.com" style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #D8DCCF', fontSize: 14, fontFamily: 'inherit' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#55605A' }}>
            Contraseña
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="Mínimo 6 caracteres" style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #D8DCCF', fontSize: 14, fontFamily: 'inherit' }} />
          </label>
          {error && <div style={{ background: '#F7E3DF', border: '1px solid #A34A3D', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#A34A3D' }}>{error}</div>}
          {mensaje && <div style={{ background: '#DCE6DE', border: '1px solid #2F5D50', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#2F5D50' }}>{mensaje}</div>}
          <button onClick={handleSubmit} disabled={cargando} style={{ background: '#2F5D50', color: 'white', border: 'none', padding: '11px 0', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: cargando ? 'not-allowed' : 'pointer', opacity: cargando ? 0.7 : 1 }}>
            {cargando ? 'Cargando…' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </div>
        <div style={{ marginTop: 20, fontSize: 11, color: '#9AA398', textAlign: 'center' }}>Tus datos se guardan de forma privada y segura en la nube.</div>
      </div>
    </div>
  )
}
