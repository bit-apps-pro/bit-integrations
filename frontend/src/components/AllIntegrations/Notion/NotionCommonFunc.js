/* eslint-disable prefer-const */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { saveActionConf, saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'

export const handleInput = (e, conf, setConf, error, setError) => {
  const newConf = { ...conf }
  const inputError = { ...error }
  const { name, value } = e.target
  inputError[name] = ''
  newConf[name] = value
  setError(inputError)
  setConf(newConf)
}

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : { accessToken: conf?.tokenDetails?.access_token }

export const getAllDatabaseLists = async (conf, setConf, loading, setLoading) => {
  setLoading && setLoading({ ...loading, list: true })
  const requestParams = buildAuthRequestParams(conf)
  const result = await bitsFetch(requestParams, 'notion_database_lists')
  if (result.success && result.data.results) {
    const data = result?.data.results
      .filter(e => e.object === 'database')
      .map(e => ({ id: e.id, name: e.title[0].text.content }))
    const newConf = { ...conf }
    if (data) {
      if (!newConf.default) {
        newConf.default = {}
      }
      newConf.default.databaseLists = data
      setConf(newConf)
      if (setLoading) {
        setLoading({ ...loading, list: false })
        toast.success(__('List refresh successfully'))
      }
    }
    return true
  }

  if (setLoading) {
    setLoading({ ...loading, list: false })
    toast.success(__('List refresh failed'))
  }
  return false
}

export const getFieldsProperties = async (conf, setConf, loading, setLoading) => {
  setLoading && setLoading({ ...loading, field: true })
  const requestParams = {
    ...buildAuthRequestParams(conf),
    databaseId: conf.databaseId
  }
  const result = await bitsFetch(requestParams, 'notion_database_properties')

  if (result.success && result.data.properties) {
    const data = result?.data.properties
    const field = []
    const sanitizeField = [
      'formula',
      'people',
      'Rollup',
      'Relation',
      'created_by',
      'created_time',
      'last_edited_by',
      'last_edited_time'
    ]
    for (const key in data) {
      const obb = {}
      let value = data[key]
      const typeName = value.type
      if (!sanitizeField.includes(typeName)) {
        obb.label = key
        obb.key = typeName
        if (typeName == 'title') {
          obb.required = true
        } else {
          obb.required = false
        }
        field.push(obb)
      }
    }

    const newConf = { ...conf }
    if (data) {
      newConf.notionFields = field
      setConf({ ...newConf })
      if (setLoading) {
        setLoading({ ...loading, field: false })
        toast.success(__('field refresh successfully'))
      }
    }
    return field
  }
  if (setLoading) {
    setLoading({ ...loading, field: false })
    toast.success(__('field refresh failed'))
  }
  return false
}

export const generateMappedField = notionConf => {
  const requiredFlds = notionConf?.notionFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formFields: '',
        notionFormFields: field.label
      }))
    : [{ formFields: '', notionFormFields: '' }]
}

const checkMappedFields = notionConf => {
  const mappedFields = notionConf?.field_map
    ? notionConf.field_map.filter(
        mappedField =>
          !mappedField.formFields ||
          !mappedField.notionFormFields ||
          (!mappedField.formFields === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const nextPage = (conf, setStep, pageNo) => {
  setTimeout(() => {
    document.getElementById('btcd-settings-wrp').scrollTop = 0
  }, 300)

  if (!checkMappedFields(conf)) {
    toast.error(__('Please map mandatory fields', 'bit-integrations'))
    return
  }
  conf.field_map.length > 0 && setStep(pageNo)
}

export const saveConfig = (flow, setFlow, allIntegURL, conf, navigate, setLoading) => {
  setLoading(true)
  const resp = saveIntegConfig(flow, setFlow, allIntegURL, conf, navigate, '', '', setLoading)
  resp.then(res => {
    if (res.success) {
      toast.success(res.data?.msg)
      navigate(allIntegURL)
    } else {
      toast.error(res.data || res)
    }
  })
}

export const saveUpdateConfig = (flow, allIntegURL, conf, navigate, edit, setIsLoading) => {
  if (!checkMappedFields(conf)) {
    toast.error(__('Please map mandatory fields', 'bit-integrations'))
    return
  }
  saveActionConf({ flow, allIntegURL, conf, navigate, edit, setIsLoading })
}
