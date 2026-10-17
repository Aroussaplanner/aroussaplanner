import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useVendor } from '../context/VendorContext'

export function useBookings() {
  const { organisatie } = useVendor()
  const [boekingen, setBoekingen] = useState([])
  const [laadt, setLaadt] = useState(true)
  const [fout, setFout] = useState(null)

  useEffect(() => {
    if (!organisatie) return
    laadBoekingen()
  }, [organisatie])

  async function laadBoekingen() {
    setLaadt(true)
    const { data, error } = await supabase
      .from('vendor_bookings')
      .select('*, vendor_booking_costs(*)')
      .eq('organization_id', organisatie.id)
      .order('event_date', { ascending: true })

    if (error) setFout(error.message)
    else setBoekingen(data ?? [])
    setLaadt(false)
  }

  async function maakBoeking(boekingData) {
    const { data, error } = await supabase
      .from('vendor_bookings')
      .insert({ ...boekingData, organization_id: organisatie.id })
      .select()
      .single()

    if (error) throw error
    setBoekingen(prev => [...prev, data].sort(
      (a, b) => new Date(a.event_date) - new Date(b.event_date)
    ))
    return data
  }

  async function updateBoeking(id, updates) {
    const { data, error } = await supabase
      .from('vendor_bookings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setBoekingen(prev => prev.map(b => b.id === id ? data : b))
    return data
  }

  async function maakVanOfferte(offerte) {
    return maakBoeking({
      quote_id: offerte.id,
      lead_id: offerte.lead_id,
      couple_name: offerte.couple_name,
      email: offerte.email,
      event_date: offerte.event_date,
      location: offerte.location,
      guest_count: offerte.guest_count,
      total_amount: offerte.total,
      paid_amount: 0,
      payment_status: 'openstaand',
    })
  }

  return { boekingen, laadt, fout, maakBoeking, updateBoeking, maakVanOfferte, herlaad: laadBoekingen }
}
