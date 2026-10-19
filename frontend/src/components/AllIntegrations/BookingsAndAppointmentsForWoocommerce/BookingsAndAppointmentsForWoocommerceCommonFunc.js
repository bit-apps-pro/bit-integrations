import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (
  e,
  bookingsAndAppointmentsForWoocommerceConf,
  setBookingsAndAppointmentsForWoocommerceConf
) => {
  const { name, value } = e.target

  setBookingsAndAppointmentsForWoocommerceConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshProducts = (setBookingsAndAppointmentsForWoocommerceConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_bookings_and_appointments_for_woocommerce_products')
    .then(result => {
      if (result && result?.success && result?.data?.products) {
        setBookingsAndAppointmentsForWoocommerceConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allProducts = result.data.products
          })
        )
        setIsLoading(false)
        toast.success(__('All bookable products fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Bookable products fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const refreshCustomers = (setBookingsAndAppointmentsForWoocommerceConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_bookings_and_appointments_for_woocommerce_customers')
    .then(result => {
      if (result && result?.success && result?.data?.customers) {
        setBookingsAndAppointmentsForWoocommerceConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allCustomers = result.data.customers
          })
        )
        setIsLoading(false)
        toast.success(__('All customers fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Customers fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const refreshAssets = (setBookingsAndAppointmentsForWoocommerceConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_bookings_and_appointments_for_woocommerce_assets')
    .then(result => {
      if (result && result?.success && result?.data?.assets) {
        setBookingsAndAppointmentsForWoocommerceConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allAssets = result.data.assets
          })
        )
        setIsLoading(false)
        toast.success(__('All booking assets fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Booking assets fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = bookingsAndAppointmentsForWoocommerceConf => {
  const mappedFields = bookingsAndAppointmentsForWoocommerceConf?.field_map
    ? bookingsAndAppointmentsForWoocommerceConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.bookingsAndAppointmentsForWoocommerceField ||
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
        bookingsAndAppointmentsForWoocommerceField: field.key
      }))
    : [{ formField: '', bookingsAndAppointmentsForWoocommerceField: '' }]
}
