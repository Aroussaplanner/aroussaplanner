import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useVendor } from '../../context/VendorContext'
import { Invoerveld } from '../../components/ui/Invoerveld'
import { Knop } from '../../components/ui/Knop'
import { maakSlug } from '../../lib/utils'

const STAPPEN = ['Account', 'Bedrijf', 'Klaar']

export function Register() {
  const { user, laadt } = useVendor()
  const [stap, setStap] = useState(0)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')
  const [klaar, setKlaar] = useState(false)

  // Account gegevens
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [wachtwoordBevestig, setWachtwoordBevestig] = useState('')

  // Bedrijf gegevens
  const [bedrijfsnaam, setBedrijfsnaam] = useState('')
  const [kvkNummer, setKvkNummer] = useState('')
  const [telefoon, setTelefoon] = useState('')
  const [stad, setStad] = useState('')

  if (laadt) return null
  if (user && !klaar) return <Navigate to="/dashboard" replace />

  async function handleAccountAanmaken(e) {
    e.preventDefault()
    setFout('')

    if (wachtwoord !== wachtwoordBevestig) {
      setFout('Wachtwoorden komen niet overeen.')
      return
    }
    if (wachtwoord.length < 8) {
      setFout('Wachtwoord moet minimaal 8 tekens zijn.')
      return
    }
    setStap(1)
  }

  async function handleBedrijfAanmaken(e) {
    e.preventDefault()
    setFout('')
    setBezig(true)

    try {
      // 1. Maak auth account aan
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: wachtwoord,
      })

      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('Account aanmaken mislukt')

      // 2. Maak organisatie aan
      const slug = maakSlug(bedrijfsnaam)
      const { data: org, error: orgError } = await supabase
        .from('vendor_organizations')
        .insert({
          name: bedrijfsnaam,
          slug: slug + '-' + Date.now(),
          type: 'catering',
          kvk_number: kvkNummer || null,
          phone: telefoon || null,
          city: stad || null,
          email,
        })
        .select()
        .single()

      if (orgError) throw orgError

      // 3. Voeg toe als owner
      const { error: memberError } = await supabase
        .from('vendor_members')
        .insert({
          organization_id: org.id,
          user_id: userId,
          role: 'owner',
        })

      if (memberError) throw memberError

      setKlaar(true)
      setStap(2)

    } catch (err) {
      setFout(err.message || 'Er is een fout opgetreden. Probeer opnieuw.')
    }
    setBezig(false)
  }

  if (klaar) {
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
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '28px',
            color: '#2D2520',
            marginBottom: '12px',
          }}>
            Account aangemaakt!
          </h2>
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '13px',
            color: '#8B7355',
            marginBottom: '24px',
          }}>
            Controleer je e-mail om je account te bevestigen, dan kun je direct inloggen.
          </p>
          <Link to="/inloggen">
            <Knop volikontwikkeld>Naar inloggen</Knop>
          </Link>
        </div>
      </div>
    )
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
        maxWidth: '440px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            fontFamily: 'Italiana, serif',
            fontSize: '28px',
            color: '#C4A882',
          }}>
            Aroussa
          </div>
          <div style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '10px',
            color: '#8B7355',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}>
            Leveranciersdashboard
          </div>
        </div>

        {/* Stappen indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
          {STAPPEN.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: i <= stap ? '#C4A882' : '#EDE6D6',
                color: i <= stap ? '#fff' : '#8B7355',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                {i + 1}
              </div>
              {i < STAPPEN.length - 1 && (
                <div style={{
                  width: '32px',
                  height: '1px',
                  background: i < stap ? '#C4A882' : '#EDE6D6',
                }} />
              )}
            </div>
          ))}
        </div>

        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '24px',
          color: '#2D2520',
          margin: '0 0 20px',
          textAlign: 'center',
        }}>
          {stap === 0 ? 'Account aanmaken' : 'Bedrijfsgegevens'}
        </h2>

        {stap === 0 && (
          <form onSubmit={handleAccountAanmaken} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Invoerveld
              label="E-mailadres"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              verplicht
              placeholder="jouw@email.nl"
            />
            <Invoerveld
              label="Wachtwoord"
              type="password"
              value={wachtwoord}
              onChange={e => setWachtwoord(e.target.value)}
              verplicht
              placeholder="Minimaal 8 tekens"
            />
            <Invoerveld
              label="Wachtwoord bevestigen"
              type="password"
              value={wachtwoordBevestig}
              onChange={e => setWachtwoordBevestig(e.target.value)}
              verplicht
              placeholder="Herhaal wachtwoord"
            />

            {fout && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#DC2626',
                fontFamily: 'Montserrat, sans-serif',
              }}>
                {fout}
              </div>
            )}

            <Knop type="submit" volikontwikkeld>
              Volgende →
            </Knop>
          </form>
        )}

        {stap === 1 && (
          <form onSubmit={handleBedrijfAanmaken} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Invoerveld
              label="Bedrijfsnaam"
              value={bedrijfsnaam}
              onChange={e => setBedrijfsnaam(e.target.value)}
              verplicht
              placeholder="Naam van je cateringbedrijf"
            />
            <Invoerveld
              label="KVK-nummer"
              value={kvkNummer}
              onChange={e => setKvkNummer(e.target.value)}
              placeholder="12345678"
            />
            <Invoerveld
              label="Telefoon"
              type="tel"
              value={telefoon}
              onChange={e => setTelefoon(e.target.value)}
              placeholder="06-12345678"
            />
            <Invoerveld
              label="Stad"
              value={stad}
              onChange={e => setStad(e.target.value)}
              placeholder="Amsterdam"
            />

            {fout && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#DC2626',
                fontFamily: 'Montserrat, sans-serif',
              }}>
                {fout}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <Knop variant="secundair" onClick={() => setStap(0)}>
                ← Terug
              </Knop>
              <Knop type="submit" disabled={bezig} volikontwikkeld>
                {bezig ? 'Account aanmaken...' : 'Registreren'}
              </Knop>
            </div>
          </form>
        )}

        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '12px',
          color: '#8B7355',
        }}>
          Al een account?{' '}
          <Link to="/inloggen" style={{ color: '#C4A882', fontWeight: '500' }}>
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  )
}
