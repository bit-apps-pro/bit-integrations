/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import CopyText from '../../Utilities/CopyText'
import Note from '../../Utilities/Note'
import { handleAuthorize } from './LionDeskCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'
export default function LionDeskAuthorization({
  lionDeskConf,
  setLionDeskConf,
  step,
  setStep,
  setSnackbar,
  isLoading,
  setIsLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ session_token: '' })
  const btcbi = useRecoilValue($appConfigState)
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    !lionDeskConf?.default
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...lionDeskConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setLionDeskConf(newConf)
  }

  const ActiveInstructions = `
            <h4>${__('Get the Redirect URI, Client Id and Client Secret', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your Lion Desk Developer Center Apps.', 'bit-integrations')}</li>
                <li>${__('Then Click "New App+" from Right in the middle', 'bit-integrations')}</li>
                <li>${__('Then input the "Name and Redirect URI" then save', 'bit-integrations')}</li>
                <li>${__(
                  'Then click "REVEAL CLIENT ID" and "REVEAL CLIENT SECRET", Then Copied',
                  'bit-integrations'
                )}</li>
            </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="lionDesk" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={lionDeskConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Authorized Redirect URIs:', 'bit-integrations')}</b>
      </div>
      <CopyText
        value={`${btcbi.api}/redirect`}
        setSnackbar={setSnackbar}
        className="field-key-cpy w-6 ml-0"
        readOnly={isInfo}
      />

      <div className="mt-3">
        <b>{__('Client id:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="clientId"
        value={lionDeskConf.clientId}
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
        value={lionDeskConf.clientSecret}
        type="text"
        placeholder={__('client Secret...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red' }}>{error.clientSecret}</div>

      <small className="d-blk mt-3">
        {__('To get Client ID and SECRET , Please Visit', 'bit-integrations')}
        &nbsp;
        <a
          className="btcd-link"
          href="http://developers.liondesk.com/account/apps"
          target="_blank"
          rel="noreferrer">
          {__('Lion Desk Apps', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              handleAuthorize(
                'lionDesk',
                'lionDesk',
                lionDeskConf,
                setLionDeskConf,
                setError,
                setIsAuthorized,
                setIsLoading,
                setSnackbar,
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
            className="btn ml-auto btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={!isAuthorized}>
            {__('Next', 'bit-integrations')}
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        </div>
      )}
      <Note note={ActiveInstructions} />
    </div>
  )
}
