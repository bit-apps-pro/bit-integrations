import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, sheetConf, setSheetConf) => {
  const newConf = { ...sheetConf }
  newConf[e.target.name] = e.target.value
  setSheetConf({ ...newConf })
}

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        clientId: conf.clientId,
        clientSecret: conf.clientSecret,
        baseUrl: conf.baseUrl,
        tokenDetails: conf.tokenDetails
      }

export const getAllFields = (mauticConf, setMauticConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = buildAuthRequestParams(mauticConf)
  bitsFetch(requestParams, 'mautic_get_fields')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...mauticConf }
        if (result.data) {
          if (!newConf.default) {
            newConf.default = {}
          }
          if (!newConf.default?.fields) {
            newConf.default.fields = {}
          }
          newConf.default.fields = result.data
          newConf.field_map = generateMappedField(result.data)
        }

        if (result.data?.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSnackbar({
          show: true,
          msg: __('Fields refreshed', 'bit-integrations')
        })
        setMauticConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Fields refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}
export const getAllTags = (mauticConf, setMauticConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = buildAuthRequestParams(mauticConf)
  bitsFetch(requestParams, 'mautic_get_tags')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...mauticConf }
        if (result.data) {
          if (!newConf.default) {
            newConf.default = {}
          }
          if (!newConf.default?.tags) {
            newConf.default.tags = {}
          }
          newConf.default.tags = result.data
        }

        if (result.data?.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSnackbar({
          show: true,
          msg: __('Tags refreshed', 'bit-integrations')
        })
        setMauticConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Tags refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const getAllUsers = (mauticConf, setMauticConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = buildAuthRequestParams(mauticConf)
  bitsFetch(requestParams, 'mautic_get_users')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...mauticConf }
        if (result.data) {
          if (!newConf.default) {
            newConf.default = {}
          }
          if (!newConf.default?.users) {
            newConf.default.users = {}
          }
          newConf.default.users = result.data.allUsers
        }

        if (result.data?.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSnackbar({
          show: true,
          msg: __('Contact Owner refreshed', 'bit-integrations')
        })
        setMauticConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Contact Owner refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = mauticConf => {
  const mappedFleld = mauticConf.field_map
    ? mauticConf.field_map.filter(mapped => !mapped.formField && !mapped.mauticField)
    : []
  if (mappedFleld.length > 0) {
    return false
  }
  return true
}

const generateMappedField = mauticFields => {
  const requiredFlds = mauticFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        mauticField: field.fieldAlias
      }))
    : [{ formField: '', mauticField: '' }]
}
