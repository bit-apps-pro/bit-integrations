import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import { getAllTicketFields } from './FreshdeskCommonFunc'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function FreshdeskAuthorization({
  freshdeskConf,
  setFreshdeskConf,
  step,
  setstep,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const loadTicketFields = useCallback(
    connectionId => {
      const nextConf = connectionId ? { ...freshdeskConf, connection_id: connectionId } : freshdeskConf
      getAllTicketFields(nextConf, setFreshdeskConf, setIsLoading, setSnackbar)
    },
    [freshdeskConf, setFreshdeskConf, setIsLoading, setSnackbar]
  )

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !freshdeskConf?.ticketFields?.length) {
        loadTicketFields()
      }

      setstep(value)
    },
    [freshdeskConf?.ticketFields?.length, loadTicketFields, setstep]
  )

  const freshdeskInstructions = `
            <h4>${__('Locate Your App Domain', 'bit-integrations')}</h4>
            <ul>
                <li>${__('Access your Freshdesk account.', 'bit-integrations')}</li>
                <li>${__(
    'Copy the URL displayed in your browser’s address bar',
    'bit-integrations'
  )} (e.g., https://domain.freshdesk.com/)</li>
                <li>${__(
    'Paste the copied App Domain into the designated “App Domain” field within the integrations you’re setting up.',
    'bit-integrations'
  )}</li>
            </ul>
            <h4>${__('Retrieve Your App API Key', 'bit-integrations')}</h4>
            <ul>
                <li>${__(
    'Within your Freshdesk account, click on your profile icon, situated in the top right corner.',
    'bit-integrations'
  )}</li>
                <li>${__(
    'Select “Profile Settings” from the options that appear.',
    'bit-integrations'
  )}</li>
                <li>${__(
    'Locate your App API key, prominently displayed on the top right side of the Profile Settings page.',
    'bit-integrations'
  )}</li>
                <li>${__('Copy this key.', 'bit-integrations')}</li>
                <li>${__(
    'Paste the copied App API key into the designated “App API key” field within the integrations you’re configuring.',
    'bit-integrations'
  )}</li>
</ul>
<small className="d-blk mt-2">
            ${__('To get access Token , Please Visit', 'bit-integrations')}${' '}
            <a
              className="btcd-link"
              href=${`${freshdeskConf?.app_domain || 'https://domain.freshdesk.com'}/a/profiles/72009210017/edit`}
              target="_blank"
              rel="noreferrer">
              ${__('FreshDesk Console', 'bit-integrations')}
            </a>
          </small>
`

  return (
    <Authorization
      config={freshdeskConf}
      setConfig={setFreshdeskConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Freshdesk"
      tutorialLinks={tutorialLinks?.freshdesk || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: '{app_domain}/api/v2/tickets',
        method: 'GET',
        key: 'X-BI-Auth',
        addTo: 'header',
        headers: authData => ({
          Authorization: btoa(`${authData.api_key}`),
          'Content-Type': 'application/json'
        }),
        extraFields: [
          {
            name: 'app_domain',
            label: __('Your App Domain', 'bit-integrations'),
            required: true,
            placeholder: __('https://domain.freshdesk.com', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note: freshdeskInstructions }}
      onConnectionSelected={loadTicketFields}
    />
  )
}
