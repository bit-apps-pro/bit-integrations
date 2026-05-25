import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function WpErpAuthorization({
  wpErpConf,
  setWpErpConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={wpErpConf}
      setConfig={setWpErpConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'function', value: 'erp_insert_people' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use WP ERP integration, make sure the WP ERP plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
