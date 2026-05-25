import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function NotificationXAuthorization({
  notificationXConf,
  setNotificationXConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={notificationXConf}
      setConfig={setNotificationXConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="NotificationX"
      tutorialLinks={tutorialLinks?.notificationX || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'NOTIFICATIONX_FILE' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use NotificationX integration, make sure the NotificationX plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
