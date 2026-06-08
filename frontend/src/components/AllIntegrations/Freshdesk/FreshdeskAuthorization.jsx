import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import { getAllTicketFields, handleAuthorize } from './FreshdeskCommonFunc'
import Note from '../../Utilities/Note'
import TutorialLink from '../../Utilities/TutorialLink'

export default function FreshdeskAuthorization({
  formID,
  freshdeskConf,
  setFreshdeskConf,
  step,
  setstep,
  isLoading,
  setIsLoading,
  setSnackbar,
  redirectLocation,
  isInfo
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ api_key: '' })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    getAllTicketFields(freshdeskConf, setFreshdeskConf, setIsLoading, setSnackbar)
    setstep(2)
  }
  const handleInput = e => {
    const newConf = { ...freshdeskConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setFreshdeskConf(newConf)
  }

  const freshdeskInstructions = `
            <h4>${__('Locate Your App Domain', 'bit-integrations')}</h4>
            <ul>
                <li>${__('Access your Freshdesk account.', 'bit-integrations')}</li>
                <li>${__(
                  'Copy the URL displayed in your browser’s address bar',
                  'bit-integrations'
                )} (e.g., https://domain.freshdesk.com/)</li>
                <li>${__(
                  'Paste the copied App Domain into the designated “App Domain” field within the integrations you’re setting up.',
                  'bit-integrations'
                )}</li>
            </ul>
            <h4>${__('Retrieve Your App API Key', 'bit-integrations')}</h4>
            <ul>
                <li>${__(
                  'Within your Freshdesk account, click on your profile icon, situated in the top right corner.',
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'Select “Profile Settings” from the options that appear.',
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'Locate your App API key, prominently displayed on the top right side of the Profile Settings page.',
                  'bit-integrations'
                )}</li>
                <li>${__('Copy this key.', 'bit-integrations')}</li>
                <li>${__(
                  'Paste the copied App API key into the designated “App API key” field within the integrations you’re configuring.',
                  'bit-integrations'
                )}</li>
            </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{
        ...{ width: step === 1 && 900 },
        ...{ height: step === 1 && 'auto' }
      }}>
            <TutorialLink linkKey="freshdesk" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={freshdeskConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Your App Domain:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="app_domain"
        value={freshdeskConf.app_domain}
        type="text"
        placeholder={__('App Domain...', 'bit-integrations')}
        disabled={isInfo}
      />
      <small className="d-blk mt-2">{`${__(
        'App Domain Example',
        'bit-integrations'
      )}: https://domain.freshdesk.com`}</small>
      <div style={{ color: 'red' }}>{error.app_domain}</div>

      <div className="mt-3">
        <b>{__('App api key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_key"
        value={freshdeskConf.api_key}
        type="text"
        placeholder={__('Access Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <small className="d-blk mt-2">
        {__('To get access Token , Please Visit', 'bit-integrations')}{' '}
        <a
          className="btcd-link"
          href={`${
            freshdeskConf?.app_domain || 'https://domain.freshdesk.com'
          }/a/profiles/72009210017/edit`}
          target="_blank"
          rel="noreferrer">
          {__('FreshDesk Console', 'bit-integrations')}
        </a>
      </small>
      <div style={{ color: 'red' }}>{error.api_key}</div>

      {!isInfo && (
        <>
          <button
            onClick={() =>
              handleAuthorize(
                freshdeskConf,
                setFreshdeskConf,
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
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={!isAuthorized}>
            {__('Next', 'bit-integrations')}
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        </>
      )}

      <Note note={freshdeskInstructions} />
    </div>
  )
}
