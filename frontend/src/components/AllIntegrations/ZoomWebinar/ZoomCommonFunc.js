import { __, sprintf } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import { deepCopy } from '../../../Utils/Helpers'

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

export const handleInput = (
  e,
  zoomWebinarConf,
  setZoomWebinarConf,
  formID,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  let newConf = { ...zoomWebinarConf }
  if (isNew) {
    const rmError = { ...error }
    rmError[e.target.name] = ''
    setError({ ...rmError })
  }
  newConf[e.target.name] = e.target.value
  setZoomWebinarConf({ ...newConf })
}
export const zoomAllWebinar = (
  formID,
  zoomWebinarConf,
  setZoomWebinarConf,
  setIsLoading,
  setSnackbar
) => {
  setIsLoading(true)
  const fetchWebinarModulesRequestParams = {
    formID,
    ...buildAuthRequestParams(zoomWebinarConf)
  }
  bitsFetch(fetchWebinarModulesRequestParams, 'zoom_webinar_fetch_all_webinar')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...zoomWebinarConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data.allWebinar) {
          newConf.default.allWebinar = result.data.allWebinar
        }
        // if (result.data.tokenDetails) {
        //   newConf.tokenDetails = result.data.tokenDetails
        // }
        setSnackbar({ show: true, msg: __('Webinar list refreshed', 'bit-integrations') })
        setZoomWebinarConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('All Webinar list refresh failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('All Webinar list failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = zoomWebinarConf => {
  const mappedFleld = zoomWebinarConf.field_map
    ? zoomWebinarConf.field_map.filter(mapped => !mapped.formField && !mapped.zoomWebinarConf)
    : []
  if (mappedFleld.length > 0) {
    return false
  }
  return true
}

export const generateMappedField = zoomWebinarConf => {
  const requiredFlds = zoomWebinarConf?.zoomWebinarFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', zoomField: field.key }))
    : [{ formField: '', zoomField: '' }]
}
