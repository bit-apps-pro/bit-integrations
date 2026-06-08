import { useState } from 'react'
import AuthorizeButton from '../../Utilities/AuthorizeButton'
import ErrorField from '../../Utilities/ErrorField'
import GetInfo from '../../Utilities/GetInfo'
import Input from '../../Utilities/Input'
import Note from '../../Utilities/Note'
import StepPage from '../../Utilities/StepPage'
import { getAllTags, handleAuthorize, handleInput } from './SelzyCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'
import { __ } from '../../../Utils/i18nwrap'

function SelzyAuthorization({ selzyConf, setSelzyConf, step, setStep, loading, setLoading, isInfo }) {
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', authKey: '' })
const nextPage = async () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setStep(2)
    setLoading({ ...loading, page: true })
    const data = await getAllTags(selzyConf, setSelzyConf)
    if (data) {
      setLoading({ ...loading, page: false })
    }
  }

  const note = `
  <h4>${__('Step of get API Key:', 'bit-integrations')}</h4>
  <ul>
    <li>${__(
      'Goto Settings and click on',
      'bit-integrations'
    )} <a href="https://cp.selzy.com/en/v5/user/info/api" target='_blank'>${__(
      'Integration and API.',
      'bit-integrations'
    )}</a></li>
    <li>${__('API access section API key click show full.', 'bit-integrations')}</li>
    <li>${__('Enter your password and click send', 'bit-integrations')}</li>
    <li>${__(
      'Copy the <b>API Key</b> and paste into <b>API Key</b> field of your authorization form.',
      'bit-integrations'
    )}</li>
    <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
</ul>
`

  return (
    <StepPage step={step} stepNo={1} style={{ width: 900, height: 'auto' }}>
            <TutorialLink linkKey="selzy" />

      <div className="mt-2">
        {/* SelzyAuthorization */}
        <Input
          label={__('Integration Name', 'bit-integrations')}
          name="name"
          placeholder={__('Integration Name...', 'bit-integrations')}
          value={selzyConf.name}
          onchange={e => handleInput(e, selzyConf, setSelzyConf, error, setError)}
        />
        <Input
          label={__('API key', 'bit-integrations')}
          name="authKey"
          placeholder={__('API key...', 'bit-integrations')}
          value={selzyConf.authKey}
          onchange={e => handleInput(e, selzyConf, setSelzyConf, error, setError)}
        />
        <ErrorField error={error.authKey} />
        <GetInfo
          url="https://cp.selzy.com/en/v5/user/info/api"
          info={__('To get API key, please visit', 'bit-integrations')}
        />
        {!isInfo && (
          <AuthorizeButton
            onclick={() =>
              handleAuthorize(selzyConf, setSelzyConf, setError, setAuthorized, loading, setLoading)
            }
            nextPage={nextPage}
            auth={authorized}
            loading={loading.auth}
          />
        )}
      </div>

      <Note note={note} />
    </StepPage>
  )
}

export default SelzyAuthorization
