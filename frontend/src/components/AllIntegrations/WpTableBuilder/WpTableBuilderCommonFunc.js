import toast from 'react-hot-toast'
import { create } from 'mutative'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, wpTableBuilderConf, setWpTableBuilderConf) => {
  const { name, value } = e.target

  setWpTableBuilderConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const generateMappedField = (fields = []) => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        wpTableBuilderField: field.key
      }))
    : [{ formField: '', wpTableBuilderField: '' }]
}

const isRowFilled = mappedField =>
  mappedField.formField &&
  mappedField.wpTableBuilderField &&
  !(mappedField.formField === 'custom' && !mappedField.customValue)

export const checkMappedFields = wpTableBuilderConf => {
  const fieldMap = wpTableBuilderConf?.field_map || []

  if (wpTableBuilderConf?.mainAction === 'add_row') {
    if (!wpTableBuilderConf?.selectedTable) {
      return false
    }
    return fieldMap.some(isRowFilled)
  }

  return !fieldMap.some(mappedField => !isRowFilled(mappedField))
}

export const refreshTables = (wpTableBuilderConf, setWpTableBuilderConf, setIsLoading) => {
  setIsLoading(true)

  bitsFetch({}, 'refresh_wptablebuilder_tables')
    .then(result => {
      setIsLoading(false)
      if (result?.success) {
        setWpTableBuilderConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.tables = result.data?.tables || []
          })
        )
        toast.success(__('Tables fetched successfully', 'bit-integrations'))
        return
      }
      toast.error(
        typeof result?.data === 'string' ? result.data : __('Failed to fetch tables', 'bit-integrations')
      )
    })
    .catch(() => {
      setIsLoading(false)
      toast.error(__('An error occurred while fetching tables', 'bit-integrations'))
    })
}

export const refreshColumns = (
  wpTableBuilderConf,
  setWpTableBuilderConf,
  setIsLoading,
  selectedTable
) => {
  const tableId = selectedTable ?? wpTableBuilderConf?.selectedTable

  if (!tableId) {
    toast.error(__('Select a table first', 'bit-integrations'))
    return
  }

  setIsLoading(true)

  bitsFetch({ selectedTable: tableId }, 'refresh_wptablebuilder_columns')
    .then(result => {
      setIsLoading(false)
      if (result?.success) {
        const columns = result.data?.columns || []

        setWpTableBuilderConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.wpTableBuilderFields = columns
            draftConf.field_map = generateMappedField(columns)
          })
        )
        toast.success(__('Columns fetched successfully', 'bit-integrations'))
        return
      }
      toast.error(
        typeof result?.data === 'string'
          ? result.data
          : __('Failed to fetch columns', 'bit-integrations')
      )
    })
    .catch(() => {
      setIsLoading(false)
      toast.error(__('An error occurred while fetching columns', 'bit-integrations'))
    })
}
