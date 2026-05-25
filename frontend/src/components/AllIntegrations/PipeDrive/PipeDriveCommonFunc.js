/* eslint-disable radix */
/* eslint-disable no-unused-expressions */
import toast from 'react-hot-toast'
import { __, sprintf } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

const buildAuthRequestParams = confTmp =>
  confTmp?.connection_id ? { connection_id: confTmp.connection_id } : { api_key: confTmp?.api_key }

export const handleInput = (
  e,
  recordTab,
  pipeDriveConf,
  setPipeDriveConf,
  formID,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  let newConf = { ...pipeDriveConf }
  if (recordTab === 0) {
    if (isNew) {
      const rmError = { ...error }
      rmError[e.target.name] = ''
      setError({ ...rmError })
    }
    if (e.target.value !== '') {
      if (e.target.name !== 'module') {
        newConf.moduleData[e.target.name] = parseInt(e.target.value)
      } else {
        newConf.moduleData = {}
        newConf.moduleData[e.target.name] = e.target.value
      }
    } else {
      delete newConf.moduleData[e.target.name]
    }
  } else {
    if (!newConf.relatedlists) {
      newConf.relatedlists = []
    }
    if (e.target.value !== '') {
      if (e.target.name !== 'module') {
        newConf.relatedlists[recordTab - 1][e.target.name] = parseInt(e.target.value)
      } else {
        newConf.relatedlists[recordTab - 1].moduleData = {}
        newConf.relatedlists[recordTab - 1][e.target.name] = e.target.value
      }
    } else {
      delete newConf.relatedlists[recordTab - 1][e.target.name]
    }
  }

  switch (e.target.name) {
    case 'module':
      newConf = moduleChange(recordTab, formID, newConf, setPipeDriveConf, setIsLoading, setSnackbar)
      break
    default:
      break
  }
  setPipeDriveConf({ ...newConf })
}

export const handleTabChange = (recordTab, settab) => {
  settab(recordTab)
}

const moduleChange = (recordTab, formID, pipeDriveConf, setPipeDriveConf, setIsLoading, setSnackbar) => {
  const newConf = { ...pipeDriveConf }
  if (!newConf.relatedlists[recordTab - 1]) newConf.relatedlists[recordTab - 1] = {}
  const module = recordTab === 0 ? newConf.moduleData.module : newConf.relatedlists[recordTab - 1].module

  if (recordTab === 0) {
    newConf.actions = {}
    newConf.field_map = [{ formField: '', pipeDriveFormField: '' }]
    newConf.relatedlists = []
    if (['Leads', 'Deals', 'Activities', 'Notes'].includes(module)) {
      !newConf.default.organizations &&
        refreshOrganizations(newConf, setPipeDriveConf, setIsLoading, setSnackbar)
      !newConf.default.persons && refreshPersons(newConf, setPipeDriveConf, setIsLoading, setSnackbar)
    }

    if (module !== '' && module !== undefined) {
      setTimeout(() => {
        refreshFields(module, newConf, setPipeDriveConf, recordTab)
      }, 1000)
    } else {
      newConf.field_map = newConf.default.modules?.[module]?.requiredFields
        ? generateMappedField(recordTab, newConf)
        : [{ formField: '', pipeDriveFormField: '' }]
    }
  } else {
    newConf.relatedlists[recordTab - 1].actions = {}
    newConf.relatedlists[recordTab - 1].field_map = [{ formField: '', pipeDriveFormField: '' }]
    if (module !== '' && module !== undefined) {
      setTimeout(() => {
        refreshFields(module, newConf, setPipeDriveConf, recordTab)
      }, 1000)
    } else {
      newConf.relatedlists[recordTab - 1].field_map = newConf.default.modules?.[module]?.requiredFields
        ? generateMappedField(recordTab, newConf)
        : [{ formField: '', pipeDriveFormField: '' }]
    }
  }

  return newConf
}

const refreshFields = (module, pipeDriveConf, setPipeDriveConf, recordTab) => {
  const requestParams = { ...buildAuthRequestParams(pipeDriveConf), module }

  bitsFetch(requestParams, 'PipeDrive_refresh_fields').then(result => {
    if (result && result.success) {
      const newConf = { ...pipeDriveConf }
      if (!newConf.default.modules[module].fields) newConf.default.modules[module].fields = {}
      if (result.data) {
        newConf.default.modules[module].fields = result.data
        if (recordTab === 0) {
          newConf.field_map = newConf.default.modules?.[module]?.requiredFields
            ? generateMappedField(recordTab, newConf)
            : [{ formField: '', pipeDriveFormField: '' }]
        } else {
          newConf.relatedlists[recordTab - 1].field_map = newConf.default.modules?.[module]
            ?.requiredFields
            ? generateMappedField(recordTab, newConf)
            : [{ formField: '', pipeDriveFormField: '' }]
        }
      }
      setPipeDriveConf({ ...newConf })
    }
  })
}

