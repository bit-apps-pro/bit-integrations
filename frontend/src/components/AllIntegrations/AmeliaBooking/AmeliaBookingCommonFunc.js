import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { selectsByAction } from './staticData'

export const handleInput = (e, setAmeliaBookingConf) => {
  const { name, value } = e.target

  setAmeliaBookingConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const lists = {
  services: {
    route: 'refresh_amelia_booking_services',
    error: __('Amelia did not send the services. Try again.', 'bit-integrations')
  },
  employees: {
    route: 'refresh_amelia_booking_employees',
    error: __('Amelia did not send the employees. Try again.', 'bit-integrations')
  },
  locations: {
    route: 'refresh_amelia_booking_locations',
    error: __('Amelia did not send the locations. Try again.', 'bit-integrations')
  },
  categories: {
    route: 'refresh_amelia_booking_categories',
    error: __('Amelia did not send the categories. Try again.', 'bit-integrations')
  },
  events: {
    route: 'refresh_amelia_booking_events',
    error: __('Amelia did not send the events. Try again.', 'bit-integrations')
  }
}

export const listConfKey = listName => `all_${listName}`

const fetchList = listName =>
  bitsFetch(null, lists[listName].route)
    .then(result => ({ listName, result }))
    .catch(() => ({ listName, result: null }))

const storeList = (setAmeliaBookingConf, listName, result) => {
  if (!result?.success || !Array.isArray(result?.data?.[listName])) {
    toast.error(lists[listName].error)
    return
  }

  setAmeliaBookingConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[listConfKey(listName)] = result.data[listName].map(option => ({
        label: option.label,
        value: String(option.value)
      }))
    })
  )
}

export const refreshAmeliaBookingLists = (listNames, setAmeliaBookingConf, setIsLoading) => {
  if (!listNames.length) {
    return
  }

  setIsLoading(true)
  Promise.all(listNames.map(fetchList)).then(results => {
    results.forEach(({ listName, result }) => storeList(setAmeliaBookingConf, listName, result))
    setIsLoading(false)
  })
}

export const checkMappedFields = ameliaBookingConf => {
  const fields = ameliaBookingConf?.ameliaBookingFields || []
  const fieldMap = ameliaBookingConf?.field_map || []

  const invalidRows = fieldMap.filter(
    mappedField =>
      !mappedField.formField ||
      !mappedField.ameliaBookingField ||
      (mappedField.formField === 'custom' && !mappedField.customValue)
  )

  if (invalidRows.length > 0) {
    return false
  }

  return fields
    .filter(item => item.required)
    .every(item => fieldMap.some(mappedField => mappedField.ameliaBookingField === item.key))
}

export const requiredSelectMissing = ameliaBookingConf => {
  const { mainAction } = ameliaBookingConf || {}

  if (!mainAction) {
    return __('Select an action to continue.', 'bit-integrations')
  }

  const missing = (selectsByAction[mainAction] || []).find(
    item => item.required && !ameliaBookingConf?.[item.confKey]
  )

  if (missing) {
    return __('Select a value in every required list to continue.', 'bit-integrations')
  }

  return ''
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)

  return requiredFlds.length > 0
    ? requiredFlds.map(item => ({ formField: '', ameliaBookingField: item.key }))
    : [{ formField: '', ameliaBookingField: '' }]
}
