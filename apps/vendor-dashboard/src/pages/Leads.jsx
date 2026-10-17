import { useState } from 'react'
import { useLeads } from '../hooks/useLeads'
import { Header } from '../components/layout/Header'
import { Kaart } from '../components/ui/Kaart'
import { Badge } from '../components/ui/Badge'
import { Knop } from '../components/ui/Knop'
import { Invoerveld, Selectieveld, Tekstveld } from '../components/ui/Invoerveld'
import { formatDatum, statusKleur, statusLabel } from '../lib/utils'

const STATUS_OPTIES = ['nieuw', 'in_behandeling', 'offerte_verstuurd', 'gewonnen', 'verloren']

export function Leads() {
  const { leads, laadt, maakLead, updateLead, verwijderLead } = useLeads()
  const [toonFormulier, setToonFormulier] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [geselecteerd, setGeselecteerd] = useState(null)
  const [filter, setFilter] = useState('alle')

  const [form, setForm] = useState({
    couple_name: '',
    email: '',
    phone: '',
    event_date: '',
    location: '',
    guest_count: '',
    budget_range: '',
    wishes: '',
    status: 'nieuw',
  })

  function handleWijziging(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleOpslaan(e) {
    e.preventDefault()
    setBezig(true)
    try {
      await maakLead({
        ...form,
        guest_count: form.guest_count ? parseInt(form.guest_count) : null,
        event_date: form.event_date || null,
      })
      setToonFormulier(false)
      setForm({ couple_name: '', email: '', phone: '', event_date: '', location: '', guest_count: '', budget_range: '', wishes: '', status: 'nieuw' })
    } catch (err) {
      alert('Fout: ' + err.message)
    }
    setBezig(false)
  }

  async function handleStatusWijziging(id, status) {
    await updateLead(id, { status })
  }

  const gefilterd = filter === 'alle' ? leads : leads.filter(l => l.status === filter)

  return (
    <div>
      <Header
        titel="Aanvragen"
        subtitel={`${leads.length} aanvragen totaal`}
        acties={
          <Knop onClick={() => setToonFormulier(true)}>+ Nieuwe aanvraag</Knop>
        }
      />

      {/* Filter tabs */}
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
              fontWeight: filter === s ? '500' : '400',
            }}
          >
            {s === 'alle' ? 'Alle' : statusLabel(s)}
            {s !== 'alle' && (
              <span style={{ marginLeft: '6px', opacity: 0.7 }}>
                {leads.filter(l => l.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Formulier */}
      {toonFormulier && (
        <Kaart stijl={{ marginBottom: '20px', border: '1px solid #C4A882' }}>
          <h3 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '20px',
            color: '#2D2520',
            marginTop: 0,
            marginBottom: '20px',
          }}>
            Nieuwe aanvraag toevoegen
          </h3>
          <form onSubmit={handleOpslaan}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Invoerveld label="Naam koppel" name="couple_name" value={form.couple_name} onChange={handleWijziging} verplicht />
              <Invoerveld label="E-mail" type="email" name="email" value={form.email} onChange={handleWijziging} verplicht />
              <Invoerveld label="Telefoon" name="phone" value={form.phone} onChange={handleWijziging} />
              <Invoerveld label="Datum evenement" type="date" name="event_date" value={form.event_date} onChange={handleWijziging} />
              <Invoerveld label="Locatie" name="location" value={form.location} onChange={handleWijziging} />
              <Invoerveld label="Aantal gasten" type="number" name="guest_count" value={form.guest_count} onChange={handleWijziging} />
              <Invoerveld label="Budgetrange" name="budget_range" value={form.budget_range} onChange={handleWijziging} placeholder="bv. €3.000–€5.000" />
              <Selectieveld label="Status" name="status" value={form.status} onChange={handleWijziging}>
                {STATUS_OPTIES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </Selectieveld>
            </div>
            <div style={{ marginTop: '14px' }}>
              <Tekstveld label="Wensen" name="wishes" value={form.wishes} onChange={handleWijziging} placeholder="Specifieke wensen van het koppel..." />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <Knop variant="secundair" onClick={() => setToonFormulier(false)}>Annuleren</Knop>
              <Knop type="submit" disabled={bezig}>{bezig ? 'Opslaan...' : 'Aanvraag opslaan'}</Knop>
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
            Geen aanvragen gevonden.
          </p>
        </Kaart>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {gefilterd.map(lead => (
            <Kaart key={lead.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2D2520',
                    }}>
                      {lead.couple_name}
                    </span>
                    <Badge status={statusKleur(lead.status)} label={statusLabel(lead.status)} />
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '12px',
                    color: '#8B7355',
                    flexWrap: 'wrap',
                  }}>
                    <span>✉ {lead.email}</span>
                    {lead.event_date && <span>📅 {formatDatum(lead.event_date)}</span>}
                    {lead.location && <span>📍 {lead.location}</span>}
                    {lead.guest_count && <span>👥 {lead.guest_count} gasten</span>}
                    {lead.budget_range && <span>💰 {lead.budget_range}</span>}
                  </div>
                  {lead.wishes && (
                    <p style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '12px',
                      color: '#6B5B4E',
                      margin: '8px 0 0',
                      fontStyle: 'italic',
                    }}>
                      "{lead.wishes}"
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                  <Selectieveld
                    value={lead.status}
                    onChange={e => handleStatusWijziging(lead.id, e.target.value)}
                  >
                    {STATUS_OPTIES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </Selectieveld>
                  <Knop klein variant="ghost" onClick={() => verwijderLead(lead.id)}>
                    Verwijderen
                  </Knop>
                </div>
              </div>
            </Kaart>
          ))}
        </div>
      )}
    </div>
  )
}
