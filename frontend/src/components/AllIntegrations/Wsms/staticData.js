import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'send_sms', label: __('Send SMS', 'bit-integrations'), is_pro: true },
  { name: 'add_subscriber', label: __('Add Subscriber', 'bit-integrations'), is_pro: true },
  { name: 'update_subscriber', label: __('Update Subscriber', 'bit-integrations'), is_pro: true },
  { name: 'delete_subscriber', label: __('Delete Subscriber', 'bit-integrations'), is_pro: true },
  { name: 'add_group', label: __('Add Group', 'bit-integrations'), is_pro: true },
  { name: 'update_group', label: __('Update Group', 'bit-integrations'), is_pro: true },
  { name: 'delete_group', label: __('Delete Group', 'bit-integrations'), is_pro: true }
]

const SendSmsFields = [
  { key: 'to', label: __('To (Recipient Numbers)', 'bit-integrations'), required: true },
  { key: 'message', label: __('Message', 'bit-integrations'), required: true },
  { key: 'sender_id', label: __('Sender ID', 'bit-integrations'), required: false },
  { key: 'is_flash', label: __('Is Flash', 'bit-integrations'), required: false },
  { key: 'media_urls', label: __('Media URLs', 'bit-integrations'), required: false }
]

const AddSubscriberFields = [
  { key: 'name', label: __('Name', 'bit-integrations'), required: true },
  { key: 'mobile', label: __('Mobile', 'bit-integrations'), required: true }
]

const UpdateSubscriberFields = [
  { key: 'name', label: __('Name', 'bit-integrations'), required: true },
  { key: 'mobile', label: __('Mobile', 'bit-integrations'), required: true }
]

const DeleteSubscriberFields = [
  { key: 'mobile', label: __('Mobile', 'bit-integrations'), required: true }
]

const AddGroupFields = [{ key: 'name', label: __('Group Name', 'bit-integrations'), required: true }]

const UpdateGroupFields = [
  { key: 'group_id', label: __('Group ID', 'bit-integrations'), required: true },
  { key: 'name', label: __('Group Name', 'bit-integrations'), required: true }
]

const DeleteGroupFields = [
  { key: 'group_id', label: __('Group ID', 'bit-integrations'), required: true }
]

export const WsmsStaticData = {
  send_sms: SendSmsFields,
  add_subscriber: AddSubscriberFields,
  update_subscriber: UpdateSubscriberFields,
  delete_subscriber: DeleteSubscriberFields,
  add_group: AddGroupFields,
  update_group: UpdateGroupFields,
  delete_group: DeleteGroupFields
}

export const wsmsStatuses = [
  { value: '1', label: __('Active', 'bit-integrations') },
  { value: '0', label: __('Inactive', 'bit-integrations') }
]
