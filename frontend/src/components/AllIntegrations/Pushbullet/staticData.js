import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'send_note', label: __('Send Note', 'bit-integrations'), is_pro: true },
  { name: 'send_link', label: __('Send Link', 'bit-integrations'), is_pro: true },
  { name: 'send_file', label: __('Send File', 'bit-integrations'), is_pro: true },
  { name: 'dismiss_push', label: __('Dismiss Push', 'bit-integrations'), is_pro: true },
  { name: 'delete_push', label: __('Delete Push', 'bit-integrations'), is_pro: true },
  { name: 'delete_all_pushes', label: __('Delete All Pushes', 'bit-integrations'), is_pro: true },
  { name: 'send_text', label: __('Send SMS or MMS', 'bit-integrations'), is_pro: true },
  { name: 'cancel_text', label: __('Cancel Text Message', 'bit-integrations'), is_pro: true },
  { name: 'create_device', label: __('Create Device', 'bit-integrations'), is_pro: true },
  { name: 'update_device', label: __('Update Device', 'bit-integrations'), is_pro: true },
  { name: 'delete_device', label: __('Delete Device', 'bit-integrations'), is_pro: true },
  { name: 'create_chat', label: __('Create Chat', 'bit-integrations'), is_pro: true },
  { name: 'mute_chat', label: __('Mute or Unmute Chat', 'bit-integrations'), is_pro: true },
  { name: 'delete_chat', label: __('Delete Chat', 'bit-integrations'), is_pro: true },
  { name: 'subscribe_channel', label: __('Subscribe to Channel', 'bit-integrations'), is_pro: true },
  {
    name: 'mute_subscription',
    label: __('Mute or Unmute Subscription', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'unsubscribe_channel',
    label: __('Unsubscribe from Channel', 'bit-integrations'),
    is_pro: true
  },
  { name: 'upload_file', label: __('Upload File', 'bit-integrations'), is_pro: true },
  {
    name: 'mirror_notification',
    label: __('Send Mirrored Notification', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'dismiss_notification',
    label: __('Dismiss Mirrored Notification', 'bit-integrations'),
    is_pro: true
  },
  { name: 'send_ephemeral', label: __('Send Custom Ephemeral', 'bit-integrations'), is_pro: true }
]

export const muteOptions = [
  { label: __('Mute', 'bit-integrations'), value: 'true' },
  { label: __('Unmute', 'bit-integrations'), value: 'false' }
]

export const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: 'true' },
  { label: __('No', 'bit-integrations'), value: 'false' }
]

export const iconOptions = [
  { label: __('Desktop', 'bit-integrations'), value: 'desktop' },
  { label: __('Browser', 'bit-integrations'), value: 'browser' },
  { label: __('Website', 'bit-integrations'), value: 'website' },
  { label: __('Laptop', 'bit-integrations'), value: 'laptop' },
  { label: __('Tablet', 'bit-integrations'), value: 'tablet' },
  { label: __('Phone', 'bit-integrations'), value: 'phone' },
  { label: __('Watch', 'bit-integrations'), value: 'watch' },
  { label: __('System', 'bit-integrations'), value: 'system' }
]

const field = (key, label, required = false) => ({ key, label, required })

const fileFields = [
  field('file', __('File (URL or uploads path, up to 25 MB)', 'bit-integrations'), true),
  field('file_name', __('File Name', 'bit-integrations')),
  field('file_type', __('File Type (e.g. application/pdf)', 'bit-integrations'))
]

const pushTargetFields = [
  field('email', __('Recipient Email', 'bit-integrations')),
  field('client_iden', __('OAuth Client ID', 'bit-integrations')),
  field('guid', __('Unique ID (GUID)', 'bit-integrations'))
]

const deviceDetailFields = [
  field('manufacturer', __('Manufacturer', 'bit-integrations')),
  field('model', __('Model', 'bit-integrations')),
  field('app_version', __('App Version', 'bit-integrations')),
  field('push_token', __('Push Token', 'bit-integrations'))
]

const pushIdField = field('push_iden', __('Push ID', 'bit-integrations'), true)
const deviceIdField = field('device_iden', __('Device ID', 'bit-integrations'), true)
const chatIdField = field('chat_iden', __('Chat ID', 'bit-integrations'), true)
const subscriptionIdField = field('subscription_iden', __('Subscription ID', 'bit-integrations'), true)

