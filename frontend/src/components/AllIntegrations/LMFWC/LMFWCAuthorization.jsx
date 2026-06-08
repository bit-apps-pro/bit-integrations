/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import TutorialLink from '../../Utilities/TutorialLink'
import { lmfwcAuthentication } from './LMFWCCommonFunc'

export default function LMFWCAuthorization({
  licenseManagerConf,
  setLicenseManagerConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
const [error, setError] = useState({ api_key: '', api_secret: '' })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (isAuthorized) {
      setStep(2)
    }
  }

  const handleInput = e => {
    const newConf = { ...licenseManagerConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setLicenseManagerConf(newConf)
  }

  const ActiveInstructions = `
            <b>${__('Requirements', 'bit-integrations')}</b>
            <p>${__('WordPress permalinks must be enabled at', 'bit-integrations')}: <b>${__(
              'Settings',
              'bit-integrations'
            )}</b> > <b>${__('Permalinks', 'bit-integrations')}</b></p>
            <h4>${__('To Get Consumer key & Consumer secret', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to "WooCommerce"', 'bit-integrations')}</li>
                <li>${__('Then go to "Settings" page', 'bit-integrations')}</li>
                <li>${__(
                  'Click on "License Manager " from right top corner menu',
                  'bit-integrations'
                )}</li>
                <li>${__('Then click "REST API" from the top sub menu', 'bit-integrations')}</li>
                <li>${__('Then click "Add key" button at the top of the page', 'bit-integrations')}</li>
                <li>${__('FIll the form & click "Generate API Key"', 'bit-integrations')}</li>
            </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="lmfwc" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={licenseManagerConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Homepage URL:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="baseUrl"
        value={licenseManagerConf.base_url}
        type="text"
        placeholder={__('Homepage URL...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.base_url}</div>

      <div className="mt-3">
        <b>{__('Consumer key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_key"
        value={licenseManagerConf.api_key}
        type="text"
        placeholder={__('Consumer key...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_key}</div>

      <div className="mt-3">
        <b>{__('Consumer secret:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_secret"
        value={licenseManagerConf.api_secret}
        type="text"
        placeholder={__('Consumer secret...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_secret}</div>
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              lmfwcAuthentication(
                licenseManagerConf,
                setLicenseManagerConf,
                setError,
                setIsAuthorized,
                loading,
                setLoading
              )
            }
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
      <Note note={ActiveInstructions} />
    </div>
  )
}
