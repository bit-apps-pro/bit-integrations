/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import TutorialLink from '../../Utilities/TutorialLink'
import { mondayComAuthentication } from './MondayComCommonFunc'
import { create } from 'mutative'

export default function MondayComAuthorization({
  mondayComConf,
  setMondayComConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ apiToken: '' })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setStep(2)
  }

  const handleInput = e => {
    const { name, value } = e.target
    setError(err =>
      create(err, draft => {
        draft[name] = ''
      })
    )
    setMondayComConf(prev =>
      create(prev, draft => {
        draft[name] = value
      })
    )
  }

  const ActiveInstructions = `
    <h4>${__('To Get Monday.com API Token', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Log in to your Monday.com account.', 'bit-integrations')}</li>
      <li>${__('Click on your avatar in the bottom left corner.', 'bit-integrations')}</li>
      <li>${__('Select Developers → API Token.', 'bit-integrations')}</li>
      <li>${__('Copy your personal API token (v2).', 'bit-integrations')}</li>
    </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
      <TutorialLink title="Monday.com" links={tutorialLinks?.mondayCom || {}} />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={mondayComConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('API Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="apiToken"
        value={mondayComConf.apiToken}
        type="text"
        placeholder={__('API Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.apiToken}</div>

      <small className="d-blk mt-3">
        {__('To Get API Token, Please Visit', 'bit-integrations')}
        &nbsp;
        <a
          className="btcd-link"
          href="https://monday.com/developers/apps"
          target="_blank"
          rel="noreferrer">
          {__('Monday.com Developers', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              mondayComAuthentication(mondayComConf, setError, setIsAuthorized, loading, setLoading)
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
