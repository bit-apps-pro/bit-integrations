import { useState } from 'react'
import { toast } from 'react-hot-toast'
import BackIcn from '../../../Icons/BackIcn'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { refreshCampaignMonitorLists } from './CampaignMonitorCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function CampaignMonitorAuthorization({
  campaignMonitorConf,
  setCampaignMonitorConf,
  step,
  setstep,
  setSnackbar,
  isInfo,
  isLoading,
  setIsLoading
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', api_key: '' })
  const [showAuthMsg, setShowAuthMsg] = useState(false)
const handleAuthorize = () => {
    const newConf = { ...campaignMonitorConf }
    if (!newConf.name || !newConf.client_id || !newConf.api_key) {
      setError({
        name: !newConf.name ? __("Integration name can't be empty", 'bit-integrations') : '',
        client_id: !newConf.client_id ? __("Client Id can't be empty", 'bit-integrations') : '',
        api_key: !newConf.api_key ? __("Access Api Key can't be empty", 'bit-integrations') : ''
      })
      return
    }
    setIsLoading('auth')

    const data = {
      api_key: newConf.api_key,
      client_id: newConf.client_id
    }

    bitsFetch(data, 'campaign_monitor_authorize').then(result => {
      if (result && result.success) {
        const newConf = { ...campaignMonitorConf }
        newConf.tokenDetails = result.data
        setCampaignMonitorConf(newConf)
        setisAuthorized(true)
        toast.success(__('Authorized Successfully', 'bit-integrations'))
      } else if (
        (result && result.data) ||
        (!result.success && typeof result.data.Message === 'string')
      ) {
        toast.error(
          `${__('Authorization failed Cause:', 'bit-integrations')}${result.data.Message}. ${__(
            'please try again',
            'bit-integrations'
          )}`
        )
      } else {
        toast.error(__('Authorization failed. please try again', 'bit-integrations'))
      }
      setShowAuthMsg(true)
      setIsLoading(false)
    })
  }
  const handleInput = e => {
    const newConf = { ...campaignMonitorConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setCampaignMonitorConf(newConf)
  }

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    refreshCampaignMonitorLists(campaignMonitorConf, setCampaignMonitorConf, setIsLoading, setSnackbar)
    setstep(2)
  }

  const ActiveInstructions = `
            <h4>${__('Get Client Id & Api key', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your CampaignMonitor dashboard.', 'bit-integrations')}</li>
                <li>${__('Click on Your "Profile Image" at the top right', 'bit-integrations')}</li>
                <li>${__('Click on the "Account Settings"', 'bit-integrations')}</li>
                <li>${__('Then Click "API keys"', 'bit-integrations')}</li>
            </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="campaignMonitor" />

      <div className="mt-3 wdt-200">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={campaignMonitorConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.name}</div>

      <div className="mt-3 wdt-250">
        <b>{__('Client id:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="client_id"
        value={campaignMonitorConf.client_id}
        type="text"
        placeholder={__('client ID...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.client_id}</div>

      <div className="mt-3 wdt-250">
        <b>{__('Access API Key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_key"
        value={campaignMonitorConf.api_key}
        type="text"
        placeholder={__('Access API Key...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_key}</div>

      <small className="d-blk mt-3">
        {__('To Get Client Id & Api Key, Please Visit', 'bit-integrations')}
        &nbsp;
        <a
          className="btcd-link"
          href="https://bitcode2.createsend.com/account/apikeys"
          target="_blank"
          rel="noreferrer">
          {__('Campaign Monitor API Key', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />
      {isLoading === 'auth' && (
        <div className="flx mt-5">
          <LoaderSm size={25} clr="#022217" className="mr-2" />
          {__('Checking API Key!!!', 'bit-integrations')}
        </div>
      )}

      {showAuthMsg && !isAuthorized && !isLoading && (
        <div className="flx mt-5" style={{ color: 'red' }}>
          <span className="btcd-icn mr-2" style={{ fontSize: 30, marginTop: -5 }}>
            &times;
          </span>
          {__('Sorry, Api key is invalid', 'bit-integrations')}
        </div>
      )}
      {!isInfo && (
        <>
          <button
            onClick={handleAuthorize}
            className="btn btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={isAuthorized || isLoading}>
            {isAuthorized ? __('Authorized ✔', 'bit-integrations') : __('Authorize', 'bit-integrations')}
            {isLoading && <LoaderSm size={20} clr="#022217" className="ml-2" />}
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
      <Note note={ActiveInstructions} />
    </div>
  )
}
