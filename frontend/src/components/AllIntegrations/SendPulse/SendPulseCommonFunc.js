// eslint-disable-next-line import/no-extraneous-dependencies
import { create } from 'mutative'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, sendPulseConf, setSendPulseConf) => {
  const { value } = e.target
  setSendPulseConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf.name = value
    })
  )
}

export const handleCustomValue = (e, index, sendPulseConf, setSendPulseConf) => {
  const value = e?.target?.value ?? e
  setSendPulseConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf.field_map[index].customValue = value
    })
  )
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : {
        client_id: confTmp.client_id,
        client_secret: confTmp.client_secret,
        tokenDetails: confTmp.tokenDetails
      }

export const refreshSendPulseList = (sendPulseConf, setSendPulseConf, setIsLoading, setSnackbar) => {
  const refreshListsRequestParams = buildAuthRequestParams(sendPulseConf)

  setIsLoading(true)

  bitsFetch(refreshListsRequestParams, 'sendPulse_lists')
    .then(result => {
      if (result && result.success) {
        if (result.data) {
          const lists = result.data
          setSendPulseConf(prevConf =>
            create(prevConf, draftConf => {
              if (!draftConf.default) {
                draftConf.default = {}
              }
              draftConf.default.sendPulseLists = lists
            })
          )
          setSnackbar({
            show: true,
            msg: __('SendPulse lists refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No SendPulse lists found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }
      } else {
        setSnackbar({
          show: true,
          msg: __('SendPulse lists refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshSendPulseHeader = (sendPulseConf, setSendPulseConf, setIsLoading, setSnackbar) => {
  const refreshListsRequestParams = {
    ...buildAuthRequestParams(sendPulseConf),
    list_id: sendPulseConf.listId
  }

  setIsLoading(true)

  bitsFetch(refreshListsRequestParams, 'sendPulse_headers')
    .then(result => {
      if (result && result.success) {
        if (result.data?.sendPulseField) {
          const fields = result.data.sendPulseField
          setSendPulseConf(prevConf =>
            create(prevConf, draftConf => {
              if (!draftConf.default) {
                draftConf.default = {}
              }
              draftConf.default.fields = fields
              draftConf.field_map = Object.values(fields)
                .filter(f => f.required)
                .map(f => ({
                  formField: '',
                  sendPulseField: f.fieldValue,
                  required: true
                }))
            })
          )
          setSnackbar({
            show: true,
            msg: __('SendPulse fields refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No SendPulse fields found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }
      } else {
        setSnackbar({
          show: true,
          msg: __('SendPulse fields refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = sendPulseConf => {
  const mappedFields = sendPulseConf?.field_map
    ? sendPulseConf.field_map.filter(
        mappedField => !mappedField.formField && mappedField.sendPulseField && mappedField.required
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
