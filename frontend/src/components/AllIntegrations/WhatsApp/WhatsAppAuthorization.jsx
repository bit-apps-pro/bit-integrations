/* eslint-disable jsx-a11y/anchor-is-valid */
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function WhatsAppAuthorization({ whatsAppConf, setWhatsAppConf, step, setstep, isInfo }) {
  return (
    <Authorization
      config={whatsAppConf}
      setConfig={setWhatsAppConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="WhatsApp"
      tutorialLinks={tutorialLinks?.whatsApp || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://graph.facebook.com/v20.0/{businessAccountID}',
        method: 'GET',
        extraFields: [
          {
            name: 'numberID',
            label: __('Phone number ID', 'bit-integrations'),
            required: true,
            placeholder: __('Number ID...', 'bit-integrations')
          },
          {
            name: 'businessAccountID',
            label: __('WhatsApp Business Account ID', 'bit-integrations'),
            required: true,
            placeholder: __('Business Account ID...', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}

const note = `<h4>${__('WhatsApp Cloud API setup', 'bit-integrations')}</h4>
  <ul>
    <li>${__('Provide your WhatsApp Business Account ID.', 'bit-integrations')}</li>
    <li>${__('Provide your Phone Number ID.', 'bit-integrations')}</li>
    <li>${__('Paste a valid long-lived access token.', 'bit-integrations')}</li>
  </ul>`
