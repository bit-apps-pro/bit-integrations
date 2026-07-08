import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, powerCouponsConf, setPowerCouponsConf) => {
  const { name, value } = e.target

  setPowerCouponsConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const refreshList = (
  route,
  dataKey,
  confKey,
  successMsg,
  errorMsg,
  setPowerCouponsConf,
  setIsLoading
) => {
  setIsLoading(true)
  bitsFetch(null, route)
    .then(result => {
      if (result && result?.success && result?.data?.[dataKey]) {
        setPowerCouponsConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf[confKey] = result.data[dataKey]
          })
        )

        setIsLoading(false)
        toast.success(successMsg)
        return
      }

      setIsLoading(false)
      toast.error(errorMsg)
    })
    .catch(() => setIsLoading(false))
}

export const refreshPowerCouponsCoupons = (setPowerCouponsConf, setIsLoading) =>
  refreshList(
    'refresh_power_coupons_coupons',
    'coupons',
    'allCoupons',
    __('All coupons fetched successfully', 'bit-integrations'),
    __('Power Coupons fetch failed. Please try again', 'bit-integrations'),
    setPowerCouponsConf,
    setIsLoading
  )

export const checkMappedFields = powerCouponsConf => {
  const fieldMap = powerCouponsConf?.field_map || []

  const hasIncompleteRow = fieldMap.some(
    mappedField =>
      (mappedField.formField && !mappedField.powerCouponsField) ||
      (!mappedField.formField && mappedField.powerCouponsField) ||
      (mappedField.formField === 'custom' && !mappedField.customValue)
  )

  if (hasIncompleteRow) {
    return false
  }

  const requiredKeys = (powerCouponsConf?.powerCouponsFields || [])
    .filter(fld => fld.required === true)
    .map(fld => fld.key)
  const mappedKeys = fieldMap
    .filter(mappedField => mappedField.formField && mappedField.powerCouponsField)
    .map(mappedField => mappedField.powerCouponsField)

  return requiredKeys.every(key => mappedKeys.includes(key))
}

export const hasCouponLookup = powerCouponsConf => {
  const lookupActions = [
    'update_coupon',
    'delete_coupon',
    'toggle_auto_apply',
    'toggle_show_in_slideout',
    'toggle_rules'
  ]

  if (!lookupActions.includes(powerCouponsConf?.mainAction)) {
    return true
  }

  if (powerCouponsConf?.selectedCoupon) {
    return true
  }

  return (powerCouponsConf?.field_map || []).some(
    field =>
      field.formField &&
      ['coupon_id', 'coupon_code'].includes(field.powerCouponsField)
  )
}

export const hasUpdatePayload = powerCouponsConf => {
  if (powerCouponsConf?.mainAction !== 'update_coupon') {
    return true
  }

  return (powerCouponsConf?.field_map || []).some(
    field =>
      field.formField &&
      field.powerCouponsField &&
      !['coupon_id', 'coupon_code'].includes(field.powerCouponsField)
  )
}

export const checkPowerCouponsConfig = powerCouponsConf =>
  Boolean(powerCouponsConf?.mainAction) &&
  checkMappedFields(powerCouponsConf) &&
  hasCouponLookup(powerCouponsConf) &&
  hasUpdatePayload(powerCouponsConf)

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        powerCouponsField: field.key
      }))
    : [{ formField: '', powerCouponsField: '' }]
}
