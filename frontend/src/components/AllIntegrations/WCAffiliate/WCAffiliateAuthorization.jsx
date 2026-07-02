import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function WCAffiliateAuthorization({
  wcAffiliateConf,
  setWCAffiliateConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={wcAffiliateConf}
      setConfig={setWCAffiliateConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [
            { type: 'class', value: 'WC_Affiliate\\Models\\Affiliate' },
            { type: 'class', value: 'WC_Affiliate\\Models\\Referral' },
            { type: 'class', value: 'WC_Affiliate\\Models\\Transaction' }
          ],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use WC Affiliate integration, make sure the WC Affiliate plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
