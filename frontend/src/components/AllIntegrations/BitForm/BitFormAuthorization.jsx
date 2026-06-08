import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import CopyText from '../../Utilities/CopyText'
import { fetchAllForm, handleAuthorize } from './BitFormCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function BitFormAuthorization({
  formID,
  bitFormConf,
  setBitFormConf,
  step,
  setstep,
  isLoading,
  setIsLoading,
  setSnackbar,
  redirectLocation,
  isInfo
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
const [error, setError] = useState({ dataCenter: '', api_key: '' })
  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setstep(2)
    fetchAllForm(bitFormConf, setBitFormConf, setIsLoading, setSnackbar)
  }

  const handleInput = e => {
    const newConf = { ...bitFormConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setBitFormConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="bitForm" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={bitFormConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Your Domain Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="domainName"
        value={bitFormConf.domainName}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Client id:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_key"
        value={bitFormConf.api_key}
        type="text"
        placeholder={__('client ID...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_key}</div>

      <div style={{ color: 'red', fontSize: '15px' }}>{error.clientSecret}</div>
      {!isInfo && (
        <>
          <button
            onClick={() =>
              handleAuthorize(
                bitFormConf,
                setBitFormConf,
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
