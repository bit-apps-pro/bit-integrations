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

const paramKeys = source => [...(sources[source].requires || []), ...(sources[source].optional || [])]

const setSourceOptions = (setConf, source, options, params = null) =>
  setConf(prevConf => {
    const isStale =
      params &&
      (String(prevConf?.connection_id ?? '') !== String(params.connection_id ?? '') ||
        paramKeys(source).some(key => (prevConf?.[key] || '') !== (params[key] || '')))

    if (isStale) return prevConf

    return create(prevConf, draftConf => {
      if (!draftConf.default) {
        draftConf.default = {}
      }
      draftConf.default[source] = options
    })
  })

export const clearSourceOptions = (setConf, source) => setSourceOptions(setConf, source, [])

let pendingRequests = 0

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

  paramKeys(source).forEach(key => {
    if (conf?.[key]) params[key] = conf[key]
  })

  pendingRequests += 1
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

      setSourceOptions(setConf, source, Array.isArray(result.data) ? result.data : [], params)
      return __('Options refreshed', 'bit-integrations')
    })
    .finally(() => {
      pendingRequests -= 1
      setIsLoading(pendingRequests > 0)
    })

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

export const fetchActionSources = (conf, setConf, setIsLoading, skipLoaded = false) => {
  const actionSources = (selectsByAction[conf?.mainAction] || []).map(select => select.source)

  if (rowActions.includes(conf?.mainAction)) {
    actionSources.push('columns')
  }

  actionSources
    .filter(source => !skipLoaded || !conf?.default?.[source]?.length)
    .forEach(source => fetchSource(source, conf, setConf, setIsLoading, true))
}

const columnLabel = (letter, header) => {
  if (!header) {
    // translators: %s: column letter
    return sprintf(__('Column %s', 'bit-integrations'), letter)
  }

  // translators: 1: column letter, 2: column name read from the worksheet
  return sprintf(__('Column %s (%s)', 'bit-integrations'), letter, header)
}

export const setCustomValue = (event, index, setConf) => {
  const value = event?.target?.value ?? event

  setConf(prevConf =>
    create(prevConf, draftConf => {
      if (draftConf.field_map?.[index]) {
        draftConf.field_map[index].customValue = value
      }
    })
  )
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

export const generateMappedField = mainAction => {
  const requiredFields = (fieldsByAction[mainAction] || []).filter(field => field.required)

  return requiredFields.length > 0
    ? requiredFields.map(field => ({ formField: '', microsoftExcelField: field.key }))
    : [{ formField: '', microsoftExcelField: '' }]
}

const hasValue = field => field.formField && (field.formField !== 'custom' || field.customValue)

export const validationMessage = conf => {
  if (!conf?.mainAction) return __('Select an action', 'bit-integrations')

  const missingSelect = (selectsByAction[conf.mainAction] || []).find(
    select => select.required && !conf[select.key]
  )

  if (missingSelect) {
    return missingSelect.requiredMessage || __('Select every required option', 'bit-integrations')
  }

  const fieldMap = conf.field_map || []
  const missingField = (fieldsByAction[conf.mainAction] || []).find(
    field =>
      field.required &&
      !fieldMap.some(mapped => mapped.microsoftExcelField === field.key && hasValue(mapped))
  )

  if (missingField) {
    // translators: %s: Microsoft Excel field label
    return sprintf(__('Map a value to %s', 'bit-integrations'), missingField.label)
  }

  const mappedRows = fieldMap.filter(field => field.formField || field.microsoftExcelField)

  if (mappedRows.some(field => !field.formField || !field.microsoftExcelField)) {
    return __('Finish or remove the incomplete field map row', 'bit-integrations')
  }

  if (mappedRows.some(field => !hasValue(field))) {
    return __('Type a value for every Custom field', 'bit-integrations')
  }

  if (
    rowActions.includes(conf.mainAction) &&
    !mappedRows.some(field => COLUMN_KEY.test(field.microsoftExcelField))
  ) {
    return __('Map at least one form field to a worksheet column', 'bit-integrations')
  }

  return ''
}
