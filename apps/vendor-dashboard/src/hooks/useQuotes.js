import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useVendor } from '../context/VendorContext'
import { generateQuoteNumber } from '../lib/utils'

export function useQuotes() {
  const { organisatie } = useVendor()
  const [offertes, setOffertes] = useState([])
  const [laadt, setLaadt] = useState(true)
  const [fout, setFout] = useState(null)

  useEffect(() => {
    if (!organisatie) return
    laadOffertes()
  }, [organisatie])

  async function laadOffertes() {
    setLaadt(true)
    const { data, error } = await supabase
      .from('vendor_quotes')
      .select('*, vendor_quote_items(*)')
      .eq('organization_id', organisatie.id)
      .order('created_at', { ascending: false })

    if (error) setFout(error.message)
    else setOffertes(data ?? [])
    setLaadt(false)
  }

  async function maakOfferte(offerteData, regelItems = []) {
    const quoteNumber = generateQuoteNumber()

    // Bereken totalen
    const subtotaal = regelItems.reduce((sum, item) => sum + item.total, 0)
    const btwPercentage = offerteData.btw_percentage ?? 9
    const btwBedrag = subtotaal * (btwPercentage / 100)
    const totaal = subtotaal + btwBedrag

    const { data: offerte, error: offerteError } = await supabase
      .from('vendor_quotes')
      .insert({
        ...offerteData,
        organization_id: organisatie.id,
        quote_number: quoteNumber,
        subtotal: subtotaal,
        btw_percentage: btwPercentage,
        btw_amount: btwBedrag,
        total: totaal,
      })
      .select()
      .single()

    if (offerteError) throw offerteError

    if (regelItems.length > 0) {
      const items = regelItems.map((item, idx) => ({
        ...item,
        quote_id: offerte.id,
        sort_order: idx,
      }))

      const { error: itemsError } = await supabase
        .from('vendor_quote_items')
        .insert(items)

      if (itemsError) throw itemsError
    }

    await laadOffertes()
    return offerte
  }

  async function updateOfferteStatus(id, status) {
    const { data, error } = await supabase
      .from('vendor_quotes')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setOffertes(prev => prev.map(o => o.id === id ? { ...o, ...data } : o))
    return data
  }

  async function verwijderOfferte(id) {
    const { error } = await supabase
      .from('vendor_quotes')
      .delete()
      .eq('id', id)

    if (error) throw error
    setOffertes(prev => prev.filter(o => o.id !== id))
  }

  return { offertes, laadt, fout, maakOfferte, updateOfferteStatus, verwijderOfferte, herlaad: laadOffertes }
}
