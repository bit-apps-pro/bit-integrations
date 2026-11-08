import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function EasyAppointmentsAuthorization({
  easyAppointmentsConf,
  setEasyAppointmentsConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={easyAppointmentsConf}
      setConfig={setEasyAppointmentsConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Easy Appointments"
      tutorialLinks={tutorialLinks?.easyAppointments || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'EASY_APPOINTMENTS_VERSION' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use this integration, install and activate the Easy Appointments plugin on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
