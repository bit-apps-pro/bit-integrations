/* eslint-disable react/jsx-no-useless-fragment */
import { useEffect, useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import LoaderSm from '../../Loaders/LoaderSm'
import BackIcn from '../../../Icons/BackIcn'
import TutorialLink from '../../Utilities/TutorialLink'

export default function FluentCrmAuthorization({
  formID,
  fluentCrmConf,
  setFluentCrmConf,
  step,
  nextPage,
  setSnackbar,
  isInfo
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
  const [error, setError] = useState({ integrationName: '' })
  const [showAuthMsg, setShowAuthMsg] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
const [isMounted, setIsMounted] = useState(true)
  useEffect(
    () => () => {
      setIsMounted(false)
    },
    []
  )

  const handleAuthorize = () => {
    setIsLoading('auth')
    bitsFetch({}, 'fluent_crm_authorize').then(result => {
      if (isMounted) {
        if (result?.success) {
          setisAuthorized(true)
          setSnackbar({ show: true, msg: __('Connected Successfully', 'bit-integrations') })
        }
        setShowAuthMsg(true)
        setIsLoading(false)
      }
    })
  }
  const handleInput = e => {
    const newConf = { ...fluentCrmConf }
    const rmError = { ...error }
    rmError[e.target.name] = ''
    newConf[e.target.name] = e.target.value
    setError(rmError)
    setFluentCrmConf(newConf)
  }

  return (
    <>
      <div
        className="btcd-stp-page"
        style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
                <TutorialLink linkKey="fluentCrm" />

        <div className="mt-3">
          <b>{__('Integration Name:', 'bit-integrations')}</b>
        </div>
        <input
          className="btcd-paper-inp w-5 mt-1"
          onChange={handleInput}
          name="name"
          value={fluentCrmConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
          disabled={isInfo}
        />
        {isLoading === 'auth' && (
          <div className="flx mt-5">
            <LoaderSm size={25} clr="#022217" className="mr-2" />
            {__('Checking if Fluent CRM is active!!!', 'bit-integrations')}
          </div>
        )}

        {showAuthMsg && !isAuthorized && !isLoading && (
          <div className="flx mt-5" style={{ color: 'red' }}>
            <span className="btcd-icn mr-2" style={{ fontSize: 30, marginTop: -5 }}>
              &times;
            </span>
            {__('Please! First Install Fluent CRM Plugins', 'bit-integrations')}
          </div>
        )}
        <button
          onClick={handleAuthorize}
          className="btn btcd-btn-lg purple sh-sm flx"
          type="button"
          disabled={isAuthorized || isLoading}>
          {isAuthorized
            ? __('Connected ✔', 'bit-integrations')
            : __('Connect to Fluent CRM', 'bit-integrations')}
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
      </div>
    </>
  )
}
