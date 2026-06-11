/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import TutorialLink from '../../Utilities/TutorialLink'
import { authorization } from './SenderCommonFunc'

const tokenUrl = 'https://app.sender.net/settings/tokens'
const note = `
    <h4>${__('Steps to generate an API access token:', 'bit-integrations')}</h4>
    <ul>
      <li>${__('Go to', 'bit-integrations')} <a href=${tokenUrl} target="_blank" rel="noreferrer">${__(
  'Sender API Access Tokens',
  'bit-integrations'
)}</a></li>
      <li>${__('Create a token and copy it.', 'bit-integrations')}</li>
      <li>${__('Paste it into the <b>API Token</b> field and click <b>Authorize</b>.', 'bit-integrations')}</li>
    </ul>
  `

export default function SenderAuthorization({
  senderConf,
  setSenderConf,
  step,
  setstep,
  loading,
  setLoading,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setstep(2)
  }

  const handleInput = e => {
    const newConf = { ...senderConf }
    newConf[e.target.name] = e.target.value
    setSenderConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
      <TutorialLink linkKey="sender" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={senderConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <div className="mt-3">
        <b>{__('API Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_token"
        value={senderConf.api_token}
        type="text"
        placeholder={__('API Token...', 'bit-integrations')}
        disabled={isInfo}
      />

      <small className="d-blk mt-3">
        {__('To get your API token, please visit', 'bit-integrations')}
        &nbsp;
        <a className="btcd-link" href={tokenUrl} target="_blank" rel="noreferrer">
          {__('Sender API Access Tokens', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />

      {!isInfo && (
        <div>
          <button
            onClick={() => authorization(senderConf, setIsAuthorized, loading, setLoading)}
            className="btn btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={isAuthorized || loading.auth || !senderConf.api_token}>
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
