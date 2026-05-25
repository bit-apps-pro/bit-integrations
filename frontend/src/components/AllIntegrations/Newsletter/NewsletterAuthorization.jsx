import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function NewsletterAuthorization({
  newsletterConf,
  setNewsletterConf,
  step,
  setStep,
  isInfo
}) {
  return (
    <Authorization
      config={newsletterConf}
      setConfig={setNewsletterConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Newsletter"
      tutorialLinks={tutorialLinks?.newsletter || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'plugin_file', value: 'newsletter/plugin.php' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Newsletter integration, make sure the Newsletter plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
