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
  crmConf,
  setCrmConf,
  formID,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  let newConf = { ...crmConf }
  if (recordTab === 0) {
    if (isNew) {
      const rmError = { ...error }
      rmError[e.target.name] = ''
      setError({ ...rmError })
    }
    newConf[e.target.name] = e.target.value
  } else {
    if (!newConf.relatedlists) {
      newConf.relatedlists = []
    }
    newConf.relatedlists[recordTab - 1][e.target.name] = e.target.value
  }

  switch (e.target.name) {
    case 'module':
      newConf = moduleChange(recordTab, formID, newConf, setCrmConf, setIsLoading, setSnackbar)
      break
    case 'layout':
      newConf = layoutChange(recordTab, formID, newConf, setCrmConf, setIsLoading, setSnackbar)
      break
    default:
      break
  }
  setCrmConf({ ...newConf })
}

export const handleTabChange = (
  recordTab,
  settab,
  formID,
  crmConf,
  setCrmConf,
  setIsLoading,
  setSnackbar
) => {
  if (recordTab) {
    !crmConf.default?.relatedlists?.[crmConf.module] &&
      refreshRelatedList(formID, crmConf, setCrmConf, setIsLoading, setSnackbar)
  }
  settab(recordTab)
}

const moduleChange = (recordTab, formID, crmConf, setCrmConf, setIsLoading, setSnackbar) => {
  let newConf = { ...crmConf }
  const module = recordTab === 0 ? newConf.module : newConf.relatedlists[recordTab - 1].module
  if (!newConf.relatedlists[recordTab - 1]) newConf.relatedlists[recordTab - 1] = {}

  if (recordTab === 0) {
    newConf.layout = ''
    newConf.actions = {}
    newConf.field_map = [{ formField: '', zohoFormField: '' }]
    newConf.upload_field_map = [{ formField: '', zohoFormField: '' }]

    newConf.relatedlists = []
  } else {
    newConf.relatedlists[recordTab - 1].layout = ''
    newConf.relatedlists[recordTab - 1].actions = {}
    newConf.relatedlists[recordTab - 1].field_map = [{ formField: '', zohoFormField: '' }]
    newConf.relatedlists[recordTab - 1].upload_field_map = [{ formField: '', zohoFormField: '' }]
  }

  if (!newConf.default.layouts?.[module]) {
    refreshLayouts(recordTab, formID, newConf, setCrmConf, setIsLoading, setSnackbar)
  } else {
    const layouts = Object.keys(newConf.default.layouts?.[module])
    if (layouts.length === 1) {
      if (recordTab === 0) {
        ;[newConf.layout] = layouts
      } else {
        ;[newConf.relatedlists[recordTab - 1].layout] = layouts
      }
      newConf = layoutChange(recordTab, formID, newConf, setCrmConf, setIsLoading, setSnackbar)
    }
  }

  return newConf
}

const layoutChange = (recordTab, formID, crmConf, setCrmConf, setIsLoading, setSnackbar) => {
  const newConf = { ...crmConf }

  const module = recordTab === 0 ? newConf.module : newConf.relatedlists[recordTab - 1].module
  const layout = recordTab === 0 ? newConf.layout : newConf.relatedlists[recordTab - 1].layout

  if (recordTab === 0) {
    newConf.actions = {}

    newConf.field_map = newConf?.default?.layouts?.[module]?.[layout]?.required
      ? generateMappedField(recordTab, newConf)
      : [{ formField: '', zohoFormField: '' }]

    newConf.upload_field_map =
      newConf?.default?.layouts?.[module]?.[layout]?.requiredFileUploadFields &&
      Object.keys(newConf.default.layouts[module][layout].requiredFileUploadFields).length > 0
        ? generateMappedField(recordTab, newConf, true)
        : [{ formField: '', zohoFormField: '' }]
  } else {
    newConf.relatedlists[recordTab - 1].actions = {}

    newConf.relatedlists[recordTab - 1].field_map = newConf?.default?.layouts?.[module]?.[layout]
      ?.required
      ? generateMappedField(recordTab, newConf)
      : [{ formField: '', zohoFormField: '' }]

    newConf.relatedlists[recordTab - 1].upload_field_map =
      newConf?.default?.layouts?.[module]?.[layout]?.requiredFileUploadFields &&
      Object.keys(newConf.default.layouts[module][layout].requiredFileUploadFields).length > 0
        ? generateMappedField(recordTab, newConf, true)
        : [{ formField: '', zohoFormField: '' }]
  }

  !newConf.default.tags?.[module] &&
    refreshTags(recordTab, formID, newConf, setCrmConf, setIsLoading, setSnackbar)

  return newConf
}

