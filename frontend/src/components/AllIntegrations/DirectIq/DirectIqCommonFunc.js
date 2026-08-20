// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, directIqConf, setDirectIqConf) => {
  const newConf = { ...directIqConf }
  newConf.name = e.target.value
  setDirectIqConf({ ...newConf })
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : {
        client_id: confTmp.client_id,
        client_secret: confTmp.client_secret
      }

// refreshMappedLists
export const refreshDirectIqList = (directIqConf, setDirectIqConf, setIsLoading, setSnackbar) => {
  const refreshListsRequestParams = buildAuthRequestParams(directIqConf)
  bitsFetch(refreshListsRequestParams, 'directIq_lists')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...directIqConf }
        if (result.data.directIqLists) {
          if (!newConf.default) {
            newConf.default = {}
          }
          newConf.default.directIqLists = result.data.directIqLists
          setSnackbar({
            show: true,
            msg: __('DirectIQ lists refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No DirectIQ lists found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }

        setDirectIqConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('DirectIQ lists refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

// refreshMappedFields
export const refreshDirectIqHeader = (directIqConf, setDirectIqConf, setIsLoading, setSnackbar) => {
  const refreshListsRequestParams = {
    ...buildAuthRequestParams(directIqConf),
    list_id: directIqConf.listId
  }

  bitsFetch(refreshListsRequestParams, 'directIq_headers')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...directIqConf }
        if (result.data.directIqField) {
          if (!newConf.default) {
            newConf.default = {}
          }
          newConf.default.fields = result.data.directIqField
          const { fields } = newConf.default
          newConf.field_map = Object.values(fields)
            .filter(f => f.required)
            .map(f => ({
              formField: '',
              directIqField: f.fieldId,
              required: true
            }))
          setSnackbar({
            show: true,
            msg: __('DirectIQ fields refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No DirectIQ fields found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }

        setDirectIqConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('DirectIQ fields refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = directIqConf => {
  const mappedFields = directIqConf?.field_map
    ? directIqConf.field_map.filter(
        mappedField => !mappedField.formField && mappedField.directIqField && mappedField.required
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
