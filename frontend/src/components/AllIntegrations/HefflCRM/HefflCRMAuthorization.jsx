import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { handleAuthorize } from './HefflCRMCommonFunc'

export default function HefflCRMAuthorization({
  hefflCRMConf,
  setHefflCRMConf,
  step,
  setStep,
  isLoading,
  setIsLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', api_key: '' })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...hefflCRMConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setHefflCRMConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{
        ...{ width: step === 1 && 900 },
        ...{ height: step === 1 && 'auto' }
      }}>
      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={hefflCRMConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('API Key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_key"
        value={hefflCRMConf.api_key || ''}
        type="text"
        placeholder={__('Heffl CRM API Key...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_key}</div>

      <br />
      {!isInfo && (
        <div>
          <button
            onClick={() => handleAuthorize(hefflCRMConf, setError, setIsAuthorized, setIsLoading)}
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
            <BackIcn className="ml-1 rev-icn" />
          </button>
        </div>
      )}
      <Note note={note} />
    </div>
  )
}

const note = `
    <h4>${__('Steps to generate API Key:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Log in to your Heffl CRM account.', 'bit-integrations')}</li>
      <li>${__(
        'Go to Settings → Developers / API Keys and generate a new key.',
        'bit-integrations'
      )}</li>
      <li>${__(
        'Copy the API key and paste it into the field above, then click Authorize.',
        'bit-integrations'
      )}</li>
    </ul>
  `
