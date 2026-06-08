import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import TutorialLink from '../../Utilities/TutorialLink'

export default function SeoPressAuthorization({
  formID,
  seoPressConf,
  setSeoPressConf,
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
    setIsLoading('auth')
    bitsFetch({}, 'seopress_authorize').then(result => {
      if (result?.success) {
        setIsAuthorized(true)
        setSnackbar({
          show: true,
          msg: __('Connected with SEOPress Successfully', 'bit-integrations')
        })
      }
      setIsLoading(false)
      setShowAuthMsg(true)
    })
  }

  const handleInput = e => {
    const newConf = { ...seoPressConf }
    newConf[e.target.name] = e.target.value
    setSeoPressConf(newConf)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{
        width: step === 1 && 900,
        height: step === 1 && 'auto'
      }}>
            <TutorialLink linkKey="seoPress" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={seoPressConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      {isLoading === 'auth' && (
        <div className="flx mt-5">
          <LoaderSm size={25} clr="#022217" className="mr-2" />
          {__('Checking if SEOPress is active!!!', 'bit-integrations')}
        </div>
      )}

      {showAuthMsg && !isAuthorized && !isLoading && (
        <div className="flx mt-5" style={{ width: 900, justifyContent: 'center' }}>
          <div className="txt-center">
            <div className="btcd-icn btcd-icn-err">
              <span>✕</span>
            </div>
            <div className="mt-2">
              {__('SEOPress is not activated or not installed', 'bit-integrations')}
            </div>
          </div>
        </div>
      )}

      {showAuthMsg && isAuthorized && !isLoading && (
        <div className="flx mt-5" style={{ width: 900 }}>
          <div className="btcd-icn btcd-icn-success">
            <span>✓</span>
          </div>
          <div className="mt-2">{__('SEOPress is activated', 'bit-integrations')}</div>
        </div>
      )}

      <button
        onClick={authorizeHandler}
        className="btn btcd-btn-lg purple sh-sm flx"
        type="button"
        disabled={isAuthorized || isInfo}>
        {__('Connect', 'bit-integrations')}
        {isLoading === 'auth' && <LoaderSm size={20} clr="#022217" className="ml-2" />}
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
  )
}
