/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, asanaConf, setAsanaConf) => {
  const newConf = { ...asanaConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setAsanaConf({ ...newConf })
}

export const generateMappedField = asanaConf => {
  let allRequiredFields = []
  if (asanaConf.actionName === 'task') {
    allRequiredFields = asanaConf?.taskFields
  }
  const requiredFlds = allRequiredFields?.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        asanaFormField: field.key
      }))
    : [{ formField: '', asanaFormField: '' }]
}

export const checkMappedFields = asanaConf => {
  const mappedFields = asanaConf?.field_map
    ? asanaConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.asanaFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.asanaFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id ? { connection_id: confTmp.connection_id } : { api_key: confTmp.api_key }

export const getCustomFields = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, customFields: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    action: confTmp.actionName,
    project_id: confTmp.selectedProject
  }

  bitsFetch(requestParams, 'asana_fetch_custom_fields').then(result => {
    if (result && result.success) {
      // const newConf = { ...confTmp };
      // if (result.data) {
      //   newConf.customFields = result.data;
      // }
      // setConf(newConf);
      setConf(oldConf => {
        const newConf = { ...oldConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.customFields = result.data
        }
        return newConf
      })
      setLoading({ ...setLoading, customFields: false })
      if (!result.data) {
        toast.error(__('No custom fields found', 'bit-integrations'))
      } else {
        toast.success(__('Custom fields also fetched successfully', 'bit-integrations'))
      }
      return
    }
    setLoading({ ...setLoading, customFields: false })
    toast.error(__('Custom fields fetching failed', 'bit-integrations'))
  })
}

export const getAllProjects = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, Projects: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    action_name: confTmp.actionName
  }

  bitsFetch(requestParams, 'asana_fetch_all_Projects').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.Projects = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, Projects: false })
      if (confTmp.actionName === 'task') {
        toast.success(__('Projects fetched successfully', 'bit-integrations'))
      }

      return
    }
    setLoading({ ...setLoading, Projects: false })
    if (confTmp.actionName === 'task') {
      toast.error(__('Projects fetching failed', 'bit-integrations'))
    }
  })
}

export const getAllSections = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, Sections: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    selected_project: confTmp.selectedProject
  }

  bitsFetch(requestParams, 'asana_fetch_all_Sections').then(result => {
    if (result && result.success) {
      // const newConf = { ...confTmp };
      // if (result.data) {
      //   newConf.Sections = result.data;
      // }
      // setConf(newConf);

      setConf(oldConf => {
        const newConf = { ...oldConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.Sections = result.data
        }
        return newConf
      })
      setLoading({ ...setLoading, Sections: false })

      toast.success(__('Sections fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, Sections: false })
    toast.error(__('Sections fetching failed', 'bit-integrations'))
  })
}
