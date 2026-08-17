import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function AsgarosForumAuthorization({
  asgarosForumConf,
  setAsgarosForumConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={asgarosForumConf}
      setConfig={setAsgarosForumConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'class', value: 'AsgarosForum' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Asgaros Forum integration, make sure the Asgaros Forum plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
