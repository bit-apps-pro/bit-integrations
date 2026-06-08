import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { highLevelAuthentication } from './HighLevelCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'
import toast from 'react-hot-toast'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { getProLabel } from '../../Utilities/ProUtilHelpers'

export default function HighLevelAuthorization({
  formID,
  highLevelConf,
  setHighLevelConf,
  step,
  setstep,
  isInfo,
  loading,
  setLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi
const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', api_key: '' })

  const handleInput = e => {
    const newConf = { ...highLevelConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setHighLevelConf(newConf)
  }

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setstep(2)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="highLevel" />

      <div className="mt-3 wdt-200">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={highLevelConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.name}</div>

      <div className="mt-3">
        <b>{__('Select Version:')}</b>
      </div>
      <div className="flex items-center w-6 mt-3">
        <input
          id="MailerLiteClassic"
          type="radio"
          name="version"
          value="v1"
          className="hidden"
          checked={!highLevelConf?.version || highLevelConf?.version === 'v1'}
          onChange={handleInput}
        />
        <label for="MailerLiteClassic">
          <span className="w-4 h-4 inline-block mr-1 border border-grey" />
          HighLevel API V1
        </label>
      </div>

      <div className="flex items-center mr-4 mt-2 mb-4">
        <input
          id="MailerLiteNew"
          type="radio"
          name="version"
          value="v2"
          className="hidden"
          checked={highLevelConf?.version === 'v2'}
          onChange={handleInput}
          disabled={!isPro}
        />
        <label for="MailerLiteNew">
          <span className="w-4 h-4 inline-block mr-1 border border-grey" />
          {isPro ? 'HighLevel API V2' : getProLabel('HighLevel API V2')}
        </label>
      </div>

      {highLevelConf?.version === 'v2' && (
        <>
          <div className="mt-3 wdt-250">
            <b>{__('Location ID:', 'bit-integrations')}</b>
          </div>
          <input
            className="btcd-paper-inp w-6 mt-1"
            onChange={handleInput}
            name="location_id"
            value={highLevelConf.location_id}
            type="text"
            placeholder={__('Location ID...', 'bit-integrations')}
            disabled={isInfo}
          />
          <div style={{ color: 'red', fontSize: '15px' }}>{error.location_id}</div>
          <small className="d-blk mt-1">
            {__(
              'To get location id, go to Settings > Business Profile and copy the location id from General Information.',
              'bit-integrations'
            )}
          </small>
        </>
      )}

      <div className="mt-3 wdt-250">
        <b>{__('GoHighLevel Api Key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_key"
        value={highLevelConf.api_key}
        type="text"
        placeholder={__('GoHighLevel Api Key...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_key}</div>

      <small className="d-blk mt-3">
        {!highLevelConf?.version || highLevelConf?.version === 'v1'
          ? __(
              'To get API key, go to Settings > Business Profile and copy the API Key from there.',
              'bit-integrations'
            )
          : __(
              'To get API key, go to Settings > Private Integration and create new integration and copy the API token.',
              'bit-integrations'
            )}
      </small>
      <br />

      {!isInfo && (
        <>
          <button
            onClick={() =>
              highLevelAuthentication(
                highLevelConf,
                setHighLevelConf,
                setError,
                setisAuthorized,
                loading,
                setLoading
              )
            }
            className="btn btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={isAuthorized || loading.auth}>
            {isAuthorized ? __('Authorized ✔', 'bit-integrations') : __('Authorize', 'bit-integrations')}
            {loading.auth && <LoaderSm size={20} clr="#022217" className="ml-2" />}
          </button>
          <br />
          <button
            onClick={() => nextPage(2)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={!isAuthorized}>
            {__('Next', 'bit-integrations')}
            <BackIcn className="ml-1 rev-icn" />
          </button>
        </>
      )}
      <Note note={ActiveInstructions(highLevelConf?.version)} />
    </div>
  )
}

const ActiveInstructions = version => {
  return version !== 'v2'
    ? `
            <h4>${__('Get GoHighLevel Api Key', 'bit-integrations')}</h4>
            <ul>
                <li>${__(
                  'First go to your GoHighLevel sub account settings then business profile tab',
                  'bit-integrations'
                )}.</li>
                <li>${__('Copy the the API key.', 'bit-integrations')}</li>
                <li>${__(
                  'You can also get the API key from Agency view. Navigate to settings then API keys tab.',
                  'bit-integrations'
                )}</li>
            </ul>`
    : `
            <h4>${__('Get GoHighLevel Location ID', 'bit-integrations')}</h4>
            <ul>
                <li>${__(
                  'From the Sub-Account Dashboard, go to Settings in lower right-hand corner',
                  'bit-integrations'
                )}.</li>
                <li>${__(
                  'Select Business Profile on the left-side navigation bar.',
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'The Location ID will be visible as shown in General Information.',
                  'bit-integrations'
                )}</li>
                <li>${__('Copy the location ID.', 'bit-integrations')}</li>
            </ul>
            <h4>${__('Get GoHighLevel Api Key', 'bit-integrations')}</h4>
            <ul>
                <li>${__(
                  'First go to your GoHighLevel sub account settings then Private Integration tab',
                  'bit-integrations'
                )}.</li>
                <li>${__('Click on "Create new Integration"', 'bit-integrations')}</li>
                <li>${__(
                  "Give your Private Integration a name and description to help you and your team identify what it's for.",
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'Select the scopes/permissions that you want the private integration to have access to on your agency  account. Ensure that you are selecting only the required scopes for better data security.',
                  'bit-integrations'
                )}</li>
                <li>${__('Copy the token generated.', 'bit-integrations')}</li>
            </ul>`
}
