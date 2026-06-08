import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import CopyText from '../../Utilities/CopyText'
import { handleAuthorize } from './SalesforceCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'
import { $appConfigState } from '../../../GlobalStates'
import { useRecoilValue } from 'recoil'

export default function SalesforceAuthorization({
  formID,
  salesforceConf,
  setSalesforceConf,
  step,
  setStep,
  isLoading,
  setIsLoading,
  setSnackbar,
  redirectLocation,
  isInfo
}) {
  const btcbi = useRecoilValue($appConfigState)
  const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({
    dataCenter: '',
    clientId: '',
    clientSecret: ''
  })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...salesforceConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setSalesforceConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{
        ...{ width: step === 1 && 900 },
        ...{ height: step === 1 && 'auto' }
      }}>
            <TutorialLink linkKey="salesforce" />

      <div className="wdt-200 d-in-b mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <br />
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={salesforceConf.name}
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
        setSnackbar={setSnackbar}
        readOnly={isInfo}
      />

      <div className="mt-3">
        <b>{__('Authorized Redirect URIs:', 'bit-integrations')}</b>
      </div>
      <CopyText
        value={redirectLocation || `${btcbi.api}/redirect`}
        className="field-key-cpy w-6 ml-0"
        setSnackbar={setSnackbar}
        readOnly={isInfo}
      />

      <div className="mt-3">
        <b>{__('Client id:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="clientId"
        value={salesforceConf.clientId}
        type="text"
        placeholder={__('client ID...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red' }}>{error.clientId}</div>

      <div className="mt-3">
        <b>{__('Client secret:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="clientSecret"
        value={salesforceConf.clientSecret}
        type="text"
        placeholder={__('client Secret...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red' }}>{error.clientSecret}</div>

      {!isInfo && (
        <>
          <button
            onClick={() =>
              handleAuthorize(
                salesforceConf,
                setSalesforceConf,
                setError,
                setisAuthorized,
                setIsLoading,
                setSnackbar,
                btcbi
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
