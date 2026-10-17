import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useVendor } from '../../context/VendorContext'
import { Invoerveld } from '../../components/ui/Invoerveld'
import { Knop } from '../../components/ui/Knop'

export function Login() {
  const { user, laadt } = useVendor()
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')

  if (laadt) return null
  if (user) return <Navigate to="/dashboard" replace />

  async function handleInloggen(e) {
    e.preventDefault()
    setBezig(true)
    setFout('')

    const { error } = await supabase.auth.signInWithPassword({ email, password: wachtwoord })

    if (error) {
      setFout('Onjuist e-mailadres of wachtwoord.')
    }
    setBezig(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1A1210',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: '#F7F2EA',
        borderRadius: '16px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            fontFamily: 'Italiana, serif',
            fontSize: '32px',
            color: '#C4A882',
            letterSpacing: '2px',
          }}>
            Aroussa
          </div>
          <div style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '11px',
            color: '#8B7355',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginTop: '4px',
          }}>
            Leveranciersdashboard
          </div>
        </div>

        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '24px',
          fontWeight: '600',
          color: '#2D2520',
          margin: '0 0 24px',
          textAlign: 'center',
        }}>
          Inloggen
        </h2>

        <form onSubmit={handleInloggen} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Invoerveld
            label="E-mailadres"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            verplicht
            autoComplete="email"
            placeholder="jouw@email.nl"
          />
          <Invoerveld
            label="Wachtwoord"
            type="password"
            value={wachtwoord}
            onChange={e => setWachtwoord(e.target.value)}
            verplicht
            autoComplete="current-password"
            placeholder="••••••••"
          />

          {fout && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              padding: '10px 14px',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '12px',
              color: '#DC2626',
            }}>
              {fout}
            </div>
          )}

          <Knop type="submit" disabled={bezig} volikontwikkeld>
            {bezig ? 'Bezig...' : 'Inloggen'}
          </Knop>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '12px',
          color: '#8B7355',
        }}>
          Nog geen account?{' '}
          <Link to="/registreren" style={{ color: '#C4A882', fontWeight: '500' }}>
            Registreer hier
          </Link>
        </p>
      </div>
    </div>
  )
}
