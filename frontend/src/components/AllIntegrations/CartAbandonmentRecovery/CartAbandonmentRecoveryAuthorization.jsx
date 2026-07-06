import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import TutorialLink from '../../Utilities/TutorialLink'

export default function CartAbandonmentRecoveryAuthorization({
  cartAbandonmentRecoveryConf,
  setCartAbandonmentRecoveryConf,
  step,
  nextPage,
  isLoading,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [showAuthMsg, setShowAuthMsg] = useState(false)

  const authorizeHandler = () => {
    setIsLoading?.('auth')
    bitsFetch({}, 'cart_abandonment_recovery_authorize').then(result => {
      if (result?.success) {
        setIsAuthorized(true)
        setSnackbar?.({
          show: true,
          msg: __('Connected with Cart Abandonment Recovery Successfully', 'bit-integrations')
        })
      }
      setIsLoading?.(false)
      setShowAuthMsg(true)
    })
  }

  const handleInput = e => {
    if (!setCartAbandonmentRecoveryConf) return

    setCartAbandonmentRecoveryConf({ ...cartAbandonmentRecoveryConf, [e.target.name]: e.target.value })
  }

  return (
    <div
      className="btcd-stp-page"
      style={{
        width: step === 1 && 900,
        height: step === 1 && 'auto'
      }}>
      <TutorialLink linkKey="cartAbandonmentRecovery" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={cartAbandonmentRecoveryConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
      />

      {isLoading === 'auth' && (
        <div className="flx mt-5">
          <LoaderSm size={25} clr="#022217" className="mr-2" />
          {__('Checking if Cart Abandonment Recovery is authorized!!!', 'bit-integrations')}
        </div>
      )}

      {showAuthMsg && !isAuthorized && !isLoading && (
        <div className="flx mt-5" style={{ width: 900, justifyContent: 'center' }}>
          <div className="txt-center">
            <div className="btcd-icn btcd-icn-err">
              <span>x</span>
            </div>
            <div className="mt-2">
              {__('Cart Abandonment Recovery is not activated or not installed', 'bit-integrations')}
            </div>
          </div>
        </div>
      )}

      {showAuthMsg && isAuthorized && !isLoading && (
        <div className="flx mt-5" style={{ width: 900 }}>
          {__('Cart Abandonment Recovery is activated', 'bit-integrations')}
        </div>
      )}

      <button
        onClick={authorizeHandler}
        className="btn btcd-btn-lg purple sh-sm flx"
        type="button"
        disabled={isAuthorized || isLoading === 'auth'}>
        {isAuthorized
          ? __('Connected', 'bit-integrations')
          : __('Connect to Cart Abandonment Recovery', 'bit-integrations')}
        {isLoading === 'auth' && <LoaderSm size={20} clr="#022217" className="ml-2" />}
      </button>
      {!isInfo && (
        <>
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
