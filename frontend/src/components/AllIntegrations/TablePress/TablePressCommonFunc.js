import { create } from 'mutative'
import { __ } from '../../../Utils/i18nwrap'
import {
  cellActions,
  fieldsByAction,
  needsTableOptions,
  needsVisibility,
  tableOptionSelects
} from './staticData'

export const handleInput = (e, tablePressConf, setTablePressConf) => {
  const { name, value } = e.target

  setTablePressConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        tablePressField: field.key
      }))
    : [{ formField: '', tablePressField: '' }]
}

const isBlankRow = mappedField => !mappedField.formField && !mappedField.tablePressField

const isMapped = (tablePressConf, key) =>
  (tablePressConf?.field_map || []).some(
    mappedField => mappedField.tablePressField === key && mappedField.formField
  )

export const checkMappedFields = tablePressConf => {
  const fieldMap = tablePressConf?.field_map || []
  const invalidRows = fieldMap.filter(
    mappedField =>
      !isBlankRow(mappedField) &&
      (!mappedField.formField ||
        !mappedField.tablePressField ||
        (mappedField.formField === 'custom' && !mappedField.customValue))
  )

  if (invalidRows.length > 0) {
    return false
  }

  const requiredKeys = (fieldsByAction[tablePressConf?.mainAction] || [])
    .filter(field => field.required === true)
    .map(field => field.key)

  return requiredKeys.every(key => isMapped(tablePressConf, key))
}

export const getConfError = tablePressConf => {
  const { mainAction } = tablePressConf || {}

  if (!mainAction) {
    return __('Select an action to continue.', 'bit-integrations')
  }

  if (needsVisibility.includes(mainAction) && !tablePressConf?.selectedVisibility) {
    return __('Select Visible or Hidden to continue.', 'bit-integrations')
  }

  if (!checkMappedFields(tablePressConf)) {
    return __('Map all required fields to continue.', 'bit-integrations')
  }

  if (
    cellActions.includes(mainAction) &&
    !(tablePressConf?.field_map || []).some(
      mappedField => mappedField.formField && mappedField.tablePressField?.startsWith('cell_')
    )
  ) {
    return __('Map at least one column to continue.', 'bit-integrations')
  }

  if (
    mainAction === 'update_table' &&
    !isMapped(tablePressConf, 'name') &&
    !isMapped(tablePressConf, 'description')
  ) {
    return __('Map a name or a description to continue.', 'bit-integrations')
  }

  if (needsTableOptions.includes(mainAction)) {
    const hasOptionField = [
      'table_head',
      'table_foot',
      'datatables_paginate_entries',
      'extra_css_classes'
    ].some(key => isMapped(tablePressConf, key))
    const hasOptionSelect = tableOptionSelects.some(option => tablePressConf?.[option.key])

    if (!hasOptionField && !hasOptionSelect) {
      return __('Set at least one table option to continue.', 'bit-integrations')
    }
  }

  return ''
}
