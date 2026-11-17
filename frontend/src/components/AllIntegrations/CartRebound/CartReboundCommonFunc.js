import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { fieldsByAction, needsStatus } from './staticData'

export const handleInput = (e, cartReboundConf, setCartReboundConf) => {
  const { name, value } = e.target

  setCartReboundConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const fetchList =
  (route, dataKey, confKey, successMsg, errorMsg) =>
  (setCartReboundConf, setIsLoading, notify = true) => {
    setIsLoading?.(true)

    return bitsFetch(null, route)
      .then(result => {
        if (result && result?.success && Array.isArray(result?.data?.[dataKey])) {
          setCartReboundConf(prevConf =>
            create(prevConf, draftConf => {
              draftConf[confKey] = result.data[dataKey]
            })
          )

          if (notify) {
            toast.success(successMsg())
          }
          return
        }
        toast.error(errorMsg())
      })
      .catch(() => toast.error(errorMsg()))
      .finally(() => setIsLoading?.(false))
  }

export const refreshCartReboundTemplates = fetchList(
  'refresh_cart_rebound_templates',
  'templates',
  'allTemplates',
  () => __('The templates are loaded.', 'bit-integrations'),
  () => __('The templates did not load. Try again.', 'bit-integrations')
)

export const refreshCartReboundCoupons = fetchList(
  'refresh_cart_rebound_coupons',
  'coupons',
  'allCoupons',
  () => __('The coupons are loaded.', 'bit-integrations'),
  () => __('The coupons did not load. Try again.', 'bit-integrations')
)

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        cartReboundField: field.key
      }))
    : [{ formField: '', cartReboundField: '' }]
}

const isBlankRow = mappedField => !mappedField.formField && !mappedField.cartReboundField

export const checkMappedFields = cartReboundConf => {
  const fieldMap = cartReboundConf?.field_map || []
  const invalidRows = fieldMap.filter(
    mappedField =>
      !isBlankRow(mappedField) &&
      (!mappedField.formField ||
        !mappedField.cartReboundField ||
        (mappedField.formField === 'custom' && !mappedField.customValue))
  )

  if (invalidRows.length > 0) {
    return false
  }

  const requiredKeys = (fieldsByAction[cartReboundConf?.mainAction] || [])
    .filter(field => field.required === true)
    .map(field => field.key)

  return requiredKeys.every(key =>
    fieldMap.some(mappedField => mappedField.cartReboundField === key && mappedField.formField)
  )
}

export const getConfError = cartReboundConf => {
  const { mainAction } = cartReboundConf || {}

  if (!mainAction) {
    return __('Select an action to continue.', 'bit-integrations')
  }

  if (needsStatus.includes(mainAction) && !cartReboundConf?.selectedStatus) {
    return __('Select a status to continue.', 'bit-integrations')
  }

  if (!checkMappedFields(cartReboundConf)) {
    return __('Map all required fields to continue.', 'bit-integrations')
  }

  const hasMappedValue = (exceptKeys = []) =>
    (cartReboundConf?.field_map || []).some(
      mappedField =>
        mappedField.formField &&
        mappedField.cartReboundField &&
        !exceptKeys.includes(mappedField.cartReboundField)
    )
  const hasUtility = Object.keys(cartReboundConf?.utilities || {}).length > 0

  if (
    mainAction === 'update_template' &&
    !hasMappedValue(['template_id']) &&
    !cartReboundConf?.selectedCoupon &&
    !hasUtility
  ) {
    return __(
      'Map a field to update, select a coupon or select Make Default to continue.',
      'bit-integrations'
    )
  }

  return ''
}
