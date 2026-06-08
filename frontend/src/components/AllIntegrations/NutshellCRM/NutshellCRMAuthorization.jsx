/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { nutshellCRMAuthentication } from './NutshellCRMCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function NutshellCRMAuthorization({
  nutshellCRMConf,
  setNutshellCRMConf,
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

    !nutshellCRMConf?.default
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...nutshellCRMConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setNutshellCRMConf(newConf)
  }

  const handleApiTokenLink = 'https://app.nutshell.com/setup/api-key'

  const ActiveInstructions = `
            <h4>${__('Get API Token', 'bit-integrations')}</h4>
            <ul>
                <li>${__("Go to your Nutshell CRM's user dashboard", 'bit-integrations')}</li>
                <li>${__('Then select "Settings"', 'bit-integrations')}</li>
                <li>${__('Then go to "API Keys → Add API Key"', 'bit-integrations')}</li>
            </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="nutshellCRM" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={nutshellCRMConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('User Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="user_name"
        value={nutshellCRMConf.user_name}
        type="text"
        placeholder={__('User Name...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.user_name}</div>

      <div className="mt-3">
        <b>{__('API Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_token"
        value={nutshellCRMConf.api_token}
        type="text"
        placeholder={__('API Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_token}</div>

      <small className="d-blk mt-3">
        {__('To Get User Name & API Token, Please Visit', 'bit-integrations')}
        &nbsp;
        <a className="btcd-link" href={handleApiTokenLink} target="_blank">
          {__('NutshellCRM User Name & API Token', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              nutshellCRMAuthentication(
                nutshellCRMConf,
                setNutshellCRMConf,
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