export const fieldsByAction = {
  send_note: [
    field('message', __('Message', 'bit-integrations'), true),
    field('title', __('Title', 'bit-integrations')),
    ...pushTargetFields
  ],
  send_link: [
    field('url', __('URL', 'bit-integrations'), true),
    field('title', __('Title', 'bit-integrations')),
    field('message', __('Message', 'bit-integrations')),
    ...pushTargetFields
  ],
  send_file: [...fileFields, field('message', __('Message', 'bit-integrations')), ...pushTargetFields],
  dismiss_push: [pushIdField],
  delete_push: [pushIdField],
  delete_all_pushes: [],
  send_text: [
    field('recipients', __('Recipients (phone numbers, comma separated)', 'bit-integrations'), true),
    field('message', __('Message', 'bit-integrations')),
    field('file', __('Image (URL or uploads path)', 'bit-integrations')),
    field('guid', __('Unique ID (GUID)', 'bit-integrations'))
  ],
  cancel_text: [field('text_iden', __('Text ID', 'bit-integrations'), true)],
  create_device: [field('nickname', __('Nickname', 'bit-integrations'), true), ...deviceDetailFields],
  update_device: [
    deviceIdField,
    field('nickname', __('Nickname', 'bit-integrations')),
    ...deviceDetailFields
  ],
  delete_device: [deviceIdField],
  create_chat: [field('email', __('Email of a Pushbullet user', 'bit-integrations'), true)],
  mute_chat: [chatIdField],
  delete_chat: [chatIdField],
  subscribe_channel: [field('channel_tag', __('Channel Tag', 'bit-integrations'), true)],
  mute_subscription: [subscriptionIdField],
  unsubscribe_channel: [subscriptionIdField],
  upload_file: fileFields,
  mirror_notification: [
    field('title', __('Title', 'bit-integrations'), true),
    field('body', __('Body', 'bit-integrations')),
    field('application_name', __('Application Name', 'bit-integrations')),
    field('package_name', __('Package Name', 'bit-integrations')),
    field('notification_id', __('Notification ID', 'bit-integrations')),
    field('notification_tag', __('Notification Tag', 'bit-integrations')),
    field('icon', __('Icon (JPEG URL or uploads path)', 'bit-integrations'))
  ],
  dismiss_notification: [
    field('package_name', __('Package Name', 'bit-integrations'), true),
    field('notification_id', __('Notification ID', 'bit-integrations'), true),
    field('notification_tag', __('Notification Tag', 'bit-integrations'))
  ],
  send_ephemeral: [field('data', __('Ephemeral Data (JSON object)', 'bit-integrations'), true)]
}

const deviceSelect = (key, label) => ({ key, label, source: 'devices' })

const pushSelects = [
  deviceSelect('target_device_iden', __('Device', 'bit-integrations')),
  { key: 'channel_tag', label: __('Channel', 'bit-integrations'), source: 'channels' },
  deviceSelect('source_device_iden', __('Source Device', 'bit-integrations'))
]

const muteSelect = {
  key: 'muted',
  label: __('Mute or Unmute', 'bit-integrations'),
  options: muteOptions,
  required: true
}

export const selectsByAction = {
  send_note: pushSelects,
  send_link: pushSelects,
  send_file: pushSelects,
  send_text: [
    {
      key: 'target_device_iden',
      label: __('Phone', 'bit-integrations'),
      required: true,
      source: 'smsDevices'
    }
  ],
  mute_chat: [muteSelect],
  mute_subscription: [muteSelect],
  mirror_notification: [deviceSelect('source_device_iden', __('Source Device', 'bit-integrations'))]
}

export const selectKeys = ['target_device_iden', 'channel_tag', 'source_device_iden', 'muted']

export const notesByAction = {
  send_note: __(
    'Leave Device, Channel and Recipient Email empty to push to all your devices. Set only one of them.',
    'bit-integrations'
  ),
  send_link: __(
    'Leave Device, Channel and Recipient Email empty to push to all your devices. Set only one of them.',
    'bit-integrations'
  ),
  send_file: __(
    'Leave Device, Channel and Recipient Email empty to push to all your devices. Set only one of them.',
    'bit-integrations'
  ),
  send_text: __(
    'Only Android phones with Pushbullet SMS access are listed. Map a message, an image or both.',
    'bit-integrations'
  ),
  delete_all_pushes: __(
    '<b>Deletes every push in this Pushbullet account</b>, including pushes from other apps and devices. It cannot be undone.',
    'bit-integrations'
  )
}

const checkboxUtility = (key, title, subTitle, value = 'true') => ({
  checkbox: true,
  key,
  subTitle,
  title,
  value
})

const iconUtility = {
  key: 'icon',
  options: iconOptions,
  subTitle: __('Icon shown for the device', 'bit-integrations'),
  title: __('Icon', 'bit-integrations')
}

export const utilitiesByAction = {
  create_device: [
    iconUtility,
    checkboxUtility(
      'has_sms',
      __('SMS Capable', 'bit-integrations'),
      __('Mark the device as able to send SMS', 'bit-integrations')
    )
  ],
  update_device: [
    iconUtility,
    {
      key: 'has_sms',
      options: yesNoOptions,
      subTitle: __('Change whether the device can send SMS', 'bit-integrations'),
      title: __('SMS Capable', 'bit-integrations')
    }
  ],
  mirror_notification: [
    checkboxUtility(
      'dismissable',
      __('Not Dismissable', 'bit-integrations'),
      __('Keep the notification open until it is dismissed by an action', 'bit-integrations'),
      'false'
    )
  ]
}
