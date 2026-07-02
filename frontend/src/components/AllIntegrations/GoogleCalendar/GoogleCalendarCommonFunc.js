/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, googleCalendarConf, setGoogleCalendarConf) => {
  const newConf = { ...googleCalendarConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setGoogleCalendarConf({ ...newConf })
}

export const checkMappedFields = fieldsMapped => {
  const checkedField = fieldsMapped
    ? fieldsMapped.filter(item => !item.formField || !item.googleCalendarFormField)
    : []
  if (checkedField.length > 0) return false
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

export const getAllGoogleCalendarLists = (flowID, googleCalendarConf, setGoogleCalendarConf) => {
  const queryParams = {
    flowID: flowID ?? null,
    ...buildAuthRequestParams(googleCalendarConf)
  }
  const loadPostTypes = bitsFetch(queryParams, 'googleCalendar_get_all_lists').then(result => {
    if (result && result.success) {
      const newConf = { ...googleCalendarConf }
      if (result.data.googleCalendarLists) {
        newConf.calendarLists = result.data.googleCalendarLists
        newConf.tokenDetails = result.data.tokenDetails
      }

      setGoogleCalendarConf(newConf)
      return __('Google Calendar List refreshed successfully', 'bit-integrations')
    } else {
      return __('Google Calendar List refresh failed. please try again', 'bit-integrations')
    }
  })
  toast.promise(loadPostTypes, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading Google Calendar List...', 'bit-integrations')
  })
}
