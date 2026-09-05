import { __ } from '../../../Utils/i18nwrap'

export const DEFAULT_ACTION = 'insertRow'

export const modules = [
  { name: 'insertRow', label: __('Insert Row', 'bit-integrations') },
  { name: 'appendOrUpdateRow', label: __('Append or Update Row', 'bit-integrations'), is_pro: true },
  { name: 'updateRow', label: __('Update Row', 'bit-integrations'), is_pro: true },
  { name: 'deleteRow', label: __('Delete Row', 'bit-integrations'), is_pro: true },
  { name: 'createColumn', label: __('Create Column', 'bit-integrations'), is_pro: true },
  { name: 'createSheet', label: __('Create Worksheet', 'bit-integrations'), is_pro: true },
  { name: 'copySheet', label: __('Copy Worksheet', 'bit-integrations'), is_pro: true },
  { name: 'clearSheet', label: __('Clear Worksheet', 'bit-integrations'), is_pro: true },
  { name: 'deleteSheet', label: __('Delete Worksheet', 'bit-integrations'), is_pro: true },
  { name: 'createSpreadsheet', label: __('Create Spreadsheet', 'bit-integrations'), is_pro: true },
  { name: 'deleteSpreadsheet', label: __('Delete Spreadsheet', 'bit-integrations'), is_pro: true }
]

export const needsSpreadsheet = [
  'insertRow',
  'appendOrUpdateRow',
  'updateRow',
  'deleteRow',
  'createColumn',
  'createSheet',
  'copySheet',
  'clearSheet',
  'deleteSheet',
  'deleteSpreadsheet'
]

export const needsWorksheet = [
  'insertRow',
  'appendOrUpdateRow',
  'updateRow',
  'deleteRow',
  'createColumn',
  'copySheet',
  'clearSheet',
  'deleteSheet'
]

export const needsHeaders = ['appendOrUpdateRow', 'updateRow']

export const needsColumnToMatch = ['appendOrUpdateRow']

export const hasUtilities = ['clearSheet']

export const SpreadsheetFields = [
  { key: 'title', label: __('Spreadsheet Title', 'bit-integrations'), required: true },
  { key: 'sheetTitle', label: __('First Worksheet Title', 'bit-integrations'), required: false }
]

export const WorksheetTitleField = [
  { key: 'title', label: __('Worksheet Title', 'bit-integrations'), required: true }
]

export const CopySheetFields = [
  {
    key: 'destinationSpreadsheetId',
    label: __('Destination Spreadsheet Id', 'bit-integrations'),
    required: true
  }
]

export const RowNumberField = [
  { key: 'rowId', label: __('Row Number', 'bit-integrations'), required: true }
]

export const ColumnFields = [
  { key: 'columnName', label: __('Column Name', 'bit-integrations'), required: true },
  { key: 'columnIndex', label: __('Column Position', 'bit-integrations'), required: false }
]

export const actionFields = {
  createSpreadsheet: SpreadsheetFields,
  createSheet: WorksheetTitleField,
  copySheet: CopySheetFields,
  updateRow: RowNumberField,
  deleteRow: RowNumberField,
  createColumn: ColumnFields
}

export const needsFieldMap = [
  'insertRow',
  'appendOrUpdateRow',
  'updateRow',
  'deleteRow',
  'createColumn',
  'createSheet',
  'copySheet',
  'createSpreadsheet'
]
