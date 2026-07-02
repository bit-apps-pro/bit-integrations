import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import { getAllCampaign } from './WoodpeckerCommonFunc'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function WoodpeckerAuthorization({
  woodpeckerConf,
  setWoodpeckerConf,
  step,
  setStep,
  loading,
  setLoading,
  setSnackbar,
  isInfo = false
}) {
  const loadCampaigns = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...woodpeckerConf, connection_id: connectionId } : woodpeckerConf
      getAllCampaign(nextConf, setWoodpeckerConf, loading, setLoading, setSnackbar)
    },
    [loading, setLoading, setSnackbar, setWoodpeckerConf, woodpeckerConf]
  )

  const ActiveInstructions = `
            <h4>${__('Get API Key', 'bit-integrations')}</h4>
            <ul>
                <li>${__(
                  'Log into your Woodpecker account on',
                  'bit-integrations'
                )} <a className="btcd-link" href="https://app.woodpecker.co/panel" target="_blank">${__(
                  'app.woodpecker.co.',
                  'bit-integrations'
                )}</a></li>
                <li>${__(
                  'Go to the <b>Marketplace</b> → <b>INTEGRATIONS</b> → <b>API keys</b>.',
                  'bit-integrations'
                )}</li>
                <li>${__('Use the purple button to <b>CREATE A KEY</b>.', 'bit-integrations')}</li>
            </ul>`

  return (
    <Authorization
      config={woodpeckerConf}
      setConfig={setWoodpeckerConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Woodpecker"
      tutorialLinks={tutorialLinks?.woodpecker || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.woodpecker.co/rest/v1/campaign_list',
        method: 'GET',
        key: 'X-BI-Auth',
        addTo: 'header',
        headers: data => ({
          Authorization: `Basic ${btoa(data?.api_key || '')}`,
          'Content-type': 'application/json'
        })
      }}
      noteDetails={{ note: ActiveInstructions }}
      onConnectionSelected={loadCampaigns}
    />
  )
}
