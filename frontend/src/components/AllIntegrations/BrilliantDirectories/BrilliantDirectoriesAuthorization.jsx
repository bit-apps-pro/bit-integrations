import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function BrilliantDirectoriesAuthorization({
  brilliantDirectoriesConf,
  setBrilliantDirectoriesConf,
  step,
  setstep,
  isInfo
}) {
  const note = `
  <small class="d-blk mt-5">
    ${__('Generate an API key from your Brilliant Directories admin:', 'bit-integrations')}
    <b>${__('Developer Hub &gt; Generate API Key', 'bit-integrations')}</b>.
    ${__('Most endpoints also require the', 'bit-integrations')}
    <b>${__('Advanced Endpoints', 'bit-integrations')}</b>
    ${__('toggle to be enabled on that key.', 'bit-integrations')}
  </small>
  `

  return (
    <Authorization
      config={brilliantDirectoriesConf}
      setConfig={setBrilliantDirectoriesConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Brilliant Directories"
      tutorialLinks={tutorialLinks?.brilliantDirectories || {}}
      authDetails={{
        addTo: 'header',
        apiEndpoint: '{site_url}/api/v2/token/verify',
        extraFields: [
          {
            label: __('Site URL', 'bit-integrations'),
            name: 'site_url',
            placeholder: 'https://your-directory.com',
            required: true
          }
        ],
        authType: AUTH_TYPES.API_KEY,
        key: 'X-Api-Key',
        method: 'GET'
      }}
      noteDetails={{ note }}
    />
  )
}
