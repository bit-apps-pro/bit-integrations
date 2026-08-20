import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_booking', label: __('Create Booking', 'bit-integrations'), is_pro: true },
  { name: 'update_booking', label: __('Update Booking', 'bit-integrations'), is_pro: true },
  { name: 'cancel_booking', label: __('Cancel Booking', 'bit-integrations'), is_pro: true },
  { name: 'create_agent', label: __('Create Agent', 'bit-integrations'), is_pro: true },
  { name: 'create_customer', label: __('Create Customer', 'bit-integrations'), is_pro: true },
  { name: 'create_order', label: __('Create Order', 'bit-integrations'), is_pro: true },
  { name: 'create_coupon', label: __('Create Coupon', 'bit-integrations'), is_pro: true },
  { name: 'update_coupon', label: __('Update Coupon', 'bit-integrations'), is_pro: true }
]

// Agent, service, location and bundle are chosen per flow via fetched dropdowns,
// so they are deliberately absent from every field map below.

export const CreateBookingFields = [
  { key: 'start_date', label: __('Start Date (Y-m-d)', 'bit-integrations'), required: true },
  { key: 'start_time', label: __('Start Time (HH:MM)', 'bit-integrations'), required: true },
  { key: 'end_time', label: __('End Time (HH:MM)', 'bit-integrations'), required: false },
  { key: 'customer_first_name', label: __('Customer First Name', 'bit-integrations'), required: false },
  { key: 'customer_last_name', label: __('Customer Last Name', 'bit-integrations'), required: false },
  { key: 'customer_email', label: __('Customer Email', 'bit-integrations'), required: false },
  { key: 'customer_phone', label: __('Customer Phone', 'bit-integrations'), required: false },
  { key: 'customer_notes', label: __('Customer Notes', 'bit-integrations'), required: false },
  {
    key: 'customer_id',
    label: __('Customer ID (existing customer)', 'bit-integrations'),
    required: false
  },
  { key: 'customer_comment', label: __('Customer Comment', 'bit-integrations'), required: false },
  { key: 'total_attendees', label: __('Total Attendees', 'bit-integrations'), required: false },
  { key: 'buffer_before', label: __('Buffer Before (minutes)', 'bit-integrations'), required: false },
  { key: 'buffer_after', label: __('Buffer After (minutes)', 'bit-integrations'), required: false }
]

export const UpdateBookingFields = [
  { key: 'booking_id', label: __('Booking ID', 'bit-integrations'), required: true },
  { key: 'start_date', label: __('Start Date (Y-m-d)', 'bit-integrations'), required: false },
  { key: 'start_time', label: __('Start Time (HH:MM)', 'bit-integrations'), required: false },
  { key: 'end_time', label: __('End Time (HH:MM)', 'bit-integrations'), required: false },
  { key: 'total_attendees', label: __('Total Attendees', 'bit-integrations'), required: false },
  { key: 'buffer_before', label: __('Buffer Before (minutes)', 'bit-integrations'), required: false },
  { key: 'buffer_after', label: __('Buffer After (minutes)', 'bit-integrations'), required: false }
]

export const CancelBookingFields = [
  { key: 'booking_id', label: __('Booking ID', 'bit-integrations'), required: true }
]

export const CreateAgentFields = [
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: true },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: true },
  { key: 'email', label: __('Email Address', 'bit-integrations'), required: true },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'bio', label: __('Bio', 'bit-integrations'), required: false },
  { key: 'wp_user_id', label: __('WordPress User ID', 'bit-integrations'), required: false }
]

export const CreateCustomerFields = [
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: true },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: true },
  { key: 'email', label: __('Email Address', 'bit-integrations'), required: true },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'notes', label: __('Notes', 'bit-integrations'), required: false }
]

export const CreateOrderFields = [
  { key: 'customer_first_name', label: __('Customer First Name', 'bit-integrations'), required: false },
  { key: 'customer_last_name', label: __('Customer Last Name', 'bit-integrations'), required: false },
  { key: 'customer_email', label: __('Customer Email', 'bit-integrations'), required: false },
  { key: 'customer_phone', label: __('Customer Phone', 'bit-integrations'), required: false },
  { key: 'customer_notes', label: __('Customer Notes', 'bit-integrations'), required: false },
  {
    key: 'customer_id',
    label: __('Customer ID (existing customer)', 'bit-integrations'),
    required: false
  }
]

