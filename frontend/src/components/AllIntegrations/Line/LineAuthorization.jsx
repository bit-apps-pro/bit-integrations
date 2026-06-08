import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import { handleAuthorize } from './LineCommonFunc'
import Note from '../../Utilities/Note'
import TutorialLink from '../../Utilities/TutorialLink'

export default function LineAuthorization({
  formID,
  lineConf,
  setLineConf,
  step,
  setstep,
  isLoading,
  setIsLoading,
  setSnackbar,
  redirectLocation,
  isInfo
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ accessToken: '' })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setstep(2)
  }

  const handleInput = e => {
    const newConf = { ...lineConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setLineConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{
        ...{ width: step === 1 && 900 },
        ...{ height: step === 1 && 'auto' }
      }}>
            <TutorialLink linkKey="line" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={lineConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <small className="d-blk mt-5">
        {__('To get access Token , Please Visit', 'bit-integrations')}{' '}
        <a
          className="btcd-link"
          href="https://developers.line.biz/console/"
          target="_blank"
          rel="noreferrer">
          {__('Line Console', 'bit-integrations')}
        </a>
      </small>

      <div className="mt-3">
        <b>{__('Access Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="accessToken"
        value={lineConf.accessToken}
        type="text"
        placeholder={__('Access Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red' }}>{error.accessToken}</div>

      {!isInfo && (
        <>
          <button
            onClick={() =>
              handleAuthorize(
                lineConf,
                setLineConf,
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

      <Note note={lineAccessTokenNote} />
    </div>
  )
}

const lineAccessTokenNote = `<h2>${__('To get your Line access token:', 'bit-integrations')}</h2>
     <ul>
         <li>${__(
           'Log in to the <a href="https://developers.line.biz/console/" target="_blank">Line Developers Console</a>.',
           'bit-integrations'
         )}</li>
         <li>${__(
           'Go to your provider and select the channel you want to use.',
           'bit-integrations'
         )}</li>
         <li>${__('Navigate to the "Messaging API" tab.', 'bit-integrations')}</li>
         <li>${__(
           'Scroll down to the "Channel access token (long-lived)" section.',
           'bit-integrations'
         )}</li>
         <li>${__('Click the "issue" button to generate a new token.', 'bit-integrations')}</li>
         <li>${__('Copy the generated token — this is your Line access token.', 'bit-integrations')}</li>
     </ul>`
