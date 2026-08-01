import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import { getAllLists } from './MailercloudCommonFunc'

function MailercloudAuthorization({
  mailercloudConf,
  setMailercloudConf,
  step,
  setStep,
  isInfo,
  loading,
  setLoading,
  setSnackbar
}) {
  const loadLists = useCallback(
    connectionId => {
      const nextConf = connectionId
        ? { ...mailercloudConf, connection_id: connectionId }
        : mailercloudConf

      getAllLists(nextConf, setMailercloudConf, loading, setLoading, setSnackbar)
    },
    [mailercloudConf, loading, setLoading, setMailercloudConf, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !mailercloudConf?.default?.lists) {
        loadLists()
      }
      setStep(value)
    },
    [loadLists, mailercloudConf?.default?.lists, setStep]
  )

  const note = `
  <h4>${__('Step of get API Key:', 'bit-integrations')}</h4>
  <ul>
    <li>${__(
      'Goto Account and click on',
      'bit-integrations'
    )} <a href="https://app.mailercloud.com/account/api-integrations" target='_blank'>${__(
      'Integration',
      'bit-integrations'
    )}</a></li>
    <li>${__('Click on API Integrations .', 'bit-integrations')}</li>
    <li>${__(
      'Copy the <b>API Key</b> and paste into <b>API Key</b> field of your authorization form.',
      'bit-integrations'
    )}</li>
    <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
</ul>
`

  return (
    <Authorization
      config={mailercloudConf}
      setConfig={setMailercloudConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Mailercloud"
      tutorialLinks={tutorialLinks?.mailercloud || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://cloudapi.mailercloud.com/v1/client/plan',
        method: 'GET',
        key: 'X-BI-Auth',
        addTo: 'header',
        headers: {
          Authorization: '{api_key}',
          'Content-Type': 'application/json'
        }
      }}
      noteDetails={{ note }}
      onConnectionSelected={loadLists}
    />
  )
}

export default MailercloudAuthorization
