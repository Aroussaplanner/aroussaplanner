import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useVendor } from '../context/VendorContext'

export function useLeads() {
  const { organisatie } = useVendor()
  const [leads, setLeads] = useState([])
  const [laadt, setLaadt] = useState(true)
  const [fout, setFout] = useState(null)

  useEffect(() => {
    if (!organisatie) return
    laadLeads()
  }, [organisatie])

  async function laadLeads() {
    setLaadt(true)
    const { data, error } = await supabase
      .from('vendor_leads')
      .select('*')
      .eq('organization_id', organisatie.id)
      .order('created_at', { ascending: false })

    if (error) setFout(error.message)
    else setLeads(data ?? [])
    setLaadt(false)
  }

  async function maakLead(leadData) {
    const { data, error } = await supabase
      .from('vendor_leads')
      .insert({ ...leadData, organization_id: organisatie.id })
      .select()
      .single()

    if (error) throw error
    setLeads(prev => [data, ...prev])
    return data
  }

  async function updateLead(id, updates) {
    const { data, error } = await supabase
      .from('vendor_leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setLeads(prev => prev.map(l => l.id === id ? data : l))
    return data
  }

  async function verwijderLead(id) {
    const { error } = await supabase
      .from('vendor_leads')
      .delete()
      .eq('id', id)

    if (error) throw error
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  return { leads, laadt, fout, maakLead, updateLead, verwijderLead, herlaad: laadLeads }
}
