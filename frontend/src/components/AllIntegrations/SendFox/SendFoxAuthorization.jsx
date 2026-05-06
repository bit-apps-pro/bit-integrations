import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import LoaderSm from '../../Loaders/LoaderSm'
import CopyText from '../../Utilities/CopyText'
import TutorialLink from '../../Utilities/TutorialLink'
import { handleAuthorize } from './SendFoxCommonFunc'

export default function SendFoxAuthorization({
  formID,
  sendFoxConf,
  setSendFoxConf,
  step,
  setstep,
  isLoading,
  setIsLoading,
  setSnackbar,
  redirectLocation,
  isInfo
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ dataCenter: '', clientId: '' })
  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setstep(2)
    // fetchAllList(sendFoxConf, setSendFoxConf, setIsLoading, setSnackbar)
  }

  const handleInput = e => {
    const newConf = { ...sendFoxConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setSendFoxConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
      <TutorialLink title="SendFox" links={tutorialLinks?.sendFox || {}} />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={sendFoxConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Authorized Redirect URIs:', 'bit-integrations')}</b>
      </div>
      <CopyText
        value={redirectLocation || `${window.location.href}`}
        className="field-key-cpy w-6 ml-0"
        readOnly={isInfo}
        setSnackbar={setSnackbar}
      />

      <div className="mt-3">
        <b>{__('Access Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="access_token"
        value={sendFoxConf.access_token}
        type="text"
        placeholder={__('Access Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.access_token}</div>

      <small className="d-blk mt-3">
        {__('To Get Client Auth token, Please Visit', 'bit-integrations')}
        &nbsp;
        <a
          className="btcd-link"
          href="https://sendfox.com/account/oauth"
          target="_blank"
          rel="noreferrer">
          {__('SendFox Access Token', 'bit-integrations')}
        </a>
      </small>

      {!isInfo && (
        <>
          <button
            onClick={() =>
              handleAuthorize(
                sendFoxConf,
                setSendFoxConf,
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
            {isLoading && <LoaderSm size={20} clr="#022217" className="ml-2" />}
          </button>
          <br />
          <button
            onClick={nextPage}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={!isAuthorized}>
            {__('Next', 'bit-integrations')}
            <BackIcn className="ml-1 rev-icn" />
          </button>
        </>
      )}
    </div>
  )
}
