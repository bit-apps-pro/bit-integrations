/* eslint-disable jsx-a11y/anchor-is-valid */
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function AgiledAuthorization({ agiledConf, setAgiledConf, step, setStep, isInfo }) {
  return (
    <Authorization
      config={agiledConf}
      setConfig={setAgiledConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Agiled CRM"
      tutorialLinks={tutorialLinks?.agiled || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://my.agiled.app/api/v1/users',
        method: 'GET',
        key: 'api_token',
        addTo: 'query',
        headers: {
          Brand: '{brand}'
        },
        extraFields: [
          {
            name: 'brand',
            label: __('Brand (Your Account URL)', 'bit-integrations'),
            required: true,
            placeholder: __('Your Account...', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}

const note = `${__('Example: name.agiled.app', 'bit-integrations')}`
