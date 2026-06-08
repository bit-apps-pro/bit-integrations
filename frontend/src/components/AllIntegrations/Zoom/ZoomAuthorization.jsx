import { useState } from 'react'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import CopyText from '../../Utilities/CopyText'
import Note from '../../Utilities/Note'
import { handleAuthorize, zoomAllMeeting } from './ZoomCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function ZoomAuthorization({
  formID,
  zoomConf,
  setZoomConf,
  step,
  setStep,
  isLoading,
  setIsLoading,
  setSnackbar,
  redirectLocation,
  isInfo
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ clientId: '', clientSecret: '' })
  const btcbi = useRecoilValue($appConfigState)
const handleInput = e => {
    const newConf = { ...zoomConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setZoomConf(newConf)
  }
  const nextPage = () => {
    zoomAllMeeting(formID, zoomConf, setZoomConf, setIsLoading, setSnackbar)
    setStep(2)
  }

  const ZoomInstructions = `<h4>${__('Pro or higher plan only .', 'bit-integrations')}</h4>
  <h4>${__('Client Id and Client Secret generate with OAuth .', 'bit-integrations')}</h4>
  <h4>${__('Scope:', 'bit-integrations')}</h4>
  <ul>
      <li>${__("User:<b>'user:master, user:read:admin, user:write:admin'</b> ", 'bit-integrations')}</li>
      <li>${__(
        "Meeting:<b>'meeting:master, meeting:read:admin, meeting:write:admin'</b> ",
        'bit-integrations'
      )}</li>
  </ul>
  <h4>${__("Redirect URIs add also in <b>'Add allow lists'</b>", 'bit-integrations')}</h4>
  <h4>${__('Zoom Settings :', 'bit-integrations')}</h4>
  <ul>
      <li>${__('Registration:<b>Required</b>', 'bit-integrations')}</li>
      <li>${__('Participant:<b>On</b>', 'bit-integrations')}</li>
  </ul>

  `
  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && `${100}%` } }}>
            <TutorialLink linkKey="zoomMeeting" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={zoomConf.name}
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
        value={redirectLocation || `${btcbi.api}/redirect`}
        className="field-key-cpy w-6 ml-0"
        readOnly={isInfo}
        setSnackbar={setSnackbar}
      />

      <small className="d-blk mt-5">
        {__('To get Client ID and SECRET , Please Visit', 'bit-integrations')}{' '}
        <a
          className="btcd-link"
          href="https://marketplace.zoom.us/develop/create"
          target="_blank"
          rel="noreferrer">
          {__('Get Zoom client id and secret', 'bit-integrations')}
        </a>
      </small>

      <div className="mt-3">
        <b>{__('Client id:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="clientId"
        value={zoomConf.clientId}
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
        value={zoomConf.clientSecret}
        type="text"
        placeholder={__('client Secret...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.clientSecret}</div>
      {!isInfo && (
        <>
          <button
            onClick={() =>
              handleAuthorize(
                zoomConf,
                setZoomConf,
                setError,
                setisAuthorized,
                setIsLoading,
                setSnackbar,
                btcbi
              )
            }
            className="btn btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={isAuthorized}>
            {isAuthorized ? __('Authorized ✔', 'bit-integrations') : __('Authorize', 'bit-integrations')}
            {isLoading && <LoaderSm size={20} clr="#022217" className="ml-2" />}
          </button>
          <br />
          <button
            onClick={() => nextPage(2)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={!isAuthorized}>
            {__('Next', 'bit-integrations')}
            <BackIcn className="ml-1 rev-icn" />
          </button>
        </>
      )}
      <Note note={ZoomInstructions} />
    </div>
  )
}
