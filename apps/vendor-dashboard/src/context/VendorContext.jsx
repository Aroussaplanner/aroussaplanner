import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const VendorContext = createContext(null)

export function VendorProvider({ children }) {
  const [user, setUser] = useState(null)
  const [organisatie, setOrganisatie] = useState(null)
  const [lidmaatschap, setLidmaatschap] = useState(null)
  const [laadt, setLaadt] = useState(true)

  useEffect(() => {
    // Haal huidige sessie op
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        laadOrganisatie(session.user.id)
      } else {
        setLaadt(false)
      }
    })

    // Luister naar auth wijzigingen
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await laadOrganisatie(session.user.id)
        } else {
          setOrganisatie(null)
          setLidmaatschap(null)
          setLaadt(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function laadOrganisatie(userId) {
    try {
      const { data: lid } = await supabase
        .from('vendor_members')
        .select('*, vendor_organizations(*)')
        .eq('user_id', userId)
        .single()

      if (lid) {
        setLidmaatschap(lid)
        setOrganisatie(lid.vendor_organizations)
      }
    } catch (err) {
      console.error('Fout bij laden organisatie:', err)
    } finally {
      setLaadt(false)
    }
  }

  async function uitloggen() {
    await supabase.auth.signOut()
  }

  const waarde = {
    user,
    organisatie,
    lidmaatschap,
    laadt,
    uitloggen,
    isOwner: lidmaatschap?.role === 'owner',
    heeftOrganisatie: !!organisatie,
  }

  return (
    <VendorContext.Provider value={waarde}>
      {children}
    </VendorContext.Provider>
  )
}

export function useVendor() {
  const context = useContext(VendorContext)
  if (!context) {
    throw new Error('useVendor moet binnen VendorProvider worden gebruikt')
  }
  return context
}
