import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'log_event', label: __('Log Event', 'bit-integrations'), is_pro: true },
  { name: 'delete_event', label: __('Delete Log Entry', 'bit-integrations'), is_pro: true },
  { name: 'delete_events', label: __('Delete Log Entries by Filter', 'bit-integrations'), is_pro: true },
  {
    name: 'delete_events_older_than',
    label: __('Delete Log Entries Older Than', 'bit-integrations'),
    is_pro: true
  },
  { name: 'enable_event', label: __('Enable Event', 'bit-integrations'), is_pro: true },
  { name: 'disable_event', label: __('Disable Event', 'bit-integrations'), is_pro: true },
  { name: 'exclude_user', label: __('Exclude User', 'bit-integrations'), is_pro: true },
  {
    name: 'remove_user_exclusion',
    label: __('Remove User Exclusion', 'bit-integrations'),
    is_pro: true
  },
  { name: 'exclude_role', label: __('Exclude Role', 'bit-integrations'), is_pro: true },
  {
    name: 'remove_role_exclusion',
    label: __('Remove Role Exclusion', 'bit-integrations'),
    is_pro: true
  },
  { name: 'exclude_ip_address', label: __('Exclude IP Address', 'bit-integrations'), is_pro: true },
  {
    name: 'remove_ip_address_exclusion',
    label: __('Remove IP Address Exclusion', 'bit-integrations'),
    is_pro: true
  },
  { name: 'exclude_post_type', label: __('Exclude Post Type', 'bit-integrations'), is_pro: true },
  {
    name: 'remove_post_type_exclusion',
    label: __('Remove Post Type Exclusion', 'bit-integrations'),
    is_pro: true
  },
  { name: 'exclude_post_status', label: __('Exclude Post Status', 'bit-integrations'), is_pro: true },
  {
    name: 'remove_post_status_exclusion',
    label: __('Remove Post Status Exclusion', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'exclude_post_meta_field',
    label: __('Exclude Post Meta Key', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'remove_post_meta_field_exclusion',
    label: __('Remove Post Meta Key Exclusion', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'exclude_user_meta_field',
    label: __('Exclude User Meta Key', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'remove_user_meta_field_exclusion',
    label: __('Remove User Meta Key Exclusion', 'bit-integrations'),
    is_pro: true
  }
]

export const EventLogIdField = [
  { key: 'occurrence_id', label: __('Log Entry ID', 'bit-integrations'), required: true }
]

export const EventFilterFields = [
  { key: 'client_ip', label: __('IP Address', 'bit-integrations'), required: false },
  { key: 'post_id', label: __('Post ID', 'bit-integrations'), required: false },
  {
    key: 'start_date',
    label: __('Start Date (YYYY-MM-DD HH:MM:SS)', 'bit-integrations'),
    required: false
  },
  {
    key: 'end_date',
    label: __('End Date (YYYY-MM-DD HH:MM:SS)', 'bit-integrations'),
    required: false
  }
]

export const OlderThanField = [
  { key: 'older_than', label: __('Older Than', 'bit-integrations'), required: true }
]

export const EventIdField = [
  { key: 'event_id', label: __('Event ID', 'bit-integrations'), required: true }
]

export const UsernameField = [
  { key: 'username', label: __('User Login', 'bit-integrations'), required: true }
]

export const RoleField = [{ key: 'role', label: __('Role Key', 'bit-integrations'), required: true }]

export const IpAddressField = [
  { key: 'ip_address', label: __('IP Address', 'bit-integrations'), required: true }
]

export const PostTypeField = [
  { key: 'post_type', label: __('Post Type Key', 'bit-integrations'), required: true }
]

export const PostStatusField = [
  { key: 'post_status', label: __('Post Status Key', 'bit-integrations'), required: true }
]

export const MetaKeyField = [
  { key: 'meta_key', label: __('Meta Key', 'bit-integrations'), required: true }
]

export const fieldsByAction = {
  log_event: [],
  delete_event: EventLogIdField,
  delete_events: EventFilterFields,
  delete_events_older_than: OlderThanField,
  enable_event: EventIdField,
  disable_event: EventIdField,
  exclude_user: UsernameField,
  remove_user_exclusion: UsernameField,
  exclude_role: RoleField,
  remove_role_exclusion: RoleField,
  exclude_ip_address: IpAddressField,
  remove_ip_address_exclusion: IpAddressField,
  exclude_post_type: PostTypeField,
  remove_post_type_exclusion: PostTypeField,
  exclude_post_status: PostStatusField,
  remove_post_status_exclusion: PostStatusField,
  exclude_post_meta_field: MetaKeyField,
  remove_post_meta_field_exclusion: MetaKeyField,
  exclude_user_meta_field: MetaKeyField,
  remove_user_meta_field_exclusion: MetaKeyField
}

export const severityOptions = [
  { label: __('Critical', 'bit-integrations'), value: '500' },
  { label: __('High', 'bit-integrations'), value: '400' },
  { label: __('Medium', 'bit-integrations'), value: '300' },
  { label: __('Low', 'bit-integrations'), value: '250' },
  { label: __('Info', 'bit-integrations'), value: '200' }
]

export const timeUnitOptions = [
  { label: __('Days', 'bit-integrations'), value: 'days' },
  { label: __('Weeks', 'bit-integrations'), value: 'weeks' },
  { label: __('Months', 'bit-integrations'), value: 'months' },
  { label: __('Years', 'bit-integrations'), value: 'years' }
]

export const needsEvent = ['log_event']

export const needsTimeUnit = ['delete_events_older_than']

export const hasUtilities = ['log_event', 'delete_events']
