import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import LoaderSm from '../../Loaders/LoaderSm'
import Note from '../../Utilities/Note'
import TutorialLink from '../../Utilities/TutorialLink'
import { userRegistrationAuthorize } from './UserRegistrationMembershipCommonFunc'

export default function UserRegistrationMembershipAuthorization({
  userRegistrationConf,
  setUserRegistrationConf,
  step,
  nextPage,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [showAuthMsg, setShowAuthMsg] = useState(false)

  const handleAuthorize = () => {
    userRegistrationAuthorize(setIsAuthorized, setShowAuthMsg, setIsLoading, setSnackbar, nextPage)
  }

  return (
    <div
      className="btcd-stp-page"
      style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
      <TutorialLink linkKey="userRegistrationMembership" />

      <div className="mt-3">
        <b>{__('Integration Name:', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-6 mt-1"
        onChange={e => setUserRegistrationConf({ ...userRegistrationConf, name: e.target.value })}
        name="name"
        value={userRegistrationConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
        disabled={isAuthorized}
      />

      <button
        onClick={handleAuthorize}
        className="btn btcd-btn-lg purple sh-sm flx"
        type="button"
        disabled={isAuthorized || isLoading}>
        {isAuthorized ? __('Connected ✔', 'bit-integrations') : __('Connect', 'bit-integrations')}
        {isLoading && <LoaderSm size={20} clr="#022217" className="ml-2" />}
      </button>
      <br />
      {showAuthMsg && isAuthorized && (
        <div className="flx mt-4">
          <button
            onClick={() => nextPage(2)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')}
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        </div>
      )}
      <Note
        note={__(
          'Note: User Registration & Membership plugin must be installed and activated.',
          'bit-integrations'
        )}
      />
    </div>
  )
}
