/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import { deepCopy } from '../../../Utils/Helpers'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, flowluConf, setFlowluConf) => {
  const newConf = { ...flowluConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setFlowluConf({ ...newConf })
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : {
        api_key: confTmp.api_key,
        company_name: confTmp.company_name
      }

export const getAllFields = (flowluConf, setFlowluConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = {
    ...buildAuthRequestParams(flowluConf),
    action_name: flowluConf.actionName,
    selectedAccountType: flowluConf?.selectedAccountType
  }

  bitsFetch(requestParams, 'Flowlu_all_fields')
    .then(result => {
      if (result && result.success) {
        setFlowluConf(prevFlowluConf => {
          const draftConf = deepCopy(prevFlowluConf)
          draftConf.field_map = [{ formField: '', flowluFormField: '' }]
          if (result.data) {
            draftConf.flowluFields = result.data
            draftConf.field_map = generateMappedField(draftConf)
          }
          return draftConf
        })
        setSnackbar({
          show: true,
          msg: __('Flowlu fields Fetched Successfully', 'bit-integrations')
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Flowlu fields Fetched Successfully. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

const generateMappedField = flowluConf => {
  const requiredFlds =
    flowluConf?.flowluFields && flowluConf?.flowluFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        flowluFormField: field.key
      }))
    : [{ formField: '', flowluFormField: '' }]
}

export const checkMappedFields = flowluConf => {
  const mappedFields = flowluConf?.field_map
    ? flowluConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.flowluFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.flowluFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const getAllAccountCategories = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, accountCategories: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'flowlu_fetch_all_account_categories').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.accountCategories = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, accountCategories: false })

      toast.success(__('Categories fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, accountCategories: false })
    toast.error(__('Categories fetching failed', 'bit-integrations'))
  })
}

export const getAllIndustry = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, industry: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'flowlu_fetch_all_industries').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.industries = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, industry: false })

      toast.success(__('Industries fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, industry: false })
    toast.error(__('Industries fetching failed', 'bit-integrations'))
  })
}

export const getAllPipeline = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, pipeline: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'flowlu_fetch_all_pipelines').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.pipelines = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, pipeline: false })

      toast.success(__('Pipelines fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, pipeline: false })
    toast.error(__('Pipelines fetching failed', 'bit-integrations'))
  })
}

export const getAllStage = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, stage: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    pipeline_id: confTmp.selectedPipeline
  }

  bitsFetch(requestParams, 'flowlu_fetch_all_stages').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.stages = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, stage: false })

      toast.success(__('Opportunity stages fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, stage: false })
    toast.error(__('Opportunity stages fetching failed', 'bit-integrations'))
  })
}

export const getAllSource = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, source: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'flowlu_fetch_all_sources').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.sources = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, source: false })

      toast.success(__('Source fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, source: false })
    toast.error(__('Source fetching failed', 'bit-integrations'))
  })
}

export const getAllCustomer = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, customer: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'flowlu_fetch_all_customers').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.customers = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, customer: false })

      toast.success(__('Customer fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, customer: false })
    toast.error(__('Customer fetching failed', 'bit-integrations'))
  })
}

export const getAllManagers = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, manager: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'flowlu_fetch_all_managers').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.managers = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, manager: false })

      toast.success(__('Project Manager fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, manager: false })
    toast.error(__('Project Manager fetching failed', 'bit-integrations'))
  })
}

export const getAllProjectStage = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, projectStage: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'flowlu_fetch_all_project_tages').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.projectStages = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, projectStage: false })

      toast.success(__('Project Stage fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, projectStage: false })
    toast.error(__('Project Stage fetching failed', 'bit-integrations'))
  })
}

export const getAllPortfolio = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, portfolio: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'flowlu_fetch_all_portfolio').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.portfolios = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, portfolio: false })

      toast.success(__('Project Stage fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, portfolio: false })
    toast.error(__('Project Stage fetching failed', 'bit-integrations'))
  })
}

export const getAllProjectOpportunity = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, projectOpportunity: true })

  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'flowlu_fetch_all_project_opportunity').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.projectOpportunities = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, projectOpportunity: false })

      toast.success(__('Project Opportunity fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, projectOpportunity: false })
    toast.error(__('Project Opportunity fetching failed', 'bit-integrations'))
  })
}
