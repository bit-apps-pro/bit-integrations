import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'update_cart_status', label: __('Update Cart Status', 'bit-integrations'), is_pro: true },
  { name: 'mark_cart_recovered', label: __('Mark Cart as Recovered', 'bit-integrations'), is_pro: true },
  { name: 'send_recovery_email', label: __('Send Recovery Email', 'bit-integrations'), is_pro: true },
  { name: 'delete_cart', label: __('Delete Cart', 'bit-integrations'), is_pro: true },
  { name: 'delete_carts', label: __('Delete Carts', 'bit-integrations'), is_pro: true },
  { name: 'create_template', label: __('Create Template', 'bit-integrations'), is_pro: true },
  { name: 'update_template', label: __('Update Template', 'bit-integrations'), is_pro: true },
  { name: 'delete_template', label: __('Delete Template', 'bit-integrations'), is_pro: true },
  { name: 'set_default_template', label: __('Set Default Template', 'bit-integrations'), is_pro: true },
  { name: 'send_test_email', label: __('Send Test Email', 'bit-integrations'), is_pro: true },
  { name: 'unsubscribe_email', label: __('Unsubscribe Email', 'bit-integrations'), is_pro: true },
  { name: 'resubscribe_email', label: __('Resubscribe Email', 'bit-integrations'), is_pro: true },
  { name: 'update_settings', label: __('Update Settings', 'bit-integrations'), is_pro: true },
  { name: 'clear_logs', label: __('Clear Logs', 'bit-integrations'), is_pro: true }
]

const CartIdField = [{ key: 'cart_id', label: __('Cart ID', 'bit-integrations'), required: true }]

const TemplateIdField = [
  { key: 'template_id', label: __('Template ID', 'bit-integrations'), required: true }
]

const EmailField = [{ key: 'email', label: __('Email', 'bit-integrations'), required: true }]

const TemplateFields = required => [
  { key: 'name', label: __('Template Name', 'bit-integrations'), required },
  { key: 'subject', label: __('Email Subject', 'bit-integrations'), required },
  { key: 'body', label: __('Email Body', 'bit-integrations'), required },
  { key: 'from_name', label: __('From Name', 'bit-integrations'), required: false },
  { key: 'from_email', label: __('From Email', 'bit-integrations'), required: false }
]

export const fieldsByAction = {
  update_cart_status: CartIdField,
  mark_cart_recovered: [
    ...CartIdField,
    { key: 'order_id', label: __('Order ID', 'bit-integrations'), required: true }
  ],
  send_recovery_email: CartIdField,
  delete_cart: CartIdField,
  delete_carts: [
    { key: 'cart_ids', label: __('Cart IDs (comma-separated)', 'bit-integrations'), required: true }
  ],
  create_template: TemplateFields(true),
  update_template: [...TemplateIdField, ...TemplateFields(false)],
  delete_template: TemplateIdField,
  set_default_template: TemplateIdField,
  send_test_email: [
    ...TemplateIdField,
    { key: 'email', label: __('Recipient Email', 'bit-integrations'), required: true }
  ],
  unsubscribe_email: EmailField,
  resubscribe_email: EmailField,
  update_settings: [
    {
      key: 'abandonment_threshold',
      label: __('Abandonment Threshold (Minutes)', 'bit-integrations'),
      required: false
    },
    { key: 'scan_interval', label: __('Scan Interval (Minutes)', 'bit-integrations'), required: false },
    {
      key: 'email_delay_minutes',
      label: __('Send Delay (Minutes)', 'bit-integrations'),
      required: false
    },
    {
      key: 'cleanup_days',
      label: __('Unrecovered Cleanup After (Days)', 'bit-integrations'),
      required: false
    },
    {
      key: 'converted_cleanup_days',
      label: __('Converted Cleanup After (Days)', 'bit-integrations'),
      required: false
    },
    {
      key: 'log_retention_days',
      label: __('Delete Log Entries After (Days)', 'bit-integrations'),
      required: false
    },
    {
      key: 'admin_notification_email',
      label: __('Notification Email', 'bit-integrations'),
      required: false
    }
  ],
  clear_logs: []
}

export const cartStatusOptions = [
  { label: __('Active', 'bit-integrations'), value: 'active' },
  { label: __('Abandoned', 'bit-integrations'), value: 'abandoned' },
  { label: __('Pending Payment', 'bit-integrations'), value: 'pending-payment' },
  { label: __('Recovered', 'bit-integrations'), value: 'recovered' },
  { label: __('Completed', 'bit-integrations'), value: 'completed' },
  { label: __('Lost', 'bit-integrations'), value: 'lost' }
]

export const needsStatus = ['update_cart_status']

export const needsTemplate = ['send_recovery_email']

export const needsCoupon = ['create_template', 'update_template']

export const needsPaidStatuses = ['update_settings']

export const hasUtilities = ['create_template', 'update_template', 'update_settings']

export const settingToggles = [
  {
    key: 'tracking_enabled',
    onTitle: __('Turn On Cart Tracking', 'bit-integrations'),
    onSubTitle: __('Track new carts', 'bit-integrations'),
    offTitle: __('Turn Off Cart Tracking', 'bit-integrations'),
    offSubTitle: __('Stop tracking new carts', 'bit-integrations')
  },
  {
    key: 'guest_tracking',
    onTitle: __('Turn On Guest Tracking', 'bit-integrations'),
    onSubTitle: __('Track carts of logged-out shoppers', 'bit-integrations'),
    offTitle: __('Turn Off Guest Tracking', 'bit-integrations'),
    offSubTitle: __('Track only logged-in shoppers', 'bit-integrations')
  },
  {
    key: 'recovery_email_enabled',
    onTitle: __('Turn On Recovery Emails', 'bit-integrations'),
    onSubTitle: __('Email shoppers about abandoned carts', 'bit-integrations'),
    offTitle: __('Turn Off Recovery Emails', 'bit-integrations'),
    offSubTitle: __('Stop automatic recovery emails', 'bit-integrations')
  },
  {
    key: 'admin_recovery_email',
    onTitle: __('Turn On Admin Recovery Emails', 'bit-integrations'),
    onSubTitle: __('Email the admin when a cart is recovered', 'bit-integrations'),
    offTitle: __('Turn Off Admin Recovery Emails', 'bit-integrations'),
    offSubTitle: __('Stop recovery emails to the admin', 'bit-integrations')
  }
]

export const actionNotes = {
  update_cart_status: __(
    'Abandoned schedules a recovery email when recovery emails are on and the cart has an email. A cart with an order gets no email.',
    'bit-integrations'
  ),
  mark_cart_recovered: __(
    'The order must be paid. It must not be linked to a different cart.',
    'bit-integrations'
  ),
  send_recovery_email: __(
    'The cart must have an email, items and no order. Unsubscribed emails get no email.',
    'bit-integrations'
  ),
  delete_carts: __('Map a comma-separated list of cart IDs, for example 12,15,18.', 'bit-integrations'),
  create_template: __(
    'You can use merge tags such as {first_name}, {recovery_url} and {coupon_code}.',
    'bit-integrations'
  ),
  update_template: __('Fields that you do not map keep their current value.', 'bit-integrations'),
  delete_template: __('You cannot delete the default template.', 'bit-integrations'),
  update_settings: __(
    'Fields and options that you do not set keep their current value. Set Delete Log Entries After to 0 to keep all log entries.',
    'bit-integrations'
  ),
  clear_logs: __(
    'This action deletes all Cart Rebound log entries. You cannot undo it.',
    'bit-integrations'
  )
}
