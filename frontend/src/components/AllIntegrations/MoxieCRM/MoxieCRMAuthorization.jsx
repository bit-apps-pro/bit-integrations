/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { moxiecrmAuthentication } from './MoxieCRMCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function MoxieCRMAuthorization({
  moxiecrmConf,
  setMoxieCRMConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ api_key: '', api_url: '' })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    !moxiecrmConf?.default
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...moxiecrmConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setMoxieCRMConf(newConf)
  }

  const ActiveInstructions = `
  <h4>${__('Get api secret key', 'bit-integrations')}</h4>
  <ul>
      <li>${__('First go to your Moxie dashboard.', 'bit-integrations')}</li>
      <li>${__('Then click Workspace Settings from bottom left corner.', 'bit-integrations')}</li>
      <li>${__('Click "Connneted Apps", Then click "Integrations"', 'bit-integrations')}</li>
      <li>${__('Select "Custom Integrations"', 'bit-integrations')}</li>
  </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="moxiecrm" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={moxiecrmConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('Your API URL:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_url"
        value={moxiecrmConf.api_url}
        type="text"
        placeholder={__('Your Client...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_url}</div>
      <small className="d-blk mt-3">{__('Example: {name}.withmoxie.com', 'bit-integrations')}</small>
      <div className="mt-3">
        <b>{__('API Key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_key"
        value={moxiecrmConf.api_key}
        type="text"
        placeholder={__('API Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_key}</div>

      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              moxiecrmAuthentication(
                moxiecrmConf,
                setMoxieCRMConf,
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
