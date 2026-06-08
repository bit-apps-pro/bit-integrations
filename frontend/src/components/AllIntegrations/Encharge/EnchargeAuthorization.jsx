import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import { refreshEnchargeHeader } from './EnchargeCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function EnchargeAuthorization({
  formID,
  enchargeConf,
  setEnchargeConf,
  step,
  setstep,
  setSnackbar,
  isInfo
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', api_key: '' })
  const [showAuthMsg, setShowAuthMsg] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
const handleAuthorize = () => {
    const newConf = { ...enchargeConf }
    if (!newConf.name || !newConf.api_key) {
      setError({
        name: !newConf.name ? __("Integration name can't be empty", 'bit-integrations') : '',
        api_key: !newConf.api_key ? __("API Key can't be empty", 'bit-integrations') : ''
      })
      return
    }
    setIsLoading('auth')
    const data = { api_key: newConf.api_key }
    bitsFetch(data, 'encharge_authorize').then(result => {
      if (result?.success) {
        setisAuthorized(true)
        setSnackbar({ show: true, msg: __('Authorized Successfully', 'bit-integrations') })
      }
      setShowAuthMsg(true)
      setIsLoading(false)
    })
  }
  const handleInput = e => {
    const newConf = { ...enchargeConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setEnchargeConf(newConf)
  }

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setstep(2)
    refreshEnchargeHeader(enchargeConf, setEnchargeConf, setIsLoading, setSnackbar)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="encharge" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={enchargeConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.name}</div>

      <div className="mt-3">
        <b>{__('API Key:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_key"
        value={enchargeConf.api_key}
        type="text"
        placeholder={__('API key', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_key}</div>
      <small className="d-blk mt-5">
        {__('To get API , Please Visit', 'bit-integrations')}{' '}
        <a
          className="btcd-link"
          href="https://app.encharge.io/account/info"
          target="_blank"
          rel="noreferrer">
          {__('Encharge API Console', 'bit-integrations')}
        </a>
      </small>
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
    </div>
  )
}
