/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        clientId: conf.clientId,
        clientSecret: conf.clientSecret,
        tokenDetails: conf.tokenDetails
      }

export const handleInput = (e, zohoSheetConf, setZohoSheetConf) => {
  const newConf = { ...zohoSheetConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setZohoSheetConf({ ...newConf })
}

export const checkMappedFields = zohoSheetConf => {
  const mappedFields = zohoSheetConf?.field_map
    ? zohoSheetConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.zohoSheetFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const getAllWorkbooks = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, workbooks: true })
  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    dataCenter: confTmp.dataCenter
  }

  bitsFetch(requestParams, 'zohoSheet_fetch_all_work_books').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.workbooks = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, workbooks: false })
      toast.success(__('Workbooks fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, workbooks: false })
    toast.error(__('Workbooks fetching failed', 'bit-integrations'))
  })
}

export const getAllWorksheets = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, worksheets: true })
  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    dataCenter: confTmp.dataCenter,
    workbook: confTmp.selectedWorkbook
  }

  bitsFetch(requestParams, 'zohoSheet_fetch_all_work_sheets').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.worksheets = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, worksheets: false })
      toast.success(__('Worksheets fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, worksheets: false })
    toast.error(__('Worksheets fetching failed', 'bit-integrations'))
  })
}

export const getWorksheetHeader = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, header: true, workSheetHeaders: false })
  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    dataCenter: confTmp.dataCenter,
    workbook: confTmp.selectedWorkbook,
    worksheet: confTmp.selectedWorksheet,
    headerRow: confTmp.headerRow
  }

  bitsFetch(requestParams, 'zohoSheet_fetch_all_work_sheet_header').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.workSheetHeaders = result.data
      }
      setConf(newConf)
      setLoading({ ...loading, header: false, workSheetHeaders: true })
      toast.success(__('Worksheet headers fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, header: false, workSheetHeaders: false })
    toast.error(__(`${result.data}`, 'bit-integrations'))
  })
}
