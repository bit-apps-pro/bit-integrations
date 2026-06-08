import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import bitsFetch from '../../../Utils/bitsFetch'
import { deepCopy } from '../../../Utils/Helpers'
import { __, sprintf } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import { getAllLevels } from './RestrictContentCommonFunc'
import TutorialLink from '../../Utilities/TutorialLink'
export default function RestrictContentAuthorization({
  formID,
  restrictConf,
  setRestrictConf,
  step,
  setStep,
  setSnackbar
}) {
  const [isAuthorized, setisAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showAuthMsg, setShowAuthMsg] = useState(false)
const authorizeHandler = () => {
    setIsLoading('auth')
    bitsFetch({}, 'restrict_authorize').then(result => {
      if (result?.success) {
        setisAuthorized(true)
        setSnackbar({
          show: true,
          msg: __('Connected with Restrict Content Successfully', 'bit-integrations')
        })
      }
      setIsLoading(false)
      setShowAuthMsg(true)
    })
  }

  const handleInput = e => {
    const newConf = deepCopy(restrictConf)
    newConf[e.target.name] = e.target.value
    setRestrictConf(newConf)
  }

  const nextPage = () => {
    // setTimeout(() => {
    //   document.getElementById('btcd-settings-wrp').scrollTop = 0
    // }, 300)
    getAllLevels(restrictConf, setRestrictConf, setIsLoading)
    setStep(2)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{
        width: step === 1 && 900,
        height: step === 1 && 'auto'
      }}>
            <TutorialLink linkKey="restrictContent" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={handleInput}
        name="name"
        value={restrictConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
      />

      {isLoading === 'auth' && (
        <div className="flx mt-5">
          <LoaderSm size={25} clr="#022217" className="mr-2" />
          Checking if restrict content is active!!!
        </div>
      )}

      {showAuthMsg && !isAuthorized && !isLoading && (
        <div className="flx mt-5" style={{ color: 'red' }}>
          <span className="btcd-icn mr-2" style={{ fontSize: 30, marginTop: -5 }}>
            &times;
          </span>
          {sprintf(
            __('%s plugin must be activated to integrate with Bit Integrations', 'bit-integrations'),
            'RestrictContent'
          )}
        </div>
      )}

      {!isAuthorized && (
        <button
          onClick={authorizeHandler}
          className="btn btcd-btn-lg purple sh-sm flx mt-5"
          type="button">
          {__('Connect', 'bit-integrations')}
        </button>
      )}

      {isAuthorized && (
        <button
          onClick={() => nextPage(2)}
          className="btn btcd-btn-lg purple sh-sm flx mt-5"
          type="button"
          disabled={!isAuthorized}>
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      )}
    </div>
  )
}
