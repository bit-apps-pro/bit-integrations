import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

const note = `
    <h4>${__('Steps to connect Follow Up Boss:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('In Follow Up Boss, go to <b>Admin</b> > <b>API</b>.', 'bit-integrations')}</li>
      <li>${__('Create an API key, or copy the key that you have.', 'bit-integrations')}</li>
      <li>${__('Paste the API key into <b>Username</b>. Keep <b>Password</b> empty.', 'bit-integrations')}</li>
      <li>${__('The API key has the same access as its user. Use the key of the account owner or an admin to use every action.', 'bit-integrations')}</li>
    </ul>
  `

export default function FollowUpBossAuthorization({
  followUpBossConf,
  setFollowUpBossConf,
  step,
  setstep,
  isInfo
}) {
  return (
    <Authorization
      config={followUpBossConf}
      setConfig={setFollowUpBossConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="Follow Up Boss"
      tutorialLinks={tutorialLinks?.followUpBoss || {}}
      authDetails={{
        authType: AUTH_TYPES.BASIC_AUTH,
        apiEndpoint: 'https://api.followupboss.com/v1/identity',
        method: 'GET',
        allowEmptyPassword: true
      }}
      noteDetails={{ note }}
    />
  )
}
