// eslint-disable-next-line import/no-extraneous-dependencies
import { sprintf, __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, sendinBlueConf, setSendinBlueConf) => {
  const newConf = { ...sendinBlueConf }
  newConf.name = e.target.value
  setSendinBlueConf({ ...newConf })
}

const buildAuthRequestParams = conf =>
  conf.connection_id ? { connection_id: conf.connection_id } : { api_key: conf.api_key }

export const refreshLists = (sendinBlueConf, setSendinBlueConf, setIsLoading, setSnackbar) => {
  if (typeof setIsLoading === 'function') setIsLoading(true)
  const refreshListsRequestParams = buildAuthRequestParams(sendinBlueConf)
  bitsFetch(refreshListsRequestParams, 'sblue_refresh_lists')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...sendinBlueConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data.sblueList) {
          newConf.default.sblueList = result.data.sblueList
        }
        setSnackbar?.({ show: true, msg: __('List refreshed', 'bit-integrations') })
        setSendinBlueConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar?.({
          show: true,
          msg: sprintf(
            __('List refresh failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar?.({ show: true, msg: __('List failed. please try again', 'bit-integrations') })
      }
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
    .catch(() => {
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
}

export const refreshTemplate = (sendinBlueConf, setSendinBlueConf, setSnackbar) => {
  // setIsLoading(true)
  const refreshListsRequestParams = buildAuthRequestParams(sendinBlueConf)
  bitsFetch(refreshListsRequestParams, 'sblue_refresh_template').then(result => {
    if (result && result.success) {
      const newConf = { ...sendinBlueConf }
      if (!newConf.default) {
        newConf.default = {}
      }
      if (result.data.sblueTemplates) {
        newConf.default.sblueTemplates = result.data.sblueTemplates
      }
      setSnackbar?.({ show: true, msg: __('Templates refreshed', 'bit-integrations') })
      setSendinBlueConf({ ...newConf })
    } else if (
      (result && result.data && result.data.data) ||
      (!result.success && typeof result.data === 'string')
    ) {
      setSnackbar?.({
        show: true,
        msg: sprintf(
          __('Templates refresh failed Cause: %s. please try again', 'bit-integrations'),
          result.data.data || result.data
        )
      })
    } else {
      setSnackbar?.({ show: true, msg: __('Templates failed. please try again', 'bit-integrations') })
    }
    // setIsLoading(false)
  })
  // .catch(() => setIsLoading(false))
}

export const refreshSendinBlueHeader = (
  sendinBlueConf,
  setSendinBlueConf,
  setIsLoading,
  setSnackbar
) => {
  const refreshListsRequestParams = buildAuthRequestParams(sendinBlueConf)
  bitsFetch(refreshListsRequestParams, 'sblue_headers')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...sendinBlueConf }
        if (result.data.sendinBlueField) {
          newConf.default.fields = result.data.sendinBlueField
          const { fields } = newConf.default
          newConf.field_map = Object.values(fields)
            .filter(f => f.required)
            .map(f => ({ formField: '', sendinBlueField: f.fieldId, required: true }))
          setSnackbar?.({ show: true, msg: __('Sendinblue fields refreshed', 'bit-integrations') })
        } else {
          setSnackbar?.({
            show: true,
            msg: __(
              'No Sendinblue fields found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }

        setSendinBlueConf({ ...newConf })
      } else {
        setSnackbar?.({
          show: true,
          msg: __('Sendinblue fields refresh failed. please try again', 'bit-integrations')
        })
      }
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
    .catch(() => {
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
}

export const checkMappedFields = sendinBlueConf => {
  const mappedFields = sendinBlueConf?.field_map
    ? sendinBlueConf.field_map.filter(
        mappedField => !mappedField.formField && mappedField.sendinBlueField && mappedField.required
      )
    : []
  if (sendinBlueConf.lists && sendinBlueConf.lists?.length === undefined) return false
  if (mappedFields.length > 0) return false
  return true
}
