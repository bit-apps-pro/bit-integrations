/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import TutorialLink from '../../Utilities/TutorialLink'
import { authorization } from './MailerLiteCommonFunc'

export default function MailerLiteAuthorization({
  mailerLiteConf,
  setMailerLiteConf,
  step,
  setstep,
  loading,
  setLoading,
  setSnackbar,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', auth_token: '' })
const url =
    mailerLiteConf.version === 'v2'
      ? 'https://dashboard.mailerlite.com/integrations/api'
      : 'https://app.mailerlite.com/integrations/api/'

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    !mailerLiteConf?.default
    setstep(2)
  }
  const handleInput = e => {
    const newConf = { ...mailerLiteConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setMailerLiteConf(newConf)
  }

  const note = `
    <h4>${__('Step of generate API token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Goto', 'bit-integrations')} <a href=${url}>Generate API Token</a></li>
      <li>${__(
        'Copy the <b>Token</b> and paste into <b>API Token</b> field of your authorization form.',
        'bit-integrations'
      )}</li>
      <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
  </ul>
  `

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="mailerLite" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={mailerLiteConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Select Version:')}</b>
      </div>
      <div className="flex items-center w-6 mt-3">
        <input
          id="MailerLiteClassic"
          type="radio"
          name="version"
          value="v1"
          className="hidden"
          checked={mailerLiteConf.version === 'v1'}
          onChange={handleInput}
        />
        <label for="MailerLiteClassic">
          <span className="w-4 h-4 inline-block mr-1 border border-grey" />
          MailerLite Classic
        </label>
      </div>

      <div className="flex items-center mr-4 mt-2 mb-4">
        <input
          id="MailerLiteNew"
          type="radio"
          name="version"
          value="v2"
          className="hidden"
          checked={mailerLiteConf.version === 'v2'}
          onChange={handleInput}
        />
        <label for="MailerLiteNew">
          <span className="w-4 h-4 inline-block mr-1 border border-grey" />
          MailerLite New
        </label>
      </div>

      <div className="mt-3">
        <b>{__('API Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="auth_token"
        value={mailerLiteConf.auth_token}
        type="text"
        placeholder={__('API Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.auth_token}</div>

      <small className="d-blk mt-3">
        {__('To Get API Token, Please Visit', 'bit-integrations')}
        &nbsp;
        <a className="btcd-link" href={url} target="_blank" rel="noreferrer">
          {__('MailerLite API Token', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() => authorization(mailerLiteConf, setIsAuthorized, loading, setLoading)}
            className="btn btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={
              isAuthorized ||
              loading.auth ||
              mailerLiteConf.version === undefined ||
              mailerLiteConf.version === ''
            }>
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
      )}
      <Note note={note} />
    </div>
  )
}
