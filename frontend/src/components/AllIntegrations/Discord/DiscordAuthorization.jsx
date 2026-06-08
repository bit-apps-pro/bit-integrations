import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import { getAllServers, handleAuthorize } from './DiscordCommonFunc'
import Note from '../../Utilities/Note'
import TutorialLink from '../../Utilities/TutorialLink'

export default function DiscordAuthorization({
  formID,
  discordConf,
  setDiscordConf,
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
    getAllServers(discordConf, setDiscordConf, setIsLoading)
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setstep(2)
  }
  const handleInput = e => {
    const newConf = { ...discordConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setDiscordConf(newConf)
  }

  const discordInstructions = `
            <h4>${__('Get Access Token few step', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First create app.', 'bit-integrations')}</li>
                <li>${__('Click on OAuth2.', 'bit-integrations')}</li>
                <li>${__('Select <b>bot</b> from scopes.', 'bit-integrations')}</li>
                <li>${__('Select permissions from <b>Bot Permissions</b>.', 'bit-integrations')}</li>
                <li>${__(
                  'Then copy the <b>generated url</b> and paste it in the browser and hit enter.',
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'Then click on <b>Bot</b>  from left navbar and copy the <b>Access token</b>.',
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
            <TutorialLink linkKey="discord" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={discordConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <small className="d-blk mt-5">
        {__('To get access Token , Please Visit', 'bit-integrations')}{' '}
        <a
          className="btcd-link"
          href="https://discord.com/developers/applications"
          target="_blank"
          rel="noreferrer">
          {__('Discord Console', 'bit-integrations')}
        </a>
      </small>

      <div className="mt-3">
        <b>{__('Access Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="accessToken"
        value={discordConf.accessToken}
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
                discordConf,
                setDiscordConf,
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

      <Note note={discordInstructions} />
    </div>
  )
}
