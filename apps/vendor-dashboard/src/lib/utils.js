import { format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'

/**
 * Formatteer datum naar Nederlands formaat
 */
export function formatDatum(datum) {
  if (!datum) return '—'
  try {
    const d = typeof datum === 'string' ? parseISO(datum) : datum
    return format(d, 'd MMMM yyyy', { locale: nl })
  } catch {
    return datum
  }
}

/**
 * Formatteer bedrag naar EUR
 */
export function formatEuro(bedrag) {
  if (bedrag == null) return '—'
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(bedrag)
}

/**
 * Genereer offertenummer: OFR-YYYY-XXXX
 */
export function generateQuoteNumber() {
  const jaar = new Date().getFullYear()
  const willekeurig = Math.floor(1000 + Math.random() * 9000)
  return `OFR-${jaar}-${willekeurig}`
}

/**
 * Status badge kleur
 */
export function statusKleur(status) {
  const kleuren = {
    // Leads
    nieuw: 'badge-blauw',
    in_behandeling: 'badge-goud',
    offerte_verstuurd: 'badge-paars',
    gewonnen: 'badge-groen',
    verloren: 'badge-rood',
    // Offertes
    concept: 'badge-grijs',
    verstuurd: 'badge-blauw',
    geaccepteerd: 'badge-groen',
    afgewezen: 'badge-rood',
    verlopen: 'badge-grijs',
    // Betalingen
    openstaand: 'badge-oranje',
    gedeeltelijk: 'badge-goud',
    betaald: 'badge-groen',
  }
  return kleuren[status] || 'badge-grijs'
}

/**
 * Status label in Nederlands
 */
export function statusLabel(status) {
  const labels = {
    nieuw: 'Nieuw',
    in_behandeling: 'In behandeling',
    offerte_verstuurd: 'Offerte verstuurd',
    gewonnen: 'Gewonnen',
    verloren: 'Verloren',
    concept: 'Concept',
    verstuurd: 'Verstuurd',
    geaccepteerd: 'Geaccepteerd',
    afgewezen: 'Afgewezen',
    verlopen: 'Verlopen',
    openstaand: 'Openstaand',
    gedeeltelijk: 'Gedeeltelijk betaald',
    betaald: 'Betaald',
    handmatig: 'Handmatig',
  }
  return labels[status] || status
}

/**
 * Bereken marge percentage
 */
export function berekenMarge(omzet, kosten) {
  if (!omzet || omzet === 0) return 0
  return Math.round(((omzet - kosten) / omzet) * 100)
}

/**
 * Slug aanmaken van naam
 */
export function maakSlug(naam) {
  return naam
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
