/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import { handleAuthorize } from './TwilioCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function TwilioAuthorization({
  twilioConf,
  setTwilioConf,
  step,
  setstep,
  isLoading,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ username: '', password: '' })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setstep(2)
  }
  const handleInput = e => {
    const newConf = { ...twilioConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setTwilioConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="twilio" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={twilioConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Account SID:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="sid"
        value={twilioConf.sid}
        type="text"
        placeholder={__('Account SID...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red' }}>{error.sid}</div>

      <small className="d-blk mt-5">
        {__('To get Account SID and Auth Token , Please Visit', 'bit-integrations')}{' '}
        <a className="btcd-link" href="https://console.twilio.com/" target="_blank" rel="noreferrer">
          {__('Twilio Console', 'bit-integrations')}
        </a>
      </small>

      <div className="mt-3">
        <b>{__('Auth Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="token"
        value={twilioConf.token}
        type="text"
        placeholder={__('Auth Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red' }}>{error.token}</div>

      <div className="mt-3">
        <b>{__('From:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="from_num"
        value={twilioConf.from_num}
        type="text"
        placeholder={__('Phone Number...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red' }}>{error.from_num}</div>

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              handleAuthorize(
                twilioConf,
                setTwilioConf,
                setError,
                setisAuthorized,
                setIsLoading,
                setSnackbar
              )
            }
            className="btn btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={isAuthorized || isLoading}>
            {isAuthorized ? __('Authorized ✔', 'bit-integrations') : __('Authorize', 'bit-integrations')}
            {isLoading && <LoaderSm size="20" clr="#022217" className="ml-2" />}
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
