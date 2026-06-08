/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { woodpeckerAuthentication } from './WoodpeckerCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function WoodpeckerAuthorization({
  woodpeckerConf,
  setWoodpeckerConf,
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

    !woodpeckerConf?.default
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...woodpeckerConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setWoodpeckerConf(newConf)
  }

  const ActiveInstructions = `
            <h4>${__('Get API Key', 'bit-integrations')}</h4>
            <ul>
                <li>${__(
                  'Log into your Woodpecker account on',
                  'bit-integrations'
                )} <a className="btcd-link" href="https://app.woodpecker.co/panel" target="_blank">${__(
                  'app.woodpecker.co.',
                  'bit-integrations'
                )}</a></li>
                <li>${__(
                  'Go to the <b>Marketplace</b> → <b>INTEGRATIONS</b> → <b>API keys</b>.',
                  'bit-integrations'
                )}</li>
                <li>${__('Use the purple button to <b>CREATE A KEY</b>.', 'bit-integrations')}</li>
            </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="woodpecker" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={woodpeckerConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('API Key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_key"
        value={woodpeckerConf.api_key}
        type="text"
        placeholder={__('API Key...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_key}</div>

      <small className="d-blk mt-3">
        {__('To get API key, please visit', 'bit-integrations')}
        &nbsp;
        <a
          className="btcd-link"
          href="https://app.woodpecker.co/panel?u=411340#marketplace/integrations/api-keys"
          target="_blank">
          {__('Woodpecker API Key', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              woodpeckerAuthentication(woodpeckerConf, setError, setIsAuthorized, loading, setLoading)
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
