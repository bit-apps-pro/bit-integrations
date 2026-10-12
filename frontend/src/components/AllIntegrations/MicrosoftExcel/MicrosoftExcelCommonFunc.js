import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { COLUMN_KEY, fieldsByAction, rowActions, selectsByAction } from './staticData'

const sources = {
  columns: { requires: ['workbook_id', 'worksheet_id'], route: 'microsoft_excel_get_columns' },
  folders: { route: 'microsoft_excel_get_folders' },
  workbooks: { optional: ['folder_id'], route: 'microsoft_excel_get_workbooks' },
  worksheets: { requires: ['workbook_id'], route: 'microsoft_excel_get_worksheets' }
}

const setSourceOptions = (setConf, source, options) =>
  setConf(prevConf =>
    create(prevConf, draftConf => {
      if (!draftConf.default) {
        draftConf.default = {}
      }
      draftConf.default[source] = options
    })
  )

export const handleInput = (e, setConf) => {
  const { name, value } = e.target

  setConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const fetchSource = (source, conf, setConf, setIsLoading, silent = false) => {
  const { optional = [], requires = [], route } = sources[source] || {}

  if (!route) return

  if (requires.some(key => !conf?.[key])) {
    setSourceOptions(setConf, source, [])
    return
  }

  const params = { connection_id: conf?.connection_id }

  ;[...requires, ...optional].forEach(key => {
    if (conf?.[key]) params[key] = conf[key]
  })

  setIsLoading(true)

  const request = bitsFetch(params, route)
    .then(result => {
      if (!result?.success) {
        throw new Error(
          typeof result?.data === 'string'
            ? result.data
            : __('Refresh failed. Please try again', 'bit-integrations')
        )
      }

      setSourceOptions(setConf, source, Array.isArray(result.data) ? result.data : [])
      return __('Options refreshed', 'bit-integrations')
    })
    .finally(() => setIsLoading(false))

  if (silent) {
    request.catch(error => toast.error(error.message))
    return
  }

  toast.promise(request, {
    error: error => error.message,
    loading: __('Loading options...', 'bit-integrations'),
    success: message => message
  })
}

export const fetchActionSources = (conf, setConf, setIsLoading) => {
  const actionSources = (selectsByAction[conf?.mainAction] || []).map(select => select.source)

  if (rowActions.includes(conf?.mainAction)) {
    actionSources.push('columns')
  }

  actionSources.forEach(source => fetchSource(source, conf, setConf, setIsLoading, true))
}

const columnLabel = (letter, header) => {
  if (!header) {
    // translators: %s: column letter
    return sprintf(__('Column %s', 'bit-integrations'), letter)
  }

  // translators: 1: column letter, 2: column name read from the worksheet
  return sprintf(__('Column %1$s (%2$s)', 'bit-integrations'), letter, header)
}

export const actionFields = conf => {
  const fields = fieldsByAction[conf?.mainAction] || []

  if (!rowActions.includes(conf?.mainAction)) return fields

  const columns = (conf?.default?.columns || []).map(({ id, name }) => ({
    key: id,
    label: columnLabel(id, name),
    required: false
  }))
  const listed = new Set(columns.map(column => column.key))
  const savedColumns = (conf?.field_map || [])
    .map(field => field.microsoftExcelField)
    .filter(key => COLUMN_KEY.test(key || '') && !listed.has(key))
    .map(key => ({ key, label: columnLabel(key), required: false }))

  return [...fields, ...columns, ...savedColumns]
}

export const generateMappedField = conf => {
  const requiredFields = (fieldsByAction[conf?.mainAction] || []).filter(field => field.required)

  return requiredFields.length > 0
    ? requiredFields.map(field => ({ formField: '', microsoftExcelField: field.key }))
    : [{ formField: '', microsoftExcelField: '' }]
}

export const checkMappedFields = conf => {
  if (!conf?.mainAction) return false

  const missingSelect = (selectsByAction[conf.mainAction] || []).some(
    select => select.required && !conf[select.key]
  )

  if (missingSelect) return false

  const mappedRows = (conf.field_map || []).filter(field => field.formField || field.microsoftExcelField)
  const hasIncompleteRow = mappedRows.some(
    field =>
      !field.formField ||
      !field.microsoftExcelField ||
      (field.formField === 'custom' && !field.customValue)
  )

  if (hasIncompleteRow) return false

  return (
    !rowActions.includes(conf.mainAction) ||
    mappedRows.some(field => COLUMN_KEY.test(field.microsoftExcelField))
  )
}
