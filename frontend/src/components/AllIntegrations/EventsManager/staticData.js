import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  {
    name: 'unregister_user_from_event',
    label: __('Unregister User From Event', 'bit-integrations'),
    is_pro: true
  }
]

export const UnregisterUserFields = [
  { key: 'event_id', label: __('Event ID', 'bit-integrations'), required: true },
  { key: 'user_email', label: __('User Email', 'bit-integrations'), required: true }
]
