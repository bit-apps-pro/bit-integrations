// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '@wordpress/i18n'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, mailifyConf, setMailifyConf) => {
  const newConf = { ...mailifyConf }
  newConf.name = e.target.value
  setMailifyConf({ ...newConf })
}

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : { account_id: conf.account_id, api_key: conf.api_key }

// refreshMappedLists
export const refreshMailifyList = (mailifyConf, setMailifyConf, setIsLoading, setSnackbar) => {
  if (typeof setIsLoading === 'function') setIsLoading(true)
  const refreshListsRequestParams = buildAuthRequestParams(mailifyConf)
  bitsFetch(refreshListsRequestParams, 'mailify_lists')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...mailifyConf }
        if (result.data) {
          if (!newConf.default) {
            newConf.default = {}
          }
          newConf.default.mailifyLists = result.data
          setSnackbar({
            show: true,
            msg: __('Mailify lists refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No Mailify lists found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }

        setMailifyConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Mailify lists refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

// refreshMappedFields
export const refreshMailifyHeader = (mailifyConf, setMailifyConf, setIsLoading, setSnackbar) => {
  if (typeof setIsLoading === 'function') setIsLoading(true)
  const refreshListsRequestParams = {
    ...buildAuthRequestParams(mailifyConf),
    list_id: mailifyConf.listId
  }

  bitsFetch(refreshListsRequestParams, 'mailify_headers')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...mailifyConf }
        if (result.data.mailifyField) {
          if (!newConf.default) {
            newConf.default = {}
          }
          newConf.default.fields = result.data.mailifyField
          const { fields } = newConf.default
          newConf.field_map = Object.values(fields)
            .filter(f => f.required)
            .map(f => ({
              formField: '',
              mailifyField: f.fieldValue,
              required: true
            }))
          setSnackbar({
            show: true,
            msg: __('Mailify fields refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No Mailify fields found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }
        setMailifyConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Mailify fields refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = mailifyConf => {
  const mappedFields = mailifyConf?.field_map
    ? mailifyConf.field_map.filter(
        mappedField => !mappedField.formField && mappedField.mailifyField && mappedField.required
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