export const refreshOrganizations = (pipeDriveConf, setPipeDriveConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = {
    ...buildAuthRequestParams(pipeDriveConf),
    type: 'organizations'
  }

  bitsFetch(requestParams, 'PipeDrive_fetch_meta_data')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...pipeDriveConf }
        if (!newConf.default.organizations) newConf.default.organizations = {}
        if (result.data) {
          newConf.default.organizations = result.data
        }
        setPipeDriveConf({ ...newConf })
        setSnackbar({
          show: true,
          msg: __('Organizations refreshed', 'bit-integrations')
        })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('Organizations refresh failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Organizations refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshPersons = (pipeDriveConf, setPipeDriveConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = { ...buildAuthRequestParams(pipeDriveConf), type: 'persons' }

  bitsFetch(requestParams, 'PipeDrive_fetch_meta_data')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...pipeDriveConf }
        if (!newConf.default.persons) newConf.default.persons = {}
        if (result.data) {
          newConf.default.persons = result.data
        }
        setPipeDriveConf({ ...newConf })
        setSnackbar({
          show: true,
          msg: __('Persons refreshed', 'bit-integrations')
        })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('Persons refresh failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Persons refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const getAllOwners = (pipeDriveConf, setPipeDriveConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = { ...buildAuthRequestParams(pipeDriveConf), type: 'users' }

  bitsFetch(requestParams, 'PipeDrive_fetch_meta_data')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...pipeDriveConf }
        if (!newConf.default.owners) newConf.default.owners = {}
        if (result.data) {
          newConf.default.owners = result.data
        }
        setPipeDriveConf({ ...newConf })
        setSnackbar({
          show: true,
          msg: __('Owners fetched successfully', 'bit-integrations')
        })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('Owners fetch failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Owners fetch failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const getAllLeadLabels = (pipeDriveConf, setPipeDriveConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = { ...buildAuthRequestParams(pipeDriveConf), type: 'leadLabels' }

  bitsFetch(requestParams, 'PipeDrive_fetch_meta_data')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...pipeDriveConf }
        if (!newConf.default.leadLabels) newConf.default.leadLabels = {}
        if (result.data) {
          newConf.default.leadLabels = result.data
        }
        setPipeDriveConf({ ...newConf })
        setSnackbar({
          show: true,
          msg: __('Labels fetched successfully', 'bit-integrations')
        })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('Labels fetch failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Labels fetch failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}
export const getAllCurrencies = (pipeDriveConf, setPipeDriveConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = { ...buildAuthRequestParams(pipeDriveConf), type: 'currencies' }

  bitsFetch(requestParams, 'PipeDrive_fetch_meta_data')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...pipeDriveConf }
        if (!newConf.default.currencies) newConf.default.currencies = {}
        if (result.data) {
          newConf.default.currencies = result.data
        }
        setPipeDriveConf({ ...newConf })
        setSnackbar({
          show: true,
          msg: __('Currencies fetched successfully', 'bit-integrations')
        })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('Currencies fetch failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Currencies fetch failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const getDealStages = (pipeDriveConf, setPipeDriveConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = { ...buildAuthRequestParams(pipeDriveConf), type: 'stages' }

  bitsFetch(requestParams, 'PipeDrive_fetch_meta_data')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...pipeDriveConf }
        if (!newConf.default.stages) newConf.default.stages = {}
        if (result.data) {
          newConf.default.stages = result.data
        }
        setPipeDriveConf({ ...newConf })
        setSnackbar({
          show: true,
          msg: __('Stages fetched successfully', 'bit-integrations')
        })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('Stages fetch failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Stages fetch failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

const generateMappedField = (recordTab, pipeDriveConf) => {
  const module =
    recordTab === 0 ? pipeDriveConf.moduleData.module : pipeDriveConf.relatedlists[recordTab - 1].module

  const requiredFlds = pipeDriveConf?.default?.modules?.[module]?.fields?.filter(
    fld => fld.required === true
  )
  return requiredFlds?.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        pipeDriveFormField: field.key
      }))
    : [{ formField: '', pipeDriveFormField: '' }]
}

export const checkMappedFields = pipeDriveConf => {
  const mappedFields = pipeDriveConf?.field_map
    ? pipeDriveConf.field_map.filter(
        mappedField =>
          !mappedField.formField &&
          mappedField.pipeDriveFormField &&
          pipeDriveConf?.default?.modules?.[pipeDriveConf.moduleData.module]?.requiredFields?.indexOf(
            mappedField.pipeDriveFormField
          ) !== -1
      )
    : []
  const mappedRelatedFields = pipeDriveConf.relatedlists.map(relatedlist =>
    relatedlist.field_map.filter(mappedField => !mappedField.formField && mappedField.pipeDriveFormField)
  )
  if (mappedFields.length > 0 || mappedRelatedFields.some(relatedField => relatedField.length)) {
    return false
  }

  return true
}

export const checkRequired = pipeDriveConf => {
  if (
    pipeDriveConf.moduleData?.module !== '' &&
    pipeDriveConf.default.modules?.[pipeDriveConf?.moduleData?.module]?.required
  ) {
    if (
      ['Leads', 'Deals', 'Activities', 'Notes'].includes(pipeDriveConf.moduleData.module) &&
      pipeDriveConf.moduleData.organization_id === undefined &&
      pipeDriveConf.moduleData?.person_id === undefined
    ) {
      return false
    }

    // if (pipeDriveConf.moduleData.module === 'Persons' && pipeDriveConf.moduleData.organization_id === undefined) {
    //   return false
    // }
  }
  return true
}

export const handleAuthorize = (confTmp, setError, setisAuthorized, setIsLoading) => {
  if (!confTmp.connection_id && !confTmp.api_key) {
    setError({
      api_key: !confTmp.api_key ? __("API Key can't be empty", 'bit-integrations') : ''
    })
    return
  }
  setError({})
  setIsLoading(true)
  const requestParams = { ...buildAuthRequestParams(confTmp), type: 'persons' }

  bitsFetch(requestParams, 'PipeDrive_fetch_meta_data').then(result => {
    if (result && result.success) {
      setisAuthorized(true)
      setIsLoading(false)
      toast.success(__('Authorized Successfully', 'bit-integrations'))
      return
    }
    setIsLoading(false)
    toast.error(__('Authorized failed', 'bit-integrations'))
  })
}
