import { useState } from 'react'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import AuthorizeButton from '../../Utilities/AuthorizeButton'
import ErrorField from '../../Utilities/ErrorField'
import GetInfo from '../../Utilities/GetInfo'
import Input from '../../Utilities/Input'
import Note from '../../Utilities/Note'
import StepPage from '../../Utilities/StepPage'
import { getAllDatabaseLists, handleAuthorize, handleInput } from './NotionCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'
import { __ } from '../../../Utils/i18nwrap'

function NotionAuthorization({ notionConf, setNotionConf, step, setStep, isInfo, loading, setLoading }) {
  const btcbi = useRecoilValue($appConfigState)
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState({ clientId: '', clientSecret: '' })
const nextPage = async () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setStep(2)
    setLoading({ ...loading, page: true })
    const data = await getAllDatabaseLists(notionConf, setNotionConf)
    if (data) {
      setLoading({ ...loading, page: false })
    }
  }

  const note = `
  <h4>${__('Step of get Client Id & Client Secret', 'bit-integrations')}</h4>
  <ul>
    <li>${__(
      'Goto',
      'bit-integrations'
    )}Goto <a href="https://www.notion.so/my-integrations" target='_blank'>My integrations.</a></li>
    <li>${__('Click new integration.', 'bit-integrations')}</li>
    <li>${__('Name to identify your integration to users.', 'bit-integrations')}</li>
    <li>${__(
      '<b>User Capabilities</b> always select read user information including email addresses',
      'bit-integrations'
    )}</li>
    <li><b>${__('Submit', 'bit-integrations')}</b></li>
    <li>${__('Select <b>Integration type</b> Public', 'bit-integrations')}</li>
    <li>${__('Fill up <b>OAuth Domain & URIs</b> information', 'bit-integrations')}</li>
    <li>${__('Homepage & Redirect URIs copy from Integration Settings', 'bit-integrations')}</li>
    <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
</ul>
`
  return (
    <StepPage step={step} stepNo={1} style={{ width: 900, height: 'auto' }}>
            <TutorialLink linkKey="notion" />

      <div className="mt-2">
        {/* Notion Authorization */}

        <Input
          label={__('Integration Name', 'bit-integrations')}
          name="name"
          placeholder={__('Integration Name...', 'bit-integrations')}
          value={notionConf.name}
          onchange={e => handleInput(e, notionConf, setNotionConf, error, setError)}
        />
        <Input label="Homepage" copytext={window.location.origin} setToast />
        <Input label="Redirect URIs" copytext={`${btcbi.api}/redirect`} setToast />
        <Input
          label={__('OAuth client ID', 'bit-integrations')}
          name="clientId"
          placeholder={__('client ID...', 'bit-integrations')}
          value={notionConf.clientId}
          onchange={e => handleInput(e, notionConf, setNotionConf, error, setError)}
        />
        <ErrorField error={error.clientId} />
        <Input
          label={__('OAuth client secret', 'bit-integrations')}
          name="clientSecret"
          placeholder={__('client Secret...', 'bit-integrations')}
          value={notionConf.clientSecret}
          onchange={e => handleInput(e, notionConf, setNotionConf, error, setError)}
        />
        <ErrorField error={error.clientSecret} />
        <GetInfo
          url="https://www.notion.so/my-integrations"
          info={__('Notion My integrations, please visit', 'bit-integrations')}
        />
        {!isInfo && (
          <AuthorizeButton
            onclick={() =>
              handleAuthorize(
                notionConf,
                setNotionConf,
                error,
                setError,
                setAuthorized,
                loading,
                setLoading,
                btcbi
              )
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

export default NotionAuthorization
