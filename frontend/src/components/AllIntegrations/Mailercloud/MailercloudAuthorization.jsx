import { useState } from 'react'
import AuthorizeButton from '../../Utilities/AuthorizeButton'
import ErrorField from '../../Utilities/ErrorField'
import GetInfo from '../../Utilities/GetInfo'
import Input from '../../Utilities/Input'
import Note from '../../Utilities/Note'
import StepPage from '../../Utilities/StepPage'
import { getAllLists, handleAuthorize, handleInput } from './MailercloudCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'
import { __ } from '../../../Utils/i18nwrap'

function MailercloudAuthorization({
  mailercloudConf,
  setMailercloudConf,
  step,
  setStep,
  isInfo,
  loading,
  setLoading
}) {
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', authKey: '' })
const nextPage = async () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setStep(2)
    setLoading({ ...loading, page: true })
    const data = await getAllLists(mailercloudConf, setMailercloudConf)
    if (data) {
      setLoading({ ...loading, page: false })
    }
  }

  const note = `
  <h4>${__('Step of get API Key:', 'bit-integrations')}</h4>
  <ul>
    <li>${__(
      'Goto Account and click on',
      'bit-integrations'
    )} <a href="https://app.mailercloud.com/account/api-integrations" target='_blank'>${__(
      'Integration',
      'bit-integrations'
    )}</a></li>
    <li>${__('Click on API Integrations .', 'bit-integrations')}</li>
    <li>${__(
      'Copy the <b>API Key</b> and paste into <b>API Key</b> field of your authorization form.',
      'bit-integrations'
    )}</li>
    <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
</ul>
`

  return (
    <StepPage step={step} stepNo={1} style={{ width: 900, height: 'auto' }}>
            <TutorialLink linkKey="mailercloud" />

      <div className="mt-2">
        {/* Mailercloud Authorization */}

        <Input
          label={__('Integration Name', 'bit-integrations')}
          name="name"
          placeholder={__('Integration Name...', 'bit-integrations')}
          value={mailercloudConf.name}
          onchange={e => handleInput(e, mailercloudConf, setMailercloudConf, error, setError)}
        />
        <Input
          label={__('API key', 'bit-integrations')}
          name="authKey"
          placeholder={__('API key...', 'bit-integrations')}
          value={mailercloudConf.authKey}
          onchange={e => handleInput(e, mailercloudConf, setMailercloudConf, error, setError)}
        />
        <ErrorField error={error.authKey} />
        <GetInfo
          url="https://app.mailercloud.com/account/api-integrations"
          info={__('To get API key, please visit', 'bit-integrations')}
        />
        {!isInfo && (
          <AuthorizeButton
            onclick={() =>
              handleAuthorize(mailercloudConf, setError, setAuthorized, loading, setLoading)
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

export default MailercloudAuthorization
