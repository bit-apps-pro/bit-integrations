import { useState } from 'react'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import TutorialLink from '../../Utilities/TutorialLink'
import { handleAuthorize, setIntegrationName } from './WishlistMemberCommonFunc'

export default function WishlistMemberAuthorization({
  wishlistMemberConf,
  setWishlistMemberConf,
  step,
  nextPage,
  setSnackbar,
  isInfo
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
            <TutorialLink linkKey="wishlistMember" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-7 mt-1"
        onChange={e => setIntegrationName(e, setWishlistMemberConf)}
        name="name"
        value={wishlistMemberConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isInfo}
      />

      <button
        onClick={() => handleAuthorize(setIsAuthorized, setIsLoading, setSnackbar)}
        className="btn btcd-btn-lg purple sh-sm flx"
        type="button"
        disabled={isAuthorized || isLoading}>
        {isAuthorized ? __('Authorized ✔', 'bit-integrations') : __('Authorize', 'bit-integrations')}
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
  )
}