export const refreshModules = (formID, crmConf, setCrmConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const refreshModulesRequestParams = {
    formID,
    id: crmConf.id,
    ...buildAuthRequestParams(crmConf),
    dataCenter: crmConf.dataCenter,
  }
  bitsFetch(refreshModulesRequestParams, 'zcrm_refresh_modules')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...crmConf }
        if (!newConf.default) newConf.default = {}
        if (result.data.modules) {
          newConf.default.modules = result.data.modules
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setCrmConf({ ...newConf })
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

export const refreshLayouts = (recordTab, formID, crmConf, setCrmConf, setIsLoading, setSnackbar) => {
  const newConf = { ...crmConf }
  const module = recordTab === 0 ? newConf.module : newConf.relatedlists[recordTab - 1].module
  if (!module) {
    return
  }
  setIsLoading(true)
  const refreshLayoutsRequestParams = {
    formID,
    module,
    ...buildAuthRequestParams(newConf),
    dataCenter: newConf.dataCenter,
  }
  bitsFetch(refreshLayoutsRequestParams, 'zcrm_refresh_layouts')
    .then(result => {
      if (result && result.success) {
        if (result.data.layouts) {
          if (!newConf.default.layouts) newConf.default.layouts = {}
          newConf.default.layouts[module] = result.data.layouts
          const layouts = [...Object.keys(result.data.layouts)]
          if (layouts.length === 1) {
            if (recordTab === 0) {
              ;[newConf.layout] = layouts
              newConf.field_map = generateMappedField(recordTab, newConf)
              if (Object.keys(result.data.layouts[layouts].fileUploadFields).length > 0) {
                newConf.upload_field_map = generateMappedField(recordTab, newConf, true)
              }
            } else {
              ;[newConf.relatedlists[recordTab - 1].layout] = layouts
              newConf.relatedlists[recordTab - 1].field_map = generateMappedField(recordTab, newConf)

              if (Object.keys(result.data.layouts[layouts].fileUploadFields).length > 0) {
                newConf.relatedlists[recordTab - 1].upload_field_map = generateMappedField(
                  recordTab,
                  newConf,
                  true
                )
              }
            }

            if (!newConf.default.tags?.[module])
              refreshTags(recordTab, formID, newConf, setCrmConf, setIsLoading, setSnackbar)
          }
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setCrmConf({ ...newConf })
        setSnackbar({ show: true, msg: __('Layouts refreshed', 'bit-integrations') })
      } else if (result?.data?.data || (!result.success && typeof result.data === 'string')) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('Layouts refresh failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Layouts refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshRelatedList = (formID, crmConf, setCrmConf, setIsLoading, setSnackbar) => {
  if (!crmConf.module) {
    return
  }
  setIsLoading(true)
  const relatedListRequestParams = {
    formID,
    module: crmConf.module,
    ...buildAuthRequestParams(crmConf),
    dataCenter: crmConf.dataCenter,
  }
  bitsFetch(relatedListRequestParams, 'zcrm_get_related_lists')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...crmConf }
        if (result.data.relatedLists) {
          if (!newConf.default.relatedlists) {
            newConf.default.relatedlists = {}
          }
          newConf.default.relatedlists[newConf.module] = { ...result.data.relatedLists }
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setCrmConf({ ...newConf })
        setSnackbar({ show: true, msg: __('RelatedLists refreshed', 'bit-integrations') })
      } else if (result?.data?.data || (!result.success && typeof result.data === 'string')) {
        setSnackbar({
          show: true,
          msg: `${__('RelatedLists refresh failed Cause:')}${result.data.data || result.data}. ${__(
            'please try again',
            'bit-integrations'
          )}`
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

export const refreshTags = (recordTab, formID, crmConf, setCrmConf, setIsLoading, setSnackbar) => {
  const module = recordTab === 0 ? crmConf.module : crmConf.relatedlists[recordTab - 1].module
  if (!module) return
  setIsLoading(true)
  const refreshTagsParams = {
    formID,
    module,
    ...buildAuthRequestParams(crmConf),
    dataCenter: crmConf.dataCenter,
  }
  bitsFetch(refreshTagsParams, 'zcrm_get_tags')
    .then(result => {
      if (result?.success) {
        const newConf = { ...crmConf }
        if (result.data.tags) {
          if (!newConf.default.tags) {
            newConf.default.tags = {}
          }
          newConf.default.tags[module] = { ...result.data.tags }
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setCrmConf({ ...newConf })
        setSnackbar({ show: true, msg: __('Tags refreshed', 'bit-integrations') })
      } else if (result?.data?.data || (!result.success && typeof result.data === 'string')) {
        setSnackbar({
          show: true,
          msg: `${__('Tags refresh failed Cause:', 'bit-integrations')}${
            result.data.data || result.data
          }. ${__('please try again', 'bit-integrations')}`
        })
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

export const refreshOwners = (formID, crmConf, setCrmConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const getOwnersParams = {
    formID,
    ...buildAuthRequestParams(crmConf),
    dataCenter: crmConf.dataCenter,
  }
  bitsFetch(getOwnersParams, 'zcrm_get_users')
    .then(result => {
      if (result?.success) {
        const newConf = { ...crmConf }
        newConf.default.crmOwner = result.data.users
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setCrmConf({ ...newConf })
        setSnackbar({ show: true, msg: __('Owners refreshed', 'bit-integrations') })
      } else {
        setSnackbar({
          show: true,
          msg: __('Owners refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshAssigmentRules = (recordTab, crmConf, setCrmConf, setIsLoading, setSnackbar) => {
  const module = recordTab === 0 ? crmConf.module : crmConf.relatedlists[recordTab - 1].module
  if (!module) return
  setIsLoading(true)
  const getAssigmentRulesParams = {
    module,
    ...buildAuthRequestParams(crmConf),
    dataCenter: crmConf.dataCenter,
  }
  bitsFetch(getAssigmentRulesParams, 'zcrm_get_assignment_rules')
    .then(result => {
      if (result?.success) {
        const newConf = { ...crmConf }
        if (!newConf.default.assignmentRules) {
          newConf.default.assignmentRules = {}
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        newConf.default.assignmentRules[module] = { ...result.data.assignmentRules }
        setCrmConf({ ...newConf })
        setSnackbar({ show: true, msg: __('Assignment Rules refreshed', 'bit-integrations') })
      } else {
        setSnackbar({
          show: true,
          msg: __('Assignment Rules refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

const generateMappedField = (recordTab, crmConf, uploadFields) => {
  const module = recordTab === 0 ? crmConf.module : crmConf.relatedlists[recordTab - 1].module
  const layout = recordTab === 0 ? crmConf.layout : crmConf.relatedlists[recordTab - 1].layout

  if (uploadFields) {
    return crmConf.default.layouts[module][layout].requiredFileUploadFields.length > 0
      ? crmConf.default.layouts[module][layout].requiredFileUploadFields.map(field => ({
          formField: '',
          zohoFormField: field
        }))
      : [{ formField: '', zohoFormField: '' }]
  }
  return crmConf.default.layouts[module][layout].required.length > 0
    ? crmConf.default.layouts[module][layout].required.map(field => ({
        formField: '',
        zohoFormField: field
      }))
    : [{ formField: '', zohoFormField: '' }]
}

export const checkMappedFields = crmConf => {
  const mappedFields = crmConf?.field_map
    ? crmConf.field_map.filter(
        mappedField =>
          !mappedField.formField &&
          mappedField.zohoFormField &&
          crmConf?.default?.layouts?.[crmConf.module]?.[crmConf.layout]?.required.indexOf(
            mappedField.zohoFormField
          ) !== -1
      )
    : []
  const mappedUploadFields = crmConf?.upload_field_map
    ? crmConf.upload_field_map.filter(
        mappedField =>
          !mappedField.formField &&
          mappedField.zohoFormField &&
          crmConf.default.layouts[crmConf.module][crmConf.layout].requiredFileUploadFields.indexOf(
            mappedField.zohoFormField
          ) !== -1
      )
    : []
  const mappedRelatedFields = crmConf.relatedlists.map(relatedlist =>
    relatedlist.field_map.filter(mappedField => !mappedField.formField && mappedField.zohoFormField)
  )
  const mappedRelatedUploadFields = crmConf.relatedlists.map(relatedlist =>
    relatedlist.upload_field_map.filter(
      mappedField => !mappedField.formField && mappedField.zohoFormField
    )
  )

  if (
    mappedFields.length > 0 ||
    mappedUploadFields.length > 0 ||
    mappedRelatedFields.some(relatedField => relatedField.length) ||
    mappedRelatedUploadFields.some(relatedField => relatedField.length)
  ) {
    return false
  }

  return true
}
