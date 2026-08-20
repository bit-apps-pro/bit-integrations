import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  {
    name: 'create_or_update_subscriber',
    label: __('Create or Update Subscriber', 'bit-integrations'),
    is_pro: true
  },
  { name: 'update_subscriber', label: __('Update Subscriber', 'bit-integrations'), is_pro: true },
  { name: 'delete_subscriber', label: __('Delete Subscriber', 'bit-integrations'), is_pro: true },
  {
    name: 'remove_phone_from_subscriber',
    label: __('Remove Phone From Subscriber', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'add_subscriber_to_group',
    label: __('Add Subscriber To Group', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'remove_subscriber_from_group',
    label: __('Remove Subscriber From Group', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_group', label: __('Create Group', 'bit-integrations'), is_pro: true },
  { name: 'update_group', label: __('Update Group', 'bit-integrations'), is_pro: true },
  { name: 'delete_group', label: __('Delete Group', 'bit-integrations'), is_pro: true }
]

// Field-map definitions per action. Only inputs that are NOT a fetchable dropdown live here.
// Group ids come from the group dropdown (conf.groups / conf.groupId), not the field map.
export const SubscriberFields = [
  { key: 'email', label: __('Email', 'bit-integrations'), required: true },
  { key: 'firstname', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'lastname', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false }
]

export const UpdateSubscriberFields = [
  { key: 'subscriber_id', label: __('Subscriber ID / Email', 'bit-integrations'), required: true },
  { key: 'firstname', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'lastname', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'subscriber_status', label: __('Subscriber Status', 'bit-integrations'), required: false },
  { key: 'sms_status', label: __('SMS Status', 'bit-integrations'), required: false },
  {
    key: 'transactional_email_status',
    label: __('Transactional Email Status', 'bit-integrations'),
    required: false
  }
]

export const EmailsField = [
  { key: 'emails', label: __('Emails (comma separated)', 'bit-integrations'), required: true }
]

export const SubscriberIdField = [
  { key: 'subscriber_id', label: __('Subscriber ID / Email', 'bit-integrations'), required: true }
]

export const GroupTitleField = [
  { key: 'title', label: __('Group Title', 'bit-integrations'), required: true }
]

// Map an action to its static field-map definition.
export const senderFieldsByAction = {
  create_or_update_subscriber: SubscriberFields,
  update_subscriber: UpdateSubscriberFields,
  delete_subscriber: EmailsField,
  remove_phone_from_subscriber: SubscriberIdField,
  add_subscriber_to_group: EmailsField,
  remove_subscriber_from_group: EmailsField,
  create_group: GroupTitleField,
  update_group: GroupTitleField,
  delete_group: []
}

// Actions that need the single-group dropdown.
export const singleGroupActions = [
  'add_subscriber_to_group',
  'remove_subscriber_from_group',
  'update_group',
  'delete_group'
]

// Actions that need the multi-group dropdown + custom field fetch.
export const subscriberActions = ['create_or_update_subscriber', 'update_subscriber']

// Actions that show the Trigger Automation switch.
export const triggerAutomationActions = [
  'create_or_update_subscriber',
  'update_subscriber',
  'add_subscriber_to_group'
]
