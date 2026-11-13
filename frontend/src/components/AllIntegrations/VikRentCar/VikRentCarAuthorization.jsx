import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import Authorization from '../../Connections/Authorization'

export default function VikRentCarAuthorization({
  vikRentCarConf,
  setVikRentCarConf,
  step,
  nextPage,
  isInfo
}) {
  return (
    <Authorization
      config={vikRentCarConf}
      setConfig={setVikRentCarConf}
      step={step}
      setStep={nextPage}
      isInfo={isInfo}
      tutorialLinkKey="vikRentCar"
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'constant', value: 'VIKRENTCAR_SOFTWARE_VERSION' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'Install and activate the VikRentCar plugin to use this integration.',
          'bit-integrations'
        )
      }}
    />
  )
}
