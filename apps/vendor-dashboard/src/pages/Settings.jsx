import { useState } from 'react'
import { useVendor } from '../context/VendorContext'
import { supabase } from '../lib/supabase'
import { Header } from '../components/layout/Header'
import { Kaart } from '../components/ui/Kaart'
import { Invoerveld } from '../components/ui/Invoerveld'
import { Knop } from '../components/ui/Knop'

export function Settings() {
  const { organisatie, user } = useVendor()
  const [bezig, setBezig] = useState(false)
  const [opgeslagen, setOpgeslagen] = useState(false)

  const [form, setForm] = useState({
    name: organisatie?.name || '',
    email: organisatie?.email || '',
    phone: organisatie?.phone || '',
    city: organisatie?.city || '',
    kvk_number: organisatie?.kvk_number || '',
  })

  function handleWijziging(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleOpslaan(e) {
    e.preventDefault()
    if (!organisatie) return
    setBezig(true)
    setOpgeslagen(false)

    const { error } = await supabase
      .from('vendor_organizations')
      .update({
        ...form,
        updated_at: new Date().toISOString(),
      })
      .eq('id', organisatie.id)

    if (!error) setOpgeslagen(true)
    setBezig(false)
  }

  return (
    <div>
      <Header
        titel="Instellingen"
        subtitel="Beheer je bedrijfsgegevens"
      />

      <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
        {/* Bedrijfsgegevens */}
        <Kaart>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#2D2520', marginTop: 0 }}>
            Bedrijfsgegevens
          </h3>
          <form onSubmit={handleOpslaan} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Invoerveld
              label="Bedrijfsnaam"
              name="name"
              value={form.name}
              onChange={handleWijziging}
              verplicht
            />
            <Invoerveld
              label="E-mailadres bedrijf"
              type="email"
              name="email"
              value={form.email}
              onChange={handleWijziging}
            />
            <Invoerveld
              label="Telefoon"
              name="phone"
              value={form.phone}
              onChange={handleWijziging}
            />
            <Invoerveld
              label="Stad"
              name="city"
              value={form.city}
              onChange={handleWijziging}
            />
            <Invoerveld
              label="KVK-nummer"
              name="kvk_number"
              value={form.kvk_number}
              onChange={handleWijziging}
            />

            {opgeslagen && (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '6px',
                padding: '10px 14px',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '12px',
                color: '#065F46',
              }}>
                ✓ Gegevens opgeslagen
              </div>
            )}

            <Knop type="submit" disabled={bezig}>
              {bezig ? 'Opslaan...' : 'Opslaan'}
            </Knop>
          </form>
        </Kaart>

        {/* Account info */}
        <Kaart>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#2D2520', marginTop: 0 }}>
            Account
          </h3>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: '#8B7355' }}>
            <p>Ingelogd als: <strong style={{ color: '#2D2520' }}>{user?.email}</strong></p>
            <p style={{ fontSize: '11px', marginTop: '8px' }}>
              Om je wachtwoord te wijzigen, log uit en gebruik de "Wachtwoord vergeten" optie.
            </p>
          </div>
        </Kaart>

        {/* Tikkie info */}
        <Kaart>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#2D2520', marginTop: 0 }}>
            Betalingen
          </h3>
          <div style={{
            background: '#FEF9EC',
            border: '1px solid #FDE68A',
            borderRadius: '8px',
            padding: '14px 16px',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '13px',
            color: '#92610A',
          }}>
            <strong>Tikkie</strong> is de betaalmethode van Aroussa. Stuur betalingsverzoeken direct via de Tikkie-app aan je klanten.
          </div>
        </Kaart>
      </div>
    </div>
  )
}
