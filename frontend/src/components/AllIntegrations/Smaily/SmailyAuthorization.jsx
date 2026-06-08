/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { smailyAuthentication } from './SmailyCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function SmailyAuthorization({
  smailyConf,
  setSmailyConf,
  step,
  setStep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({
    name: '',
    subdomain: '',
    api_user_name: '',
    api_user_password: ''
  })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    !smailyConf?.default
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...smailyConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setSmailyConf(newConf)
  }

  const note = `<h4>${__(
    'To create API username and password, do the following.',
    'bit-integrations'
  )}</h4>
  <ol>
  <li>${__(
    'Click on your',
    'bit-integrations'
  )} <a href="https://www.sendsmaily.net/account/login/" target="_blank">account</a>${__(
    'name in the upper right corner of the page.',
    'bit-integrations'
  )}</li>
  <li>${__('From a dropdown menu choose “Preferences”.', 'bit-integrations')}</li>
  <li>${__('Click on the “Integrations” tab.', 'bit-integrations')}</li>
  <li>${__('And then underneath API Passwords click on “Create a new user”.', 'bit-integrations')}</li>
  </ol>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="smaily" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={smailyConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.name}</div>
      <div className="mt-3">
        <b>{__('Subdomain Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="subdomain"
        value={smailyConf.subdomain}
        type="text"
        placeholder={__('Your Account', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.subdomain}</div>
      <div className="mt-3">
        <b>{__('API User Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_user_name"
        value={smailyConf.api_user_name}
        type="text"
        placeholder={__('API user name...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_user_name}</div>
      <div className="mt-3">
        <b>{__('API User Password:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_user_password"
        value={smailyConf.api_user_password}
        type="text"
        placeholder={__('API user password...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_user_password}</div>
      {smailyConf.subdomain && (
        <small className="d-blk mt-3">
          {__('To Get subdomain, API user name and password Please Visit', 'bit-integrations')}
          &nbsp;
          <a
            className="btcd-link"
            href={`https://${smailyConf.subdomain}.sendsmaily.net/account/profile/#api`}
            target="_blank"
            rel="noreferrer">
            {__('Smaily API Token', 'bit-integrations')}
          </a>
        </small>
      )}
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() =>
              smailyAuthentication(
                smailyConf,
                setSmailyConf,
                setError,
                setIsAuthorized,
                loading,
                setLoading,
                'authentication'
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
      <Note note={note} />
    </div>
  )
}
