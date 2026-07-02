/* eslint-disable jsx-a11y/anchor-is-valid */
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function SmailyAuthorization({ smailyConf, setSmailyConf, step, setStep, isInfo }) {
  const note = `<h4>${__(
    'To create API username and password, do the following.',
    'bit-integrations'
  )}</h4>
  <ol>
  <li>${__(
    'Click on your',
    'bit-integrations'
  )} <a href="https://www.sendsmaily.net/account/login/" target="_blank">account</a>${__(
    'name in the upper right corner of the page.',
    'bit-integrations'
  )}</li>
  <li>${__('From a dropdown menu choose “Preferences”.', 'bit-integrations')}</li>
  <li>${__('Click on the “Integrations” tab.', 'bit-integrations')}</li>
  <li>${__('And then underneath API Passwords click on “Create a new user”.', 'bit-integrations')}</li>
  </ol>`

  return (
    <Authorization
      config={smailyConf}
      setConfig={setSmailyConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Smaily"
      tutorialLinks={tutorialLinks?.smaily || {}}
      authDetails={{
        authType: AUTH_TYPES.BASIC_AUTH,
        apiEndpoint: 'https://{subdomain}.sendsmaily.net/api/organizations/users.php',
        method: 'GET',
        extraFields: [
          {
            name: 'subdomain',
            label: __('Subdomain Name', 'bit-integrations'),
            required: true,
            placeholder: __('Your Account', 'bit-integrations')
          }
        ]
      }}
      noteDetails={{ note }}
    />
  )
}
