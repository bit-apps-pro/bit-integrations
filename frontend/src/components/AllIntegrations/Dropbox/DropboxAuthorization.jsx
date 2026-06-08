/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import { getAllDropboxFolders, handleAuthorize } from './DropboxCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'

export default function DropboxAuthorization({
  flowID,
  dropboxConf,
  setDropboxConf,
  step,
  setStep,
  isLoading,
  setIsLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState({ clientId: '', clientSecret: '' })
const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    getAllDropboxFolders(flowID, dropboxConf, setDropboxConf, setIsLoading)
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...dropboxConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setDropboxConf(newConf)
  }

  const getAccessCode = () => {
    if (!dropboxConf.clientId || !dropboxConf.clientSecret) {
      setError({
        clientId: !dropboxConf.clientId ? __("Client Id can't be empty", 'bit-integrations') : '',
        clientSecret: !dropboxConf.clientSecret
          ? __("Client Secret can't be empty", 'bit-integrations')
          : ''
      })
      return
    }
    window.open(
      `https://www.dropbox.com/oauth2/authorize?client_id=${dropboxConf.clientId}&token_access_type=offline&response_type=code`,
      '_blank'
    )
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="dropbox" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={dropboxConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <small className="d-blk mt-3">
        {__('To Get Client Id & Secret, Please Visit', 'bit-integrations')}
        &nbsp;
        <a
          className="btcd-link"
          rel="noreferrer"
          target="_blank"
          href="https://www.dropbox.com/developers/apps/create?_tk=pilot_lp&_ad=ctabtn1&_camp=create">
          {__('Dropbox API Console', 'bit-integrations')}
        </a>
      </small>

      <div className="mt-3">
        <b>{__('Dropbox Client id:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="clientId"
        value={dropboxConf.clientId}
        type="text"
        placeholder={__('client ID...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red' }}>{error.clientId}</div>

      <div className="mt-3">
        <b>{__('Dropbox Client Secret:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="clientSecret"
        value={dropboxConf.clientSecret}
        type="text"
        placeholder={__('client Secret...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red' }}>{error.clientSecret}</div>

      <small className="d-blk mt-3">
        {__('To Get Access Code, Please Visit', 'bit-integrations')}
        &nbsp;
        <span
          className="btcd-link"
          style={{ cursor: 'pointer' }}
          onClick={getAccessCode}
          aria-hidden="true">
          {__('Dropbox Access Code', 'bit-integrations')}
        </span>
      </small>

      <div className="mt-3">
        <b>{__('Dropbox Access Code:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="accessCode"
        value={dropboxConf.accessCode}
        type="text"
        placeholder={__('Access Code...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red' }}>{error.accessCode}</div>

      {!isInfo && (
        <>
          <button
            onClick={() =>
              handleAuthorize(dropboxConf, setDropboxConf, setIsAuthorized, setIsLoading, setError)
            }
            className="btn btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={isAuthorized || isLoading}>
            {isAuthorized ? __('Authorized ✔', 'bit-integrations') : __('Authorize', 'bit-integrations')}
            {isLoading && <LoaderSm size="20" clr="#022217" className="ml-2" />}
          </button>
          <br />
          <button
            onClick={nextPage}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={!isAuthorized}>
            {__('Next', 'bit-integrations')}
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        </>
      )}
    </div>
  )
}
