import { __, sprintf } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import { deepCopy } from '../../../Utils/Helpers'
import { create } from 'mutative'

export const handleInput = (
  e,
  zoomConf,
  setZoomConf,
  formID,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  let newConf = { ...zoomConf }
  if (isNew) {
    const rmError = { ...error }
    rmError[e.target.name] = ''
    setError({ ...rmError })
  }
  newConf[e.target.name] = e.target.value

  if (e.target.name === 'id') {
    refreshFields(newConf, setZoomConf, setIsLoading, setSnackbar)
  }
  switch (e.target.name) {
    case 'spreadsheetId':
      newConf = spreadSheetChange(newConf, formID, setZoomConf, setIsLoading, setSnackbar)
      break
    case 'worksheetName':
      newConf = worksheetChange(newConf, formID, setZoomConf, setIsLoading, setSnackbar)
      break
    default:
      break
  }
  setZoomConf({ ...newConf })
}

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        clientId: conf.clientId,
        clientSecret: conf.clientSecret,
        tokenDetails: conf.tokenDetails,
        accessToken: conf?.tokenDetails?.access_token,
        refreshToken: conf?.tokenDetails?.refresh_token
      }

export const zoomAllMeeting = (formID, zoomConf, setZoomConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const fetchMeetingModulesRequestParams = {
    formID,
    ...buildAuthRequestParams(zoomConf)
  }
  bitsFetch(fetchMeetingModulesRequestParams, 'zoom_fetch_all_meetings')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...zoomConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data.allMeeting) {
          newConf.default.allMeeting = result.data.allMeeting
        }

        setSnackbar({
          show: true,
          msg: __('Meeting list refreshed', 'bit-integrations')
        })
        setZoomConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('All Meeting list refresh failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('All Meeting list failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshFields = (zoomConf, setZoomConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const fetchMeetingModulesRequestParams = {
    meetingId: zoomConf.id,
    ...buildAuthRequestParams(zoomConf)
  }
  bitsFetch(fetchMeetingModulesRequestParams, 'zoom_fetch_all_fields')
    .then(result => {
      setIsLoading(false)
      if (result && result.success) {
        setZoomConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.zoomFields = result.data
            draftConf.field_map = generateMappedField(draftConf.zoomFields)
          })
        )
        setSnackbar({
          show: true,
          msg: __('Zoom fields refreshed', 'bit-integrations')
        })
      }
      setSnackbar({
        show: true,
        msg: result?.data ? result?.data : __('Zoom fields refreshed failed!', 'bit-integrations')
      })
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = zoomConf => {
  const mappedFleld = zoomConf.field_map
    ? zoomConf.field_map.filter(mapped => !mapped.formField && !mapped.zoomConf)
    : []
  if (mappedFleld.length > 0) {
    return false
  }
  return true
}

export const generateMappedField = (zoomFields = []) => {
  const requiredFlds = zoomFields?.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', zoomField: field.key }))
    : [{ formField: '', zoomField: '' }]
}
