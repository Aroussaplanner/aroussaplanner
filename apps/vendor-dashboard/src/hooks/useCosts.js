import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCosts(boekingId) {
  const [kosten, setKosten] = useState([])
  const [laadt, setLaadt] = useState(false)

  async function laadKosten() {
    if (!boekingId) return
    setLaadt(true)
    const { data, error } = await supabase
      .from('vendor_booking_costs')
      .select('*')
      .eq('booking_id', boekingId)
      .order('created_at', { ascending: true })

    if (!error) setKosten(data ?? [])
    setLaadt(false)
  }

  async function voegKostToe(kostenData) {
    const { data, error } = await supabase
      .from('vendor_booking_costs')
      .insert({ ...kostenData, booking_id: boekingId })
      .select()
      .single()

    if (error) throw error
    setKosten(prev => [...prev, data])
    return data
  }

  async function verwijderKost(id) {
    const { error } = await supabase
      .from('vendor_booking_costs')
      .delete()
      .eq('id', id)

    if (error) throw error
    setKosten(prev => prev.filter(k => k.id !== id))
  }

  const totaalKosten = kosten.reduce((sum, k) => sum + Number(k.amount), 0)

  return { kosten, laadt, totaalKosten, laadKosten, voegKostToe, verwijderKost }
}
