import { __, sprintf } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_table', label: __('Create Table', 'bit-integrations'), is_pro: true },
  { name: 'update_table', label: __('Update Table', 'bit-integrations'), is_pro: true },
  { name: 'update_table_options', label: __('Update Table Options', 'bit-integrations'), is_pro: true },
  { name: 'copy_table', label: __('Copy Table', 'bit-integrations'), is_pro: true },
  { name: 'delete_table', label: __('Delete Table', 'bit-integrations'), is_pro: true },
  { name: 'change_table_id', label: __('Change Table ID', 'bit-integrations'), is_pro: true },
  { name: 'import_table', label: __('Import Table', 'bit-integrations'), is_pro: true },
  { name: 'add_row', label: __('Add Row', 'bit-integrations'), is_pro: true },
  { name: 'update_row', label: __('Update Row', 'bit-integrations'), is_pro: true },
  { name: 'delete_row', label: __('Delete Row', 'bit-integrations'), is_pro: true },
  { name: 'set_row_visibility', label: __('Show or Hide Row', 'bit-integrations'), is_pro: true },
  { name: 'add_column', label: __('Add Column', 'bit-integrations'), is_pro: true },
  { name: 'delete_column', label: __('Delete Column', 'bit-integrations'), is_pro: true },
  { name: 'set_column_visibility', label: __('Show or Hide Column', 'bit-integrations'), is_pro: true },
  { name: 'update_cell', label: __('Update Cell', 'bit-integrations'), is_pro: true }
]

const tableIdField = { key: 'table_id', label: __('Table ID', 'bit-integrations'), required: true }

const rowNumberField = required => ({
  key: 'row_number',
  label: required ? __('Row Number', 'bit-integrations') : __('Insert Before Row', 'bit-integrations'),
  required
})

const columnField = required => ({
  key: 'column',
  label: required ? __('Column', 'bit-integrations') : __('Insert Before Column', 'bit-integrations'),
  required
})

const cellFields = Array.from({ length: 26 }, (_, index) => {
  const letter = String.fromCodePoint(65 + index)

  return {
    key: `cell_${letter.toLowerCase()}`,
    // translators: %s: Column letter
    label: sprintf(__('Column %s', 'bit-integrations'), letter),
    required: false
  }
})

export const fieldsByAction = {
  create_table: [
    { key: 'name', label: __('Table Name', 'bit-integrations'), required: true },
    { key: 'rows', label: __('Rows', 'bit-integrations'), required: true },
    { key: 'columns', label: __('Columns', 'bit-integrations'), required: true },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false }
  ],
  update_table: [
    tableIdField,
    { key: 'name', label: __('Table Name', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false }
  ],
  update_table_options: [
    tableIdField,
    { key: 'table_head', label: __('Header Rows', 'bit-integrations'), required: false },
    { key: 'table_foot', label: __('Footer Rows', 'bit-integrations'), required: false },
    {
      key: 'datatables_paginate_entries',
      label: __('Rows per Page', 'bit-integrations'),
      required: false
    },
    { key: 'extra_css_classes', label: __('Extra CSS Classes', 'bit-integrations'), required: false }
  ],
  copy_table: [tableIdField],
  delete_table: [tableIdField],
  change_table_id: [
    tableIdField,
    { key: 'new_table_id', label: __('New Table ID', 'bit-integrations'), required: true }
  ],
  import_table: [
    { key: 'url', label: __('File URL', 'bit-integrations'), required: false },
    { key: 'data', label: __('Table Data', 'bit-integrations'), required: false },
    { key: 'table_id', label: __('Table ID', 'bit-integrations'), required: false }
  ],
  add_row: [tableIdField, rowNumberField(false), ...cellFields],
  update_row: [tableIdField, rowNumberField(true), ...cellFields],
  delete_row: [tableIdField, rowNumberField(true)],
  set_row_visibility: [tableIdField, rowNumberField(true)],
  add_column: [
    tableIdField,
    columnField(false),
    { key: 'header', label: __('Header Text', 'bit-integrations'), required: false }
  ],
  delete_column: [tableIdField, columnField(true)],
  set_column_visibility: [tableIdField, columnField(true)],
  update_cell: [
    tableIdField,
    columnField(true),
    rowNumberField(true),
    { key: 'value', label: __('Value', 'bit-integrations'), required: false }
  ]
}

export const importSourceOptions = [
  { label: __('URL', 'bit-integrations'), value: 'url' },
  { label: __('Data', 'bit-integrations'), value: 'data' }
]

export const importTypeOptions = [
  { label: __('Add as a new table', 'bit-integrations'), value: 'add' },
  { label: __('Replace a table', 'bit-integrations'), value: 'replace' },
  { label: __('Append rows to a table', 'bit-integrations'), value: 'append' }
]

