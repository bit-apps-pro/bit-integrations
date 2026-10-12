import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'add_worksheet_row', label: __('Add Worksheet Row', 'bit-integrations'), is_pro: true },
  {
    name: 'update_worksheet_row',
    label: __('Update Worksheet Row', 'bit-integrations'),
    is_pro: true
  },
  { name: 'clear_worksheet', label: __('Clear Worksheet', 'bit-integrations'), is_pro: true },
  {
    name: 'add_worksheet',
    label: __('Add Worksheet to Workbook', 'bit-integrations'),
    is_pro: true
  },
  { name: 'delete_worksheet', label: __('Delete Worksheet', 'bit-integrations'), is_pro: true },
  { name: 'create_table', label: __('Create Table', 'bit-integrations'), is_pro: true },
  { name: 'delete_table', label: __('Delete Table', 'bit-integrations'), is_pro: true }
]

export const rowActions = ['add_worksheet_row', 'update_worksheet_row']

export const COLUMN_KEY = /^[A-Z]{1,3}$/

const worksheetField = {
  key: 'worksheet',
  label: __('Worksheet Name or ID', 'bit-integrations'),
  required: true
}

const rangeField = {
  key: 'range',
  label: __('Range (e.g. A1:D20)', 'bit-integrations'),
  required: false
}

export const fieldsByAction = {
  add_worksheet_row: [],
  update_worksheet_row: [
    { key: 'row_number', label: __('Row Number', 'bit-integrations'), required: true }
  ],
  clear_worksheet: [worksheetField, rangeField],
  add_worksheet: [{ key: 'name', label: __('Worksheet Name', 'bit-integrations'), required: false }],
  delete_worksheet: [worksheetField],
  create_table: [rangeField],
  delete_table: [{ key: 'table', label: __('Table Name or ID', 'bit-integrations'), required: true }]
}

const folderSelect = {
  key: 'folder_id',
  label: __('Folder', 'bit-integrations'),
  placeholder: __('Root (My files)', 'bit-integrations'),
  source: 'folders'
}

const workbookSelect = {
  key: 'workbook_id',
  label: __('Workbook', 'bit-integrations'),
  source: 'workbooks',
  dependsOn: 'folder_id',
  required: true
}

const worksheetSelect = {
  key: 'worksheet_id',
  label: __('Worksheet', 'bit-integrations'),
  source: 'worksheets',
  dependsOn: 'workbook_id',
  required: true
}

export const selectsByAction = {
  add_worksheet_row: [folderSelect, workbookSelect, worksheetSelect],
  update_worksheet_row: [folderSelect, workbookSelect, worksheetSelect],
  clear_worksheet: [folderSelect, workbookSelect],
  add_worksheet: [folderSelect, workbookSelect],
  delete_worksheet: [folderSelect, workbookSelect],
  create_table: [folderSelect, workbookSelect, worksheetSelect],
  delete_table: [folderSelect, workbookSelect]
}

export const selectKeys = [folderSelect.key, workbookSelect.key, worksheetSelect.key]

export const utilitiesByAction = {
  clear_worksheet: [
    {
      key: 'apply_to',
      title: __('What to Clear', 'bit-integrations'),
      subTitle: __('Contents and formats by default', 'bit-integrations'),
      options: [
        { label: __('Contents and formats', 'bit-integrations'), value: 'All' },
        { label: __('Contents only', 'bit-integrations'), value: 'Contents' },
        { label: __('Formats only', 'bit-integrations'), value: 'Formats' }
      ]
    }
  ],
  create_table: [
    {
      checkbox: true,
      key: 'has_headers',
      title: __('No Header Row', 'bit-integrations'),
      subTitle: __('Excel adds column names and moves the data down a row', 'bit-integrations'),
      value: 'false'
    }
  ]
}

export const notesByAction = {
  add_worksheet_row: __(
    'Each run writes one row below the last row that holds a value. Column labels come from the first row with data.',
    'bit-integrations'
  ),
  update_worksheet_row: __(
    'Row Number picks the row to overwrite. Columns you leave unmapped keep their current values.',
    'bit-integrations'
  ),
  clear_worksheet: __(
    'Leave Range unmapped to clear the whole worksheet. To always clear the same worksheet, choose Custom and type its name.',
    'bit-integrations'
  ),
  add_worksheet: __(
    'Leave Worksheet Name unmapped to let Excel name it (Sheet2, Sheet3…). Names must be unique in the workbook.',
    'bit-integrations'
  ),
  delete_worksheet: __(
    'To always delete the same worksheet, choose Custom and type its name.',
    'bit-integrations'
  ),
  create_table: __(
    'Leave Range unmapped to turn all the data on the worksheet into a table.',
    'bit-integrations'
  ),
  delete_table: __(
    'To always delete the same table, choose Custom and type its name.',
    'bit-integrations'
  )
}
