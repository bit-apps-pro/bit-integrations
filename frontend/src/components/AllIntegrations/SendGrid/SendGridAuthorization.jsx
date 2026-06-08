/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import { sendGridAuthentication } from './SendGridCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function SendGridAuthorization({
  sendGridConf,
  setSendGridConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', secretKey: '' })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    !sendGridConf?.default
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...sendGridConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setSendGridConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="sendGrid" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={sendGridConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('API Key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="apiKey"
        value={sendGridConf.apiKey}
        type="text"
        placeholder={__('Your Api Key', 'bit-integrations')}
        disabled={isInfo}
      />
      <div className="mt-3" style={{ color: 'red', fontSize: '15px' }}>
        {error.apiKey}
      </div>
      <small className="d-blk mt-3">
        {__('To Get API key & Secret Key, Please Visit', 'bit-integrations')}
        &nbsp;
        <a
          className="btcd-link"
          href="https://app.sendgrid.com/settings/api_keys"
          target="_blank"
          rel="noreferrer">
          {__('SendGrid API Token', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              sendGridAuthentication(
                sendGridConf,
                setSendGridConf,
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
