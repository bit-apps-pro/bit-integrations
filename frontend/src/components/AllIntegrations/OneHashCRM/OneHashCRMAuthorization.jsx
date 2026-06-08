/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { oneHashCRMAuthentication } from './OneHashCRMCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function OneHashCRMAuthorization({
  oneHashCRMConf,
  setOneHashCRMConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ api_token: '' })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    !oneHashCRMConf?.default
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...oneHashCRMConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setOneHashCRMConf(newConf)
  }

  const handleApiTokenLink = () => {
    oneHashCRMConf.domain
      ? window.open(`${oneHashCRMConf.domain}/app/user`, '_blank', 'noreferrer')
      : toast.error(__('Access API URL is required!', 'bit-integrations'))
  }

  const ActiveInstructions = `
            <h4>${__('Get API Token', 'bit-integrations')}</h4>
            <ul>
                <li>${__(
                  "Go to your OneHash CRM's user dashboard and click the profile buttom from Right top corner",
                  'bit-integrations'
                )}</li>
                <li>${__('Then select "My Settings"', 'bit-integrations')}</li>
                <li>${__('Then go to "API Access → Generates Keys"', 'bit-integrations')}</li>
            </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="oneHashCRM" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={oneHashCRMConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Access API URL:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="domain"
        value={oneHashCRMConf.domain}
        type="text"
        placeholder={__('Access API URL...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.domain}</div>

      <div className="mt-3">
        <b>{__('API Key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_key"
        value={oneHashCRMConf.api_key}
        type="text"
        placeholder={__('API Key...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_key}</div>

      <div className="mt-3">
        <b>{__('API Secret:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_secret"
        value={oneHashCRMConf.api_secret}
        type="text"
        placeholder={__('API Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_secret}</div>

      <small className="d-blk mt-3">
        {__('To Get API Key & API Secret, Please Visit', 'bit-integrations')}
        &nbsp;
        <a className="btcd-link" onClick={handleApiTokenLink}>
          {__('OneHashCRM API Key & API Secret', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              oneHashCRMAuthentication(
                oneHashCRMConf,
                setOneHashCRMConf,
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
