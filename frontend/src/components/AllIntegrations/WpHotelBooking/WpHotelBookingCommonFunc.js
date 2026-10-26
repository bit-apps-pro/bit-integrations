import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { needsBookingStatus, needsCoupon, needsDiscountType, needsExtras, needsRoom } from './staticData'

export const handleInput = (e, wpHotelBookingConf, setWpHotelBookingConf) => {
  const { name, value } = e.target

  setWpHotelBookingConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const fetchList =
  (route, dataKey, confKey, successMsg, errorMsg) => (setWpHotelBookingConf, setIsLoading) => {
    setIsLoading(true)
    bitsFetch(null, route)
      .then(result => {
        if (result?.success && result?.data?.[dataKey]) {
          setWpHotelBookingConf(prevConf =>
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

export const refreshWpHotelBookingRooms = fetchList(
  'refresh_wp_hotel_booking_rooms',
  'rooms',
  'allRooms',
  () => __('Rooms fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the rooms. Try again.', 'bit-integrations')
)

export const refreshWpHotelBookingCoupons = fetchList(
  'refresh_wp_hotel_booking_coupons',
  'coupons',
  'allCoupons',
  () => __('Coupons fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the coupons. Try again.', 'bit-integrations')
)

export const refreshWpHotelBookingExtras = fetchList(
  'refresh_wp_hotel_booking_extras',
  'extras',
  'allExtras',
  () => __('Extras fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the extras. Try again.', 'bit-integrations')
)

export const refreshWpHotelBookingRoomTypes = fetchList(
  'refresh_wp_hotel_booking_room_types',
  'roomTypes',
  'allRoomTypes',
  () => __('Room types fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the room types. Try again.', 'bit-integrations')
)

export const refreshWpHotelBookingPaymentMethods = fetchList(
  'refresh_wp_hotel_booking_payment_methods',
  'paymentMethods',
  'allPaymentMethods',
  () => __('Payment methods fetched successfully.', 'bit-integrations'),
  () => __('Could not fetch the payment methods. Try again.', 'bit-integrations')
)

export const refreshByOptionsKey = {
  allRoomTypes: refreshWpHotelBookingRoomTypes,
  allPaymentMethods: refreshWpHotelBookingPaymentMethods
}

export const checkMappedFields = wpHotelBookingConf => {
  const mappedFields = wpHotelBookingConf?.field_map
    ? wpHotelBookingConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.wpHotelBookingField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  return mappedFields.length === 0
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)

  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', wpHotelBookingField: field.key }))
    : [{ formField: '', wpHotelBookingField: '' }]
}

const requiredSelects = [
  {
    actions: needsRoom,
    confKey: 'selectedRoom',
    message: () => __('Room is not selected. Select a room.', 'bit-integrations')
  },
  {
    actions: needsBookingStatus,
    confKey: 'selectedBookingStatus',
    message: () => __('Booking status is not selected. Select a status.', 'bit-integrations')
  },
  {
    actions: needsDiscountType,
    confKey: 'selectedDiscountType',
    message: () => __('Discount type is not selected. Select a discount type.', 'bit-integrations')
  },
  {
    actions: needsCoupon,
    confKey: 'selectedCoupon',
    message: () => __('Coupon is not selected. Select a coupon.', 'bit-integrations')
  },
  {
    actions: needsExtras,
    confKey: 'selectedExtras',
    message: () => __('Extras are not selected. Select at least one extra.', 'bit-integrations')
  }
]

export const getMissingSelectMessage = wpHotelBookingConf => {
  if (!wpHotelBookingConf?.mainAction) {
    return __('Action is not selected. Select an action.', 'bit-integrations')
  }

  const missing = requiredSelects.find(
    ({ actions, confKey }) =>
      actions.includes(wpHotelBookingConf?.mainAction) && !wpHotelBookingConf?.[confKey]
  )

  return missing ? missing.message() : ''
}
