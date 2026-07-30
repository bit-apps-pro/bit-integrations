import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function MoreConvertWishlistAuthorization({
  moreConvertWishlistConf,
  setMoreConvertWishlistConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={moreConvertWishlistConf}
      setConfig={setMoreConvertWishlistConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="moreConvertWishlist"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [
            { type: 'class', value: 'WLFMC' },
            { type: 'class', value: 'WLFMC_Wishlist_Factory' }
          ],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use MoreConvert Wishlist integration, make sure the MoreConvert Wishlist for WooCommerce plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
