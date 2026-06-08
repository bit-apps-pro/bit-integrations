import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import TutorialLink from '../../Utilities/TutorialLink'
export default function UltimateAffiliateProAuthorization({
  ultimateAffiliateProConf,
  setUltimateAffiliateProConf,
  step,
  nextPage,
  isLoading,
  setIsLoading,
  setSnackbar,
  isInfo,

}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [showAuthMsg, setShowAuthMsg] = useState(false)

  const authorizeHandler = () => {
    if (isInfo || typeof setIsLoading !== 'function' || typeof setSnackbar !== 'function') {
      return
    }

    setIsLoading('auth')
    bitsFetch({}, 'ultimate_affiliate_pro_authorize').then(result => {
      if (result?.success) {
        setIsAuthorized(true)
        setSnackbar({
          show: true,
          msg: __('Connected with Ultimate Affiliate Pro Successfully', 'bit-integrations')
        })
      }
      setIsLoading(false)
      setShowAuthMsg(true)
    })
  }

  const handleInput = e => {
    if (isInfo || typeof setUltimateAffiliateProConf !== 'function') {
      return
    }

    const newConf = { ...ultimateAffiliateProConf }
    newConf[e.target.name] = e.target.value
    setUltimateAffiliateProConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{
        width: step === 1 && 900,
        height: step === 1 && 'auto'
      }}>
      <TutorialLink linkKey="ultimateAffiliatePro" />
      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={ultimateAffiliateProConf?.name || ''}
        type="text"
        disabled={isInfo}
        placeholder={__('Integration Name...', 'bit-integrations')}
      />

      {isLoading === 'auth' && (
        <div className="flx mt-5">
          <LoaderSm size={25} clr="#022217" className="mr-2" />
          {__('Checking if Ultimate Affiliate Pro is authorized...', 'bit-integrations')}
        </div>
      )}

      {showAuthMsg && !isAuthorized && !isLoading && (
        <div className="flx mt-5" style={{ width: 900, justifyContent: 'center' }}>
          <div className="txt-center">
            <div className="btcd-icn btcd-icn-err">
              <span>✕</span>
            </div>
            <div className="mt-2">
              {__('Ultimate Affiliate Pro is not activated or not installed', 'bit-integrations')}
            </div>
          </div>
        </div>
      )}

      {showAuthMsg && isAuthorized && !isLoading && (
        <div className="flx mt-5" style={{ width: 900 }}>
          <div className="btcd-icn btcd-icn-success">
            <span>✓</span>
          </div>
          <div className="mt-2">{__('Ultimate Affiliate Pro is activated', 'bit-integrations')}</div>
        </div>
      )}

      {!isInfo && (
        <>
          <button
            onClick={authorizeHandler}
            className="btn btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={isAuthorized || isLoading === 'auth'}>
            {isAuthorized
              ? __('Connected', 'bit-integrations')
              : __('Connect to Ultimate Affiliate Pro', 'bit-integrations')}
            {isLoading === 'auth' && <LoaderSm size={20} clr="#022217" className="ml-2" />}
          </button>
          <br />
          <button
            onClick={() => nextPage(2)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={!isAuthorized || typeof nextPage !== 'function'}>
            {__('Next', 'bit-integrations')}
            <BackIcn className="ml-1 rev-icn" />
          </button>
        </>
      )}
    </div>
  )
}
