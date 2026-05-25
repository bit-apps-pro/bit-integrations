/* eslint-disable jsx-a11y/anchor-is-valid */
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function TwilioAuthorization({ twilioConf, setTwilioConf, step, setstep, isInfo }) {
  const note = `<h4>${__('To get Account SID and Auth Token:', 'bit-integrations')}</h4>
  <ul>
    <li>${__(
      'Visit your',
      'bit-integrations'
    )} <a href="https://console.twilio.com/" target="_blank">Twilio Console</a>.</li>
    <li>${__('Copy your Account SID and use it as Username.', 'bit-integrations')}</li>
    <li>${__('Copy your Auth Token and use it as Password.', 'bit-integrations')}</li>
    <li>${__('Use your Twilio sender number in the From Number field.', 'bit-integrations')}</li>
  </ul>`

  return (
    <Authorization
      config={twilioConf}
      setConfig={setTwilioConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Twilio"
      tutorialLinks={tutorialLinks?.twilio || {}}
      authDetails={{
        authType: AUTH_TYPES.BASIC_AUTH,
        apiEndpoint: 'https://api.twilio.com/2010-04-01/Accounts',
        method: 'GET',
        ssl_verify: false,
        extraFields: [
          {
            name: 'from_num',
            label: __('From Number', 'bit-integrations'),
            required: true,
            placeholder: __('Phone Number...', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
