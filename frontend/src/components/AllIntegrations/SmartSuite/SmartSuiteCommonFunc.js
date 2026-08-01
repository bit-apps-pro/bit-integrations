/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'

export const handleInput = (e, smartSuiteConf, setSmartSuiteConf) => {
  setSmartSuiteConf(smartSuiteConf =>
    create(smartSuiteConf, draftConf => {
      const { name, value } = e.target
      if (value !== '') {
        draftConf[name] = value
      } else {
        delete draftConf[name]
      }
    })
  )
}

export const generateMappedField = smartSuiteFields => {
  const requiredFlds = smartSuiteFields?.filter(fld => fld.required === true)

  return requiredFlds?.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        smartSuiteFormField: field.key
      }))
    : [{ formField: '', smartSuiteFormField: '' }]
}

export const checkMappedFields = smartSuiteConf => {
  const mappedFields = smartSuiteConf?.field_map
    ? smartSuiteConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.smartSuiteFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.smartSuiteFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : { workspaceId: confTmp.workspaceId, apiToken: confTmp.apiToken }

export const getAllSolutions = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, solution: true })

  if (confTmp?.selectedSolution) delete confTmp?.selectedSolution

  bitsFetch(buildAuthRequestParams(confTmp), 'smartSuite_fetch_all_solutions').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf => {
          prevConf.solutions = result.data
          return prevConf
        })

        setLoading({ ...setLoading, solution: false })
        toast.success(__('Solution fetched successfully', 'bit-integrations'))
        return
      }
      setLoading({ ...setLoading, solution: false })
      toast.error(__('Solution Not Found!', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, solution: false })
    toast.error(__('Solution fetching failed', 'bit-integrations'))
  })
}

export const getAllTables = (confTmp, setConf, solution_id, setLoading) => {
  if (confTmp?.selectedTable) delete confTmp?.selectedTable

  setLoading({ ...setLoading, table: true })
  bitsFetch(
    { ...buildAuthRequestParams(confTmp), solution_id: solution_id },
    'smartSuite_fetch_all_tables'
  ).then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf => {
          prevConf.tables = result.data
          return prevConf
        })

        setLoading({ ...setLoading, table: false })
        toast.success(__('Table fetched successfully', 'bit-integrations'))
        return
      }
      setLoading({ ...setLoading, table: false })
      toast.error(__('Table Not Found!', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, table: false })
    toast.error(__('Table fetching failed', 'bit-integrations'))
  })
}

export const getAllUser = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, assignedUser: true })

  bitsFetch(buildAuthRequestParams(confTmp), 'smartSuite_fetch_all_user').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf => {
          prevConf.assignedUser = result.data
          return prevConf
        })

        setLoading({ ...setLoading, solution: false })
        toast.success(__('User fetched successfully', 'bit-integrations'))
        return
      }
      setLoading({ ...setLoading, solution: false })
      toast.error(__('User Not Found!', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, solution: false })
    toast.error(__('User fetching failed', 'bit-integrations'))
  })
}
