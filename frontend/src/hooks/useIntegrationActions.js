import { useCallback } from 'react'
import toast from 'react-hot-toast'
import bitsFetch from '../Utils/bitsFetch'
import { __ } from '../Utils/i18nwrap'

export default function useIntegrationActions({
  integrations,
  setIntegrations,
  mutate,
  integrationTags,
  setIntegrationTags,
  tags,
  persistTagData
}) {
  const handleStatus = useCallback(
    (e, id) => {
      const status = e.target.checked
      setIntegrations(prev =>
        prev.map(int => (int.id === id ? { ...int, status: status ? '1' : '0' } : int))
      )
      bitsFetch({ id, status }, 'flow/toggleStatus')
        .then(res => toast.success(__(res.data, 'bit-integrations')))
        .catch(() => toast.error(__('Something went wrong', 'bit-integrations')))
    },
    [setIntegrations]
  )

  const handleDelete = useCallback(
    (id, index) => {
      const deleteLoad = bitsFetch({ id }, 'flow/delete').then(response => {
        if (!response.success) return response.data
        const next = [...integrations]
        next.splice(index, 1)
        mutate(next)
        setIntegrations(next)

        const key = String(id)
        if (integrationTags[key]) {
          const updatedMapping = { ...integrationTags }
          delete updatedMapping[key]
          setIntegrationTags(updatedMapping)
          persistTagData(tags, updatedMapping).catch(() => {})
        }
        return __('Integration deleted successfully', 'bit-integrations')
      })

      toast.promise(deleteLoad, {
        success: msg => msg,
        error: __('Error Occurred', 'bit-integrations'),
        loading: __('delete...')
      })
    },
    [integrations, mutate, setIntegrations, integrationTags, setIntegrationTags, tags, persistTagData]
  )

  const handleClone = useCallback(
    id => {
      const loadClone = bitsFetch({ id }, 'flow/clone').then(response => {
        if (!response.success) return response.data
        const newInteg = response.data
        const exist = integrations.find(item => item.id === id)
        const cpyInteg = {
          id: newInteg.id,
          name: `duplicate of ${exist.name}`,
          triggered_entity: exist.triggered_entity,
          status: exist.status,
          created_at: newInteg.created_at
        }
        setIntegrations([...integrations, cpyInteg])
        return __('Integration clone successfully', 'bit-integrations')
      })

      toast.promise(loadClone, {
        success: msg => msg,
        error: __('Error Occurred', 'bit-integrations'),
        loading: __('cloning...')
      })
    },
    [integrations, setIntegrations]
  )

  const setBulkDelete = useCallback(
    rows => {
      const rowID = []
      const flowID = []
      rows.forEach(r => {
        rowID.push(r.id)
        flowID.push(r.original.id)
      })

      const bulkDeleteLoading = bitsFetch({ flowID }, 'flow/bulk-delete').then(response => {
        if (!response.success) return response.data

        const newData = [...integrations]
        for (let i = rowID.length - 1; i >= 0; i -= 1) {
          newData.splice(Number(rowID[i]), 1)
        }
        setIntegrations(newData)

        const updatedMapping = { ...integrationTags }
        let isMappingUpdated = false
        flowID.forEach(deletedIntegId => {
          const key = String(deletedIntegId)
          if (updatedMapping[key]) {
            delete updatedMapping[key]
            isMappingUpdated = true
          }
        })
        if (isMappingUpdated) {
          setIntegrationTags(updatedMapping)
          persistTagData(tags, updatedMapping).catch(() => {})
        }

        return __('Integration Deleted Successfully', 'bit-integrations')
      })

      toast.promise(bulkDeleteLoading, {
        success: msg => msg,
        error: __('Error Occurred', 'bit-integrations'),
        loading: __('delete...')
      })
    },
    [integrations, integrationTags, tags, persistTagData, setIntegrations, setIntegrationTags]
  )

  return { handleStatus, handleDelete, handleClone, setBulkDelete }
}
