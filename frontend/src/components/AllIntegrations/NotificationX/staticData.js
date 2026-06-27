import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  {
    label: __('Add Sales Notification', 'bit-integrations'),
    name: 'add_sales_notification',
    is_pro: true
  },
  {
    label: __('Add Reviews', 'bit-integrations'),
    name: 'add_reviews',
    is_pro: true
  },
  {
    label: __('Add Email Subscription', 'bit-integrations'),
    name: 'add_email_subscription',
    is_pro: true
  },
  {
    label: __('Add Notification Entry', 'bit-integrations'),
    name: 'add_notification_entry',
    is_pro: true
  },
  {
    label: __('Delete Notification', 'bit-integrations'),
    name: 'delete_notification',
    is_pro: true
  },
  {
    label: __('Enable Notification', 'bit-integrations'),
    name: 'enable_notification',
    is_pro: true
  },
  {
    label: __('Disable Notification', 'bit-integrations'),
    name: 'disable_notification',
    is_pro: true
  }
]

export const NotificationIdField = [
  { key: 'notification_id', label: __('Notification ID', 'bit-integrations'), required: true }
]

export const SalesNotificationFields = [
  { key: 'name', label: __('Full Name', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'sales_count', label: __('Sales Count', 'bit-integrations'), required: false },
  { key: 'email', label: __('Customer Email', 'bit-integrations'), required: false },
  { key: 'title', label: __('Title / Product Title', 'bit-integrations'), required: false },
  {
    key: 'anonymous_title',
    label: __('Anonymous Title / Product', 'bit-integrations'),
    required: false
  },
  { key: 'timestamp', label: __('Definite Time', 'bit-integrations'), required: false },
  { key: 'sometime', label: __('Sometime', 'bit-integrations'), required: false },
  { key: '1day', label: __('In last 1 day', 'bit-integrations'), required: false },
  { key: '7days', label: __('In last 7 days', 'bit-integrations'), required: false },
  { key: '30days', label: __('In last 30 days', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'country', label: __('Country', 'bit-integrations'), required: false },
  { key: 'city_country', label: __('City, Country', 'bit-integrations'), required: false }
]

export const ReviewFields = [
  { key: 'username', label: __('Username', 'bit-integrations'), required: false },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'rated', label: __('Rated', 'bit-integrations'), required: false },
  { key: 'plugin_name', label: __('Plugin Name', 'bit-integrations'), required: false },
  { key: 'plugin_review', label: __('Plugin Review', 'bit-integrations'), required: false },
  { key: 'title', label: __('Review Title', 'bit-integrations'), required: false },
  { key: 'anonymous_title', label: __('Anonymous Title', 'bit-integrations'), required: false },
  { key: 'rating', label: __('Rating', 'bit-integrations'), required: false },
  { key: 'timestamp', label: __('Definite Time', 'bit-integrations'), required: false },
  { key: 'sometime', label: __('Some time ago', 'bit-integrations'), required: false }
]

export const EmailSubscriptionFields = [
  { key: 'name', label: __('Full Name', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'title', label: __('Title / Product Title', 'bit-integrations'), required: false },
  { key: 'anonymous_title', label: __('Anonymous Title', 'bit-integrations'), required: false },
  { key: 'timestamp', label: __('Definite Time', 'bit-integrations'), required: false },
  { key: 'sometime', label: __('Some time ago', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'country', label: __('Country', 'bit-integrations'), required: false },
  { key: 'city_country', label: __('City, Country', 'bit-integrations'), required: false }
]

export const NOTIFICATION_SELECTION_ACTIONS = [
  'add_sales_notification',
  'add_reviews',
  'add_email_subscription'
]
