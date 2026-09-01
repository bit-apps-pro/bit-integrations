import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_customer', label: __('Create Customer', 'bit-integrations'), is_pro: true },
  { name: 'update_customer', label: __('Update Customer', 'bit-integrations'), is_pro: true },
  { name: 'delete_customer', label: __('Delete Customer', 'bit-integrations'), is_pro: true },
  { name: 'create_agent', label: __('Create Agent', 'bit-integrations'), is_pro: true },
  { name: 'update_agent', label: __('Update Agent', 'bit-integrations'), is_pro: true },
  { name: 'delete_agent', label: __('Delete Agent', 'bit-integrations'), is_pro: true },
  { name: 'create_service', label: __('Create Service', 'bit-integrations'), is_pro: true },
  { name: 'update_service', label: __('Update Service', 'bit-integrations'), is_pro: true },
  {
    name: 'update_service_status',
    label: __('Update Service Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'delete_service', label: __('Delete Service', 'bit-integrations'), is_pro: true },
  { name: 'create_category', label: __('Create Category', 'bit-integrations'), is_pro: true },
  { name: 'update_category', label: __('Update Category', 'bit-integrations'), is_pro: true },
  { name: 'delete_category', label: __('Delete Category', 'bit-integrations'), is_pro: true },
  { name: 'create_appointment', label: __('Create Appointment', 'bit-integrations'), is_pro: true },
  { name: 'update_appointment', label: __('Update Appointment', 'bit-integrations'), is_pro: true },
  {
    name: 'update_appointment_status',
    label: __('Update Appointment Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'delete_appointment', label: __('Delete Appointment', 'bit-integrations'), is_pro: true },
  { name: 'create_order', label: __('Create Order', 'bit-integrations'), is_pro: true },
  { name: 'update_order', label: __('Update Order', 'bit-integrations'), is_pro: true },
  { name: 'update_order_status', label: __('Update Order Status', 'bit-integrations'), is_pro: true },
  { name: 'refund_order', label: __('Refund Order', 'bit-integrations'), is_pro: true },
  { name: 'delete_order', label: __('Delete Order', 'bit-integrations'), is_pro: true },
  { name: 'create_payment', label: __('Create Payment', 'bit-integrations'), is_pro: true },
  {
    name: 'update_payment_status',
    label: __('Update Payment Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_notification', label: __('Create Notification', 'bit-integrations'), is_pro: true }
]

export const CustomerFields = [
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: true },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: true },
  { key: 'email', label: __('Email', 'bit-integrations'), required: true },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'gender', label: __('Gender', 'bit-integrations'), required: false },
  { key: 'dob', label: __('Date of Birth', 'bit-integrations'), required: false },
  { key: 'wp_user_id', label: __('WordPress User ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_wp_user_email',
    label: __('Find WordPress User by Email', 'bit-integrations'),
    required: false
  },
  { key: 'internal_notes', label: __('Internal Notes', 'bit-integrations'), required: false }
]

export const CustomerUpdateFields = [
  { key: 'customer_id', label: __('Customer ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_customer_email',
    label: __('Find Customer by Email', 'bit-integrations'),
    required: false
  },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'gender', label: __('Gender', 'bit-integrations'), required: false },
  { key: 'dob', label: __('Date of Birth', 'bit-integrations'), required: false },
  { key: 'internal_notes', label: __('Internal Notes', 'bit-integrations'), required: false }
]

export const CustomerIdField = [
  { key: 'customer_id', label: __('Customer ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_customer_email',
    label: __('Find Customer by Email', 'bit-integrations'),
    required: false
  }
]

export const AgentFields = [
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: true },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: true },
  { key: 'email', label: __('Email', 'bit-integrations'), required: true },
  { key: 'title', label: __('Job Title', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'experience_years', label: __('Years of Experience', 'bit-integrations'), required: false },
  { key: 'bio', label: __('Bio', 'bit-integrations'), required: false },
  { key: 'internal_notes', label: __('Internal Notes', 'bit-integrations'), required: false }
]

export const AgentUpdateFields = [
  { key: 'agent_id', label: __('Agent ID', 'bit-integrations'), required: false },
  { key: 'find_by_agent_email', label: __('Find Agent by Email', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'title', label: __('Job Title', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'bio', label: __('Bio', 'bit-integrations'), required: false },
  { key: 'internal_notes', label: __('Internal Notes', 'bit-integrations'), required: false }
]

export const AgentIdField = [
  { key: 'agent_id', label: __('Agent ID', 'bit-integrations'), required: false },
  { key: 'find_by_agent_email', label: __('Find Agent by Email', 'bit-integrations'), required: false }
]

export const ServiceFields = [
  { key: 'title', label: __('Title', 'bit-integrations'), required: true },
  { key: 'duration', label: __('Duration (minutes)', 'bit-integrations'), required: true },
  { key: 'price', label: __('Price', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'capacity', label: __('Capacity', 'bit-integrations'), required: false },
  { key: 'max_capacity', label: __('Maximum Capacity', 'bit-integrations'), required: false },
  { key: 'deposit_amount', label: __('Deposit Amount', 'bit-integrations'), required: false },
  { key: 'color', label: __('Calendar Colour', 'bit-integrations'), required: false },
  { key: 'internal_notes', label: __('Internal Notes', 'bit-integrations'), required: false }
]

export const ServiceUpdateFields = [
  { key: 'service_id', label: __('Service ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_service_title',
    label: __('Find Service by Title', 'bit-integrations'),
    required: false
  },
  { key: 'title', label: __('Title', 'bit-integrations'), required: false },
  { key: 'duration', label: __('Duration (minutes)', 'bit-integrations'), required: false },
  { key: 'price', label: __('Price', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'internal_notes', label: __('Internal Notes', 'bit-integrations'), required: false }
]

export const ServiceIdField = [
  { key: 'service_id', label: __('Service ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_service_title',
    label: __('Find Service by Title', 'bit-integrations'),
    required: false
  }
]

export const CategoryFields = [
  { key: 'title', label: __('Title', 'bit-integrations'), required: true },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'sort_order', label: __('Sort Order', 'bit-integrations'), required: false }
]

export const CategoryUpdateFields = [
  { key: 'category_id', label: __('Category ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_category_slug',
    label: __('Find Category by Slug', 'bit-integrations'),
    required: false
  },
  {
    key: 'find_by_category_title',
    label: __('Find Category by Title', 'bit-integrations'),
    required: false
  },
  { key: 'title', label: __('Title', 'bit-integrations'), required: false },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const CategoryIdField = [
  { key: 'category_id', label: __('Category ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_category_slug',
    label: __('Find Category by Slug', 'bit-integrations'),
    required: false
  },
  {
    key: 'find_by_category_title',
    label: __('Find Category by Title', 'bit-integrations'),
    required: false
  }
]

export const AppointmentFields = [
  { key: 'customer_id', label: __('Customer ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_customer_email',
    label: __('Find Customer by Email', 'bit-integrations'),
    required: false
  },
  { key: 'date', label: __('Date (YYYY-MM-DD)', 'bit-integrations'), required: true },
  {
    key: 'start_time',
    label: __('Start Time (YYYY-MM-DD HH:MM:SS)', 'bit-integrations'),
    required: true
  },
  {
    key: 'end_time',
    label: __('End Time (YYYY-MM-DD HH:MM:SS)', 'bit-integrations'),
    required: false
  },
  { key: 'total_attendees', label: __('Total Attendees', 'bit-integrations'), required: false },
  { key: 'internal_notes', label: __('Internal Notes', 'bit-integrations'), required: false }
]

export const AppointmentUpdateFields = [
  { key: 'appointment_id', label: __('Appointment ID', 'bit-integrations'), required: true },
  { key: 'date', label: __('Date (YYYY-MM-DD)', 'bit-integrations'), required: false },
  {
    key: 'start_time',
    label: __('Start Time (YYYY-MM-DD HH:MM:SS)', 'bit-integrations'),
    required: false
  },
  {
    key: 'end_time',
    label: __('End Time (YYYY-MM-DD HH:MM:SS)', 'bit-integrations'),
    required: false
  },
  { key: 'total_attendees', label: __('Total Attendees', 'bit-integrations'), required: false },
  { key: 'internal_notes', label: __('Internal Notes', 'bit-integrations'), required: false }
]

export const AppointmentIdField = [
  { key: 'appointment_id', label: __('Appointment ID', 'bit-integrations'), required: true }
]

export const OrderFields = [
  { key: 'customer_id', label: __('Customer ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_customer_email',
    label: __('Find Customer by Email', 'bit-integrations'),
    required: false
  },
  { key: 'total_amount', label: __('Total Amount', 'bit-integrations'), required: true },
  { key: 'subtotal', label: __('Subtotal', 'bit-integrations'), required: false },
  { key: 'discount_amount', label: __('Discount Amount', 'bit-integrations'), required: false },
  { key: 'tax_amount', label: __('Tax Amount', 'bit-integrations'), required: false },
  { key: 'currency', label: __('Currency Code', 'bit-integrations'), required: false },
  { key: 'coupon_code', label: __('Coupon Code', 'bit-integrations'), required: false },
  {
    key: 'payment_transaction_id',
    label: __('Payment Transaction ID', 'bit-integrations'),
    required: false
  },
  { key: 'internal_notes', label: __('Internal Notes', 'bit-integrations'), required: false }
]

export const OrderUpdateFields = [
  { key: 'order_id', label: __('Order ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_order_number',
    label: __('Find Order by Number (ORD-000123)', 'bit-integrations'),
    required: false
  },
  { key: 'total_amount', label: __('Total Amount', 'bit-integrations'), required: false },
  { key: 'subtotal', label: __('Subtotal', 'bit-integrations'), required: false },
  { key: 'discount_amount', label: __('Discount Amount', 'bit-integrations'), required: false },
  { key: 'tax_amount', label: __('Tax Amount', 'bit-integrations'), required: false },
  { key: 'internal_notes', label: __('Internal Notes', 'bit-integrations'), required: false }
]

export const OrderIdField = [
  { key: 'order_id', label: __('Order ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_order_number',
    label: __('Find Order by Number (ORD-000123)', 'bit-integrations'),
    required: false
  }
]

export const RefundOrderFields = [
  { key: 'order_id', label: __('Order ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_order_number',
    label: __('Find Order by Number (ORD-000123)', 'bit-integrations'),
    required: false
  },
  { key: 'refund_amount', label: __('Refund Amount', 'bit-integrations'), required: true },
  { key: 'refund_reason', label: __('Refund Reason', 'bit-integrations'), required: false }
]

export const PaymentFields = [
  { key: 'customer_id', label: __('Customer ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_customer_email',
    label: __('Find Customer by Email', 'bit-integrations'),
    required: false
  },
  { key: 'amount', label: __('Amount', 'bit-integrations'), required: true },
  { key: 'order_id', label: __('Order ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_order_number',
    label: __('Find Order by Number (ORD-000123)', 'bit-integrations'),
    required: false
  },
  { key: 'booking_id', label: __('Appointment ID', 'bit-integrations'), required: false },
  { key: 'transaction_id', label: __('Transaction ID', 'bit-integrations'), required: false },
  {
    key: 'payment_time',
    label: __('Payment Time (YYYY-MM-DD HH:MM:SS)', 'bit-integrations'),
    required: false
  },
  { key: 'internal_notes', label: __('Internal Notes', 'bit-integrations'), required: false }
]

export const PaymentIdField = [
  { key: 'payment_id', label: __('Payment ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_payment_transaction_id',
    label: __('Find Payment by Transaction ID', 'bit-integrations'),
    required: false
  }
]

export const NotificationFields = [
  { key: 'title', label: __('Title', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'user_id', label: __('WordPress User ID', 'bit-integrations'), required: false },
  {
    key: 'find_by_user_email',
    label: __('Find WordPress User by Email', 'bit-integrations'),
    required: false
  },
  {
    key: 'notification_time',
    label: __('Notification Time (YYYY-MM-DD HH:MM:SS)', 'bit-integrations'),
    required: false
  }
]

// Fixed option sets. These mirror the plugin's own status helpers, which are filterable —
// a site that customises them will still accept these defaults.
export const activeStatusOptions = [
  { label: __('Active', 'bit-integrations'), value: 'active' },
  { label: __('Inactive', 'bit-integrations'), value: 'inactive' }
]

export const appointmentStatusOptions = [
  { label: __('Approved', 'bit-integrations'), value: 'approved' },
  { label: __('Rescheduled', 'bit-integrations'), value: 'rescheduled' },
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Rejected', 'bit-integrations'), value: 'rejected' },
  { label: __('Cancelled', 'bit-integrations'), value: 'cancelled' },
  { label: __('Completed', 'bit-integrations'), value: 'completed' },
  { label: __('Emergency', 'bit-integrations'), value: 'emergency' }
]

export const orderStatusOptions = [
  { label: __('Pending payment', 'bit-integrations'), value: 'pending_payment' },
  { label: __('Processing', 'bit-integrations'), value: 'processing' },
  { label: __('On hold', 'bit-integrations'), value: 'on_hold' },
  { label: __('Completed', 'bit-integrations'), value: 'completed' },
  { label: __('Cancelled', 'bit-integrations'), value: 'cancelled' },
  { label: __('Refunded', 'bit-integrations'), value: 'refunded' },
  { label: __('Failed', 'bit-integrations'), value: 'failed' }
]

export const paymentStatusOptions = [
  { label: __('Failed', 'bit-integrations'), value: 'failed' },
  { label: __('Paid', 'bit-integrations'), value: 'paid' },
  { label: __('Cancelled', 'bit-integrations'), value: 'cancelled' },
  { label: __('Processing', 'bit-integrations'), value: 'processing' },
  { label: __('Unpaid', 'bit-integrations'), value: 'unpaid' },
  { label: __('Refunded', 'bit-integrations'), value: 'refunded' }
]

export const paymentMethodOptions = [
  { label: __('Stripe', 'bit-integrations'), value: 'stripe' },
  { label: __('Pay Later', 'bit-integrations'), value: 'pay_later' },
  { label: __('Cash', 'bit-integrations'), value: 'cash' },
  { label: __('Credit / Debit Card', 'bit-integrations'), value: 'card' }
]

export const notificationTypeOptions = [
  { label: __('Info', 'bit-integrations'), value: 'info' },
  { label: __('Success', 'bit-integrations'), value: 'success' },
  { label: __('Warning', 'bit-integrations'), value: 'warning' },
  { label: __('Error', 'bit-integrations'), value: 'error' }
]

// Required enum -> rendered in IntegLayout, stored on conf.selectedXxx
export const needsServiceStatus = ['update_service_status']
export const needsAppointmentStatus = ['update_appointment_status']
export const needsOrderStatus = ['update_order_status']
export const needsPaymentStatus = ['update_payment_status']

// Optional enums -> rendered in the Utilities section, stored on conf.utilities.selected_*
export const hasUtilities = [
  'create_agent',
  'create_service',
  'create_appointment',
  'create_order',
  'create_payment',
  'create_notification'
]

// Catalog records the admin picks once per flow, so they are dropdowns on conf.selectedXxx.
// An action that TARGETS one keeps it in the field map instead (update/delete service).
export const needsServiceSelect = ['create_appointment']
export const needsAgentSelect = ['create_appointment', 'update_appointment']
export const needsCategorySelect = ['create_appointment']
export const needsLocationSelect = ['create_appointment', 'create_agent']

// The id and its natural key are interchangeable: the flow needs one of them, not both.
export const requiredEitherFields = {
  update_customer: [['customer_id', 'find_by_customer_email']],
  delete_customer: [['customer_id', 'find_by_customer_email']],
  update_agent: [['agent_id', 'find_by_agent_email']],
  delete_agent: [['agent_id', 'find_by_agent_email']],
  update_service: [['service_id', 'find_by_service_title']],
  update_service_status: [['service_id', 'find_by_service_title']],
  delete_service: [['service_id', 'find_by_service_title']],
  update_category: [['category_id', 'find_by_category_slug', 'find_by_category_title']],
  delete_category: [['category_id', 'find_by_category_slug', 'find_by_category_title']],
  create_appointment: [['customer_id', 'find_by_customer_email']],
  update_order: [['order_id', 'find_by_order_number']],
  update_order_status: [['order_id', 'find_by_order_number']],
  refund_order: [['order_id', 'find_by_order_number']],
  delete_order: [['order_id', 'find_by_order_number']],
  create_order: [['customer_id', 'find_by_customer_email']],
  create_payment: [['customer_id', 'find_by_customer_email']],
  update_payment_status: [['payment_id', 'find_by_payment_transaction_id']]
}
