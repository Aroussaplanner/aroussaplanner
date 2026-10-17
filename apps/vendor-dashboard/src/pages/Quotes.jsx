import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuotes } from '../hooks/useQuotes'
import { Header } from '../components/layout/Header'
import { Kaart } from '../components/ui/Kaart'
import { Badge } from '../components/ui/Badge'
import { Knop } from '../components/ui/Knop'
import { Invoerveld, Selectieveld, Tekstveld } from '../components/ui/Invoerveld'
import { formatDatum, formatEuro, statusKleur, statusLabel } from '../lib/utils'

const STATUS_OPTIES = ['concept', 'verstuurd', 'geaccepteerd', 'afgewezen', 'verlopen']

const EENHEDEN = ['p.p.', 'per uur', 'per dag', 'per stuk', 'totaal']

export function Quotes() {
  const { offertes, laadt, maakOfferte, updateOfferteStatus } = useQuotes()
  const [toonFormulier, setToonFormulier] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [filter, setFilter] = useState('alle')

  const [form, setForm] = useState({
    couple_name: '',
    email: '',
    event_date: '',
    location: '',
    guest_count: '',
    btw_percentage: '9',
    valid_until: '',
    notes: '',
  })

  const [regelItems, setRegelItems] = useState([
    { description: '', quantity: 1, unit: 'p.p.', unit_price: '', total: 0 }
  ])

  function handleWijziging(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function updateRegelItem(idx, veld, waarde) {
    setRegelItems(prev => {
      const nieuw = [...prev]
      nieuw[idx] = { ...nieuw[idx], [veld]: waarde }
      if (veld === 'quantity' || veld === 'unit_price') {
        const qty = veld === 'quantity' ? Number(waarde) : Number(nieuw[idx].quantity)
        const prijs = veld === 'unit_price' ? Number(waarde) : Number(nieuw[idx].unit_price)
        nieuw[idx].total = qty * prijs
      }
      return nieuw
    })
  }

  function voegRegelToe() {
    setRegelItems(prev => [...prev, { description: '', quantity: 1, unit: 'p.p.', unit_price: '', total: 0 }])
  }

  function verwijderRegel(idx) {
    setRegelItems(prev => prev.filter((_, i) => i !== idx))
  }

  const subtotaal = regelItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0)
  const btwBedrag = subtotaal * (Number(form.btw_percentage) / 100)
  const totaal = subtotaal + btwBedrag

  async function handleOpslaan(e) {
    e.preventDefault()
    setBezig(true)
    try {
      await maakOfferte(
        {
          ...form,
          guest_count: form.guest_count ? parseInt(form.guest_count) : null,
          event_date: form.event_date || null,
          valid_until: form.valid_until || null,
          btw_percentage: Number(form.btw_percentage),
          status: 'concept',
        },
        regelItems.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total: Number(item.total),
        }))
      )
      setToonFormulier(false)
      setForm({ couple_name: '', email: '', event_date: '', location: '', guest_count: '', btw_percentage: '9', valid_until: '', notes: '' })
      setRegelItems([{ description: '', quantity: 1, unit: 'p.p.', unit_price: '', total: 0 }])
    } catch (err) {
      alert('Fout: ' + err.message)
    }
    setBezig(false)
  }

  const gefilterd = filter === 'alle' ? offertes : offertes.filter(o => o.status === filter)

  return (
    <div>
      <Header
        titel="Offertes"
        subtitel={`${offertes.length} offertes totaal`}
        acties={
          <Knop onClick={() => setToonFormulier(true)}>+ Nieuwe offerte</Knop>
        }
      />

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['alle', ...STATUS_OPTIES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filter === s ? '#C4A882' : '#DDD6CC',
              background: filter === s ? '#C4A882' : 'transparent',
              color: filter === s ? '#fff' : '#8B7355',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {s === 'alle' ? 'Alle' : statusLabel(s)}
          </button>
        ))}
      </div>

      {/* Formulier */}
      {toonFormulier && (
        <Kaart stijl={{ marginBottom: '20px', border: '1px solid #C4A882' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#2D2520', marginTop: 0 }}>
            Nieuwe offerte
          </h3>
          <form onSubmit={handleOpslaan}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <Invoerveld label="Naam koppel" name="couple_name" value={form.couple_name} onChange={handleWijziging} verplicht />
              <Invoerveld label="E-mail" type="email" name="email" value={form.email} onChange={handleWijziging} verplicht />
              <Invoerveld label="Datum evenement" type="date" name="event_date" value={form.event_date} onChange={handleWijziging} />
              <Invoerveld label="Locatie" name="location" value={form.location} onChange={handleWijziging} />
              <Invoerveld label="Aantal gasten" type="number" name="guest_count" value={form.guest_count} onChange={handleWijziging} />
              <Invoerveld label="Geldig tot" type="date" name="valid_until" value={form.valid_until} onChange={handleWijziging} />
            </div>

            {/* Regelitems */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', fontWeight: '500', color: '#2D2520', marginBottom: '8px' }}>
                Arrangementregels
              </div>
              <div style={{ border: '1px solid #EDE6D6', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F7F2EA' }}>
                      {['Omschrijving', 'Aantal', 'Eenheid', 'Prijs', 'Totaal', ''].map(kop => (
                        <th key={kop} style={{
                          padding: '8px 12px',
                          fontFamily: 'Montserrat, sans-serif',
                          fontSize: '11px',
                          color: '#8B7355',
                          fontWeight: '500',
                          textAlign: 'left',
                          letterSpacing: '0.5px',
                        }}>
                          {kop}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {regelItems.map((item, idx) => (
                      <tr key={idx} style={{ borderTop: '1px solid #EDE6D6' }}>
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            value={item.description}
                            onChange={e => updateRegelItem(idx, 'description', e.target.value)}
                            placeholder="Omschrijving"
                            style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'Montserrat, sans-serif', fontSize: '13px', outline: 'none' }}
                          />
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e => updateRegelItem(idx, 'quantity', e.target.value)}
                            style={{ width: '60px', border: 'none', background: 'transparent', fontFamily: 'Montserrat, sans-serif', fontSize: '13px', outline: 'none' }}
                          />
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <select
                            value={item.unit}
                            onChange={e => updateRegelItem(idx, 'unit', e.target.value)}
                            style={{ border: 'none', background: 'transparent', fontFamily: 'Montserrat, sans-serif', fontSize: '13px' }}
                          >
                            {EENHEDEN.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={e => updateRegelItem(idx, 'unit_price', e.target.value)}
                            placeholder="0,00"
                            style={{ width: '80px', border: 'none', background: 'transparent', fontFamily: 'Montserrat, sans-serif', fontSize: '13px', outline: 'none' }}
                          />
                        </td>
                        <td style={{ padding: '6px 8px', fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: '#2D2520' }}>
                          {formatEuro(item.total)}
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          {regelItems.length > 1 && (
                            <button type="button" onClick={() => verwijderRegel(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '14px' }}>
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={voegRegelToe}
                style={{ marginTop: '8px', background: 'none', border: 'none', color: '#C4A882', fontFamily: 'Montserrat, sans-serif', fontSize: '12px', cursor: 'pointer' }}
              >
                + Regel toevoegen
              </button>
            </div>

            {/* Totalen */}
            <div style={{
              background: '#F7F2EA',
              borderRadius: '8px',
              padding: '14px 16px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              alignItems: 'flex-end',
            }}>
              <div style={{ display: 'flex', gap: '12px', fontFamily: 'Montserrat, sans-serif', fontSize: '12px' }}>
                <span style={{ color: '#8B7355' }}>Subtotaal:</span>
                <span style={{ color: '#2D2520', fontWeight: '500' }}>{formatEuro(subtotaal)}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontFamily: 'Montserrat, sans-serif', fontSize: '12px', alignItems: 'center' }}>
                <span style={{ color: '#8B7355' }}>
                  BTW
                  <input
                    type="number"
                    name="btw_percentage"
                    value={form.btw_percentage}
                    onChange={handleWijziging}
                    style={{ width: '40px', border: '1px solid #DDD6CC', borderRadius: '4px', padding: '2px 4px', marginLeft: '4px', fontSize: '12px' }}
                  />
                  %:
                </span>
                <span style={{ color: '#2D2520', fontWeight: '500' }}>{formatEuro(btwBedrag)}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontFamily: 'Montserrat, sans-serif', fontSize: '15px', borderTop: '1px solid #EDE6D6', paddingTop: '6px' }}>
                <span style={{ color: '#2D2520', fontWeight: '600' }}>Totaal:</span>
                <span style={{ color: '#C4A882', fontWeight: '700' }}>{formatEuro(totaal)}</span>
              </div>
            </div>

            <Tekstveld label="Opmerkingen" name="notes" value={form.notes} onChange={handleWijziging} placeholder="Extra informatie op de offerte..." />

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <Knop variant="secundair" onClick={() => setToonFormulier(false)}>Annuleren</Knop>
              <Knop type="submit" disabled={bezig}>{bezig ? 'Opslaan...' : 'Offerte opslaan'}</Knop>
            </div>
          </form>
        </Kaart>
      )}

      {/* Lijst */}
      {laadt ? (
        <div style={{ color: '#8B7355', fontFamily: 'Montserrat, sans-serif' }}>Laden...</div>
      ) : gefilterd.length === 0 ? (
        <Kaart>
          <p style={{ textAlign: 'center', color: '#8B7355', fontFamily: 'Montserrat, sans-serif', padding: '24px' }}>
            Geen offertes gevonden.
          </p>
        </Kaart>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {gefilterd.map(offerte => (
            <Kaart key={offerte.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: '600', color: '#2D2520' }}>
                      {offerte.couple_name}
                    </span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '11px', color: '#8B7355' }}>
                      {offerte.quote_number}
                    </span>
                    <Badge status={statusKleur(offerte.status)} label={statusLabel(offerte.status)} />
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: '#8B7355' }}>
                    {offerte.event_date && <span>📅 {formatDatum(offerte.event_date)}</span>}
                    {offerte.location && <span>📍 {offerte.location}</span>}
                    {offerte.guest_count && <span>👥 {offerte.guest_count} gasten</span>}
                    {offerte.valid_until && <span>⏱ Geldig tot {formatDatum(offerte.valid_until)}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: '600', color: '#2D2520' }}>
                    {formatEuro(offerte.total)}
                  </span>
                  <Selectieveld
                    value={offerte.status}
                    onChange={e => updateOfferteStatus(offerte.id, e.target.value)}
                  >
                    {STATUS_OPTIES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </Selectieveld>
                </div>
              </div>
            </Kaart>
          ))}
        </div>
      )}
    </div>
  )
}
