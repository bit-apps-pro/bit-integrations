import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { needsCar, needsRentalStatus } from './staticData'

export const handleInput = (e, setVikRentCarConf) => {
  const { name, value } = e.target

  setVikRentCarConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const handleCustomValue = (value, index, setVikRentCarConf) => {
  setVikRentCarConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf.field_map[index].customValue = value
    })
  )
}

const fetchList =
  (route, dataKey, confKey, successMsg, errorMsg) => (setVikRentCarConf, setIsLoading) => {
    setIsLoading(true)
    bitsFetch(null, route)
      .then(result => {
        if (result?.success && result?.data?.[dataKey]) {
          setVikRentCarConf(prevConf =>
            create(prevConf, draftConf => {
              draftConf[confKey] = result.data[dataKey]
            })
          )

          setIsLoading(false)
          toast.success(successMsg())
          return
        }
        setIsLoading(false)
        toast.error(typeof result?.data === 'string' && result.data ? result.data : errorMsg())
      })
      .catch(() => {
        setIsLoading(false)
        toast.error(errorMsg())
      })
  }

export const refreshVikRentCarCars = fetchList(
  'refresh_vik_rent_car_cars',
  'cars',
  'allCars',
  () => __('Cars fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the cars. Try again.', 'bit-integrations')
)

export const refreshVikRentCarLocations = fetchList(
  'refresh_vik_rent_car_locations',
  'locations',
  'allLocations',
  () => __('Locations fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the locations. Try again.', 'bit-integrations')
)

export const refreshVikRentCarCountries = fetchList(
  'refresh_vik_rent_car_countries',
  'countries',
  'allCountries',
  () => __('Countries fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the countries. Try again.', 'bit-integrations')
)

export const refreshByOptionsKey = {
  allCars: refreshVikRentCarCars,
  allLocations: refreshVikRentCarLocations,
  allCountries: refreshVikRentCarCountries
}

export const checkMappedFields = vikRentCarConf => {
  const mappedFields = vikRentCarConf?.field_map
    ? vikRentCarConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.vikRentCarField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  return mappedFields.length === 0
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)

  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', vikRentCarField: field.key }))
    : [{ formField: '', vikRentCarField: '' }]
}

const requiredSelects = [
  {
    actions: needsCar,
    confKey: 'selectedCar',
    message: () => __('Car is not selected. Select a car.', 'bit-integrations')
  },
  {
    actions: needsRentalStatus,
    confKey: 'selectedRentalStatus',
    message: () => __('Rental status is not selected. Select a rental status.', 'bit-integrations')
  }
]

export const requiredSelectKeys = requiredSelects.map(({ confKey }) => confKey)

export const getMissingSelectMessage = vikRentCarConf => {
  if (!vikRentCarConf?.mainAction) {
    return __('Action is not selected. Select an action.', 'bit-integrations')
  }

  const missing = requiredSelects.find(
    ({ actions, confKey }) => actions.includes(vikRentCarConf?.mainAction) && !vikRentCarConf?.[confKey]
  )

  return missing ? missing.message() : ''
}
