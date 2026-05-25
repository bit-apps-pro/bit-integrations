import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { getProLabel } from '../../Utilities/ProUtilHelpers'
import { getConnection } from '../../../Utils/connectionApi'

export default function HighLevelAuthorization({
  highLevelConf,
  setHighLevelConf,
  step,
  setstep,
  isInfo
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const hydrateConnectionExtras = useCallback(
    async connectionId => {
      if (!connectionId) return

      const res = await getConnection(connectionId)
      const authDetails = res?.success ? res?.data?.data?.auth_details : null
      if (!authDetails) return

      setHighLevelConf(prev => ({
        ...prev,
        version: authDetails.version || prev.version || 'v1',
        location_id: authDetails.location_id || prev.location_id || ''
      }))
    },
    [setHighLevelConf]
  )

  const handleSetStep = useCallback(
    value => {
      setstep(value)
    },
    [setstep]
  )

  const versionOptions = isPro
    ? [
        { value: 'v1', label: 'HighLevel API V1' },
        { value: 'v2', label: 'HighLevel API V2' }
      ]
    : [{ value: 'v1', label: getProLabel('HighLevel API V1') }]

  return (
    <Authorization
      config={highLevelConf}
      setConfig={setHighLevelConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="HighLevel"
      tutorialLinks={tutorialLinks?.highLevel || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: data =>
          data?.version === 'v2'
            ? `https://services.leadconnectorhq.com/locations/${data?.location_id || ''}`
            : 'https://rest.gohighlevel.com/v1/contacts/?limit=1',
        method: 'GET',
        headers: data => ({
          Accept: 'application/json',
          ...(data?.version === 'v2' ? { Version: '2021-07-28' } : {})
        }),
        extraFields: [
          {
            name: 'version',
            label: __('Select Version', 'bit-integrations'),
            required: true,
            type: 'select',
            placeholder: __('Select Version', 'bit-integrations'),
            options: versionOptions
          },
          ...(isPro
            ? [
                {
                  name: 'location_id',
                  label: __('Location ID', 'bit-integrations'),
                  required: false,
                  placeholder: __('Location ID...', 'bit-integrations')
                }
              ]
            : [])
        ]
      }}
      noteDetails={{ note: ActiveInstructions(highLevelConf?.version) }}
      onConnectionSelected={hydrateConnectionExtras}
    />
  )
}

const ActiveInstructions = version => {
  return version !== 'v2'
    ? `
            <h4>${__('Get GoHighLevel Api Key', 'bit-integrations')}</h4>
            <ul>
                <li>${__(
                  'First go to your GoHighLevel sub account settings then business profile tab',
                  'bit-integrations'
                )}.</li>
                <li>${__('Copy the the API key.', 'bit-integrations')}</li>
                <li>${__(
                  'You can also get the API key from Agency view. Navigate to settings then API keys tab.',
                  'bit-integrations'
                )}</li>
            </ul>`
    : `
            <h4>${__('Get GoHighLevel Location ID', 'bit-integrations')}</h4>
            <ul>
                <li>${__(
                  'From the Sub-Account Dashboard, go to Settings in lower right-hand corner',
                  'bit-integrations'
                )}.</li>
                <li>${__(
                  'Select Business Profile on the left-side navigation bar.',
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'The Location ID will be visible as shown in General Information.',
                  'bit-integrations'
                )}</li>
                <li>${__('Copy the location ID.', 'bit-integrations')}</li>
            </ul>
            <h4>${__('Get GoHighLevel Api Key', 'bit-integrations')}</h4>
            <ul>
                <li>${__(
                  'First go to your GoHighLevel sub account settings then Private Integration tab',
                  'bit-integrations'
                )}.</li>
                <li>${__('Click on "Create new Integration"', 'bit-integrations')}</li>
                <li>${__(
                  "Give your Private Integration a name and description to help you and your team identify what it's for.",
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'Select the scopes/permissions that you want the private integration to have access to on your agency  account. Ensure that you are selecting only the required scopes for better data security.',
                  'bit-integrations'
                )}</li>
                <li>${__('Copy the token generated.', 'bit-integrations')}</li>
            </ul>`
}
