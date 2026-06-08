import { useState } from 'react'
import { toast } from 'react-hot-toast'
import BackIcn from '../../../Icons/BackIcn'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { refreshMailifyList } from './MailifyCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function MailifyAuthorization({
  formID,
  mailifyConf,
  setMailifyConf,
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
    const newConf = { ...mailifyConf }
    if (!newConf.name || !newConf.api_key) {
      setError({
        name: !newConf.name ? __("Integration name can't be empty", 'bit-integrations') : '',
        account_id: !newConf.account_id
          ? __("Access Account ID can't be empty", 'bit-integrations')
          : '',
        api_key: !newConf.api_key ? __("Access Api Key can't be empty", 'bit-integrations') : ''
      })
      return
    }
    setIsLoading('auth')
    const data = {
      account_id: newConf.account_id,
      api_key: newConf.api_key
    }
    bitsFetch(data, 'mailify_authorize').then(result => {
      if (result && result.success) {
        const newConf = { ...mailifyConf }
        newConf.tokenDetails = result.data
        setMailifyConf(newConf)
        setisAuthorized(true)
        toast.success(__('Authorized Successfully', 'bit-integrations'))
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        toast.error(
          `${__('Authorization failed Cause:', 'bit-integrations')}${
            result.data.data || result.data
          }. ${__('please try again', 'bit-integrations')}`
        )
      } else {
        toast.error(__('Authorization failed. please try again', 'bit-integrations'))
      }
      setShowAuthMsg(true)
      setIsLoading(false)
    })
  }
  const handleInput = e => {
    const newConf = { ...mailifyConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setMailifyConf(newConf)
  }

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    refreshMailifyList(mailifyConf, setMailifyConf, setIsLoading, setSnackbar)
    setstep(2)
  }

  const ActiveInstructions = `
            <h4>${__('Get Account Id and Api key', 'bit-integrations')}</h4>
            <ul>
                <li>${__('First go to your Mailify dashboard.', 'bit-integrations')}</li>
                <li>${__(
                  'Click on the "Settings" from Top-Right corner dropdown',
                  'bit-integrations'
                )}</li>
                <li>${__(
                  'Then Click "Developers", Then click "Add an Api Key"',
                  'bit-integrations'
                )}</li>
            </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="mailify" />

      <div className="mt-3 wdt-200">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={mailifyConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.name}</div>

      <div className="mt-3 wdt-200">
        <b>{__('Access Account ID:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="account_id"
        value={mailifyConf.account_id}
        type="text"
        placeholder={__('Access Account ID...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.account_id}</div>

      <div className="mt-3 wdt-250">
        <b>{__('Access API Key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_key"
        value={mailifyConf.api_key}
        type="text"
        placeholder={__('Access API Key...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_key}</div>

      <small className="d-blk mt-3">
        {__('To Get Account Id and Api Key, Please Visit', 'bit-integrations')}
        &nbsp;
        <a
          className="btcd-link"
          href="https://app.mailify.com/#!/p/home"
          target="_blank"
          rel="noreferrer">
          {__('Mailify API Token', 'bit-integrations')}
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
