/* eslint-disable jsx-a11y/anchor-is-valid */
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function LineAuthorization({ lineConf, setLineConf, step, setstep, isInfo }) {
  return (
    <Authorization
      config={lineConf}
      setConfig={setLineConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Line"
      tutorialLinks={tutorialLinks?.line || {}}
      authDetails={{
        authType: AUTH_TYPES.BEARER_TOKEN,
        apiEndpoint: 'https://api.line.me/v2/bot/info',
        method: 'GET'
      }}
      noteDetails={{ note: lineAccessTokenNote }}
    />
  )
}

const lineAccessTokenNote = `<h2>${__('To get your Line access token:', 'bit-integrations')}</h2>
     <ul>
         <li>${__(
           'Log in to the <a href="https://developers.line.biz/console/" target="_blank">Line Developers Console</a>.',
           'bit-integrations'
         )}</li>
         <li>${__(
           'Go to your provider and select the channel you want to use.',
           'bit-integrations'
         )}</li>
         <li>${__('Navigate to the "Messaging API" tab.', 'bit-integrations')}</li>
         <li>${__(
           'Scroll down to the "Channel access token (long-lived)" section.',
           'bit-integrations'
         )}</li>
         <li>${__('Click the "issue" button to generate a new token.', 'bit-integrations')}</li>
         <li>${__('Copy the generated token — this is your Line access token.', 'bit-integrations')}</li>
     </ul>`
