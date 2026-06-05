import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, wpDataTablesConf, setWpDataTablesConf) => {
  const { name, value } = e.target

  setWpDataTablesConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const checkMappedFields = wpDataTablesConf => {
  if (!wpDataTablesConf?.mainAction) return false
  if (!wpDataTablesConf?.selectedTable) return false

  const hasMappedRow = wpDataTablesConf?.field_map?.some(m => m.formField) ?? false
  if (!hasMappedRow) return false

  const brokenCustom =
    wpDataTablesConf?.field_map?.filter(
      m => m.formField === 'custom' && !m.customValue
    ) ?? []

  return brokenCustom.length === 0
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)

  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', wpDataTablesField: field.key }))
    : [{ formField: '', wpDataTablesField: '' }]
}

export const refreshWpDataTablesTables = (setConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'wp_data_tables_get_tables', null, "GET")
    .then(result => {
      if (result?.success && result?.data) {
        setConf(prev =>
          create(prev, draft => {
            draft.allTables = result.data
          })
        )
        setIsLoading(false)
        toast.success(__('Tables fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Tables fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const refreshWpDataTablesColumns = (tableId, setConf, setIsLoading) => {
  if (!tableId) return
  setIsLoading(true)
  bitsFetch({ table_id: tableId }, 'wp_data_tables_get_table_columns')
    .then(result => {
      if (result?.success && result?.data) {
        setConf(prev =>
          create(prev, draft => {
            draft.wpDataTablesFields = result.data
            draft.field_map = result.data.map(col => ({ formField: '', wpDataTablesField: col.key }))
          })
        )
        setIsLoading(false)
        toast.success(__('Columns fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Columns fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}
