import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import CopyText from '../../Utilities/CopyText'
import { handleMauticAuthorize, getAllFields } from './MauticCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'
export default function MauticAuthorization({
  mauticConf,
  setMauticConf,
  step,
  setstep,
  isLoading,
  setIsLoading,
  setSnackbar,
  redirectLocation,
  isInfo
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ baseUrl: '', clientId: '', clientSecret: '' })
  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setstep(2)
    getAllFields(mauticConf, setMauticConf, setIsLoading, setSnackbar)
  }

  const handleInput = e => {
    const newConf = { ...mauticConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setMauticConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="mautic" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={mauticConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Homepage URL:', 'bit-integrations')}</b>
      </div>
      <CopyText
        value={`${window.location.origin}`}
        className="field-key-cpy w-6 ml-0"
        readOnly={isInfo}
        setSnackbar={setSnackbar}
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

      <small className="d-blk mt-5">
        {__('To get Client ID and SECRET , Please Visit', 'bit-integrations')}{' '}
        <a
          className="btcd-link"
          href={`${mauticConf.baseUrl}/s/credentials/s/credentials`}
          target="_blank"
          rel="noreferrer">
          {__('Mautic API Console', 'bit-integrations')}
        </a>
      </small>

      <div className="mt-3">
        <b>{__('Mautic Base URL:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="baseUrl"
        value={mauticConf.baseUrl}
        type="text"
        placeholder={__('User Name...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red' }}>{error.baseUrl}</div>

      <small className="d-blk mt-3">
        {__('Example: https://mautic.bit-integration.pro', 'bit-integrations')}
      </small>

      <div className="mt-3">
        <b>{__('Client id:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="clientId"
        value={mauticConf.clientId}
        type="text"
        placeholder={__('client ID...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.clientId}</div>

      <div className="mt-3">
        <b>{__('Client secret:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="clientSecret"
        value={mauticConf.clientSecret}
        type="text"
        placeholder={__('client Secret...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.clientSecret}</div>

      {!isInfo && (
        <>
          <button
            onClick={() =>
              handleMauticAuthorize(
                'mautic',
                mauticConf,
                setMauticConf,
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
