import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import {
  refreshActiveCampaingAccounts,
  refreshActiveCampaingHeader,
  refreshActiveCampaingList,
  refreshActiveCampaingTags
} from './ActiveCampaignCommonFunc'

export default function ActiveCampaignAuthorization({
  activeCampaingConf,
  setActiveCampaingConf,
  step,
  setstep,
  setSnackbar,
  isInfo,
  setIsLoading
}) {
  const loadMetadata = useCallback(
    async connectionId => {
      const nextConf = connectionId
        ? { ...activeCampaingConf, connection_id: connectionId }
        : activeCampaingConf

      refreshActiveCampaingList(nextConf, setActiveCampaingConf, setIsLoading, setSnackbar)
      refreshActiveCampaingHeader(nextConf, setActiveCampaingConf, setIsLoading, setSnackbar)
      refreshActiveCampaingAccounts(nextConf, setActiveCampaingConf, setIsLoading, setSnackbar)
      refreshActiveCampaingTags(nextConf, setActiveCampaingConf, setIsLoading, setSnackbar)
    },
    [activeCampaingConf, setActiveCampaingConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (
        value === 2 &&
        (!activeCampaingConf?.default?.activeCampaignLists || !activeCampaingConf?.default?.fields)
      ) {
        loadMetadata()
      }

      setstep(value)
    },
    [activeCampaingConf, loadMetadata, setstep]
  )

  const note = `
    <h4>${__('Get API URL and API key', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Go to your ActiveCampaign dashboard.', 'bit-integrations')}</li>
      <li>${__('Open Settings, then Developer.', 'bit-integrations')}</li>
      <li>${__('Copy API URL and API Key.', 'bit-integrations')}</li>
    </ul>`

  return (
    <Authorization
      config={activeCampaingConf}
      setConfig={setActiveCampaingConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="ActiveCampaign"
      tutorialLinks={tutorialLinks?.activeCampaign || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: '{api_url}/api/3/accounts',
        method: 'GET',
        key: 'Api-Token',
        addTo: 'header',
        extraFields: [
          {
            name: 'api_url',
            label: __('Access API URL', 'bit-integrations'),
            required: true,
            placeholder: __('https://your-account.api-us1.com', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadMetadata}
    />
  )
}
