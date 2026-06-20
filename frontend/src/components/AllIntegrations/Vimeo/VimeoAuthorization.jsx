import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { authorization, handleInput } from './VimeoCommonFunc'

export default function VimeoAuthorization({
  vimeoConf,
  setVimeoConf,
  step,
  setstep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)

  const url = 'https://developer.vimeo.com/apps'

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setstep(2)
  }

  const note = `
    <h4>${__('Steps to generate an Access Token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Go to', 'bit-integrations')} <a href="${url}" target="_blank" rel="noreferrer">Vimeo Developer Apps</a> ${__('and open (or create) an app.', 'bit-integrations')}</li>
      <li>${__('Generate a Personal Access Token with the scopes you need (public, private, create, edit, delete, interact, upload).', 'bit-integrations')}</li>
      <li>${__('Copy the token and paste it into the <b>Access Token</b> field, then click <b>Authorize</b>.', 'bit-integrations')}</li>
    </ul>
  `

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={e => handleInput(e, vimeoConf, setVimeoConf)}
        name="name"
        value={vimeoConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Access Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={e => handleInput(e, vimeoConf, setVimeoConf)}
        name="token"
        value={vimeoConf.token}
        type="text"
        placeholder={__('Access Token...', 'bit-integrations')}
        disabled={isInfo}
      />

      <small className="d-blk mt-3">
        {__('To get an Access Token, please visit', 'bit-integrations')}
        &nbsp;
        <a className="btcd-link" href={url} target="_blank" rel="noreferrer">
          {__('Vimeo Developer Apps', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() => authorization(vimeoConf, setIsAuthorized, loading, setLoading)}
            className="btn btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={isAuthorized || loading.auth || !vimeoConf.token}>
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
