import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import { dripAuthentication } from './DripCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'
import toast from 'react-hot-toast'

export default function DripAuthorization({
  formID,
  dripConf,
  setDripConf,
  step,
  setstep,
  isInfo,
  loading,
  setLoading
}) {
const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ name: '', api_token: '' })

  const handleInput = e => {
    const newConf = { ...dripConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setDripConf(newConf)
  }

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    setstep(2)
  }

  const ActiveInstructions = `
            <h4>${__('Get Drip Api Token', 'bit-integrations')}</h4>
            <ul>
                <li>${__(
                  'First go to your',
                  'bit-integrations'
                )} <a href="https://www.getdrip.com/user/edit" target="_blank">${__(
                  'Drip user settings',
                  'bit-integrations'
                )}</a>.</li>
                <li>${__('Copy the the API Token from "User Info"', 'bit-integrations')}</li>
            </ul>`

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="drip" />

      <div className="mt-3 wdt-200">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={dripConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.name}</div>

      <div className="mt-3 wdt-250">
        <b>{__('Drip Api Token:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="api_token"
        value={dripConf.api_token}
        type="text"
        placeholder={__('Access Api Token Key...', 'bit-integrations')}
        disabled={isInfo}
      />
      <div style={{ color: 'red', fontSize: '15px' }}>{error.api_token}</div>

      <small className="d-blk mt-3">
        {__('To Get Drip Api Token, Please Visit', 'bit-integrations')}
        &nbsp;
        <a
          className="btcd-link"
          href="https://www.getdrip.com/user/edit"
          target="_blank"
          rel="noreferrer">
          {__('Drip User Settings', 'bit-integrations')}
        </a>
      </small>
      <br />
      <br />
      {loading?.auth && (
        <div className="flx mt-5">
          <LoaderSm size={25} clr="#022217" className="mr-2" />
          Checking Api Token Key!!!
        </div>
      )}

      {!isInfo && (
        <>
          <button
            onClick={() =>
              dripAuthentication(dripConf, setDripConf, setError, setisAuthorized, loading, setLoading)
            }
            className="btn btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={isAuthorized || loading.auth}>
            {isAuthorized ? __('Authorized ✔', 'bit-integrations') : __('Authorize', 'bit-integrations')}
            {loading.auth && <LoaderSm size={20} clr="#022217" className="ml-2" />}
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
