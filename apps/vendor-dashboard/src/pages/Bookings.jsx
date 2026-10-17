import { useState } from 'react'
import { useBookings } from '../hooks/useBookings'
import { useCosts } from '../hooks/useCosts'
import { Header } from '../components/layout/Header'
import { Kaart } from '../components/ui/Kaart'
import { Badge } from '../components/ui/Badge'
import { Knop } from '../components/ui/Knop'
import { Invoerveld, Selectieveld } from '../components/ui/Invoerveld'
import { formatDatum, formatEuro, statusKleur, statusLabel, berekenMarge } from '../lib/utils'

const BETALING_STATUS = ['openstaand', 'gedeeltelijk', 'betaald']
const KOSTEN_CATEGORIEEN = ['Personeel', 'Ingrediënten', 'Transport', 'Huur', 'Overig']

function KostenPanel({ boeking }) {
  const { kosten, totaalKosten, laadKosten, voegKostToe, verwijderKost } = useCosts(boeking.id)
  const [toonForm, setToonForm] = useState(false)
  const [form, setForm] = useState({ category: 'Personeel', description: '', amount: '' })
  const [geladen, setGeladen] = useState(false)

  if (!geladen) {
    laadKosten()
    setGeladen(true)
  }

  const omzet = Number(boeking.total_amount)
  const marge = berekenMarge(omzet, totaalKosten)

  async function handleToevoegen(e) {
    e.preventDefault()
    await voegKostToe({ ...form, amount: Number(form.amount) })
    setForm({ category: 'Personeel', description: '', amount: '' })
    setToonForm(false)
  }

  return (
    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #EDE6D6' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', fontWeight: '500', color: '#2D2520' }}>
          Kosten & Marge
        </span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: '#8B7355' }}>
            Omzet: {formatEuro(omzet)} · Kosten: {formatEuro(totaalKosten)} ·
            <span style={{ color: marge >= 30 ? '#065F46' : marge >= 15 ? '#92610A' : '#DC2626', fontWeight: '600', marginLeft: '4px' }}>
              Marge: {marge}%
            </span>
          </span>
          <Knop klein onClick={() => setToonForm(!toonForm)}>+ Kost toevoegen</Knop>
        </div>
      </div>

      {toonForm && (
        <form onSubmit={handleToevoegen} style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <Selectieveld
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
          >
            {KOSTEN_CATEGORIEEN.map(c => <option key={c} value={c}>{c}</option>)}
          </Selectieveld>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <Invoerveld
              placeholder="Omschrijving"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              verplicht
            />
          </div>
          <div style={{ width: '120px' }}>
            <Invoerveld
              type="number"
              step="0.01"
              placeholder="Bedrag"
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              verplicht
            />
          </div>
          <Knop type="submit" klein>Toevoegen</Knop>
        </form>
      )}

      {kosten.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {kosten.map(kost => (
            <div key={kost.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 10px',
              background: '#F7F2EA',
              borderRadius: '4px',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '12px',
            }}>
              <span style={{ color: '#8B7355' }}>{kost.category}</span>
              <span style={{ color: '#2D2520', flex: 1, marginLeft: '12px' }}>{kost.description}</span>
              <span style={{ color: '#2D2520', fontWeight: '500', marginRight: '10px' }}>{formatEuro(kost.amount)}</span>
              <button
                onClick={() => verwijderKost(kost.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '12px' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function Bookings() {
  const { boekingen, laadt, updateBoeking } = useBookings()
  const [uitgeklapt, setUitgeklapt] = useState(null)
  const [filter, setFilter] = useState('alle')

  const vandaag = new Date().toISOString().split('T')[0]
  const gefilterd = boekingen.filter(b => {
    if (filter === 'aankomend') return b.event_date >= vandaag
    if (filter === 'voorbij') return b.event_date < vandaag
    if (filter === 'onbetaald') return b.payment_status !== 'betaald'
    return true
  })

  const totaalOmzet = boekingen.reduce((sum, b) => sum + Number(b.total_amount), 0)
  const totaalBetaald = boekingen.reduce((sum, b) => sum + Number(b.paid_amount), 0)

  return (
    <div>
      <Header
        titel="Boekingen"
        subtitel={`${boekingen.length} boekingen · ${formatEuro(totaalOmzet)} totale omzet · ${formatEuro(totaalBetaald)} betaald`}
      />

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'alle', label: 'Alle' },
          { id: 'aankomend', label: 'Aankomend' },
          { id: 'voorbij', label: 'Voorbij' },
          { id: 'onbetaald', label: 'Onbetaald' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filter === f.id ? '#C4A882' : '#DDD6CC',
              background: filter === f.id ? '#C4A882' : 'transparent',
              color: filter === f.id ? '#fff' : '#8B7355',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {laadt ? (
        <div style={{ color: '#8B7355', fontFamily: 'Montserrat, sans-serif' }}>Laden...</div>
      ) : gefilterd.length === 0 ? (
        <Kaart>
          <p style={{ textAlign: 'center', color: '#8B7355', fontFamily: 'Montserrat, sans-serif', padding: '24px' }}>
            Geen boekingen gevonden.
          </p>
        </Kaart>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {gefilterd.map(boeking => (
            <Kaart key={boeking.id}>
              <div
                onClick={() => setUitgeklapt(uitgeklapt === boeking.id ? null : boeking.id)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: '600', color: '#2D2520' }}>
                        {boeking.couple_name}
                      </span>
                      <Badge status={statusKleur(boeking.payment_status)} label={statusLabel(boeking.payment_status)} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: '#8B7355' }}>
                      <span>📅 {formatDatum(boeking.event_date)}</span>
                      {boeking.location && <span>📍 {boeking.location}</span>}
                      {boeking.guest_count && <span>👥 {boeking.guest_count} gasten</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: '600', color: '#2D2520' }}>
                      {formatEuro(boeking.total_amount)}
                    </span>
                    <Selectieveld
                      value={boeking.payment_status}
                      onChange={e => {
                        e.stopPropagation()
                        updateBoeking(boeking.id, { payment_status: e.target.value })
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {BETALING_STATUS.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                    </Selectieveld>
                  </div>
                </div>
              </div>

              {uitgeklapt === boeking.id && (
                <KostenPanel boeking={boeking} />
              )}
            </Kaart>
          ))}
        </div>
      )}
    </div>
  )
}
