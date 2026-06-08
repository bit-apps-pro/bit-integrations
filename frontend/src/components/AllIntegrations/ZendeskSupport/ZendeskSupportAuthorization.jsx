/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import TutorialLink from '../../Utilities/TutorialLink'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Note from '../../Utilities/Note'
import { zendeskSupportAuthorize } from './ZendeskSupportCommonFunc'

export default function ZendeskSupportAuthorization({
  zendeskSupportConf,
  setZendeskSupportConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ subdomain: '', email: '', apiToken: '' })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...zendeskSupportConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setZendeskSupportConf(newConf)
  }


  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
      <TutorialLink title="Zendesk Support" links={tutorialLinks?.zendeskSupport || {}} />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={zendeskSupportConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Subdomain:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="subdomain"
        value={zendeskSupportConf.subdomain}
        type="text"
        placeholder={__('your-subdomain', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.subdomain}</div>

      <div className="mt-3">
        <b>{__('Email:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="email"
        value={zendeskSupportConf.email}
        type="text"
        placeholder={__('agent@example.com', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.email}</div>

      <div className="mt-3">
        <b>{__('API Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="apiToken"
        value={zendeskSupportConf.apiToken}
        type="text"
        placeholder={__('API Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.apiToken}</div>

      <small className="d-blk mt-3">
        {__('Enable token access and create a token at', 'bit-integrations')}
        &nbsp;
        <a
          className="btcd-link"
          href={`https://${zendeskSupportConf?.subdomain ?? '#'}.zendesk.com/admin/apps-integrations/apis/api-tokens`}
          target="_blank"
          rel="noreferrer">
          {__('Zendesk API Settings', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {
        !isInfo && (
          <div>
            <button
              onClick={() =>
                zendeskSupportAuthorize(
                  zendeskSupportConf,
                  setZendeskSupportConf,
                  setError,
                  setIsAuthorized,
                  loading,
                  setLoading
                )
              }
              className="btn btcd-btn-lg purple sh-sm flx"
              type="button"
              disabled={isAuthorized || loading.auth}>
              {isAuthorized ? __('Authorized ✔', 'bit-integrations') : __('Authorize', 'bit-integrations')}
              {loading.auth && <LoaderSm size="20" clr="#022217" className="ml-2" />}
            </button>
            <br />
            <button
              onClick={nextPage}
              className="btn ml-auto btcd-btn-lg purple sh-sm flx"
              type="button"
              disabled={!isAuthorized}>
              {__('Next', 'bit-integrations')}
              <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
            </button>
          </div>
        )
      }
      <Note note={note} />
    </div >
  )
}


const note = `
    <h4>${__('How to connect Zendesk Support:', 'bit-integrations')}</h4>
    <ul>
      <li>${__(
  'Your <b>Subdomain</b> is the part before <b>.zendesk.com</b> in your account URL. Example: for <b>https://acme.zendesk.com</b> the subdomain is <b>acme</b>.',
  'bit-integrations'
)}</li>
      <li>${__(
  'Use the <b>Email</b> of an agent/admin account that has API access.',
  'bit-integrations'
)}</li>
      <li>${__(
  'In Zendesk, go to <b>Admin Center → Apps and integrations → APIs → Zendesk API</b> and enable <b>Token access</b>, then click <b>Add API token</b>.',
  'bit-integrations'
)}</li>
      <li>${__(
  'Copy the generated token and paste it into the <b>API Token</b> field below.',
  'bit-integrations'
)}</li>
      <li>${__('Finally, click the <b>Authorize</b> button.', 'bit-integrations')}</li>
    </ul>
  `