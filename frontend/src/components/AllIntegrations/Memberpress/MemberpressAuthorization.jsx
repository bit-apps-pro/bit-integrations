import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'
import { getAllMemberShip, paymentGateway } from './MemberpressCommonFunc'

export default function MemberpressAuthorization({
  memberpressConf,
  setMemberpressConf,
  step,
  setStep,
  isInfo,
  setIsLoading,
  setSnackbar
}) {
  const handleSetStep = useCallback(value => {
    if (value === 2) {
      getAllMemberShip(memberpressConf, setMemberpressConf, setIsLoading, setSnackbar)
      paymentGateway(memberpressConf, setMemberpressConf, setIsLoading, setSnackbar)
    }
    setStep(value)
  }, [setStep, memberpressConf, setMemberpressConf, setIsLoading, setSnackbar])

  return (
    <Authorization
      config={memberpressConf}
      setConfig={setMemberpressConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="MemberPress"
      tutorialLinks={tutorialLinks?.memberpress || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'plugin_file', value: 'memberpress/memberpress.php' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use MemberPress integration, make sure the MemberPress plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
