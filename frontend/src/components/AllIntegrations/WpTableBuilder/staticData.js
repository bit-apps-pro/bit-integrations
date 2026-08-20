import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_table', label: __('Create Table', 'bit-integrations'), is_pro: true },
  { name: 'update_table', label: __('Update Table', 'bit-integrations'), is_pro: true },
  { name: 'delete_table', label: __('Delete Table', 'bit-integrations'), is_pro: true },
  { name: 'add_row', label: __('Add Row to Table', 'bit-integrations'), is_pro: true }
]

export const fetchesColumns = ['add_row']

export const CreateTableFields = [
  { key: 'title', label: __('Table Title', 'bit-integrations'), required: true },
  { key: 'content', label: __('Table Content', 'bit-integrations'), required: true }
]

export const UpdateTableFields = [
  { key: 'table_id', label: __('Table ID', 'bit-integrations'), required: true },
  { key: 'title', label: __('Table Title', 'bit-integrations'), required: false },
  { key: 'content', label: __('Table Content', 'bit-integrations'), required: false }
]

export const DeleteTableFields = [
  { key: 'table_id', label: __('Table ID', 'bit-integrations'), required: true }
]

export const hasUtilities = ['delete_table']
