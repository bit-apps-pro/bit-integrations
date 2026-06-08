/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import CopyText from '../../Utilities/CopyText'
import { getAllPCloudFolders, handleAuthorization } from './PCloudCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function PCloudAuthorization({
  flowID,
  pCloudConf,
  setPCloudConf,
  step,
  setStep,
  isLoading,
  setIsLoading,
  setSnackbar,
  redirectLocation,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ clientId: '', clientSecret: '' })
  const btcbi = useRecoilValue($appConfigState)
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    getAllPCloudFolders(pCloudConf, setPCloudConf, 'fetch')
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...pCloudConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setPCloudConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="pCloud" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={pCloudConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Authorized Redirect URIs:', 'bit-integrations')}</b>
      </div>
      <CopyText
        value={redirectLocation || `${btcbi.api}/redirect`}
        className="field-key-cpy w-6 ml-0"
        readOnly={isInfo}
        setSnackbar={setSnackbar}
      />

      <small className="d-blk mt-3">
        {__('To Get Client Id & Secret, Please Visit', 'bit-integrations')}
        &nbsp;
        <a
          className="btcd-link"
          href="https://docs.pcloud.com/my_apps/"
          target="_blank"
          rel="noreferrer">
          {__('pCloud API apps', 'bit-integrations')}
        </a>
      </small>

      <div className="mt-3">
        <b>{__('PCloud Client id:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="clientId"
        value={pCloudConf.clientId}
        type="text"
        placeholder={__('client ID...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red' }}>{error.clientId}</div>

      <div className="mt-3">
        <b>{__('PCloud Client Secret:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="clientSecret"
        value={pCloudConf.clientSecret}
        type="text"
        placeholder={__('client Secret...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red' }}>{error.clientSecret}</div>

      {!isInfo && (
        <>
          <button
            onClick={() =>
              handleAuthorization(
                pCloudConf,
                setPCloudConf,
                setIsAuthorized,
                setIsLoading,
                setError,
                btcbi
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
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={!isAuthorized}>
            {__('Next', 'bit-integrations')}
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        </>
      )}
    </div>
  )
}