export const visibilityOptions = [
  { label: __('Visible', 'bit-integrations'), value: 'visible' },
  { label: __('Hidden', 'bit-integrations'), value: 'hidden' }
]

export const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: 'yes' },
  { label: __('No', 'bit-integrations'), value: 'no' }
]

export const positionOptions = [
  { label: __('Above the table', 'bit-integrations'), value: 'above' },
  { label: __('Below the table', 'bit-integrations'), value: 'below' }
]

export const tableOptionSelects = [
  {
    key: 'alternating_row_colors',
    label: __('Alternating Row Colors', 'bit-integrations'),
    options: yesNoOptions
  },
  { key: 'row_hover', label: __('Row Hover Highlighting', 'bit-integrations'), options: yesNoOptions },
  { key: 'print_name', label: __('Show Table Name', 'bit-integrations'), options: yesNoOptions },
  {
    key: 'print_name_position',
    label: __('Table Name Position', 'bit-integrations'),
    options: positionOptions
  },
  {
    key: 'print_description',
    label: __('Show Table Description', 'bit-integrations'),
    options: yesNoOptions
  },
  {
    key: 'print_description_position',
    label: __('Table Description Position', 'bit-integrations'),
    options: positionOptions
  },
  {
    key: 'use_datatables',
    label: __('Enable Visitor Features', 'bit-integrations'),
    options: yesNoOptions
  },
  { key: 'datatables_sort', label: __('Sorting', 'bit-integrations'), options: yesNoOptions },
  { key: 'datatables_filter', label: __('Search', 'bit-integrations'), options: yesNoOptions },
  { key: 'datatables_paginate', label: __('Pagination', 'bit-integrations'), options: yesNoOptions },
  {
    key: 'datatables_lengthchange',
    label: __('Rows per Page Selector', 'bit-integrations'),
    options: yesNoOptions
  },
  { key: 'datatables_info', label: __('Table Information', 'bit-integrations'), options: yesNoOptions },
  {
    key: 'datatables_scrollx',
    label: __('Horizontal Scrolling', 'bit-integrations'),
    options: yesNoOptions
  }
]

export const needsVisibility = ['set_row_visibility', 'set_column_visibility']

export const needsImportSettings = ['import_table']

export const needsTableOptions = ['update_table_options']

export const cellActions = ['add_row', 'update_row']

export const tableIdNote = __(
  'Find the table ID on the TablePress All Tables screen. To use one table, select Custom and enter its ID.',
  'bit-integrations'
)

export const actionNotes = {
  create_table: __(
    'TablePress creates an empty table. Set Rows to 1 to start with only a header row, then use Add Row to add data.',
    'bit-integrations'
  ),
  update_table: __(
    'Map a name, a description or both. A field that you do not map keeps its value.',
    'bit-integrations'
  ),
  update_table_options: __(
    'Leave an option empty to keep its current value. Header Rows and Footer Rows take a number from 0 to 9.',
    'bit-integrations'
  ),
  copy_table: __('The copy gets the name "Copy of" and the name of the table.', 'bit-integrations'),
  delete_table: __(
    'TablePress deletes the table and all of its data. You cannot undo this.',
    'bit-integrations'
  ),
  change_table_id: __(
    'Use only letters, numbers, hyphens (-) and underscores (_). Update the table shortcodes on your pages to use the new ID.',
    'bit-integrations'
  ),
  import_table: __(
    'A URL can point to a CSV, HTML, JSON or Excel file. Replace and Append need a Table ID.',
    'bit-integrations'
  ),
  add_row: __(
    'Use the column letters from the TablePress editor. Columns that you do not map get an empty cell. Without Insert Before Row, the row goes after the last row, above any footer rows.',
    'bit-integrations'
  ),
  update_row: __(
    'Use the row number from the TablePress editor. Only the mapped columns change, and an empty value keeps the current cell value.',
    'bit-integrations'
  ),
  delete_row: __(
    'Use the row number from the TablePress editor. Row 1 is the first row.',
    'bit-integrations'
  ),
  set_row_visibility: __(
    'Hidden rows stay in the table, but visitors do not see them.',
    'bit-integrations'
  ),
  add_column: __(
    'Map a column letter in Insert Before Column, or leave it empty to add the column after the last column. Row 1 of the new column gets the Header Text.',
    'bit-integrations'
  ),
  delete_column: __(
    'Use the column letter from the TablePress editor, for example B.',
    'bit-integrations'
  ),
  set_column_visibility: __(
    'Hidden columns stay in the table, but visitors do not see them.',
    'bit-integrations'
  ),
  update_cell: __(
    'Use the column letter and the row number from the TablePress editor, for example B and 3. An empty value clears the cell.',
    'bit-integrations'
  )
}
