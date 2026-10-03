import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { fetchAllWithRetry } from '../../lib/fetchAllWithRetry'
import { updateWithConcurrencyCheck } from '../../lib/updateWithConcurrencyCheck'
import { useToast } from '../shared/ToastContext'

const AgentsContext = createContext(null)

// Postgres `numeric` columns are serialized as strings by PostgREST to avoid
// float precision loss — `rating` needs to be coerced back to a number here
// so the rest of the app (e.g. `agent.rating.toFixed(1)`) can keep treating
// it as one.
function normalizeAgent(agent) {
  return { ...agent, rating: Number(agent.rating) }
}

export function AgentsProvider({ children }) {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      const [{ data, error }] = await fetchAllWithRetry([
        () => supabase.from('agents').select('*').order('name', { ascending: true }),
      ])
      if (!active) return
      if (error) {
        console.error(error)
        showToast('Could not load agents.', 'error')
      } else {
        setAgents(data.map(normalizeAgent))
      }
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  async function addAgent({ name, phone, avatar_url }) {
    const { data, error } = await supabase
      .from('agents')
      .insert({ name, phone, avatar_url: avatar_url || null, rating: 0, reviews_count: 0 })
      .select()
      .single()
    if (error) throw error
    const agent = normalizeAgent(data)
    setAgents((current) => [...current, agent])
    return agent.id
  }

  async function updateAgent(id, patch, expectedUpdatedAt) {
    const data = await updateWithConcurrencyCheck('agents', id, patch, expectedUpdatedAt, 'agent')
    const agent = normalizeAgent(data)
    setAgents((current) => current.map((existing) => (existing.id === id ? agent : existing)))
    return agent
  }

  async function deleteAgent(id) {
    const { error } = await supabase.from('agents').delete().eq('id', id)
    if (error) throw error
    setAgents((current) => current.filter((agent) => agent.id !== id))
  }

  const value = useMemo(
    () => ({ agents, loading, addAgent, updateAgent, deleteAgent }),
    [agents, loading],
  )

  return <AgentsContext.Provider value={value}>{children}</AgentsContext.Provider>
}

export function useAgents() {
  const context = useContext(AgentsContext)
  if (!context) {
    throw new Error('useAgents must be used within an AgentsProvider')
  }
  return context
}
