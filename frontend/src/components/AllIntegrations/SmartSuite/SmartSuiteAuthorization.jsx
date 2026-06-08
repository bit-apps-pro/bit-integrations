/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { smartSuiteAuthentication, getAllSolutions } from './SmartSuiteCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'
import { create } from 'mutative'

export default function SmartSuiteAuthorization({
  smartSuiteConf,
  setSmartSuiteConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
const [error, setError] = useState({ workspaceId: '', apiToken: '' })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    !smartSuiteConf?.default
    setStep(2)
  }

  const handleInput = e => {
    const { name, value } = e.target
    setError(error =>
      create(error, draftError => {
        draftError[name] = ''
      })
    )
    setSmartSuiteConf(smartSuiteConf =>
      create(smartSuiteConf, draftConf => {
        draftConf[name] = value
      })
    )
  }

  const ActiveInstructions = `
            <h4>${__('To Get Workspace ID & API Token', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your SmartSuite dashboard.', 'bit-integrations')}</li>
                <li>${__('Click go to Profile Icon from Right Top corner.', 'bit-integrations')}</li>
                <li>${__('Then Click "API Key" from the "My Profile Menu".', 'bit-integrations')}</li>
                <li>${__('Then Click and Copy the "Hidden Api Token".', 'bit-integrations')}</li>
                <li>${__(
                  'Your Workspace Id is the 8 characters that follow https://app.smartsuite.com/ in the SmartSuite URL when you’re logged in.',
                  'bit-integrations'
                )}</li>

            </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="smartSuite" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={smartSuiteConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Workspace ID:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="workspaceId"
        value={smartSuiteConf.workspaceId}
        type="text"
        placeholder={__('Workspace ID...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.workspaceId}</div>

      <div className="mt-3">
        <b>{__('API Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="apiToken"
        value={smartSuiteConf.apiToken}
        type="text"
        placeholder={__('API Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.apiToken}</div>

      <small className="d-blk mt-3">
        {__('To Get API Token & Workspace ID, Please Visit', 'bit-integrations')}
        &nbsp;
        <a className="btcd-link" href="https://app.smartsuite.com/" target="_blank">
          {__('SmartSuite API Token & Workspace ID', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              smartSuiteAuthentication(
                smartSuiteConf,
                setSmartSuiteConf,
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
