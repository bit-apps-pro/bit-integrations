import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import { deepCopy } from '../../../Utils/Helpers'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import CopyText from '../../Utilities/CopyText'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import TutorialLink from '../../Utilities/TutorialLink'
export default function CustomApiAuthorization({
  formID,
  customApiConf,
  setCustomApiConf,
  step,
  setStep,
  isLoading,
  setIsLoading,
  setSnackbar,
  redirectLocation,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setStep(2)
  }
  const authType = [
    { label: __('API Key', 'bit-integrations'), value: 'apikey' },
    { label: __('Bearer Token', 'bit-integrations'), value: 'bearer' },
    { label: __('Basic Auth', 'bit-integrations'), value: 'basic' }
  ]

  const apiKeyAddTo = [
    { label: __('Header', 'bit-integrations'), value: 'header' },
    { label: __('Query String', 'bit-integrations'), value: 'query' }
  ]

  const handleInput = e => {
    const newConf = { ...customApiConf }
    newConf[e.target.name] = e.target.value
    setCustomApiConf(newConf)
  }

  const setValue = (val, name) => {
    const newConf = deepCopy(customApiConf)
    if (val) {
      newConf[name] = val
    } else {
      delete newConf[name]
    }
    setCustomApiConf({ ...newConf })
  }

  function isDisabled(selectedAuthType) {
    switch (selectedAuthType) {
      case 'apikey':
        return !customApiConf.key || !customApiConf.value || !customApiConf.apiKeyAddTo
      case 'bearer':
        return !customApiConf.key || !customApiConf.token
      case 'basic':
        return !customApiConf.username || !customApiConf.password
      default:
        return true
    }
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && '1000px' } }}>
            <TutorialLink linkKey="customApi" />

      <div className="d-flx">
        <div className="wdt-200 d-in-b mt-3">
          <b>{__('Integration Name:', 'bit-integrations')}</b>
        </div>
        <input
          className="btcd-paper-inp w-6 mt-1"
          onChange={handleInput}
          name="name"
          value={customApiConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
          disabled={isInfo}
        />
      </div>
      <br />
      <div className="d-flx">
        <b className="wdt-200 d-in-b mt-3">{__('Select Auth Protocol:', 'bit-integrations')}</b>
        <MultiSelect
          defaultValue={customApiConf.authType}
          className="btcd-paper-drpdwn w-5"
          singleSelect
          options={authType}
          onChange={val => setValue(val, 'authType')}
        />
      </div>
      {customApiConf.authType === 'apikey' && (
        <div>
          <div>
            <div className="mt-3">
              <b>{__('Key:', 'bit-integrations')}</b>
            </div>
            <input
              className="btcd-paper-inp w-6 mt-2"
              onChange={handleInput}
              name="key"
              value={customApiConf.key}
              type="text"
              placeholder={__('Key', 'bit-integrations')}
              disabled={isInfo}
            />
          </div>
          <div>
            <div className="mt-3">
              <b>{__('Value:', 'bit-integrations')}</b>
            </div>
            <input
              className="btcd-paper-inp w-6 mt-2"
              onChange={handleInput}
              name="value"
              value={customApiConf.value}
              type="text"
              placeholder={__('Value', 'bit-integrations')}
              disabled={isInfo}
            />
          </div>
          <b className="wdt-200 d-in-b mt-3">{__('Add to:', 'bit-integrations')}</b>
          <MultiSelect
            defaultValue={customApiConf.apiKeyAddTo}
            className="btcd-paper-drpdwn w-5 mt-2"
            singleSelect
            options={apiKeyAddTo}
            onChange={val => setValue(val, 'apiKeyAddTo')}
          />
        </div>
      )}
      {customApiConf.authType === 'bearer' && (
        <div>
          <div>
            <div className="mt-3">
              <b>{__('Key:', 'bit-integrations')}</b>
            </div>
            <input
              className="btcd-paper-inp w-6 mt-2"
              onChange={handleInput}
              name="key"
              value={customApiConf.key}
              type="text"
              placeholder={__('Key', 'bit-integrations')}
              disabled={isInfo}
            />
          </div>
          <div>
            <div className="mt-3">
              <b>{__('Token:', 'bit-integrations')}</b>
            </div>
            <input
              className="btcd-paper-inp w-6 mt-2"
              onChange={handleInput}
              name="token"
              value={customApiConf.token}
              type="text"
              placeholder={__('Token', 'bit-integrations')}
              disabled={isInfo}
            />
          </div>
        </div>
      )}
      {customApiConf.authType === 'basic' && (
        <div>
          <div>
            <div className="mt-3">
              <b>{__('Key:', 'bit-integrations')}</b>
            </div>
            <input
              className="btcd-paper-inp w-6 mt-2"
              onChange={handleInput}
              name="key"
              value={customApiConf.key}
              type="text"
              placeholder={__('Key', 'bit-integrations')}
              disabled={isInfo}
            />
          </div>
          <div className="mt-3">
            <b>{__('User Name:', 'bit-integrations')}</b>
          </div>
          <input
            className="btcd-paper-inp w-6 mt-1"
            onChange={handleInput}
            name="username"
            value={customApiConf.username}
            type="text"
            placeholder={__('User Name...', 'bit-integrations')}
            disabled={isInfo}
          />

          <div className="mt-3">
            <b>{__('Password:', 'bit-integrations')}</b>
          </div>
          <input
            className="btcd-paper-inp w-6 mt-1"
            onChange={handleInput}
            name="password"
            value={customApiConf.password}
            type="text"
            placeholder={__('Password...', 'bit-integrations')}
            disabled={isInfo}
          />
        </div>
      )}
      <br />
      <div style={{ ...(step === 1 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <button
          onClick={() => setStep(2)}
          disabled={isDisabled(customApiConf.authType) || isLoading}
          className="btn btcd-btn-lg purple sh-sm "
          type="button">
          {__('Next', 'bit-integrations')}
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>
    </div>
  )
}
