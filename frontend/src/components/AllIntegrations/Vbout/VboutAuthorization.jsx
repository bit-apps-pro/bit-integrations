/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { handleAuthorize } from './VboutCommonFunc'
import { getAllLists } from './VboutCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function VboutAuthorization({
  vboutConf,
  setVboutConf,
  step,
  setstep,
  loading,
  setLoading,
  setSnackbar,
  isInfo
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', auth_token: '' })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    !vboutConf?.default
    setstep(2)
    if (!vboutConf.list_id) {
      getAllLists(vboutConf, setVboutConf, loading, setLoading)
    }
  }
  const handleInput = e => {
    const newConf = { ...vboutConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setVboutConf(newConf)
  }
  const note = `
    <h4>${__('Step of get API Key:', 'bit-integrations')}</h4>
    <ul>
      <li>${__(
        'Goto Settings and click on',
        'bit-integrations'
      )} <a href="https://app.vbout.com/Settings">${__('API Integrations', 'bit-integrations')}</a></li>
      <li>${__(
        'Copy the <b>Key</b> and paste into <b>API Key</b> field of your authorization form.',
        'bit-integrations'
      )}</li>
      <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
  </ul>
  `

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="vbout" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={vboutConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <small className="d-blk mt-3">
        {__('To get API key, please visit', 'bit-integrations')}
        &nbsp;
        <a className="btcd-link" href="https://app.vbout.com/Settings" target="_blank" rel="noreferrer">
          {__('Vbout API Key', 'bit-integrations')}
        </a>
      </small>

      <div className="mt-3">
        <b>{__('API Key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="auth_token"
        value={vboutConf.auth_token}
        type="text"
        placeholder={__('API Key...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.auth_token}</div>

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              handleAuthorize(
                vboutConf,
                setVboutConf,
                setError,
                setisAuthorized,
                loading,
                setLoading,
                setSnackbar
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
      )}
      <Note note={note} />
    </div>
  )
}