export const CreateCouponFields = [
  { key: 'code', label: __('Coupon Code', 'bit-integrations'), required: true },
  { key: 'discount_value', label: __('Discount Value', 'bit-integrations'), required: true },
  { key: 'name', label: __('Coupon Name', 'bit-integrations'), required: false },
  { key: 'limit_per_customer', label: __('Limit Per Customer', 'bit-integrations'), required: false },
  { key: 'limit_total', label: __('Total Usage Limit', 'bit-integrations'), required: false },
  { key: 'orders_more', label: __('Orders More Than', 'bit-integrations'), required: false },
  { key: 'orders_less', label: __('Orders Less Than', 'bit-integrations'), required: false },
  { key: 'agent_ids', label: __('Agent IDs (comma separated)', 'bit-integrations'), required: false },
  {
    key: 'customer_ids',
    label: __('Customer IDs (comma separated)', 'bit-integrations'),
    required: false
  },
  { key: 'service_ids', label: __('Service IDs (comma separated)', 'bit-integrations'), required: false }
]

export const UpdateCouponFields = [
  { key: 'coupon_id', label: __('Coupon ID', 'bit-integrations'), required: true },
  { key: 'code', label: __('Coupon Code', 'bit-integrations'), required: false },
  { key: 'discount_value', label: __('Discount Value', 'bit-integrations'), required: false },
  { key: 'name', label: __('Coupon Name', 'bit-integrations'), required: false },
  { key: 'limit_per_customer', label: __('Limit Per Customer', 'bit-integrations'), required: false },
  { key: 'limit_total', label: __('Total Usage Limit', 'bit-integrations'), required: false },
  { key: 'orders_more', label: __('Orders More Than', 'bit-integrations'), required: false },
  { key: 'orders_less', label: __('Orders Less Than', 'bit-integrations'), required: false },
  { key: 'agent_ids', label: __('Agent IDs (comma separated)', 'bit-integrations'), required: false },
  {
    key: 'customer_ids',
    label: __('Customer IDs (comma separated)', 'bit-integrations'),
    required: false
  },
  { key: 'service_ids', label: __('Service IDs (comma separated)', 'bit-integrations'), required: false }
]

// Fixed option sets — rendered as selects, never field mapped.
export const customerTypeOptions = [
  { label: __('Create or match by email', 'bit-integrations'), value: 'new' },
  { label: __('Use existing customer ID', 'bit-integrations'), value: 'existing' }
]

export const discountTypeOptions = [
  { label: __('Percentage', 'bit-integrations'), value: 'percentage' },
  { label: __('Fixed Amount', 'bit-integrations'), value: 'fixed' }
]

export const couponStatusOptions = [
  { label: __('Active', 'bit-integrations'), value: 'active' },
  { label: __('Disabled', 'bit-integrations'), value: 'disabled' }
]

export const bookingStatusOptions = [
  { label: __('Approved', 'bit-integrations'), value: 'approved' },
  { label: __('Pending Approval', 'bit-integrations'), value: 'pending_approval' },
  { label: __('Cancelled', 'bit-integrations'), value: 'cancelled' },
  { label: __('No Show', 'bit-integrations'), value: 'no_show' },
  { label: __('Completed', 'bit-integrations'), value: 'completed' }
]

export const orderStatusOptions = [
  { label: __('Open', 'bit-integrations'), value: 'open' },
  { label: __('Cancelled', 'bit-integrations'), value: 'cancelled' },
  { label: __('Completed', 'bit-integrations'), value: 'completed' }
]

export const paymentStatusOptions = [
  { label: __('Not Paid', 'bit-integrations'), value: 'not_paid' },
  { label: __('Partially Paid', 'bit-integrations'), value: 'partially_paid' },
  { label: __('Fully Paid', 'bit-integrations'), value: 'fully_paid' },
  { label: __('Processing', 'bit-integrations'), value: 'processing' }
]

export const fulfillmentStatusOptions = [
  { label: __('Not Fulfilled', 'bit-integrations'), value: 'not_fulfilled' },
  { label: __('Partially Fulfilled', 'bit-integrations'), value: 'partially_fulfilled' },
  { label: __('Fulfilled', 'bit-integrations'), value: 'fulfilled' }
]

// Which actions render which control in the integration layout.
export const needsService = ['create_booking', 'update_booking']
export const needsAgentAndLocation = ['create_booking', 'update_booking']
export const needsCustomerType = ['create_booking', 'create_order']
export const needsBundle = ['create_order']
export const needsDiscountType = ['create_coupon', 'update_coupon']
export const needsCouponStatus = ['create_coupon', 'update_coupon']
export const needsAgentServices = ['create_agent']

// Actions exposing optional status enums under Utilities.
export const hasUtilities = ['create_booking', 'update_booking', 'create_order']
