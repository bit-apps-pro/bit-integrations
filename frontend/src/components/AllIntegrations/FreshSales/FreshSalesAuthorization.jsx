/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import TutorialLink from '../../Utilities/TutorialLink'
import { handleAuthorize } from './FreshSalesCommonFunc'

export default function FreshSalesAuthorization({
  freshSalesConf,
  setFreshSalesConf,
  step,
  setstep,
  isLoading,
  setIsLoading,
  isInfo
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', api_key: '' })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setstep(2)
  }

  const handleInput = e => {
    const newConf = { ...freshSalesConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setFreshSalesConf(newConf)
  }
  const note = `
    <h4>${__('Step of generate API token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__(
        'Goto',
        'bit-integrations'
      )} <a href="https://www.myfreshworks.com/crm/sales/personal-settings/api-settings">${__(
        'Generate API Token',
        'bit-integrations'
      )}</a></li>
      <li>${__(
        'Copy the <b>Token</b> and paste into <b>API Token</b> field of your authorization form.',
        'bit-integrations'
      )}</li>
      <li>${__('Finally, click <b>Authorize</b> button.', 'bit-integrations')}</li>
  </ul>
  `

  return (
    <div
      className="btcd-stp-page"
      style={{
        ...{ width: step === 1 && 900 },
        ...{ height: step === 1 && 'auto' }
      }}>
            <TutorialLink linkKey="freshSales" />

      <div className="mt-3">
        <b>{__('Bundle Alias(Your Account URL):', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="bundle_alias"
        value={freshSalesConf.bundle_alias}
        type="text"
        placeholder={__('Your Account Url...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.bundle_alias}</div>
      <small className="d-blk mt-3">
        {__('Example: name.myfreshworks.com/crm/sales', 'bit-integrations')}
      </small>

      <div className="mt-3">
        <b>{__('API Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_key"
        value={freshSalesConf.api_key}
        type="text"
        placeholder={__('API Token...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_key}</div>

      {freshSalesConf.bundle_alias && (
        <small className="d-blk mt-3">
          {__('To Get API Token, Please Visit', 'bit-integrations')}
          &nbsp;
          <a
            className="btcd-link"
            href={`https://${freshSalesConf.bundle_alias}/personal-settings/api-settings`}
            target="_blank"
            rel="noreferrer">
            {__('FreshSales API Token', 'bit-integrations')}
          </a>
        </small>
      )}
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() => handleAuthorize(freshSalesConf, setError, setisAuthorized, setIsLoading)}
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
