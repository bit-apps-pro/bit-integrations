import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import TutorialLink from '../../Utilities/TutorialLink'
import { handleAuthorize } from './FreshBooksCommonFunc'

export default function FreshBooksAuthorization({
  freshBooksConf,
  setFreshBooksConf,
  step,
  setstep,
  isLoading,
  setIsLoading,
  isInfo
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ access_token: '', account_id: '' })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setstep(2)
  }

  const handleInput = e => {
    const newConf = { ...freshBooksConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setFreshBooksConf(newConf)
  }

  const note = `
    <h4>${__('How to get Access Token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__(
        'Go to your FreshBooks account settings and create an OAuth2 application.',
        'bit-integrations'
      )}</li>
      <li>${__('Obtain an Access Token via the OAuth2 authorization flow.', 'bit-integrations')}</li>
      <li>${__('Find your Account ID in FreshBooks under My Account > Account Settings.', 'bit-integrations')}</li>
      <li>${__('If using Projects, Time Tracking or Services, also provide your Business ID.', 'bit-integrations')}</li>
    </ul>
  `

  return (
    <div
      className="btcd-stp-page"
      style={{
        ...{ width: step === 1 && 900 },
        ...{ height: step === 1 && 'auto' }
      }}>
      <TutorialLink linkKey="freshBooks" />

      <div className="mt-3">
        <b>{__('Access Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="access_token"
        value={freshBooksConf.access_token}
        type="text"
        placeholder={__('Bearer Access Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.access_token}</div>

      <div className="mt-3">
        <b>{__('Account ID:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="account_id"
        value={freshBooksConf.account_id}
        type="text"
        placeholder={__('Account ID...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.account_id}</div>

      <div className="mt-3">
        <b>{__('Business ID (optional):', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="business_id"
        value={freshBooksConf.business_id}
        type="text"
        placeholder={__('Business ID for Projects/Time...', 'bit-integrations')}
        disabled={isInfo}
      />
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() => handleAuthorize(freshBooksConf, setError, setisAuthorized, setIsLoading)}
            className="btn btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={isAuthorized || isLoading}>
            {isAuthorized ? __('Authorized ✔', 'bit-integrations') : __('Authorize', 'bit-integrations')}
            {isLoading && <LoaderSm size="20" clr="#022217" className="ml-2" />}
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
