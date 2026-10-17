import { useEffect, useState } from 'react'
import { useBookings } from '../hooks/useBookings'
import { supabase } from '../lib/supabase'
import { useVendor } from '../context/VendorContext'
import { Header } from '../components/layout/Header'
import { Kaart, StatKaart } from '../components/ui/Kaart'
import { formatDatum, formatEuro, berekenMarge } from '../lib/utils'

export function Costs() {
  const { organisatie } = useVendor()
  const { boekingen } = useBookings()
  const [margeData, setMargeData] = useState([])
  const [laadt, setLaadt] = useState(true)

  useEffect(() => {
    if (!boekingen.length) {
      setLaadt(false)
      return
    }
    laadMargeData()
  }, [boekingen])

  async function laadMargeData() {
    const boekingIds = boekingen.map(b => b.id)

    const { data: alleKosten } = await supabase
      .from('vendor_booking_costs')
      .select('*')
      .in('booking_id', boekingIds)

    const kostenPerBoeking = {}
    ;(alleKosten || []).forEach(k => {
      if (!kostenPerBoeking[k.booking_id]) kostenPerBoeking[k.booking_id] = []
      kostenPerBoeking[k.booking_id].push(k)
    })

    const resultaat = boekingen.map(boeking => {
      const kosten = kostenPerBoeking[boeking.id] || []
      const totaalKosten = kosten.reduce((sum, k) => sum + Number(k.amount), 0)
      const omzet = Number(boeking.total_amount)
      const marge = berekenMarge(omzet, totaalKosten)

      return {
        ...boeking,
        kosten,
        totaalKosten,
        marge,
        nettoWinst: omzet - totaalKosten,
      }
    })

    setMargeData(resultaat)
    setLaadt(false)
  }

  const totaalOmzet = margeData.reduce((sum, b) => sum + Number(b.total_amount), 0)
  const totaalKosten = margeData.reduce((sum, b) => sum + b.totaalKosten, 0)
  const totaalWinst = totaalOmzet - totaalKosten
  const gemiddeldeMarge = totaalOmzet > 0 ? berekenMarge(totaalOmzet, totaalKosten) : 0

  const margeKleur = (marge) => {
    if (marge >= 30) return '#065F46'
    if (marge >= 15) return '#92610A'
    return '#DC2626'
  }

  return (
    <div>
      <Header
        titel="Kosten & Marge"
        subtitel="Overzicht van kosten en winstmarge per boeking"
      />

      {/* Totaal stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <StatKaart label="Totale omzet" waarde={formatEuro(totaalOmzet)} icoon="€" />
        <StatKaart label="Totale kosten" waarde={formatEuro(totaalKosten)} icoon="📉" />
        <StatKaart label="Netto winst" waarde={formatEuro(totaalWinst)} icoon="✓" />
        <StatKaart
          label="Gemiddelde marge"
          waarde={`${gemiddeldeMarge}%`}
          subwaarde={gemiddeldeMarge >= 30 ? 'Uitstekend' : gemiddeldeMarge >= 15 ? 'Redelijk' : 'Te laag'}
          icoon="📊"
        />
      </div>

      {/* Per boeking */}
      {laadt ? (
        <div style={{ color: '#8B7355', fontFamily: 'Montserrat, sans-serif' }}>Laden...</div>
      ) : margeData.length === 0 ? (
        <Kaart>
          <p style={{ textAlign: 'center', color: '#8B7355', fontFamily: 'Montserrat, sans-serif', padding: '24px' }}>
            Nog geen boekingen met kosten. Voeg kosten toe via de boekingenpagina.
          </p>
        </Kaart>
      ) : (
        <Kaart>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #EDE6D6' }}>
                {['Koppel', 'Datum', 'Omzet', 'Kosten', 'Netto winst', 'Marge'].map(h => (
                  <th key={h} style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '11px',
                    color: '#8B7355',
                    fontWeight: '500',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {margeData.map(boeking => (
                <tr key={boeking.id} style={{ borderBottom: '1px solid #F0EBE2' }}>
                  <td style={{ padding: '12px', fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: '500', color: '#2D2520' }}>
                    {boeking.couple_name}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: '#8B7355' }}>
                    {formatDatum(boeking.event_date)}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: '#2D2520' }}>
                    {formatEuro(boeking.total_amount)}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: '#DC2626' }}>
                    {boeking.totaalKosten > 0 ? formatEuro(boeking.totaalKosten) : '—'}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'Montserrat, sans-serif', fontSize: '13px', fontWeight: '500', color: boeking.nettoWinst > 0 ? '#065F46' : '#DC2626' }}>
                    {boeking.totaalKosten > 0 ? formatEuro(boeking.nettoWinst) : '—'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {boeking.totaalKosten > 0 ? (
                      <span style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '14px',
                        fontWeight: '700',
                        color: margeKleur(boeking.marge),
                      }}>
                        {boeking.marge}%
                      </span>
                    ) : (
                      <span style={{ color: '#DDD6CC', fontFamily: 'Montserrat, sans-serif', fontSize: '13px' }}>
                        Geen kosten
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Kaart>
      )}
    </div>
  )
}
