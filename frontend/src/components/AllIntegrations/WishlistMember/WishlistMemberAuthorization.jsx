import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function WishlistMemberAuthorization({
  wishlistMemberConf,
  setWishlistMemberConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={wishlistMemberConf}
      setConfig={setWishlistMemberConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="WishlistMember"
      tutorialLinks={tutorialLinks?.wishlistMember || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          groups: [
            { logic: 'AND', checks: [{ type: 'class', value: 'WLMAPI' }] },
            { logic: 'AND', checks: [{ type: 'class', value: 'WishListMember' }] }
          ],
          logic: 'OR'
        }
      }}
      noteDetails={{
        note: __(
          'To use Wishlist Member integration, make sure the Wishlist Member plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
