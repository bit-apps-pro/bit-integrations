import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function TeamsForWooCommerceMembershipsAuthorization({
  teamsForWcConf,
  setTeamsForWcConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={teamsForWcConf}
      setConfig={setTeamsForWcConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Teams for WooCommerce Memberships"
      tutorialLinks={tutorialLinks?.teamsForWooCommerceMemberships || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'function', value: 'wc_memberships_for_teams' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Teams for WooCommerce Memberships integration, make sure the Teams for WooCommerce Memberships plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
