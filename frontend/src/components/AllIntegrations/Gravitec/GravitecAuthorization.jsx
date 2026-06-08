/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { gravitecAuthentication } from './GravitecCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function GravitecAuthorization({
  gravitecConf,
  setGravitecConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ site_url: '', app_key: '', app_secret: '' })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    !gravitecConf?.default
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...gravitecConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setGravitecConf(newConf)
  }

  const ActiveInstructions = `
            <h4>${__('To Get App key & App Secret', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your Gravitec dashboard.', 'bit-integrations')}</li>
                <li>${__('Click go to your "YOUR SITES" from left SideBar', 'bit-integrations')}</li>
                <li>${__('Then click "Settings"', 'bit-integrations')}</li>
                <li>${__('Then Click "REST API"', 'bit-integrations')}</li>
            </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="gravitec" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={gravitecConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Site Url:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="site_url"
        value={gravitecConf.site_url}
        type="text"
        placeholder={__('Site Url...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.site_url}</div>

      <div className="mt-3">
        <b>{__('App key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="app_key"
        value={gravitecConf.app_key}
        type="text"
        placeholder={__('App key...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.app_key}</div>

      <div className="mt-3">
        <b>{__('App Secret:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="app_secret"
        value={gravitecConf.app_secret}
        type="text"
        placeholder={__('App Secret...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.app_secret}</div>

      <small className="d-blk mt-3">
        {__('To Get App key & App Secret, Please Visit', 'bit-integrations')}
        &nbsp;
        <a
          className="btcd-link"
          href="https://push.gravitec.net/push/1767754253528465408/settings/api"
          target="_blank">
          {__('Gravitec App key & Secret', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              gravitecAuthentication(
                gravitecConf,
                setGravitecConf,
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
      )}
      <Note note={ActiveInstructions} />
    </div>
  )
}
