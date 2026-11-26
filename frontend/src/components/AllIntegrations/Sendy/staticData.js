import { __ } from '../../../Utils/i18nwrap'

export const DEFAULT_ACTION = 'add_subscriber'

export const modules = [
  { name: 'add_subscriber', label: __('Add Subscriber', 'bit-integrations'), is_pro: false },
  { name: 'unsubscribe', label: __('Unsubscribe Subscriber', 'bit-integrations'), is_pro: true },
  { name: 'delete_subscriber', label: __('Delete Subscriber', 'bit-integrations'), is_pro: true },
  { name: 'create_campaign', label: __('Create Campaign', 'bit-integrations'), is_pro: true }
]

const emailField = { key: 'email', label: __('Email', 'bit-integrations'), required: true }

export const fieldsByAction = {
  add_subscriber: [
    emailField,
    { key: 'name', label: __('Name', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country Code (2 letters)', 'bit-integrations'), required: false },
    { key: 'ipaddress', label: __('IP Address', 'bit-integrations'), required: false },
    { key: 'referrer', label: __('Referrer URL', 'bit-integrations'), required: false }
  ],
  unsubscribe: [emailField],
  delete_subscriber: [emailField],
  create_campaign: [
    { key: 'from_name', label: __('From Name', 'bit-integrations'), required: true },
    { key: 'from_email', label: __('From Email', 'bit-integrations'), required: true },
    { key: 'reply_to', label: __('Reply To Email', 'bit-integrations'), required: true },
    { key: 'subject', label: __('Subject', 'bit-integrations'), required: true },
    { key: 'html_text', label: __('HTML Content', 'bit-integrations'), required: true },
    { key: 'title', label: __('Campaign Title', 'bit-integrations'), required: false },
    { key: 'plain_text', label: __('Plain Text Content', 'bit-integrations'), required: false },
    {
      key: 'segment_ids',
      label: __('Segment IDs (comma-separated)', 'bit-integrations'),
      required: false
    },
    {
      key: 'exclude_segments_ids',
      label: __('Exclude Segment IDs (comma-separated)', 'bit-integrations'),
      required: false
    },
    { key: 'query_string', label: __('Query String', 'bit-integrations'), required: false },
    {
      key: 'schedule_date_time',
      label: __('Schedule Date and Time (e.g. June 15, 2021 6:05pm)', 'bit-integrations'),
      required: false
    }
  ]
}

export const supportsCustomFields = ['add_subscriber']

export const needsList = ['add_subscriber', 'unsubscribe', 'delete_subscriber']
export const needsCampaignLists = ['create_campaign']
export const hasUtilities = ['add_subscriber', 'create_campaign']

export const trackingOptions = [
  { label: __('Track', 'bit-integrations'), value: '1' },
  { label: __('Do not track', 'bit-integrations'), value: '0' },
  { label: __('Track anonymously', 'bit-integrations'), value: '2' }
]

export const getAction = conf => conf?.mainAction || DEFAULT_ACTION
