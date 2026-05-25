import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import { refreshLemlistCampaign } from './LemlistCommonFunc'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'

export default function LemlistAuthorization({
  lemlistConf = {},
  setLemlistConf,
  step,
  setstep = () => {},
  setSnackbar,
  isInfo,
  setIsLoading
}) {
  const loadCampaigns = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...lemlistConf, connection_id: connectionId } : lemlistConf
      refreshLemlistCampaign(nextConf, setLemlistConf, setIsLoading, setSnackbar)
    },
    [lemlistConf, setIsLoading, setLemlistConf, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !lemlistConf?.default?.lemlistCampaigns) {
        loadCampaigns()
      }
      setstep(value)
    },
    [lemlistConf, loadCampaigns, setstep]
  )

  const ActiveInstructions = `
            <h4>${__('Get Api key', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your Lemlist dashboard.', 'bit-integrations')}</li>
                <li>${__('Click on the "Team Setting" from sidebar', 'bit-integrations')}</li>
                <li>${__('Then Click "Integrations"', 'bit-integrations')}</li>
                <li>${__('Then click "Api", Then click "Generate Api Key"', 'bit-integrations')}</li>
            </ul>`

  return (
    <Authorization
      config={lemlistConf}
      setConfig={setLemlistConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Lemlist"
      tutorialLinks={tutorialLinks?.lemlist || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.lemlist.com/api/team',
        method: 'GET',
        key: 'X-BI-Auth',
        addTo: 'header',
        headers: data => ({ Authorization: `Basic ${btoa(`:${data?.api_key || ''}`)}` })
      }}
      noteDetails={{ note: ActiveInstructions }}
      onConnectionSelected={loadCampaigns}
    />
  )
}
