import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_booking', label: __('Create Booking', 'bit-integrations'), is_pro: true },
  {
    name: 'update_booking_status',
    label: __('Update Booking Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'approve_booking', label: __('Approve Booking', 'bit-integrations'), is_pro: true },
  { name: 'cancel_booking', label: __('Cancel Booking', 'bit-integrations'), is_pro: true },
  { name: 'delete_booking', label: __('Delete Booking', 'bit-integrations'), is_pro: true },
  {
    name: 'set_booking_as_paid',
    label: __('Set Booking As Paid', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_coupon', label: __('Create Coupon', 'bit-integrations'), is_pro: true },
  { name: 'update_coupon', label: __('Update Coupon', 'bit-integrations'), is_pro: true },
  { name: 'create_service', label: __('Create Service', 'bit-integrations'), is_pro: true },
  { name: 'update_service', label: __('Update Service', 'bit-integrations'), is_pro: true },
  {
    name: 'create_service_category',
    label: __('Create Service Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_staff_member',
    label: __('Create Staff Member', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_location', label: __('Create Location', 'bit-integrations'), is_pro: true }
]

export const BookingFields = [
  { key: 'name', label: __('Customer Name', 'bit-integrations'), required: true },
  { key: 'email', label: __('Customer Email', 'bit-integrations'), required: true },
  { key: 'time', label: __('Booking Date/Time', 'bit-integrations'), required: true },
  { key: 'duration', label: __('Duration (minutes)', 'bit-integrations'), required: true },
  { key: 'quantity', label: __('Quantity', 'bit-integrations'), required: true },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'time_offset', label: __('Time Offset', 'bit-integrations'), required: false }
]

export const CancelFields = [
  {
    key: 'by',
    label: __('Cancelled By (customer/administrator/auto)', 'bit-integrations'),
    required: false
  }
]

export const PaidFields = [
  { key: 'method', label: __('Payment Method', 'bit-integrations'), required: true },
  { key: 'amount', label: __('Amount Paid', 'bit-integrations'), required: true }
]

export const CouponFields = [
  { key: 'name', label: __('Coupon Name', 'bit-integrations'), required: true },
  { key: 'amount_percentage', label: __('Percentage Discount', 'bit-integrations'), required: false },
  { key: 'amount_fixed', label: __('Fixed Discount', 'bit-integrations'), required: false },
  { key: 'maximum', label: __('Maximum Usage', 'bit-integrations'), required: false }
]

export const CouponUpdateFields = [
  { key: 'name', label: __('Coupon Name', 'bit-integrations'), required: false },
  { key: 'amount_percentage', label: __('Percentage Discount', 'bit-integrations'), required: false },
  { key: 'amount_fixed', label: __('Fixed Discount', 'bit-integrations'), required: false },
  { key: 'maximum', label: __('Maximum Usage', 'bit-integrations'), required: false }
]

export const ServiceFields = [
  { key: 'name', label: __('Service Name', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'duration', label: __('Duration (minutes)', 'bit-integrations'), required: false },
  { key: 'price', label: __('Price', 'bit-integrations'), required: false },
  { key: 'quantity', label: __('Quantity', 'bit-integrations'), required: false }
]

export const ServiceUpdateFields = [
  { key: 'name', label: __('Service Name', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'duration', label: __('Duration (minutes)', 'bit-integrations'), required: false },
  { key: 'price', label: __('Price', 'bit-integrations'), required: false },
  { key: 'quantity', label: __('Quantity', 'bit-integrations'), required: false }
]

export const CategoryFields = [
  { key: 'name', label: __('Category Name', 'bit-integrations'), required: true },
  { key: 'list', label: __('Service IDs (comma separated)', 'bit-integrations'), required: false }
]

export const StaffFields = [
  { key: 'name', label: __('Staff Name', 'bit-integrations'), required: true },
  { key: 'email', label: __('Staff Email', 'bit-integrations'), required: false }
]

export const LocationFields = [
  { key: 'name', label: __('Location Name', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'address', label: __('Address', 'bit-integrations'), required: false }
]
