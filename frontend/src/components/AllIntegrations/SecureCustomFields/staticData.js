import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  {
    name: 'update_post_acf_value',
    label: __('Update Post Custom Field Value', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_user_acf_value',
    label: __('Update User Custom Field Value', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_option_acf_value',
    label: __('Update Options Page Field Value', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_group_field_value',
    label: __('Update Group Field Value', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_repeater_field_value',
    label: __('Update Repeater Field Value', 'bit-integrations'),
    is_pro: true
  }
]

export const PostFields = [
  { key: 'post_id', label: __('Post ID', 'bit-integrations'), required: true },
  { key: 'field_name', label: __('Field Name / Key', 'bit-integrations'), required: true },
  { key: 'field_value', label: __('Field Value', 'bit-integrations'), required: true }
]

export const UserFields = [
  { key: 'user_id', label: __('User ID', 'bit-integrations'), required: true },
  { key: 'field_name', label: __('Field Name / Key', 'bit-integrations'), required: true },
  { key: 'field_value', label: __('Field Value', 'bit-integrations'), required: true }
]

export const OptionFields = [
  { key: 'field_name', label: __('Field Name / Key', 'bit-integrations'), required: true },
  { key: 'field_value', label: __('Field Value', 'bit-integrations'), required: true }
]

// Actions that use dynamic sub-field mapping (config inputs + repeatable sub-field rows)
// instead of a fixed field list.
export const dynamicActions = ['update_group_field_value', 'update_repeater_field_value']

export const emptySubFieldMap = () => [
  { formField: '', subFieldName: '', customValue: '', rowIndex: '' }
]
