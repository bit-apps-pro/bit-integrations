// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, zagoMailConf, setZagoMailConf) => {
  const newConf = { ...zagoMailConf }
  newConf.name = e.target.value
  setZagoMailConf({ ...newConf })
}

const buildAuthRequestParams = conf =>
  conf.connection_id ? { connection_id: conf.connection_id } : { api_public_key: conf.api_public_key }

export const refreshZagoMailList = (zagoMailConf, setZagoMailConf, setIsLoading, setSnackbar) => {
  if (typeof setIsLoading === 'function') setIsLoading(true)
  const refreshListsRequestParams = buildAuthRequestParams(zagoMailConf)
  bitsFetch(refreshListsRequestParams, 'zagoMail_lists')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...zagoMailConf }
        if (result.data.zagoMailLists) {
          if (!newConf.default) {
            newConf.default = {}
          }
          newConf.default.zagoMailLists = result.data.zagoMailLists
          setSnackbar?.({
            show: true,
            msg: __('ZagoMail lists refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar?.({
            show: true,
            msg: __(
              'No ZagoMail lists found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }

        setZagoMailConf({ ...newConf })
      } else {
        setSnackbar?.({
          show: true,
          msg: __('ZagoMail lists refresh failed. please try again', 'bit-integrations')
        })
      }
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
    .catch(() => {
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
}
// refreshZagoMailTags
export const refreshZagoMailTags = (zagoMailConf, setZagoMailConf, setIsLoading, setSnackbar) => {
  if (typeof setIsLoading === 'function') setIsLoading({ tags: true })
  const refreshListsRequestParams = buildAuthRequestParams(zagoMailConf)
  bitsFetch(refreshListsRequestParams, 'zagoMail_tags')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...zagoMailConf }
        if (result.data.zagoMailTags) {
          if (!newConf.tags) {
            newConf.tags = {}
          }
          newConf.tags = result.data.zagoMailTags
          setZagoMailConf({ ...newConf })
          setSnackbar?.({
            show: true,
            msg: __('ZagoMail tags refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar?.({
            show: true,
            msg: __(
              'No ZagoMail tags found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }

        // console.log('newConf', newConf)
      } else {
        setSnackbar?.({
          show: true,
          msg: __('ZagoMail tags refresh failed. please try again', 'bit-integrations')
        })
      }
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
    .catch(() => {
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
}
// refreshMappedFields
export const refreshZagoMailFields = (zagoMailConf, setZagoMailConf, setIsLoading, setSnackbar) => {
  if (typeof setIsLoading === 'function') setIsLoading(true)
  const refreshListsRequestParams = {
    ...buildAuthRequestParams(zagoMailConf),
    listId: zagoMailConf.listId
  }
  // console.log('zagoMailConf', zagoMailConf)
  bitsFetch(refreshListsRequestParams, 'zagoMail_refresh_fields')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...zagoMailConf }
        if (result.data.zagoMailField) {
          if (!newConf.default) {
            newConf.default = {}
          }
          newConf.default.fields = result.data.zagoMailField
          const { fields } = newConf.default
          newConf.field_map = Object.values(fields)
            .filter(f => f.required)
            .map(f => ({
              formField: '',
              zagoMailField: f.fieldId,
              required: true
            }))
          setSnackbar?.({
            show: true,
            msg: __('ZagoMail fields refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar?.({
            show: true,
            msg: __(
              'No ZagoMail fields found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }

        setZagoMailConf({ ...newConf })
      } else {
        setSnackbar?.({
          show: true,
          msg: __('ZagoMail fields refresh failed. please try again', 'bit-integrations')
        })
      }
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
    .catch(() => {
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
}

export const checkMappedFields = zagoMailConf => {
  const mappedFields = zagoMailConf?.field_map
    ? zagoMailConf.field_map.filter(
        mappedField => !mappedField.formField && mappedField.zagoMailField && mappedField.required
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
