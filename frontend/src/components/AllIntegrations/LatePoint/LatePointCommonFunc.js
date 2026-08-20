import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import {
  needsAgentAndLocation,
  needsBundle,
  needsCustomerType,
  needsDiscountType,
  needsService
} from './staticData'

export const handleInput = (e, latePointConf, setLatePointConf) => {
  const { name, value } = e.target

  setLatePointConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const FETCHERS = {
  agents: { route: 'refresh_latepoint_agents', dataKey: 'agents' },
  services: { route: 'refresh_latepoint_services', dataKey: 'services' },
  locations: { route: 'refresh_latepoint_locations', dataKey: 'locations' },
  bundles: { route: 'refresh_latepoint_bundles', dataKey: 'bundles' }
}

const LIST_LABELS = {
  agents: () => __('agents', 'bit-integrations'),
  services: () => __('services', 'bit-integrations'),
  locations: () => __('locations', 'bit-integrations'),
  bundles: () => __('bundles', 'bit-integrations')
}

const fetchList = (key, setLists) => {
  const { route, dataKey } = FETCHERS[key]

  return bitsFetch(null, route).then(result => {
    if (result?.success && result?.data?.[dataKey]) {
      setLists(prev => ({ ...prev, [key]: result.data[dataKey] }))
      return true
    }

    throw new Error(key)
  })
}

export const refreshLatePointLists = (setLists, setIsLoading, keys) => {
  const wanted = keys.filter(key => FETCHERS[key])

  if (wanted.length === 0) {
    return Promise.resolve()
  }

  setIsLoading(true)

  return Promise.allSettled(wanted.map(key => fetchList(key, setLists))).then(results => {
    setIsLoading(false)

    const failed = wanted.filter((key, i) => results[i].status === 'rejected')

    if (failed.length > 0) {
      toast.error(
        `${__('LatePoint fetch failed for', 'bit-integrations')} ${failed
          .map(key => LIST_LABELS[key]())
          .join(', ')}. ${__('Please try again', 'bit-integrations')}`
      )
      return
    }

    toast.success(__('LatePoint lists fetched successfully', 'bit-integrations'))
  })
}

export const refreshLatePointAgents = (setLists, setIsLoading) =>
  refreshLatePointLists(setLists, setIsLoading, ['agents'])

export const refreshLatePointServices = (setLists, setIsLoading) =>
  refreshLatePointLists(setLists, setIsLoading, ['services'])

export const refreshLatePointLocations = (setLists, setIsLoading) =>
  refreshLatePointLists(setLists, setIsLoading, ['locations'])

export const refreshLatePointBundles = (setLists, setIsLoading) =>
  refreshLatePointLists(setLists, setIsLoading, ['bundles'])

export const listsForAction = action => {
  const keys = []

  if (needsService.includes(action)) {
    keys.push('services')
  }
  if (needsAgentAndLocation.includes(action)) {
    keys.push('agents', 'locations')
  }
  if (action === 'create_agent' && !keys.includes('services')) {
    keys.push('services')
  }
  if (needsBundle.includes(action)) {
    keys.push('bundles')
  }

  return keys
}

export const checkMappedFields = latePointConf => {
  const mappedFields = latePointConf?.field_map
    ? latePointConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.latePointField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

const isMapped = (latePointConf, key) =>
  (latePointConf?.field_map || []).some(
    row => row.latePointField === key && row.formField && (row.formField !== 'custom' || row.customValue)
  )

export const validateLatePointConf = latePointConf => {
  const action = latePointConf?.mainAction

  if (!action) {
    return __('Please select an action to continue.', 'bit-integrations')
  }

  if (needsService.includes(action) && !latePointConf?.selectedService) {
    return __('Please select a service to continue.', 'bit-integrations')
  }

  if (action === 'create_booking') {
    if (!latePointConf?.selectedAgent) {
      return __('Please select an agent to continue.', 'bit-integrations')
    }
    if (!latePointConf?.selectedLocation) {
      return __('Please select a location to continue.', 'bit-integrations')
    }
  }

  if (needsBundle.includes(action) && !latePointConf?.selectedBundle) {
    return __('Please select a bundle to continue.', 'bit-integrations')
  }

  if (action === 'create_coupon' && needsDiscountType.includes(action) && !latePointConf?.discountType) {
    return __('Please select a discount type to continue.', 'bit-integrations')
  }

  if (needsCustomerType.includes(action)) {
    if (!latePointConf?.customerType) {
      return __('Please select a customer option to continue.', 'bit-integrations')
    }

    if (latePointConf.customerType === 'existing') {
      if (!isMapped(latePointConf, 'customer_id')) {
        return __('Please map Customer ID to use an existing customer.', 'bit-integrations')
      }
    } else {
      const missing = ['customer_first_name', 'customer_last_name', 'customer_email'].filter(
        key => !isMapped(latePointConf, key)
      )

      if (missing.length > 0) {
        return __(
          'Please map Customer First Name, Customer Last Name and Customer Email.',
          'bit-integrations'
        )
      }
    }
  }

  return ''
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        latePointField: field.key
      }))
    : [{ formField: '', latePointField: '' }]
}
