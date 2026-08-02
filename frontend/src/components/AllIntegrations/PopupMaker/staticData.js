import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_popup', label: __('Create Popup', 'bit-integrations'), is_pro: true },
  { name: 'update_popup', label: __('Update Popup', 'bit-integrations'), is_pro: true },
  { name: 'delete_popup', label: __('Delete Popup', 'bit-integrations'), is_pro: true },
  {
    name: 'change_popup_status',
    label: __('Change Popup Status', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'reset_popup_counts',
    label: __('Reset Popup Counts', 'bit-integrations'),
    is_pro: true
  },
  { name: 'track_popup_event', label: __('Track Popup Event', 'bit-integrations'), is_pro: true },
  { name: 'create_subscriber', label: __('Create Subscriber', 'bit-integrations'), is_pro: true },
  { name: 'update_subscriber', label: __('Update Subscriber', 'bit-integrations'), is_pro: true },
  { name: 'delete_subscriber', label: __('Delete Subscriber', 'bit-integrations'), is_pro: true }
]

export const PopupFields = [
  { key: 'title', label: __('Popup Name', 'bit-integrations'), required: true },
  { key: 'popup_title', label: __('Popup Title', 'bit-integrations'), required: false },
  { key: 'content', label: __('Content', 'bit-integrations'), required: false }
]

export const PopupUpdateFields = [
  { key: 'popup_id', label: __('Popup ID', 'bit-integrations'), required: true },
  { key: 'title', label: __('Popup Name', 'bit-integrations'), required: false },
  { key: 'popup_title', label: __('Popup Title', 'bit-integrations'), required: false },
  { key: 'content', label: __('Content', 'bit-integrations'), required: false }
]

export const PopupIdField = [
  { key: 'popup_id', label: __('Popup ID', 'bit-integrations'), required: true }
]

export const SubscriberFields = [
  { key: 'email', label: __('Email', 'bit-integrations'), required: true },
  { key: 'name', label: __('Name', 'bit-integrations'), required: false },
  { key: 'fname', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'lname', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'consent_args', label: __('Consent Args', 'bit-integrations'), required: false }
]

export const SubscriberUpdateFields = [
  { key: 'subscriber_id', label: __('Subscriber ID', 'bit-integrations'), required: true },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'name', label: __('Name', 'bit-integrations'), required: false },
  { key: 'fname', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'lname', label: __('Last Name', 'bit-integrations'), required: false }
]

export const SubscriberIdField = [
  { key: 'subscriber_id', label: __('Subscriber ID', 'bit-integrations'), required: true }
]

export const statusOptions = [
  { label: __('Publish', 'bit-integrations'), value: 'publish' },
  { label: __('Draft', 'bit-integrations'), value: 'draft' },
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Private', 'bit-integrations'), value: 'private' }
]

export const changeStatusOptions = [
  ...statusOptions,
  { label: __('Trash', 'bit-integrations'), value: 'trash' }
]

export const eventOptions = [
  { label: __('Open', 'bit-integrations'), value: 'open' },
  { label: __('Conversion', 'bit-integrations'), value: 'conversion' }
]

export const sizeOptions = [
  { label: __('Nano - 10%', 'bit-integrations'), value: 'nano' },
  { label: __('Micro - 20%', 'bit-integrations'), value: 'micro' },
  { label: __('Tiny - 30%', 'bit-integrations'), value: 'tiny' },
  { label: __('Small - 40%', 'bit-integrations'), value: 'small' },
  { label: __('Medium - 60%', 'bit-integrations'), value: 'medium' },
  { label: __('Normal - 70%', 'bit-integrations'), value: 'normal' },
  { label: __('Large - 80%', 'bit-integrations'), value: 'large' },
  { label: __('X Large - 95%', 'bit-integrations'), value: 'xlarge' },
  { label: __('Auto', 'bit-integrations'), value: 'auto' },
  { label: __('Custom', 'bit-integrations'), value: 'custom' }
]

export const animationOptions = [
  { label: __('None', 'bit-integrations'), value: 'none' },
  { label: __('Slide', 'bit-integrations'), value: 'slide' },
  { label: __('Fade', 'bit-integrations'), value: 'fade' },
  { label: __('Fade and Slide', 'bit-integrations'), value: 'fadeAndSlide' }
]

export const consentOptions = [
  { label: __('Yes', 'bit-integrations'), value: 'yes' },
  { label: __('No', 'bit-integrations'), value: 'no' }
]

export const forceDeleteOptions = [
  { label: __('Yes, delete permanently', 'bit-integrations'), value: 'yes' },
  { label: __('No, move to trash', 'bit-integrations'), value: 'no' }
]

// Actions that need a fetched theme dropdown
export const needsTheme = ['create_popup', 'update_popup']

// Actions that need a fetched popup dropdown (subscriber attribution)
export const needsPopup = ['create_subscriber', 'update_subscriber']

// Actions with a required select rendered in the layout
export const needsStatus = ['change_popup_status']
export const needsEvent = ['track_popup_event']

// Actions with optional selects rendered under Utilities
export const hasUtilities = [
  'create_popup',
  'update_popup',
  'delete_popup',
  'create_subscriber',
  'update_subscriber'
]
