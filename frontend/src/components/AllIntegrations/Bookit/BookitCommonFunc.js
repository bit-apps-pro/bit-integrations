import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import {
  needsCategory,
  needsPaymentStatus,
  needsService,
  needsStaff,
  needsStatus,
  needsWeekdays
} from './staticData'

export const handleInput = (e, bookitConf, setBookitConf) => {
  const { name, value } = e.target

  setBookitConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const handleCustomValue = (value, index, setBookitConf) => {
  setBookitConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf.field_map[index].customValue = value
    })
  )
}

const fetchList = (route, dataKey, confKey, successMsg, errorMsg) => (setBookitConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, route)
    .then(result => {
      if (result?.success && result?.data?.[dataKey]) {
        setBookitConf(prevConf =>
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

export const refreshBookitServices = fetchList(
  'refresh_bookit_services',
  'services',
  'allServices',
  () => __('Services fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the services. Try again.', 'bit-integrations')
)

export const refreshBookitStaff = fetchList(
  'refresh_bookit_staff',
  'staff',
  'allStaff',
  () => __('Staff members fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the staff members. Try again.', 'bit-integrations')
)

export const refreshBookitCustomers = fetchList(
  'refresh_bookit_customers',
  'customers',
  'allCustomers',
  () => __('Customers fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the customers. Try again.', 'bit-integrations')
)

export const refreshBookitCategories = fetchList(
  'refresh_bookit_categories',
  'categories',
  'allCategories',
  () => __('Categories fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the categories. Try again.', 'bit-integrations')
)

export const refreshBookitPaymentMethods = fetchList(
  'refresh_bookit_payment_methods',
  'paymentMethods',
  'allPaymentMethods',
  () => __('Payment methods fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the payment methods. Try again.', 'bit-integrations')
)

export const refreshBookitWpUsers = fetchList(
  'refresh_bookit_wp_users',
  'wpUsers',
  'allWpUsers',
  () => __('WordPress users fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the WordPress users. Try again.', 'bit-integrations')
)

export const refreshBookitStaffWpUsers = fetchList(
  'refresh_bookit_staff_wp_users',
  'staffWpUsers',
  'allStaffWpUsers',
  () => __('WordPress users fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the WordPress users. Try again.', 'bit-integrations')
)

export const refreshByOptionsKey = {
  allServices: refreshBookitServices,
  allStaff: refreshBookitStaff,
  allCustomers: refreshBookitCustomers,
  allCategories: refreshBookitCategories,
  allPaymentMethods: refreshBookitPaymentMethods,
  allWpUsers: refreshBookitWpUsers,
  allStaffWpUsers: refreshBookitStaffWpUsers
}

export const checkMappedFields = bookitConf => {
  const mappedFields = bookitConf?.field_map
    ? bookitConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.bookitField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  return mappedFields.length === 0
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)

  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', bookitField: field.key }))
    : [{ formField: '', bookitField: '' }]
}

const requiredSelects = [
  {
    actions: needsService,
    confKey: 'selectedService',
    message: () => __('Service is not selected. Select a service.', 'bit-integrations')
  },
  {
    actions: needsStaff,
    confKey: 'selectedStaff',
    message: () => __('Staff member is not selected. Select a staff member.', 'bit-integrations')
  },
  {
    actions: needsStatus,
    confKey: 'selectedStatus',
    message: () => __('Status is not selected. Select a status.', 'bit-integrations')
  },
  {
    actions: needsPaymentStatus,
    confKey: 'selectedPaymentStatus',
    message: () => __('Payment status is not selected. Select a payment status.', 'bit-integrations')
  },
  {
    actions: needsWeekdays,
    confKey: 'selectedWeekdays',
    message: () => __('Weekdays are not selected. Select one or more weekdays.', 'bit-integrations')
  },
  {
    actions: needsCategory,
    confKey: 'selectedCategory',
    message: () => __('Category is not selected. Select a category.', 'bit-integrations')
  }
]

export const getMissingSelectMessage = bookitConf => {
  if (!bookitConf?.mainAction) {
    return __('Action is not selected. Select an action.', 'bit-integrations')
  }

  const missing = requiredSelects.find(
    ({ actions, confKey }) => actions.includes(bookitConf?.mainAction) && !bookitConf?.[confKey]
  )

  return missing ? missing.message() : ''
}
