import { __, sprintf } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import { deepCopy } from '../../../Utils/Helpers'

export const handleInput = (
  e,
  sheetConf,
  setSheetConf,
  formID,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  let newConf = { ...sheetConf }
  if (isNew) {
    const rmError = { ...error }
    rmError[e.target.name] = ''
    setError({ ...rmError })
  }
  newConf[e.target.name] = e.target.value
  switch (e.target.name) {
    case 'spreadsheetId':
      newConf = spreadSheetChange(newConf, formID, setSheetConf, setIsLoading, setSnackbar)
      break
    case 'worksheetName':
      newConf = worksheetChange(newConf, formID, setSheetConf, setIsLoading, setSnackbar)
      break
    default:
      break
  }
  setSheetConf({ ...newConf })
}

const spreadSheetChange = (sheetConf, formID, setSheetConf, setIsLoading, setSnackbar) => {
  const newConf = deepCopy(sheetConf)
  newConf.worksheetName = ''
  newConf.headerRow = 'A1'
  newConf.field_map = [{ formField: '', googleSheetField: '' }]

  if (!newConf?.default?.worksheets?.[sheetConf.spreadsheetId]) {
    refreshWorksheets(formID, newConf, setSheetConf, setIsLoading, setSnackbar)
  } else if (Object.keys(newConf?.default?.worksheets?.[sheetConf.spreadsheetId]).length === 1) {
    newConf.worksheetName = newConf?.default?.worksheets?.[sheetConf.spreadsheetId][0].properties.title

    if (!newConf?.default?.worksheets?.headers?.[newConf.worksheetName]) {
      refreshWorksheetHeaders(formID, newConf, setSheetConf, setIsLoading, setSnackbar)
    }
  }

  return newConf
}

const worksheetChange = (sheetConf, formID, setSheetConf, setIsLoading, setSnackbar) => {
  const newConf = { ...sheetConf }
  newConf.headerRow = 'A1'
  newConf.field_map = [{ formField: '', googleSheetField: '' }]

  if (!newConf?.default?.worksheets?.headers?.[sheetConf.worksheetName]) {
    refreshWorksheetHeaders(formID, newConf, setSheetConf, setIsLoading, setSnackbar)
  }

  return newConf
}

export const refreshSpreadsheets = (formID, sheetConf, setSheetConf, setIsLoading, setSnackbar) => {
  const refreshModulesRequestParams = {
    formID,
    id: sheetConf.id,
    ownerEmail: sheetConf.ownerEmail,
    ...buildAuthRequestParams(sheetConf)
  }

  setIsLoading(true)
  bitsFetch(refreshModulesRequestParams, 'gsheet_refresh_spreadsheets')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...sheetConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data.spreadsheets) {
          newConf.default.spreadsheets = result.data.spreadsheets
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSnackbar({ show: true, msg: __('Spreadsheet refreshed', 'bit-integrations') })
        setSheetConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('Spreadsheet refresh failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Spreadsheet refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshWorksheets = (formID, sheetConf, setSheetConf, setIsLoading, setSnackbar) => {
  const { spreadsheetId } = sheetConf
  if (!spreadsheetId) {
    return
  }
  setIsLoading(true)
  const refreshSpreadsheetsRequestParams = {
    formID,
    spreadsheetId,
    ...buildAuthRequestParams(sheetConf)
  }
  bitsFetch(refreshSpreadsheetsRequestParams, 'gsheet_refresh_worksheets')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...sheetConf }
        if (result.data.worksheets) {
          if (!newConf.default.worksheets) {
            newConf.default.worksheets = {}
          }
          newConf.default.worksheets[spreadsheetId] = result.data.worksheets
        }

        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSnackbar({ show: true, msg: __('Worksheets refreshed', 'bit-integrations') })
        setSheetConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Worksheets refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshWorksheetHeaders = (formID, sheetConf, setSheetConf, setIsLoading, setSnackbar) => {
  const { spreadsheetId, worksheetName, header, headerRow } = sheetConf
  if (!spreadsheetId && !worksheetName && !header && !headerRow) {
    return
  }

  setIsLoading(true)
  const refreshWorksheetHeadersRequestParams = {
    formID,
    spreadsheetId,
    worksheetName,
    header,
    headerRow,
    ...buildAuthRequestParams(sheetConf)
  }

  bitsFetch(refreshWorksheetHeadersRequestParams, 'gsheet_refresh_worksheet_headers')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...sheetConf }
        if (result.data.worksheet_headers?.length > 0) {
          if (!newConf.default.headers) {
            newConf.default.headers = {}
          }
          if (!newConf.default.headers[spreadsheetId]) {
            newConf.default.headers[spreadsheetId] = {}
          }
          if (!newConf.default.headers[spreadsheetId][worksheetName]) {
            newConf.default.headers[spreadsheetId][worksheetName] = {}
          }
          newConf.default.headers[spreadsheetId][worksheetName][headerRow] =
            result.data.worksheet_headers
          if (result.data.tokenDetails) {
            newConf.tokenDetails = result.data.tokenDetails
          }
          setSnackbar({ show: true, msg: __('Worksheet Headers refreshed', 'bit-integrations') })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No Worksheet headers found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }

        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSheetConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Worksheet Headers refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = sheetconf => {
  const mappedFleld = sheetconf.field_map
    ? sheetconf.field_map.filter(mapped => !mapped.formField && !mapped.googleSheetField)
    : []
  if (mappedFleld.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        clientId: conf.clientId,
        clientSecret: conf.clientSecret,
        tokenDetails: conf.tokenDetails
      }
