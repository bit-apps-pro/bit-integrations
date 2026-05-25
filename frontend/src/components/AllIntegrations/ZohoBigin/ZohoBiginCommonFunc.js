import { __, sprintf } from '../../../Utils/i18nwrap'
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
  recordTab,
  biginConf,
  setBiginConf,
  formID,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  let newConf = { ...biginConf }

  if (recordTab === 0) {
    if (isNew) {
      const rmError = { ...error }
      rmError[e.target.name] = ''
      setError({ ...rmError })
    }
    newConf[e.target.name] = e.target.value
  } else {
    newConf.relatedlists[recordTab - 1][e.target.name] = e.target.value
  }

  switch (e.target.name) {
    case 'module':
      newConf = moduleChange(recordTab, newConf, formID, setBiginConf, setIsLoading, setSnackbar)
      break
    default:
      break
  }
  setBiginConf({ ...newConf })
}

export const handleTabChange = (
  recordTab,
  settab,
  biginConf,
  setBiginConf,
  formID,
  setIsLoading,
  setSnackbar
) => {
  if (recordTab) {
    !biginConf?.default?.relatedlists?.[biginConf.module] &&
      refreshRelatedList(formID, biginConf, setBiginConf, setIsLoading, setSnackbar)
  }

  settab(recordTab)
}

const moduleChange = (recordTab, biginConf, formID, setBiginConf, setIsLoading, setSnackbar) => {
  const newConf = { ...biginConf }
  const module = recordTab === 0 ? newConf.module : newConf.relatedlists[recordTab - 1].module

  if (recordTab === 0) {
    newConf.actions = {}
    newConf.field_map = [{ formField: '', zohoFormField: '' }]
    newConf.upload_field_map = [{ formField: '', zohoFormField: '' }]

    if (recordTab) newConf.relatedlists[recordTab - 1] = {}
  } else {
    newConf.relatedlists[recordTab - 1].field_map = [{ formField: '', zohoFormField: '' }]
    newConf.relatedlists[recordTab - 1].upload_field_map = [{ formField: '', zohoFormField: '' }]
    newConf.relatedlists[recordTab - 1].actions = {}
  }

  if (!newConf.default?.moduleData?.[module]) {
    getFields(recordTab, formID, newConf, setBiginConf, setIsLoading, setSnackbar)
  } else if (recordTab === 0) {
    newConf.field_map = generateMappedField(recordTab, newConf)
    if (Object.keys(newConf.default.moduleData[module].fileUploadFields).length > 0) {
      newConf.upload_field_map = generateMappedField(recordTab, newConf, true)
    }
  } else {
    newConf.relatedlists[recordTab - 1].field_map = generateMappedField(recordTab, newConf)
    if (Object.keys(newConf.default.moduleData[module].fileUploadFields).length > 0) {
      newConf.relatedlists[recordTab - 1].upload_field_map = generateMappedField(
        recordTab,
        newConf,
        true
      )
    }
  }

  return newConf
}

