import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'update_customer_group', label: __('Update Customer Group', 'bit-integrations'), is_pro: true },
  { name: 'approve_customer', label: __('Approve Customer', 'bit-integrations'), is_pro: true },
  { name: 'enable_b2b_for_user', label: __('Enable B2B for User', 'bit-integrations'), is_pro: true }
]

export const UpdateCustomerGroupFields = [
  { key: 'user_email', label: __('User Email', 'bit-integrations'), required: true }
]

export const ApproveCustomerFields = [
  { key: 'user_email', label: __('User Email', 'bit-integrations'), required: true }
]

export const EnableB2BForUserFields = [
  { key: 'user_email', label: __('User Email', 'bit-integrations'), required: true }
]
