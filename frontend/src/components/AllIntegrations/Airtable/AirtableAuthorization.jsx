/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import { airtableAuthentication } from './AirtableCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function AirtableAuthorization({
  airtableConf,
  setAirtableConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', auth_token: '' })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    !airtableConf?.default
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...airtableConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setAirtableConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="airtable" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={airtableConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div className="mt-3">
        <b>{__('Personal access token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="auth_token"
        value={airtableConf.auth_token}
        type="text"
        placeholder={__('API Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.auth_token}</div>
      <small className="d-blk mt-3">
        {__('To Get personal access token, Please Visit', 'bit-integrations')}
        &nbsp;
        <a
          className="btcd-link"
          href="https://airtable.com/create/tokens"
          target="_blank"
          rel="noreferrer">
          {__('Airtable Personal access tokens', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              airtableAuthentication(
                airtableConf,
                setAirtableConf,
                setError,
                setIsAuthorized,
                loading,
                setLoading,
                'authentication'
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
    </div>
  )
}
