// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '@wordpress/i18n'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, campaignMonitorConf, setCampaignMonitorConf) => {
  const newConf = { ...campaignMonitorConf }
  newConf.name = e.target.value
  setCampaignMonitorConf({ ...newConf })
}

const buildAuthRequestParams = conf =>
  conf.connection_id
    ? { connection_id: conf.connection_id }
    : { client_id: conf.client_id, api_key: conf.api_key }

// refreshMappedLists
export const refreshCampaignMonitorLists = (
  campaignMonitorConf,
  setCampaignMonitorConf,
  setIsLoading,
  setSnackbar
) => {
  if (typeof setIsLoading === 'function') setIsLoading(true)
  const refreshListsRequestParams = buildAuthRequestParams(campaignMonitorConf)

  bitsFetch(refreshListsRequestParams, 'campaign_monitor_lists')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...campaignMonitorConf }
        if (result.data) {
          if (!newConf.default) {
            newConf.default = {}
          }
          newConf.default.campaignMonitorLists = result.data
          setSnackbar({
            show: true,
            msg: __('CampaignMonitor Lists refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No CampaignMonitor Lists found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }

        setCampaignMonitorConf({ ...newConf })
      } else {
          setSnackbar({
            show: true,
            msg: __('CampaignMonitor Lists refresh failed. please try again', 'bit-integrations')
          })
      }
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
    .catch(() => {
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
}

// refreshMappedFields
export const refreshCampaignMonitorFields = (
  campaignMonitorConf,
  setCampaignMonitorConf,
  setIsLoading,
  setSnackbar
) => {
  if (typeof setIsLoading === 'function') setIsLoading(true)
  const refreshListsRequestParams = {
    ...buildAuthRequestParams(campaignMonitorConf),
    listId: campaignMonitorConf.listId
  }

  bitsFetch(refreshListsRequestParams, 'campaign_monitor_custom_fields')
    .then(result => {
      if (result && result.success) {
        setCampaignMonitorConf(prevConf => {
          prevConf.customFields = result.data ? result.data : []
          return prevConf
        })
        setSnackbar({
          show: true,
          msg: __('CampaignMonitor Custom fields refreshed.', 'bit-integrations')
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('CampaignMonitor Custom fields refresh failed. please try again', 'bit-integrations')
        })
      }
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
    .catch(() => {
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
}

export const generateMappedField = campaignMonitorConf => {
  let allFields = campaignMonitorConf.subscriberFields
  const requiredFlds = allFields && allFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        campaignMonitorField: field.key
      }))
    : [{ formField: '', campaignMonitorField: '' }]
}

export const checkMappedFields = campaignMonitorConf => {
  const mappedFields = campaignMonitorConf?.field_map
    ? campaignMonitorConf.field_map.filter(
        mappedField => !mappedField.formField && mappedField.campaignMonitorField && mappedField.required
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