export const refreshModules = (formID, biginConf, setBiginConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const refreshModulesRequestParams = {
    formID,
    id: biginConf.id,
    ...buildAuthRequestParams(biginConf),
    dataCenter: biginConf.dataCenter,
  }
  bitsFetch(refreshModulesRequestParams, 'zbigin_refresh_modules')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...biginConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data.modules) {
          newConf.default.modules = result.data.modules
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setBiginConf({ ...newConf })
        setSnackbar({ show: true, msg: __('Modules refreshed', 'bit-integrations') })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('Modules refresh failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Modules refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshPipelinesLayout = (formID, biginConf, setBiginConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const refreshLayoutRequestParams = {
    formID,
    id: biginConf.id,
    ...buildAuthRequestParams(biginConf),
    dataCenter: biginConf.dataCenter,
  }
  bitsFetch(refreshLayoutRequestParams, 'zbigin_refresh_playouts')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...biginConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data.pLayouts) {
          newConf.default.pLayouts = result.data.pLayouts
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setBiginConf({ ...newConf })
        setSnackbar({ show: true, msg: __('Pipeline Layouts refreshed', 'bit-integrations') })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('Pipeline Layouts refresh failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Pipeline Layouts refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshRelatedList = (formID, biginConf, setBiginConf, setIsLoading, setSnackbar) => {
  if (!biginConf.module) {
    return
  }
  setIsLoading(true)
  const relatedListRequestParams = {
    formID,
    module: biginConf.module,
    ...buildAuthRequestParams(biginConf),
    dataCenter: biginConf.dataCenter,
  }
  bitsFetch(relatedListRequestParams, 'zbigin_refresh_related_lists')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...biginConf }
        if (result.data.related_modules) {
          if (!newConf.default.relatedlists) {
            newConf.default.relatedlists = {}
          }
          newConf.default.relatedlists[newConf.module] = result.data.related_modules
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setBiginConf({ ...newConf })
        setSnackbar({ show: true, msg: __('RelatedLists refreshed', 'bit-integrations') })
      } else if (result?.data?.data || (!result.success && typeof result.data === 'string')) {
        setSnackbar({
          show: true,
          msg: `${__('RelatedLists refresh failed Cause:', 'bit-integrations')}${
            result.data.data || result.data
          }. ${__('please try again', 'bit-integrations')}`
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('RelatedLists refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const getFields = (recordTab, formID, biginConf, setBiginConf, setIsLoading, setSnackbar) => {
  const module = recordTab === 0 ? biginConf.module : biginConf.relatedlists[recordTab - 1].module
  if (!module) {
    return
  }

  setIsLoading(true)
  const getFieldsRequestParams = {
    formID,
    module,
    ...buildAuthRequestParams(biginConf),
    dataCenter: biginConf.dataCenter,
  }
  bitsFetch(getFieldsRequestParams, 'zbigin_refresh_fields')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...biginConf }
        if (result.data.fieldDetails) {
          if (!newConf.default.moduleData) {
            newConf.default.moduleData = {}
          }
          newConf.default.moduleData[module] = result.data.fieldDetails
          if (recordTab === 0) {
            newConf.field_map = generateMappedField(recordTab, newConf)
            if (Object.keys(newConf.default.moduleData[module].fileUploadFields).length > 0) {
              newConf.upload_field_map = generateMappedField(recordTab, newConf, true)
            }
          } else {
            newConf.relatedlists[recordTab - 1].field_map = generateMappedField(recordTab, newConf)
            if (Object.keys(newConf.default.moduleData[module].fileUploadFields).length > 0) {
              newConf.relatedlists[recordTab - 1].upload_field_map = generateMappedField(
                recordTab,
                newConf,
                true
              )
            }
          }
        }

        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setBiginConf({ ...newConf })
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

export const refreshTags = (recordTab, formID, biginConf, setBiginConf, setIsLoading, setSnackbar) => {
  const module = recordTab === 0 ? biginConf.module : biginConf.relatedlists[recordTab - 1].module
  if (!module) {
    return
  }

  setIsLoading(true)
  const getTagsRequestParams = {
    formID,
    module,
    ...buildAuthRequestParams(biginConf),
    dataCenter: biginConf.dataCenter,
  }
  bitsFetch(getTagsRequestParams, 'zbigin_refresh_tags')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...biginConf }
        if (result.data.tags) {
          if (!newConf.default.moduleData) {
            newConf.default.moduleData = {}
          }
          newConf.default.moduleData[module].tags = result.data.tags
          setSnackbar({ show: true, msg: __('Tags refreshed', 'bit-integrations') })
        }

        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setBiginConf({ ...newConf })
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

export const refreshUsers = (formID, biginConf, setBiginConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const getUsersRequestParams = {
    formID,
    ...buildAuthRequestParams(biginConf),
    dataCenter: biginConf.dataCenter,
  }
  bitsFetch(getUsersRequestParams, 'zbigin_refresh_users')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...biginConf }
        if (result.data.users) {
          if (!newConf.default) {
            newConf.default = {}
          }
          newConf.default.users = result.data.users
          setSnackbar({ show: true, msg: __('Users refreshed', 'bit-integrations') })
        }

        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setBiginConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Users refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

const generateMappedField = (recordTab, biginConf, uploadFields) => {
  const module = recordTab === 0 ? biginConf.module : biginConf.relatedlists[recordTab - 1].module
  if (uploadFields) {
    return biginConf.default.moduleData[module].requiredFileUploadFields.length > 0
      ? biginConf.default.moduleData[module].requiredFileUploadFields?.map(field => ({
          formField: '',
          zohoFormField: field
        }))
      : [{ formField: '', zohoFormField: '' }]
  }
  return biginConf.default.moduleData[module].required.length > 0
    ? biginConf.default.moduleData[module].required?.map(field => ({
        formField: '',
        zohoFormField: field
      }))
    : [{ formField: '', zohoFormField: '' }]
}

export const checkMappedFields = biginConf => {
  const mappedFields = biginConf?.field_map
    ? biginConf.field_map.filter(
        mappedField =>
          !mappedField.formField &&
          mappedField.zohoFormField &&
          biginConf?.default?.moduleData?.[biginConf.module]?.required.indexOf(
            mappedField.zohoFormField
          ) !== -1
      )
    : []
  const mappedRelatedFields = biginConf.relatedlists.map(relatedlist =>
    relatedlist.field_map.filter(mappedField => !mappedField.formField && mappedField.zohoFormField)
  )

  if (mappedFields.length > 0 || mappedRelatedFields.find(relatedField => relatedField.length)) {
    return false
  }

  return true
}
