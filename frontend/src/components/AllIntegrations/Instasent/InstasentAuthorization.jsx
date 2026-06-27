import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import TutorialLink from '../../Utilities/TutorialLink'
import { authorization } from './InstasentCommonFunc'

export default function InstasentAuthorization({
  instasentConf,
  setInstasentConf,
  step,
  setstep,
  loading,
  setLoading,
  setSnackbar,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', auth_token: '' })
  const url = 'https://app.instasent.com/'

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setstep(2)
  }

  const handleInput = e => {
    const newConf = { ...instasentConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setInstasentConf(newConf)
  }

  const note = `
    <h4>${__('Step of generate API token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Goto', 'bit-integrations')} <a href=${url}>Instasent Dashboard</a></li>
      <li>${__(
        'Copy the <b>API Token</b> and paste into <b>API Token</b> field of your authorization form.',
        'bit-integrations'
      )}</li>
      <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
  </ul>
  `

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
      <TutorialLink linkKey="instasent" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={instasentConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('API Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="auth_token"
        value={instasentConf.auth_token}
        type="text"
        placeholder={__('API Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.auth_token}</div>

      <small className="d-blk mt-3">
        {__('To Get API Token, Please Visit', 'bit-integrations')}
        &nbsp;
        <a className="btcd-link" href={url} target="_blank" rel="noreferrer">
          {__('Instasent Dashboard', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() => authorization(instasentConf, setIsAuthorized, loading, setLoading)}
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
      )}
      <Note note={note} />
    </div>
  )
}
