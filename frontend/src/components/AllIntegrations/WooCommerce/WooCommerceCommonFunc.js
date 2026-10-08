/* eslint-disable no-param-reassign */
import c from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import { deepCopy } from '../../../Utils/Helpers'

export const handleInput = (e, wcConf, setWcConf, setIsLoading, setSnackbar, isPro = false) => {
  let newConf = deepCopy(wcConf)
  const { name, value } = e.target
  newConf[name] = value
  switch (name) {
    case 'module':
      newConf = moduleChange(newConf, setWcConf, setIsLoading, setSnackbar, isPro)
      break
    default:
      break
  }
  setWcConf(newConf)
}

const moduleChange = (wcConf, setWcConf, setIsLoading, setSnackbar, isPro = false) => {
  let newConf = deepCopy(wcConf)
  if (!newConf[wcConf.module]) newConf[wcConf.module] = {}
  newConf[wcConf.module].field_map = []
  delete newConf.selects
  delete newConf.utilities
  if (!newConf?.default?.fields?.[wcConf.module]) {
    if (wcConf.module !== 'cancelSubscription') {
      refreshFields(newConf, setWcConf, setIsLoading, setSnackbar)
    } else {
      getAllSubscriptionsProducts(wcConf, setWcConf, setIsLoading, setSnackbar)
    }
  } else {
    newConf = generateMappedFields(newConf)
  }
  if (newConf?.module !== 'changestatus') {
    if (newConf?.filterstatus) delete newConf.filterstatus
    if (newConf?.orderchange) delete newConf.orderchange
  }
  if (newConf?.module === 'order' && !isPro) {
    newConf['taskNote'] = __(
      'Flexible Checkout Fields are a feature available in the Pro version.',
      'bit-integrations'
    )
  }
  return newConf
}

export const refreshFields = (wcConf, setWcConf, setIsLoading, setSnackbar) => {
  const { module } = wcConf
  if (!module) {
    return
  }

  setIsLoading(true)
  bitsFetch({ module }, 'wc_refresh_fields')
    .then(result => {
      if (result && result.success) {
        let newConf = deepCopy(wcConf)
        if (result.data) {
          if (!newConf.default) newConf.default = {}
          if (!newConf.default.fields) {
            newConf.default.fields = {}
          }

          if (module === 'order') {
            ;[
              newConf.default.fields.order,
              newConf.default.fields.customer,
              newConf.default.fields.line_item
            ] = result.data
            if (!newConf?.order) newConf.order = {}
            if (!newConf?.customer) newConf.customer = {}
            if (!newConf?.line_item) newConf.line_item = {}
            if (!newConf?.order?.field_map) newConf.order.field_map = [{ formField: '', wcField: '' }]
            if (!newConf?.customer?.field_map)
              newConf.customer.field_map = [{ formField: '', wcField: '' }]
            if (!newConf?.line_item?.field_map)
              newConf.line_item.field_map = [{ formField: '', wcField: '' }]
            if (!newConf?.order?.upload_field_map)
              newConf.order.upload_field_map = [{ formField: '', wcField: '' }]
            if (!newConf?.customer?.upload_field_map)
              newConf.customer.upload_field_map = [{ formField: '', wcField: '' }]

            newConf = generateMappedFields(newConf, 'order')
            newConf = generateMappedFields(newConf, 'customer')
            newConf = generateLineMappedFields(newConf, 'line_item')

            setWcConf(newConf)
            setSnackbar({ show: true, msg: __('Fields refreshed', 'bit-integrations') })
          } else {
            newConf.default.fields[module] = result.data
            if (!newConf?.[module]) newConf[module] = {}
            if (!newConf?.[module]?.field_map)
              newConf[module].field_map = [{ formField: '', wcField: '' }]
            if (!newConf?.[module]?.upload_field_map)
              newConf[module].upload_field_map = [{ formField: '', wcField: '' }]
            newConf = generateMappedFields(newConf, module)
            setWcConf(newConf)
            setSnackbar({ show: true, msg: __('Fields refreshed', 'bit-integrations') })
          }
        }
      } else {
        setSnackbar({
          show: true,
          msg: __('Fields refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

const generateLineMappedFields = (wcConf, mod) => {
  const newConf = deepCopy(wcConf)

  newConf.default.fields[mod].required.forEach(reqFld => {
    if (!newConf[mod].field_map.find(fld => fld.wcField === reqFld)) {
      newConf[mod].field_map.unshift({ formField: '', wcField: reqFld, required: true })
    }
  })
  if (!newConf[mod].field_map.length) newConf[mod].field_map = [{ formField: '', wcField: '' }]
  return newConf
}

const generateMappedFields = (wcConf, mod = '') => {
  const newConf = deepCopy(wcConf)
  if (mod === '') mod = newConf.module

  newConf.default.fields[mod].required.forEach(reqFld => {
    if (!newConf[mod].field_map.find(fld => fld.wcField === reqFld)) {
      newConf[mod].field_map.unshift({ formField: '', wcField: reqFld, required: true })
    }
  })
  if (!newConf[mod].field_map.length) newConf[mod].field_map = [{ formField: '', wcField: '' }]
  return newConf
}

export const checkMappedFields = fieldMap => {
  const mappedFields = fieldMap
    ? fieldMap.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.wcField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const getAllSubscriptionsProducts = (wcConf, setWcConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  bitsFetch({}, 'wc_get_all_subscriptions_products')
    .then(result => {
      if (result && result.success) {
        const newConf = deepCopy(wcConf)
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.default.allSubscriptionProducts = result.data
        }
        setWcConf({ ...newConf })
        setSnackbar({ show: true, msg: __('Subscription product refreshed', 'bit-integrations') })
      } else {
        setSnackbar({
          show: true,
          msg: __('Failed to fetching subscription product. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}
