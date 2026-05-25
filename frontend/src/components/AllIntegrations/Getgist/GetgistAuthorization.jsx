import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function GetgistAuthorization({ getgistConf, setGetgistConf, step, setstep, isInfo }) {
  return (
    <Authorization
      config={getgistConf}
      setConfig={setGetgistConf}
      step={step}
      setStep={setstep}
      isInfo={isInfo}
      tutorialTitle="GetGist"
      tutorialLinks={tutorialLinks?.getgist || {}}
      authDetails={{
        authType: AUTH_TYPES.API_KEY,
        apiEndpoint: 'https://api.getgist.com/contacts',
        method: 'GET',
        key: 'X-BI-Auth',
        addTo: 'header',
        headers: { Authorization: 'Bearer {api_key}' }
      }}
      noteDetails={{
        note: '',
        isHeadingNull: true,
        children: (
          <small className="d-blk mt-5">
            {__('To get API , Please Visit', 'bit-integrations')}{' '}
            <a
              className="btcd-link"
              href="https://app.getgist.com/projects/jgmmrszy/settings/api-key"
              target="_blank"
              rel="noreferrer">
              {__('Getgist API Console', 'bit-integrations')}
            </a>
          </small>
        )
      }}
    />
  )
}
