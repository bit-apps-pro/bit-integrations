import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function PaidMembershipProAuthorization({
  paidMembershipProConf,
  setPaidMembershipProConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={paidMembershipProConf}
      setConfig={setPaidMembershipProConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Paid Memberships Pro"
      tutorialLinks={tutorialLinks?.paidMembershipPro || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'plugin_file', value: 'paid-memberships-pro/paid-memberships-pro.php' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Paid Memberships Pro integration, make sure the Paid Memberships Pro plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
