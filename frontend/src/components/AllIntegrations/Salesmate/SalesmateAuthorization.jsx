/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import { salesmateAuthentication } from './SalesmateCommonFunc'
import Note from '../../Utilities/Note'
import { toast } from 'react-hot-toast'
import TutorialLink from '../../Utilities/TutorialLink'

export default function SalesmateAuthorization({
  salesmateConf,
  setSalesmateConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ session_token: '' })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    !salesmateConf?.default
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...salesmateConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setSalesmateConf(newConf)
  }

  const handleSessionTokenLink = () => {
    salesmateConf.link_name
      ? window.open(
          `https://${salesmateConf.link_name}.salesmate.io/#/app/user/accesskey`,
          '_blank',
          'noreferrer'
        )
      : toast.error(__('Link Name is required!', 'bit-integrations'))
  }

  const ActiveInstructions = `
            <h4>${__('Get Session Token', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your Salesmate dashboard.', 'bit-integrations')}</li>
                <li>${__('Click go to your "Profile" from Right top corner', 'bit-integrations')}</li>
                <li>${__('Then Click "Access Key"', 'bit-integrations')}</li>
                <li>${__(
                  'Then click "Session Key / Session Token", Then Copied',
                  'bit-integrations'
                )}</li>
            </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="salesmate" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={salesmateConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Session Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="session_token"
        value={salesmateConf.session_token}
        type="text"
        placeholder={__('Session Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.session_token}</div>

      <div className="mt-3">
        <b>{__('Link Name:', 'bit-integrations')}</b>
      </div>

      <div className="btcd-input-group w-6 mt-1">
        <div className="btcd-input-group-icon">https://</div>
        <div className="btcd-input-group-area">
          <input
            className="btcd-paper-inp"
            onChange={handleInput}
            name="link_name"
            value={salesmateConf.link_name}
            type="text"
            placeholder={__('Link Name...', 'bit-integrations')}
            disabled={isInfo}
          />
        </div>
        <div className="btcd-input-group-icon">.salesmate.io</div>
      </div>
      <div style={{ color: 'red', fontSize: '15px' }}>{error.link_name}</div>

      <small className="d-blk mt-3">
        {__('To Get Session Token, Please Visit', 'bit-integrations')}
        &nbsp;
        <a className="btcd-link" onClick={handleSessionTokenLink}>
          {__('Salesmate Session Token', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              salesmateAuthentication(
                salesmateConf,
                setSalesmateConf,
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
