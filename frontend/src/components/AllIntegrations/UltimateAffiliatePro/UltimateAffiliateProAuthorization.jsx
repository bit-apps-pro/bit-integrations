import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function UltimateAffiliateProAuthorization({
  ultimateAffiliateProConf,
  setUltimateAffiliateProConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={ultimateAffiliateProConf}
      setConfig={setUltimateAffiliateProConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Ultimate Affiliate Pro"
      tutorialLinks={tutorialLinks?.ultimateAffiliatePro || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          groups: [
            { logic: 'AND', checks: [{ type: 'plugin_file', value: 'ultimate-affiliate/ultimate-affiliate.php' }] },
            { logic: 'AND', checks: [{ type: 'plugin_file', value: 'ultimate-affiliate-pro/ultimate-affiliate-pro.php' }] },
            { logic: 'AND', checks: [{ type: 'plugin_file', value: 'indeed-affiliate-pro/indeed-affiliate-pro.php' }] }
          ],
          logic: 'OR'
        }
      }}
      noteDetails={{
        note: __(
          'To use Ultimate Affiliate Pro integration, make sure the Ultimate Affiliate Pro plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
