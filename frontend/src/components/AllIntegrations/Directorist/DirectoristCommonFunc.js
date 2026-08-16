import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, directoristConf, setDirectoristConf) => {
  const { name, value } = e.target

  setDirectoristConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const fetchList = (route, dataKey, confKey, label, setDirectoristConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, route)
    .then(result => {
      if (result && result?.success && result?.data?.[dataKey]) {
        setDirectoristConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf[confKey] = result.data[dataKey]
          })
        )

        setIsLoading(false)
        toast.success(`${label} ${__('fetched successfully', 'bit-integrations')}`)
        return
      }
      setIsLoading(false)
      toast.error(`${label} ${__('fetch failed. Please try again', 'bit-integrations')}`)
    })
    .catch(() => setIsLoading(false))
}

export const refreshDirectoristDirectories = (setDirectoristConf, setIsLoading) =>
  fetchList(
    'refresh_directorist_directories',
    'directories',
    'allDirectories',
    __('Directories', 'bit-integrations'),
    setDirectoristConf,
    setIsLoading
  )

export const refreshDirectoristCategories = (setDirectoristConf, setIsLoading) =>
  fetchList(
    'refresh_directorist_categories',
    'categories',
    'allCategories',
    __('Categories', 'bit-integrations'),
    setDirectoristConf,
    setIsLoading
  )

export const refreshDirectoristLocations = (setDirectoristConf, setIsLoading) =>
  fetchList(
    'refresh_directorist_locations',
    'locations',
    'allLocations',
    __('Locations', 'bit-integrations'),
    setDirectoristConf,
    setIsLoading
  )

export const refreshDirectoristTags = (setDirectoristConf, setIsLoading) =>
  fetchList(
    'refresh_directorist_tags',
    'tags',
    'allTags',
    __('Tags', 'bit-integrations'),
    setDirectoristConf,
    setIsLoading
  )

export const refreshDirectoristUsers = (setDirectoristConf, setIsLoading) =>
  fetchList(
    'refresh_directorist_users',
    'users',
    'allUsers',
    __('Users', 'bit-integrations'),
    setDirectoristConf,
    setIsLoading
  )

export const refreshDirectoristListingStatuses = (setDirectoristConf, setIsLoading) =>
  fetchList(
    'refresh_directorist_listing_statuses',
    'statuses',
    'allListingStatuses',
    __('Listing statuses', 'bit-integrations'),
    setDirectoristConf,
    setIsLoading
  )

export const refreshDirectoristOrderStatuses = (setDirectoristConf, setIsLoading) =>
  fetchList(
    'refresh_directorist_order_statuses',
    'statuses',
    'allOrderStatuses',
    __('Order statuses', 'bit-integrations'),
    setDirectoristConf,
    setIsLoading
  )

export const checkMappedFields = directoristConf => {
  if (!directoristConf?.mainAction) {
    return false
  }

  const mappedFields = directoristConf?.field_map
    ? directoristConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.directoristField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  return mappedFields.length === 0
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        directoristField: field.key
      }))
    : [{ formField: '', directoristField: '' }]
}
