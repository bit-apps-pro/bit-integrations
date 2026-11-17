import { __, sprintf } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_table', label: __('Create Table', 'bit-integrations'), is_pro: true },
  { name: 'update_table', label: __('Update Table', 'bit-integrations'), is_pro: true },
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

export const visibilityOptions = [
  { label: __('Visible', 'bit-integrations'), value: 'visible' },
  { label: __('Hidden', 'bit-integrations'), value: 'hidden' }
]

export const needsVisibility = ['set_row_visibility', 'set_column_visibility']

export const cellActions = ['add_row', 'update_row']

export const tableIdNote = __(
  'Find the table ID on the TablePress All Tables screen. To use one table, select Custom and enter its ID.',
  'bit-integrations'
)

export const actionNotes = {
  create_table: __(
    'TablePress creates an empty table. Rows multiplied by Columns must be 100000 or less. Set Rows to 1 to start with only a header row, then use Add Row to add data.',
    'bit-integrations'
  ),
  update_table: __(
    'Map a name, a description or both. A field that you do not map keeps its value.',
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
