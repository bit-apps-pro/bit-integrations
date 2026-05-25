import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import { refreshCampaignMonitorLists } from './CampaignMonitorCommonFunc'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function CampaignMonitorAuthorization({
  campaignMonitorConf,
  setCampaignMonitorConf,
  step,
  setstep,
  setSnackbar,
  isInfo
}) {
  const loadLists = useCallback(
    connectionId => {
      const nextConf = connectionId
        ? { ...campaignMonitorConf, connection_id: connectionId }
        : campaignMonitorConf

      refreshCampaignMonitorLists(nextConf, setCampaignMonitorConf, () => {}, setSnackbar)
    },
    [campaignMonitorConf, setCampaignMonitorConf, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !campaignMonitorConf?.default?.campaignMonitorLists) {
        loadLists()
      }
      setstep(value)
    },
    [campaignMonitorConf, loadLists, setstep]
  )

  const note = `
      <h4>${__('Get Client Id & Api key', 'bit-integrations')}</h4>
      <ul>
          <li>${__('First go to your CampaignMonitor dashboard.', 'bit-integrations')}</li>
          <li>${__('Click on your profile image at the top right.', 'bit-integrations')}</li>
          <li>${__('Click on Account Settings, then API keys.', 'bit-integrations')}</li>
          <li>${__('Use your API key in the Username field.', 'bit-integrations')}</li>
      </ul>
      <small class="d-blk mt-3">
        ${__('To get Client Id & API key, please visit', 'bit-integrations')}
        <a
          class="btcd-link"
          href="https://bitcode2.createsend.com/account/apikeys"
          target="_blank"
          rel="noreferrer">
          ${__(' Campaign Monitor API Key', 'bit-integrations')}
        </a>
      </small>`

  return (
    <Authorization
      config={campaignMonitorConf}
      setConfig={setCampaignMonitorConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Campaign Monitor"
      tutorialLinks={tutorialLinks?.campaignMonitor || {}}
      authDetails={{
        authType: AUTH_TYPES.BASIC_AUTH,
        apiEndpoint: 'https://api.createsend.com/api/v3.3/clients/{client_id}.json',
        method: 'GET',
        allowEmptyPassword: true,
        extraFields: [
          {
            name: 'client_id',
            label: __('Client ID', 'bit-integrations'),
            required: true,
            placeholder: __('Client ID...', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}
