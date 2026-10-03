import { useState } from 'react'
import { IoAddOutline, IoPencilOutline, IoTrashOutline, IoPeopleOutline, IoStar, IoCallOutline } from 'react-icons/io5'
import { useAgents } from '../data/AgentsContext'
import { useProperties } from '../data/PropertiesContext'
import { useToast } from '../shared/ToastContext'
import Modal from '../shared/Modal'
import ConfirmDialog from '../shared/ConfirmDialog'
import EmptyState from '../shared/EmptyState'
import PageSpinner from '../shared/PageSpinner'
import { uploadFile } from '../shared/uploadFile'
import { generateId } from '../shared/generateId'
import AgentForm from './AgentForm'

export default function Agents() {
  const { agents, loading, addAgent, updateAgent, deleteAgent } = useAgents()
  const { properties } = useProperties()
  const { showToast } = useToast()

  const [formState, setFormState] = useState(null) // null | { mode: 'create' } | { mode: 'edit', agent }
  const [pendingDelete, setPendingDelete] = useState(null)

  function openCreate() {
    setFormState({ mode: 'create' })
  }

  function openEdit(agent) {
    setFormState({ mode: 'edit', agent })
  }

  function closeForm() {
    setFormState(null)
  }

  async function handleSubmit({ name, phone, avatar_url, avatarFile }) {
    try {
      let finalAvatarUrl = avatar_url
      if (avatarFile) {
        const path = `${generateId()}-${avatarFile.name}`
        finalAvatarUrl = await uploadFile('agent-avatars', path, avatarFile)
      }

      if (formState?.mode === 'create') {
        await addAgent({ name, phone, avatar_url: finalAvatarUrl || null })
        showToast('Agent added.')
      } else {
        await updateAgent(
          formState?.agent?.id,
          { name, phone, avatar_url: finalAvatarUrl || null },
          formState?.agent?.updated_at,
        )
        showToast('Agent updated.')
      }
      closeForm()
    } catch (error) {
      console.error(error)
      if (error?.code === 'NOT_FOUND') {
        showToast(error.message, 'error')
        closeForm()
        return
      }
      if (error?.code === 'CONFLICT') {
        showToast(error.message, 'error')
        return
      }
      showToast('Something went wrong saving this agent.', 'error')
    }
  }

  async function handleDelete() {
    if (assignedCount > 0) return
    try {
      await deleteAgent(pendingDelete?.id)
      showToast('Agent deleted.')
      setPendingDelete(null)
    } catch (error) {
      console.error(error)
      showToast('Could not delete this agent.', 'error')
    }
  }

  const assignedCount = pendingDelete
    ? properties.filter((property) => property.agent_id === pendingDelete?.id).length
    : 0

  if (loading) {
    return <PageSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-main md:text-2xl">Agents</h2>
          <p className="mt-1 text-sm text-trenary">The team shown on listings and assignable to properties.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex h-11 shrink-0 items-center gap-2 rounded-[12px] bg-accent-500 px-4 text-sm font-medium text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <IoAddOutline size={18} />
          <span className="hidden sm:inline">Add agent</span>
        </button>
      </div>

      {agents.length === 0 ? (
        <EmptyState
          icon={IoPeopleOutline}
          title="No agents yet"
          description="Add an agent to start assigning them to listings."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="rounded-[12px] bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
            >
              Add agent
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const listingCount = properties.filter((property) => property.agent_id === agent.id).length

            return (
              <div
                key={agent.id}
                className="rounded-[16px] border border-accent-500/10 bg-white p-5 transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary-600">
                      {agent.avatar_url ? (
                        <img src={agent.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-trenary">
                          <IoPeopleOutline size={18} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-main">{agent.name}</h3>
                      <p className="flex items-center gap-1 truncate text-xs text-trenary">
                        <IoCallOutline size={12} className="shrink-0" />
                        {agent.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(agent)}
                      aria-label={`Edit ${agent.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-[12px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    >
                      <IoPencilOutline size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(agent)}
                      aria-label={`Delete ${agent.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-[12px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    >
                      <IoTrashOutline size={18} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="flex items-center gap-1 rounded-full bg-gold-500/20 px-3 py-1 text-xs font-medium text-main">
                    <IoStar size={12} />
                    {agent.rating.toFixed(1)} · {agent.reviews_count} reviews
                  </span>
                  <span className="rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-secondary">
                    {listingCount} listing{listingCount === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={formState !== null} onClose={closeForm} title={formState?.mode === 'edit' ? 'Edit agent' : 'Add agent'}>
        {formState && (
          <AgentForm
            key={formState.mode === 'edit' ? formState.agent.id : 'create'}
            initialAgent={formState.mode === 'edit' ? formState.agent : null}
            onCancel={closeForm}
            onSubmit={handleSubmit}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title={assignedCount > 0 ? `Can't delete "${pendingDelete?.name}"` : `Delete "${pendingDelete?.name}"?`}
        description={
          assignedCount > 0
            ? `${assignedCount} listing${assignedCount === 1 ? ' is' : 's are'} still assigned to this agent. Reassign ${assignedCount === 1 ? 'it' : 'them'} to someone else from the Properties page, then come back to delete this agent.`
            : "This removes the agent. This can't be undone."
        }
        confirmLabel="Delete"
        blocked={assignedCount > 0}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}