import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { fieldsByAction, selectsByAction } from './staticData'

const sources = {
  accounts: 'quick_books_get_accounts',
  classes: 'quick_books_get_classes',
  customers: 'quick_books_get_customers',
  departments: 'quick_books_get_departments',
  employees: 'quick_books_get_employees',
  items: 'quick_books_get_items',
  paymentMethods: 'quick_books_get_payment_methods',
  terms: 'quick_books_get_terms',
  vendors: 'quick_books_get_vendors'
}

let pendingFetches = 0

export const handleInput = (e, quickBooksConf, setQuickBooksConf) => {
  const { name, value } = e.target

  setQuickBooksConf(
    create(quickBooksConf, draftConf => {
      if (value !== '') {
        draftConf[name] = value
      } else {
        delete draftConf[name]
      }
    })
  )
}

export const fetchSource = (source, conf, setConf, setIsLoading, silent = false) => {
  const route = sources[source]

  if (!route || !conf?.connection_id) return

  pendingFetches += 1
  setIsLoading(true)

  const request = bitsFetch({ connection_id: conf.connection_id }, route)
    .then(result => {
      if (result?.success) {
        setConf(prevConf =>
          create(prevConf, draftConf => {
            if (!draftConf.default) {
              draftConf.default = {}
            }

            draftConf.default[source] = result.data || []
          })
        )
        return __('Options refreshed.', 'bit-integrations')
      }

      throw new Error(
        typeof result?.data === 'string'
          ? result.data
          : __('Refresh failed. Try again.', 'bit-integrations')
      )
    })
    .finally(() => {
      pendingFetches -= 1
      setIsLoading(pendingFetches > 0)
    })

  if (silent) {
    request.catch(error => toast.error(error.message, { id: 'quick-books-fetch-error' }))
    return
  }

  toast.promise(request, {
    error: error => error.message,
    loading: __('Loading options...', 'bit-integrations'),
    success: message => message
  })
}

export const fetchActionSources = (conf, setConf, setIsLoading) => {
  const selectSources = (selectsByAction[conf?.mainAction] || [])
    .map(select => select.source)
    .filter(Boolean)

  ;[...new Set(selectSources)].forEach(source => fetchSource(source, conf, setConf, setIsLoading, true))
}

export const generateMappedField = action => {
  const actionFields = fieldsByAction[action] || []
  const requiredFlds = actionFields.filter(fld => fld.required === true)

  if (requiredFlds.length > 0) {
    return requiredFlds.map(field => ({ formField: '', quickBooksField: field.key }))
  }

  return actionFields.length > 0 ? [{ formField: '', quickBooksField: '' }] : []
}

export const checkMappedFields = quickBooksConf => {
  if (!quickBooksConf?.mainAction) return false

  const missingSelect = (selectsByAction[quickBooksConf.mainAction] || []).some(
    select => select.required && !quickBooksConf[select.key]?.length
  )

  if (missingSelect) return false

  const incompleteRows = (quickBooksConf.field_map || []).filter(
    mappedField =>
      !mappedField.formField ||
      !mappedField.quickBooksField ||
      (mappedField.formField === 'custom' && !mappedField.customValue)
  )

  return incompleteRows.length === 0
}
