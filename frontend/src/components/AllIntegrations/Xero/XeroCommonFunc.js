import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { fieldsByAction, selectsByAction } from './staticData'

const sources = {
  accountCodes: 'xero_get_account_codes',
  bankAccounts: 'xero_get_bank_accounts',
  brandingThemes: 'xero_get_branding_themes',
  contacts: 'xero_get_contacts',
  currencies: 'xero_get_currencies',
  items: 'xero_get_items',
  taxRates: 'xero_get_tax_rates'
}

let pendingFetches = 0

export const handleInput = (e, xeroConf, setXeroConf) => {
  const { name, value } = e.target

  setXeroConf(
    create(xeroConf, draftConf => {
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
    request.catch(error => toast.error(error.message, { id: 'xero-fetch-error' }))
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
    return requiredFlds.map(field => ({ formField: '', xeroField: field.key }))
  }

  return actionFields.length > 0 ? [{ formField: '', xeroField: '' }] : []
}

export const checkMappedFields = xeroConf => {
  if (!xeroConf?.mainAction) return false

  const missingSelect = (selectsByAction[xeroConf.mainAction] || []).some(
    select => select.required && !xeroConf[select.key]?.length
  )

  if (missingSelect) return false

  const incompleteRows = (xeroConf.field_map || []).filter(
    mappedField =>
      !mappedField.formField ||
      !mappedField.xeroField ||
      (mappedField.formField === 'custom' && !mappedField.customValue)
  )

  return incompleteRows.length === 0
}
