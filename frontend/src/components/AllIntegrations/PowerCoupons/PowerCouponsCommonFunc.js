import { create } from 'mutative'

const TOGGLE_ACTIONS = ['toggle_auto_apply', 'toggle_show_in_slideout', 'toggle_rules']
const UPDATE_UTILITY_FIELDS = [
  'discount_type',
  'free_shipping',
  'individual_use',
  'exclude_sale_items',
  'auto_apply',
  'show_in_slideout',
  'rules_enabled'
]

export const handleInput = (e, powerCouponsConf, setPowerCouponsConf) => {
  const { name, value } = e.target

  setPowerCouponsConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

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
  const lookupActions = ['update_coupon', 'delete_coupon', ...TOGGLE_ACTIONS]

  if (!lookupActions.includes(powerCouponsConf?.mainAction)) {
    return true
  }

  return (powerCouponsConf?.field_map || []).some(
    field =>
      field.formField &&
      field.powerCouponsField === 'coupon_code'
  )
}

const hasUtilityValue = (powerCouponsConf, key) => {
  const utilities = powerCouponsConf?.utilities || {}

  return Object.prototype.hasOwnProperty.call(utilities, key) && utilities[key] !== ''
}

export const hasUpdatePayload = powerCouponsConf => {
  if (powerCouponsConf?.mainAction !== 'update_coupon') {
    return true
  }

  const hasMappedUpdateField = (powerCouponsConf?.field_map || []).some(
    field =>
      field.formField &&
      field.powerCouponsField &&
      field.powerCouponsField !== 'coupon_code'
  )

  return hasMappedUpdateField || UPDATE_UTILITY_FIELDS.some(key => hasUtilityValue(powerCouponsConf, key))
}

export const hasRequiredUtilities = powerCouponsConf => {
  if (powerCouponsConf?.mainAction === 'create_coupon') {
    return hasUtilityValue(powerCouponsConf, 'discount_type')
  }

  if (TOGGLE_ACTIONS.includes(powerCouponsConf?.mainAction)) {
    return hasUtilityValue(powerCouponsConf, 'enabled')
  }

  return true
}

export const checkPowerCouponsConfig = powerCouponsConf =>
  Boolean(powerCouponsConf?.mainAction) &&
  checkMappedFields(powerCouponsConf) &&
  hasCouponLookup(powerCouponsConf) &&
  hasUpdatePayload(powerCouponsConf) &&
  hasRequiredUtilities(powerCouponsConf)

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        powerCouponsField: field.key
      }))
    : [{ formField: '', powerCouponsField: '' }]
}
