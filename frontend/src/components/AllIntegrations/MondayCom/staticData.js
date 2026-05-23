import { __ } from '../../../Utils/i18nwrap'

export const actionLists = [
  { name: 'create_item', label: __('Create Item', 'bit-integrations'), is_pro: true },
  { name: 'update_item', label: __('Update Item', 'bit-integrations'), is_pro: true },
  { name: 'create_subitem', label: __('Create Subitem', 'bit-integrations'), is_pro: true },
  { name: 'move_item_to_group', label: __('Move Item to Group', 'bit-integrations'), is_pro: true },
  { name: 'archive_item', label: __('Archive Item', 'bit-integrations'), is_pro: true },
  { name: 'delete_item', label: __('Delete Item', 'bit-integrations'), is_pro: true },
  { name: 'archive_board', label: __('Archive Board', 'bit-integrations'), is_pro: true },
  { name: 'create_group', label: __('Create Group', 'bit-integrations'), is_pro: true },
  { name: 'duplicate_group', label: __('Duplicate Group', 'bit-integrations'), is_pro: true },
  { name: 'archive_group', label: __('Archive Group', 'bit-integrations'), is_pro: true },
  { name: 'delete_group', label: __('Delete Group', 'bit-integrations'), is_pro: true },
  { name: 'create_column', label: __('Create Column', 'bit-integrations'), is_pro: true }
]

export const staticFieldsMap = {
  create_item: [{ label: __('Item Name', 'bit-integrations'), key: 'item_name', required: true }],
  update_item: [{ label: __('Item ID', 'bit-integrations'), key: 'item_id', required: true }],
  create_subitem: [
    { label: __('Subitem Name', 'bit-integrations'), key: 'subitem_name', required: true }
  ],
  move_item_to_group: [
    { label: __('Group ID', 'bit-integrations'), key: 'group_id', required: true },
    { label: __('Item ID', 'bit-integrations'), key: 'item_id', required: true }
  ],
  archive_item: [
    { label: __('Item ID', 'bit-integrations'), key: 'item_id', required: true }
  ],
  delete_item: [
    { label: __('Item ID', 'bit-integrations'), key: 'item_id', required: true }
  ],
  archive_board: [
    { label: __('Board ID', 'bit-integrations'), key: 'board_id', required: true }
  ],
  create_group: [{ label: __('Group Name', 'bit-integrations'), key: 'group_name', required: true }],
  duplicate_group: [
    { label: __('Group ID', 'bit-integrations'), key: 'group_id', required: true },
    { label: __('Group Title', 'bit-integrations'), key: 'group_title', required: true }
  ],
  archive_group: [
    { label: __('Group ID', 'bit-integrations'), key: 'group_id', required: true }
  ],
  delete_group: [
    { label: __('Group ID', 'bit-integrations'), key: 'group_id', required: true }
  ],
  create_column: [{ label: __('Column Title', 'bit-integrations'), key: 'column_title', required: true }]
}

export const columnTypeList = [
  { label: __('Text', 'bit-integrations'), value: 'text' },
  { label: __('Long Text', 'bit-integrations'), value: 'long_text' },
  { label: __('Number', 'bit-integrations'), value: 'numbers' },
  { label: __('Status', 'bit-integrations'), value: 'status' },
  { label: __('Date', 'bit-integrations'), value: 'date' },
  { label: __('Checkbox', 'bit-integrations'), value: 'checkbox' },
  { label: __('Email', 'bit-integrations'), value: 'email' },
  { label: __('Phone', 'bit-integrations'), value: 'phone' },
  { label: __('Link', 'bit-integrations'), value: 'link' },
  { label: __('Rating', 'bit-integrations'), value: 'rating' },
  { label: __('Tags', 'bit-integrations'), value: 'tag' },
  { label: __('People', 'bit-integrations'), value: 'people' },
  { label: __('Timeline', 'bit-integrations'), value: 'timeline' }
]

export const needsBoard = [
  'create_item',
  'update_item',
  'create_subitem',
  'move_item_to_group',
  'archive_item',
  'delete_item',
  'archive_group',
  'delete_group',
  'create_group',
  'duplicate_group',
  'create_column'
]

export const needsItem = ['create_subitem']

export const needsColumnMap = ['create_item', 'update_item']
