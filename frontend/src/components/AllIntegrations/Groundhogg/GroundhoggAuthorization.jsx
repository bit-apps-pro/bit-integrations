import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import CopyText from '../../Utilities/CopyText'
import Note from '../../Utilities/Note'
import { handleAuthorize, fetchAllTags } from './GroundhoggCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function GroundhoggAuthorization({
  formID,
  groundhoggConf,
  setGroundhoggConf,
  step,
  setstep,
  isLoading,
  setIsLoading,
  setSnackbar,
  redirectLocation,
  isInfo
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ token: '', public_key: '', domainName: '' })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setstep(2)
    fetchAllTags(formID, groundhoggConf, setGroundhoggConf, setIsLoading, setSnackbar)
  }

  const handleInput = e => {
    const newConf = { ...groundhoggConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setGroundhoggConf(newConf)
  }

  const groundhoggInstructions = `
            <h4>${__('Get Public Key and Token few step', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First install Groundhogg.', 'bit-integrations')}</li>
                <li>${__('Go to <b> "Setting -> Api" </b>.', 'bit-integrations')}</li>
            </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="groundhogg" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={groundhoggConf.name}
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
        value={groundhoggConf.domainName}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled="true"
      />

      <div className="mt-3">
        <b>{__('Public Key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="public_key"
        value={groundhoggConf.public_key}
        type="text"
        placeholder={__('Public Key...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div className="mt-3">
        <b>{__('Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="token"
        value={groundhoggConf.token}
        type="text"
        placeholder={__('Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_key}</div>

      <div style={{ color: 'red', fontSize: '15px' }}>{error.clientSecret}</div>
      {!isInfo && (
        <>
          <button
            onClick={() =>
              handleAuthorize(
                groundhoggConf,
                setGroundhoggConf,
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
      <Note note={groundhoggInstructions} />
    </div>
  )
}
