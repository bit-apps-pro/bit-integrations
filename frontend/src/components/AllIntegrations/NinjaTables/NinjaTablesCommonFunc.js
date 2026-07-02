import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

// Constants
const API_ENDPOINTS = {
  REFRESH_TABLES: 'refresh_ninja_tables',
  REFRESH_ROWS: 'refresh_ninja_tables_rows',
  REFRESH_USERS: 'refresh_ninja_tables_users',
  REFRESH_COLUMNS: 'refresh_ninja_tables_columns'
}

const ACTIONS = {
  ADD_ROW: 'add_row_in_table',
  UPDATE_ROW: 'update_row_in_table',
  DELETE_ROW: 'delete_row_in_table'
}

const ERROR_MESSAGES = {
  TABLE_REQUIRED: __('Please select a table first', 'bit-integrations'),
  FETCH_FAILED: __('Failed to fetch data', 'bit-integrations')
}

/**
 * Handle input change for configuration
 */
export const handleInput = (e, ninjaTablesConf, setNinjaTablesConf) => {
  const { name, value } = e.target
  setNinjaTablesConf(prevConf => ({
    ...prevConf,
    [name]: value
  }))
}

/**
 * Generic fetch handler to reduce code duplication
 */
const handleFetch = async ({
  endpoint,
  params,
  dataKey,
  successMsg,
  errorMsg,
  setNinjaTablesConf,
  setIsLoading,
  setSnackbar
}) => {
  setIsLoading(true)

  try {
    const result = await bitsFetch(params, endpoint)

    if (result?.success) {
      setNinjaTablesConf(prevConf => ({
        ...prevConf,
        default: {
          ...prevConf.default,
          [dataKey]: result.data[dataKey]
        }
      }))

      setSnackbar({
        show: true,
        msg: successMsg
      })
    } else {
      throw new Error(result?.data || errorMsg)
    }
  } catch (error) {
    setSnackbar({
      show: true,
      msg: error.message || errorMsg
    })
  } finally {
    setIsLoading(false)
  }
}

/**
 * Refresh Ninja Tables list
 */
export const refreshNinjaTables = (formID, setNinjaTablesConf, setIsLoading, setSnackbar) => {
  handleFetch({
    endpoint: API_ENDPOINTS.REFRESH_TABLES,
    params: { formID },
    dataKey: 'tables',
    successMsg: __('Tables refreshed successfully', 'bit-integrations'),
    errorMsg: __('Failed to fetch tables', 'bit-integrations'),
    setNinjaTablesConf,
    setIsLoading,
    setSnackbar
  }).then(() => {
    // Update allTables key for backwards compatibility
    setNinjaTablesConf(prevConf => {
      if (prevConf.default?.tables) {
        return {
          ...prevConf,
          default: {
            ...prevConf.default,
            allTables: prevConf.default.tables
          }
        }
      }
      return prevConf
    })
  })
}

/**
 * Validate table ID before making API calls
 */
const validateTableId = (tableId, setSnackbar) => {
  if (!tableId) {
    setSnackbar({
      show: true,
      msg: ERROR_MESSAGES.TABLE_REQUIRED
    })
    return false
  }
  return true
}

/**
 * Refresh table rows
 */
export const refreshNinjaTablesRows = (
  formID,
  tableId,
  setNinjaTablesConf,
  setIsLoading,
  setSnackbar
) => {
  if (!validateTableId(tableId, setSnackbar)) return

  handleFetch({
    endpoint: API_ENDPOINTS.REFRESH_ROWS,
    params: { formID, table_id: tableId },
    dataKey: 'rows',
    successMsg: __('Rows refreshed successfully', 'bit-integrations'),
    errorMsg: __('Failed to fetch rows', 'bit-integrations'),
    setNinjaTablesConf,
    setIsLoading,
    setSnackbar
  }).then(() => {
    // Update allRows key for backwards compatibility
    setNinjaTablesConf(prevConf => {
      if (prevConf.default?.rows) {
        return {
          ...prevConf,
          default: {
            ...prevConf.default,
            allRows: prevConf.default.rows
          }
        }
      }
      return prevConf
    })
  })
}

/**
 * Refresh WordPress users
 */
export const refreshNinjaTablesUsers = (formID, setNinjaTablesConf, setIsLoading, setSnackbar) => {
  handleFetch({
    endpoint: API_ENDPOINTS.REFRESH_USERS,
    params: { formID },
    dataKey: 'users',
    successMsg: __('Users refreshed successfully', 'bit-integrations'),
    errorMsg: __('Failed to fetch users', 'bit-integrations'),
    setNinjaTablesConf,
    setIsLoading,
    setSnackbar
  }).then(() => {
    // Update allUsers key for backwards compatibility
    setNinjaTablesConf(prevConf => {
      if (prevConf.default?.users) {
        return {
          ...prevConf,
          default: {
            ...prevConf.default,
            allUsers: prevConf.default.users
          }
        }
      }
      return prevConf
    })
  })
}

/**
 * Refresh table columns
 */
export const refreshNinjaTablesColumns = (
  formID,
  tableId,
  setNinjaTablesConf,
  setIsLoading,
  setSnackbar
) => {
  if (!validateTableId(tableId, setSnackbar)) return

  handleFetch({
    endpoint: API_ENDPOINTS.REFRESH_COLUMNS,
    params: { formID, table_id: tableId },
    dataKey: 'columns',
    successMsg: __('Columns refreshed successfully', 'bit-integrations'),
    errorMsg: __('Failed to fetch columns', 'bit-integrations'),
    setNinjaTablesConf,
    setIsLoading,
    setSnackbar
  }).then(() => {
    // Update allColumns key for backwards compatibility
    setNinjaTablesConf(prevConf => {
      if (prevConf.default?.columns) {
        return {
          ...prevConf,
          default: {
            ...prevConf.default,
            allColumns: prevConf.default.columns
          }
        }
      }
      return prevConf
    })
  })
}

/**
 * Check if field mapping is valid
 */
const isFieldMapValid = fieldMap => {
  if (!fieldMap?.length) return false

  return fieldMap.some(map => {
    const hasFormField = map.formField && map.formField !== ''
    const hasColumnName = map.columnName && map.columnName !== ''
    const hasCustomColumn = map.columnName === 'custom' && map.customColumnName?.trim()

    return hasFormField && (hasColumnName || hasCustomColumn)
  })
}

/**
 * Validate required fields based on action type
 */
const validateRequiredFields = (action, config) => {
  const validators = {
    [ACTIONS.ADD_ROW]: () =>
      config.selectedTable && config.selectedUser && isFieldMapValid(config.field_map),
    [ACTIONS.UPDATE_ROW]: () =>
      config.selectedTable && config.selectedRow && isFieldMapValid(config.field_map),
    [ACTIONS.DELETE_ROW]: () => config.selectedTable && config.selectedRow
  }

  return validators[action]?.()
}

/**
 * Check if all mapped fields are valid
 */
export const checkMappedFields = ninjaTablesConf => {
  const { mainAction } = ninjaTablesConf
  if (!mainAction) return false

  return validateRequiredFields(mainAction, ninjaTablesConf) || false
}

/**
 * Generate initial field mapping based on action
 */
export const generateMappedField = mainAction => {
  const actionsNeedingFieldMap = [ACTIONS.ADD_ROW, ACTIONS.UPDATE_ROW]
  return actionsNeedingFieldMap.includes(mainAction) ? [{ formField: '', columnName: '' }] : []
}

/**
 * Export constants for use in other components
 */
export { ACTIONS, API_ENDPOINTS }
