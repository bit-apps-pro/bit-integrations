import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { fieldsByAction, selectsByAction } from './staticData'

const sources = {
  accounts: { route: 'fresh_books_get_accounts' },
  businesses: { route: 'fresh_books_get_businesses' },
  clients: { route: 'fresh_books_get_clients', scope: 'account_id' },
  categories: { route: 'fresh_books_get_categories', scope: 'account_id' },
  staff: { route: 'fresh_books_get_staff', scope: 'account_id' },
  vendors: { route: 'fresh_books_get_vendors', scope: 'account_id' },
  taxes: { route: 'fresh_books_get_taxes', scope: 'account_id' },
  invoices: { route: 'fresh_books_get_invoices', scope: 'account_id' },
  businessClients: { route: 'fresh_books_get_business_clients', scope: 'business_id' },
  projects: { route: 'fresh_books_get_projects', scope: 'business_id' },
  services: { route: 'fresh_books_get_services', scope: 'business_id' },
  teamMembers: { route: 'fresh_books_get_team_members', scope: 'business_id' }
}

const setSourceOptions = (setConf, source, options, scope, scopeValue) =>
  setConf(prevConf => {
    if (scope && prevConf?.[scope] !== scopeValue) return prevConf

    return create(prevConf, draftConf => {
      if (!draftConf.default) {
        draftConf.default = {}
      }

      draftConf.default[source] = options
    })
  })

export const handleInput = (e, freshBooksConf, setFreshBooksConf) => {
  const newConf = { ...freshBooksConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setFreshBooksConf({ ...newConf })
}

export const fetchSource = (source, conf, setConf, setIsLoading, silent = false) => {
  const { route, scope } = sources[source] || {}

  if (!route) return

  const scopeValue = scope ? conf?.[scope] : undefined

  if (scope && !scopeValue) return

  setIsLoading(true)

  const params = { connection_id: conf?.connection_id, ...(scope && { [scope]: scopeValue }) }

  const request = bitsFetch(params, route)
    .then(result => {
      if (result?.success) {
        setSourceOptions(setConf, source, result.data || [], scope, scopeValue)
        return __('Options refreshed.', 'bit-integrations')
      }

      throw new Error(
        typeof result?.data === 'string'
          ? result.data
          : __('Refresh failed. Try again.', 'bit-integrations')
      )
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

export const clearScopedOptions = (draftConf, scope) => {
  Object.entries(sources).forEach(([source, { scope: sourceScope }]) => {
    if (sourceScope === scope && draftConf.default) delete draftConf.default[source]
  })
}

export const fetchSources = (selects, conf, setConf, setIsLoading) => {
  const selectSources = selects.map(select => select.source).filter(Boolean)

  ;[...new Set(selectSources)].forEach(source => fetchSource(source, conf, setConf, setIsLoading, true))
}

export const fetchActionSources = (conf, setConf, setIsLoading) =>
  fetchSources(selectsByAction[conf?.mainAction] || [], conf, setConf, setIsLoading)

export const generateMappedField = action => {
  const actionFields = fieldsByAction[action] || []
  const requiredFlds = actionFields.filter(fld => fld.required === true)

  if (requiredFlds.length > 0) {
    return requiredFlds.map(field => ({ formField: '', freshBooksField: field.key }))
  }

  return actionFields.length > 0 ? [{ formField: '', freshBooksField: '' }] : []
}

export const checkMappedFields = freshBooksConf => {
  if (!freshBooksConf?.mainAction) return false

  const missingSelect = (selectsByAction[freshBooksConf.mainAction] || []).some(
    select => select.required && !freshBooksConf[select.key]?.length
  )

  if (missingSelect) return false

  const incompleteRows = (freshBooksConf.field_map || []).filter(
    mappedField =>
      !mappedField.formField ||
      !mappedField.freshBooksField ||
      (mappedField.formField === 'custom' && !mappedField.customValue)
  )

  return incompleteRows.length === 0
}
