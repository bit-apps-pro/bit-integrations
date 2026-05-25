import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function AffiliateAuthorization({
  affiliateConf,
  setAffiliateConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={affiliateConf}
      setConfig={setAffiliateConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="AffiliateWP"
      tutorialLinks={tutorialLinks?.affiliate || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'plugin_file', value: 'affiliate-wp/affiliate-wp.php' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use AffiliateWP integration, make sure the AffiliateWP plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
