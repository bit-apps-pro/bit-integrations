import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import { create } from 'mutative'

const buildAuthRequestParams = conf =>
  conf.connection_id ? { connection_id: conf.connection_id } : { bot_api_key: conf.bot_api_key }

export const refreshGetUpdates = (telegramConf, setTelegramConf, setIsLoading, setSnackbar) => {
  const newConf = { ...telegramConf }
  const requestParams = buildAuthRequestParams(newConf)
  if (typeof setIsLoading === 'function') setIsLoading(true)
  bitsFetch(requestParams, 'refresh_get_updates')
    .then(result => {
      if (result && result.success) {
        if (!newConf.default) {
          newConf.default = {}
        }

        if (result.data.telegramChatLists) {
          newConf.default.telegramChatLists = result.data.telegramChatLists
        }
        setSnackbar?.({ show: true, msg: __('Chat list refreshed', 'bit-integrations') })
        setTelegramConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar?.({
          show: true,
          msg: `${__('Chat list refresh failed Cause:', 'bit-integrations')}${
            result.data.data || result.data
          }. ${__('please try again', 'bit-integrations')}`
        })
      } else {
        setSnackbar?.({
          show: true,
          msg: __('Chat list refresh failed. please try again', 'bit-integrations')
        })
      }
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
    .catch(() => {
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
}

export const handleInput = (e, telegramConf, setTelegramConf) => {
  setTelegramConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf.name = e.target.value
    })
  )
}
// export const checkMappedFields = telegramConf => {
//   const mappedFields = telegramConf?.field_map ? telegramConf.field_map.filter(mappedField => (!mappedField.formField && mappedField.mailPoetField && mappedField.required)) : []
//   if (mappedFields.length > 0) {
//     return false
//   }
//   return true
// }
