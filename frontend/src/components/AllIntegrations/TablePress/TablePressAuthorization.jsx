import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function TablePressAuthorization({
  tablePressConf,
  setTablePressConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={tablePressConf}
      setConfig={setTablePressConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="TablePress"
      tutorialLinks={tutorialLinks?.tablePress || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'TABLEPRESS_ABSPATH' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use this integration, install and activate the TablePress plugin on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
