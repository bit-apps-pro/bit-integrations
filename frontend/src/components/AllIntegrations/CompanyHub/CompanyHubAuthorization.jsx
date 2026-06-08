/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { companyHubAuthentication } from './CompanyHubCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function CompanyHubAuthorization({
  companyHubConf,
  setCompanyHubConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ sub_domain: '', api_key: '' })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    !companyHubConf?.default
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...companyHubConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setCompanyHubConf(newConf)
  }

  const ActiveInstructions = `
            <h4>${__('To Get Public Id & Secret Key', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your CompanyHub dashboard.', 'bit-integrations')}</li>
                <li>${__('Click go to "Settings" from Left Bottom corner', 'bit-integrations')}</li>
                <li>${__('Then Click "Integrations"', 'bit-integrations')}</li>
                <li>${__('Then Click "Generate Api key"', 'bit-integrations')}</li>
                <li>${__('Then copy "API Authorization Credentials"', 'bit-integrations')}</li>
            </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="companyHub" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={companyHubConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Sub Domain:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="sub_domain"
        value={companyHubConf.sub_domain}
        type="text"
        placeholder={__('Sub Domain...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.sub_domain}</div>

      <div className="mt-3">
        <b>{__('API Key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_key"
        value={companyHubConf.api_key}
        type="text"
        placeholder={__('API Key...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_key}</div>

      <small className="d-blk mt-3">
        {__('To Get Sub Domain & API Key, Please Visit', 'bit-integrations')}
        &nbsp;
        <a className="btcd-link" href="https://app.companyhub.com/settings/integration" target="_blank">
          {__('CompanyHub Sub Domain & API Key', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              companyHubAuthentication(
                companyHubConf,
                setCompanyHubConf,
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
