import { useState } from 'react'
import AuthorizeButton from '../../Utilities/AuthorizeButton'
import ErrorField from '../../Utilities/ErrorField'
import GetInfo from '../../Utilities/GetInfo'
import Input from '../../Utilities/Input'
import Note from '../../Utilities/Note'
import StepPage from '../../Utilities/StepPage'
import { getAllLists, handleAuthorize, handleInput } from './MoosendCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'
import { __ } from '../../../Utils/i18nwrap'

function MoosendAuthorization({
  moosendConf,
  setMoosendConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', authKey: '' })

  const nextPage = async () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setStep(2)
    setLoading({ ...loading, page: true })
    const data = await getAllLists(moosendConf, setMoosendConf)
    if (data) {
      setLoading({ ...loading, page: false })
    }
  }

  const note = `
  <h4>${__('Step of get API Key:', 'bit-integrations')}</h4>
  <ul>
    <li>${__('First login on account.', 'bit-integrations')}</li>
    <li>${__('Goto Settings and click on <b>API Key</b>', 'bit-integrations')}</li>
    <li>${__(
      'Copy the <b>API Key</b> and paste into <b>API Key</b> field of your authorization form.',
      'bit-integrations'
    )}</li>
    <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
</ul>
`

  return (
    <StepPage step={step} stepNo={1} style={{ width: 900, height: 'auto' }}>
            <TutorialLink linkKey="moosend" />

      <div className="mt-2">
        {/* Moosend Authorization */}

        <Input
          label={__('Integration Name', 'bit-integrations')}
          name="name"
          placeholder={__('Integration Name...', 'bit-integrations')}
          value={moosendConf.name}
          onchange={e => handleInput(e, moosendConf, setMoosendConf, error, setError)}
        />
        <Input
          label={__('API key', 'bit-integrations')}
          name="authKey"
          placeholder={__('API key...', 'bit-integrations')}
          value={moosendConf.authKey}
          onchange={e => handleInput(e, moosendConf, setMoosendConf, error, setError)}
        />
        <GetInfo
          url="https://moosend.com/"
          info={__('To get API key, please visit', 'bit-integrations')}
        />
        <ErrorField error={error.authKey} />
        {!isInfo && (
          <AuthorizeButton
            onclick={() => handleAuthorize(moosendConf, setError, setAuthorized, loading, setLoading)}
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

export default MoosendAuthorization
