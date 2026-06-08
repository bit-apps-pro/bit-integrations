/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import TutorialLink from '../../Utilities/TutorialLink'
import { bentoAuthentication } from './BentoCommonFunc'

export default function BentoAuthorization({
  bentoConf,
  setBentoConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
const [error, setError] = useState({ publishable_key: '', secret_key: '' })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    !bentoConf?.default
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...bentoConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setBentoConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="bento" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={bentoConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Publishable Key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="publishable_key"
        value={bentoConf.publishable_key}
        type="text"
        placeholder={__('Publishable Key...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.publishable_key}</div>

      <div className="mt-3">
        <b>{__('Secret Key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="secret_key"
        value={bentoConf.secret_key}
        type="text"
        placeholder={__('Secret Key...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.secret_key}</div>

      <div className="mt-3">
        <b>{__('Site UUID:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="site_uuid"
        value={bentoConf.site_uuid}
        type="text"
        placeholder={__('Site UUID...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.site_uuid}</div>

      <small className="d-blk mt-3">
        {__('To Get Publishable Key, Secret Key & Site UUID, Please Visit', 'bit-integrations')}
        &nbsp;
        <a className="btcd-link" href="https://app.bentonow.com/account/teams" target="_blank">
          {__('Bento team dashboard', 'bit-integrations')}
        </a>
      </small>
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              bentoAuthentication(bentoConf, setError, setIsAuthorized, loading, setLoading)
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

const note = `
            <h4>${__('To Get Publishable Key, Secret Key & Site UUID', 'bit-integrations')}</h4>
            <ul>
                <li>${__('Navigate to the Bento team dashboard,.', 'bit-integrations')}</li>
                <li>${__('go to "Settings" and then "API Keys"', 'bit-integrations')}</li>
                <li>${__(
                  "where you'll find your Publishable Key, Secret Key & Site UUID",
                  'bit-integrations'
                )}</li>
            </ul>`
