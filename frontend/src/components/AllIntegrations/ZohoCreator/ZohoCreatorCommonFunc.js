import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        clientId: conf.clientId,
        clientSecret: conf.clientSecret,
        tokenDetails: conf.tokenDetails
      }


export const handleInput = (
  e,
  creatorConf,
  setCreatorConf,
  formID,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  let newConf = { ...creatorConf }
  if (isNew) {
    const rmError = { ...error }
    rmError[e.target.name] = ''
    setError({ ...rmError })
  }
  newConf[e.target.name] = e.target.value

  switch (e.target.name) {
    case 'applicationId':
      newConf = applicationChange(newConf, formID, setCreatorConf, setIsLoading, setSnackbar)
      break
    case 'formId':
      newConf = formChange(newConf, formID, setCreatorConf, setIsLoading, setSnackbar)
      break
    default:
      break
  }
  setCreatorConf({ ...newConf })
}

export const applicationChange = (creatorConf, formID, setCreatorConf, setIsLoading, setSnackbar) => {
  const newConf = { ...creatorConf }
  newConf.department = ''
  newConf.field_map = [{ formField: '', zohoFormField: '' }]
  newConf.actions = {}

  if (!newConf?.default?.forms?.[newConf.applicationId]) {
    refreshForms(formID, newConf, setCreatorConf, setIsLoading, setSnackbar)
  }
  return newConf
}

export const formChange = (creatorConf, formID, setCreatorConf, setIsLoading, setSnackbar) => {
  const newConf = { ...creatorConf }
  newConf.field_map = [{ formField: '', zohoFormField: '' }]
  newConf.upload_field_map = [{ formField: '', zohoFormField: '' }]
  newConf.actions = {}

  if (!newConf?.default?.fields?.[newConf.orgId]) {
    refreshFields(formID, newConf, setCreatorConf, setIsLoading, setSnackbar)
  } else {
    newConf.field_map = generateMappedField(newConf)
    if (
      Object.keys(newConf.default.fields[newConf.applicationId][newConf.formId].fileUploadFields)
        .length > 0
    ) {
      newConf.upload_field_map = generateMappedField(newConf, true)
    }
  }
  return newConf
}

export const refreshApplications = (formID, creatorConf, setCreatorConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const refreshApplicationsRequestParams = {
    formID,
    id: creatorConf.id,
    ...buildAuthRequestParams(creatorConf),
    dataCenter: creatorConf.dataCenter,
  }
  bitsFetch(refreshApplicationsRequestParams, 'zcreator_refresh_applications')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...creatorConf }
        if (result.data.applications) {
          newConf.default = { ...newConf.default, applications: result.data.applications }
        }
        setSnackbar({ show: true, msg: __('Applications refreshed', 'bit-integrations') })
        setCreatorConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: `${__('Applications refresh failed Cause:', 'bit-integrations')}${
            result.data.data || result.data
          }. ${__('please try again', 'bit-integrations')}`
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Applications refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshForms = (formID, creatorConf, setCreatorConf, setIsLoading, setSnackbar) => {
  const { accountOwner, applicationId } = creatorConf
  setIsLoading(true)
  const refreshFormsRequestParams = {
    formID,
    id: creatorConf.id,
    ...buildAuthRequestParams(creatorConf),
    dataCenter: creatorConf.dataCenter,
    accountOwner,
    applicationId
  }
  bitsFetch(refreshFormsRequestParams, 'zcreator_refresh_forms')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...creatorConf }
        if (!newConf.default.forms) {
          newConf.default.forms = {}
        }
        if (result.data.forms) {
          newConf.default.forms[applicationId] = result.data.forms
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSnackbar({ show: true, msg: __('Forms refreshed', 'bit-integrations') })
        setCreatorConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: `${__('Forms refresh failed Cause:', 'bit-integrations')}${
            result.data.data || result.data
          }. ${__('please try again', 'bit-integrations')}`
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Forms refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshFields = (formID, creatorConf, setCreatorConf, setIsLoading, setSnackbar) => {
  const { accountOwner, applicationId, formId } = creatorConf
  setIsLoading(true)
  const refreshFieldsRequestParams = {
    formID,
    ...buildAuthRequestParams(creatorConf),
    dataCenter: creatorConf.dataCenter,
    accountOwner,
    applicationId,
    formId
  }
  bitsFetch(refreshFieldsRequestParams, 'zcreator_refresh_fields')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...creatorConf }
        if (result.data.fields) {
          if (!newConf.default.fields) {
            newConf.default.fields = {}
          }
          if (!newConf.default.fields[applicationId]) {
            newConf.default.fields[applicationId] = {}
          }
          newConf.default.fields[applicationId][formId] = { ...result.data }
          newConf.field_map = generateMappedField(newConf)
          if (Object.keys(result.data.fileUploadFields).length > 0) {
            newConf.upload_field_map = generateMappedField(newConf, true)
          }
          if (result.data.tokenDetails) {
            newConf.tokenDetails = result.data.tokenDetails
          }
          setSnackbar({ show: true, msg: __('Fields refreshed', 'bit-integrations') })
        } else {
          setSnackbar({
            show: true,
            msg: `${__('Fields refresh failed Cause:', 'bit-integrations')}${
              result.data.data || result.data
            }. ${__('please try again', 'bit-integrations')}`
          })
        }

        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setCreatorConf({ ...newConf })
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

export const generateMappedField = (creatorConf, uploadFields) => {
  const { applicationId, formId } = creatorConf
  if (uploadFields) {
    return creatorConf.default.fields[applicationId][formId].requiredFileUploadFields.length > 0
      ? creatorConf.default.fields[applicationId][formId].requiredFileUploadFields.map(field => ({
          formField: '',
          zohoFormField: field
        }))
      : [{ formField: '', zohoFormField: '' }]
  }
  return creatorConf.default.fields[applicationId][formId].required.length > 0
    ? creatorConf.default.fields[applicationId][formId].required.map(field => ({
        formField: '',
        zohoFormField: field
      }))
    : [{ formField: '', zohoFormField: '' }]
}

export const checkMappedFields = creatorConf => {
  const mappedFields = creatorConf?.field_map
    ? creatorConf.field_map.filter(
        mappedField =>
          !mappedField.formField &&
          mappedField.zohoFormField &&
          creatorConf?.default?.fields?.[creatorConf.applicationId]?.[
            creatorConf.formId
          ]?.required.indexOf(mappedField.zohoFormField) !== -1
      )
    : []
  const mappedUploadFields = creatorConf?.upload_field_map
    ? creatorConf.upload_field_map.filter(
        mappedField =>
          !mappedField.formField &&
          mappedField.zohoFormField &&
          creatorConf?.default?.fields?.[creatorConf.applicationId]?.[
            creatorConf.formId
          ]?.requiredFileUploadFields.indexOf(mappedField.zohoFormField) !== -1
      )
    : []
  if (mappedFields.length > 0 || mappedUploadFields.length > 0) {
    return false
  }
  return true
}
