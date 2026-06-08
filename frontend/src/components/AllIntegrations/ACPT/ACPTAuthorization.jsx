/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useCallback, useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import TutorialLink from '../../Utilities/TutorialLink'
import { acptAuthentication } from './ACPTCommonFunc'

export default function ACPTAuthorization({
  acptConf,
  setAcptConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ api_key: '', api_secret: '' })
const handleInput = useCallback(e => {
    const { name, value } = e.target

    setAcptConf(prev => ({
      ...prev,
      [name]: value
    }))

    setError(prev => ({
      ...prev,
      [name]: ''
    }))
  }, [])

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (isAuthorized) {
      setStep(2)
    }
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="acpt" />

      <div>
        <div className="mt-3">
          <b>{__('Integration Name:', 'bit-integrations')}</b>
        </div>
        <input
          className="btcd-paper-inp w-6 mt-1"
          onChange={handleInput}
          name="name"
          value={acptConf?.name ?? ''}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
          disabled={isInfo}
        />
        <div style={{ color: 'red', fontSize: '15px' }}>{error.name}</div>
      </div>
      <div>
        <div className="mt-3">
          <b>{__('Homepage URL:', 'bit-integrations')}</b>
        </div>
        <input
          className="btcd-paper-inp w-6 mt-1"
          onChange={handleInput}
          name="base_url"
          value={acptConf?.base_url ?? ''}
          type="text"
          placeholder={__('Homepage URL...', 'bit-integrations')}
          disabled={isInfo}
        />
        <div style={{ color: 'red', fontSize: '15px' }}>{error.base_url}</div>
      </div>
      <div>
        <div className="mt-3">
          <b>{__('Api Key-Secret:', 'bit-integrations')}</b>
        </div>
        <input
          className="btcd-paper-inp w-6 mt-1"
          onChange={handleInput}
          name="api_key"
          value={acptConf?.api_key ?? ''}
          type="text"
          placeholder={__('Api Key-Secret:', 'bit-integrations')}
          disabled={isInfo}
        />
        <div style={{ color: 'red', fontSize: '15px' }}>{error.api_key}</div>
      </div>

      {!isInfo && (
        <div>
          <button
            onClick={() => acptAuthentication(acptConf, setError, setIsAuthorized, loading, setLoading)}
            className="btn btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={isAuthorized || loading.auth}>
            {isAuthorized ? __('Authorized ✔', 'bit-integrations') : __('Authorize', 'bit-integrations')}
            {loading.auth && <LoaderSm size="20" clr="#022217" className="ml-2" />}
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

      <Note note={note} />
    </div>
  )
}

const note = `
            <b>${__('Please note', 'bit-integrations')}</b>
            <p>${__(
              'The secret key will no longer be displayed, so please take note of it. Eventually, you can regenerate your API keys.',
              'bit-integrations'
            )}</p>
            <h4>${__('To Get Api Key-secret', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to "ACPT" dashboard', 'bit-integrations')}</li>
                <li>${__('Then go to "Tools" from menu', 'bit-integrations')}</li>
                <li>${__('Click on "Go to API dashboard" from tools', 'bit-integrations')}</li>
                <li>${__('Then click "REST API" from the top sub menu', 'bit-integrations')}</li>
                <li>${__(
                  'Then If you don’t have one API key click on the "Generate API key" button.',
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'The API "key-secret" pair will be displayed in a popup.',
                  'bit-integrations'
                )}</li>
            </ul>`
