import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useVendor } from '../context/VendorContext'
import { supabase } from '../lib/supabase'
import { Header } from '../components/layout/Header'
import { StatKaart, Kaart } from '../components/ui/Kaart'
import { Badge } from '../components/ui/Badge'
import { formatDatum, formatEuro, statusKleur, statusLabel } from '../lib/utils'

export function Dashboard() {
  const { organisatie } = useVendor()
  const [stats, setStats] = useState(null)
  const [aankomend, setAankomend] = useState([])
  const [nieuwLeads, setNieuwLeads] = useState([])
  const [laadt, setLaadt] = useState(true)

  useEffect(() => {
    if (!organisatie) return
    laadDashboard()
  }, [organisatie])

  async function laadDashboard() {
    const orgId = organisatie.id

    const [
      { count: aantalLeads },
      { count: aantalOffertes },
      { count: aantalBoekingen },
      { data: komendBoekingen },
      { data: recenteLeads },
      { data: omzetData },
    ] = await Promise.all([
      supabase.from('vendor_leads').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'nieuw'),
      supabase.from('vendor_quotes').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'verstuurd'),
      supabase.from('vendor_bookings').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
      supabase.from('vendor_bookings').select('*').eq('organization_id', orgId).gte('event_date', new Date().toISOString().split('T')[0]).order('event_date').limit(5),
      supabase.from('vendor_leads').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(5),
      supabase.from('vendor_bookings').select('total_amount,paid_amount').eq('organization_id', orgId),
    ])

    const totaalOmzet = (omzetData || []).reduce((sum, b) => sum + Number(b.total_amount), 0)
    const totaalBetaald = (omzetData || []).reduce((sum, b) => sum + Number(b.paid_amount), 0)

    setStats({
      nieuwLeads: aantalLeads || 0,
      openOffertes: aantalOffertes || 0,
      totaalBoekingen: aantalBoekingen || 0,
      totaalOmzet,
      totaalBetaald,
    })
    setAankomend(komendBoekingen || [])
    setNieuwLeads(recenteLeads || [])
    setLaadt(false)
  }

  if (laadt) {
    return (
      <div style={{ color: '#8B7355', fontFamily: 'Montserrat, sans-serif' }}>
        Laden...
      </div>
    )
  }

  const vandaag = new Date()
  const dagenLabel = (datum) => {
    const d = new Date(datum)
    const diff = Math.ceil((d - vandaag) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Vandaag'
    if (diff === 1) return 'Morgen'
    if (diff < 7) return `Over ${diff} dagen`
    return formatDatum(datum)
  }

  return (
    <div>
      <Header
        titel={`Goedemorgen`}
        subtitel={`Welkom terug bij ${organisatie?.name}`}
      />

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <StatKaart
          label="Nieuwe aanvragen"
          waarde={stats.nieuwLeads}
          subwaarde="wachtend op actie"
          icoon="✉"
        />
        <StatKaart
          label="Open offertes"
          waarde={stats.openOffertes}
          subwaarde="verstuurd, geen reactie"
          icoon="📋"
        />
        <StatKaart
          label="Boekingen"
          waarde={stats.totaalBoekingen}
          subwaarde="totaal dit jaar"
          icoon="📅"
        />
        <StatKaart
          label="Omzet"
          waarde={formatEuro(stats.totaalOmzet)}
          subwaarde={`${formatEuro(stats.totaalBetaald)} ontvangen`}
          icoon="€"
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
      }}>
        {/* Aankomende boekingen */}
        <Kaart>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h3 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '18px',
              color: '#2D2520',
              margin: 0,
            }}>
              Aankomende evenementen
            </h3>
            <Link to="/boekingen" style={{ fontSize: '12px', color: '#C4A882', fontFamily: 'Montserrat, sans-serif' }}>
              Alle boekingen →
            </Link>
          </div>

          {aankomend.length === 0 ? (
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: '#8B7355' }}>
              Geen geplande evenementen.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {aankomend.map(boeking => (
                <div key={boeking.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#FDFAF6',
                  borderRadius: '8px',
                  border: '1px solid #EDE6D6',
                }}>
                  <div>
                    <div style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#2D2520',
                    }}>
                      {boeking.couple_name}
                    </div>
                    <div style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '11px',
                      color: '#8B7355',
                      marginTop: '2px',
                    }}>
                      {boeking.location} · {boeking.guest_count} gasten
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#C4A882',
                    }}>
                      {dagenLabel(boeking.event_date)}
                    </div>
                    <Badge
                      status={statusKleur(boeking.payment_status)}
                      label={statusLabel(boeking.payment_status)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Kaart>

        {/* Nieuwe aanvragen */}
        <Kaart>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h3 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '18px',
              color: '#2D2520',
              margin: 0,
            }}>
              Recente aanvragen
            </h3>
            <Link to="/aanvragen" style={{ fontSize: '12px', color: '#C4A882', fontFamily: 'Montserrat, sans-serif' }}>
              Alle aanvragen →
            </Link>
          </div>

          {nieuwLeads.length === 0 ? (
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: '#8B7355' }}>
              Geen recente aanvragen.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {nieuwLeads.map(lead => (
                <div key={lead.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#FDFAF6',
                  borderRadius: '8px',
                  border: '1px solid #EDE6D6',
                }}>
                  <div>
                    <div style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#2D2520',
                    }}>
                      {lead.couple_name}
                    </div>
                    <div style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: '11px',
                      color: '#8B7355',
                      marginTop: '2px',
                    }}>
                      {lead.event_date ? formatDatum(lead.event_date) : 'Datum onbekend'}
                      {lead.guest_count && ` · ${lead.guest_count} gasten`}
                    </div>
                  </div>
                  <Badge
                    status={statusKleur(lead.status)}
                    label={statusLabel(lead.status)}
                  />
                </div>
              ))}
            </div>
          )}
        </Kaart>
      </div>
    </div>
  )
}
