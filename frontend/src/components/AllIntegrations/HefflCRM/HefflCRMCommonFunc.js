import toast from 'react-hot-toast'
import { create } from 'mutative'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, hefflCRMConf, setHefflCRMConf) => {
  const { name, value } = e.target

  setHefflCRMConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const buildAuthRequestParams = conf =>
  conf?.connection_id ? { connection_id: conf.connection_id } : { api_key: conf?.api_key }

const hasAuthParams = conf => Boolean(conf?.connection_id || conf?.api_key)

const refreshList = (
  hefflCRMConf,
  setHefflCRMConf,
  setIsLoading,
  action,
  confKey,
  successMsg,
  errorMsg,
  extra = {}
) => {
  if (!hasAuthParams(hefflCRMConf)) {
    toast.error(__('Authorize first to refresh', 'bit-integrations'))
    return
  }
  setIsLoading(true)

  bitsFetch({ ...buildAuthRequestParams(hefflCRMConf), ...extra }, action)
    .then(result => {
      setIsLoading(false)
      if (result?.success) {
        setHefflCRMConf(prev =>
          create(prev, draft => {
            draft[confKey] = Array.isArray(result.data) ? result.data : []
          })
        )
        toast.success(successMsg)
        return
      }
      toast.error(errorMsg)
    })
    .catch(() => setIsLoading(false))
}

export const refreshLeadSources = (conf, setConf, setIsLoading) =>
  refreshList(
    conf,
    setConf,
    setIsLoading,
    'refresh_heffl_crm_lead_sources',
    'leadSources',
    __('Lead sources fetched', 'bit-integrations'),
    __('Failed to fetch lead sources', 'bit-integrations')
  )

export const refreshLeadStages = (conf, setConf, setIsLoading) =>
  refreshList(
    conf,
    setConf,
    setIsLoading,
    'refresh_heffl_crm_lead_stages',
    'leadStages',
    __('Lead stages fetched', 'bit-integrations'),
    __('Failed to fetch lead stages', 'bit-integrations')
  )

export const refreshPipelines = (conf, setConf, setIsLoading) =>
  refreshList(
    conf,
    setConf,
    setIsLoading,
    'refresh_heffl_crm_pipelines',
    'pipelines',
    __('Pipelines fetched', 'bit-integrations'),
    __('Failed to fetch pipelines', 'bit-integrations')
  )

export const refreshPipelineStages = (conf, setConf, setIsLoading, pipelineId) =>
  refreshList(
    conf,
    setConf,
    setIsLoading,
    'refresh_heffl_crm_pipeline_stages',
    'pipelineStages',
    __('Pipeline stages fetched', 'bit-integrations'),
    __('Failed to fetch pipeline stages', 'bit-integrations'),
    { pipelineId }
  )

export const refreshClients = (conf, setConf, setIsLoading) =>
  refreshList(
    conf,
    setConf,
    setIsLoading,
    'refresh_heffl_crm_clients',
    'clients',
    __('Clients fetched', 'bit-integrations'),
    __('Failed to fetch clients', 'bit-integrations')
  )

export const refreshLeads = (conf, setConf, setIsLoading) =>
  refreshList(
    conf,
    setConf,
    setIsLoading,
    'refresh_heffl_crm_leads',
    'leads',
    __('Leads fetched', 'bit-integrations'),
    __('Failed to fetch leads', 'bit-integrations')
  )

export const checkMappedFields = hefflCRMConf => {
  if (!hefflCRMConf?.mainAction) return false
  const requiredKeys = (hefflCRMConf?.hefflCRMFields || []).filter(f => f.required).map(f => f.key)
  const mapped = hefflCRMConf?.field_map || []

  return requiredKeys.every(key =>
    mapped.some(
      m =>
        m.hefflCRMField === key &&
        m.formField &&
        (m.formField !== 'custom' || (m.customValue && m.customValue !== ''))
    )
  )
}

export const generateMappedField = fields => {
  const required = fields.filter(f => f.required)
  return required.length > 0
    ? required.map(f => ({ formField: '', hefflCRMField: f.key }))
    : [{ formField: '', hefflCRMField: '' }]
}
