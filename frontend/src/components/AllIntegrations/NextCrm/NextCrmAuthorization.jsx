import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function NextCrmAuthorization({ nextCrmConf, setNextCrmConf, step, nextPage, isInfo }) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={nextCrmConf}
      setConfig={setNextCrmConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="NextCRM"
      tutorialLinks={tutorialLinks?.nextCrm || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'NEXTCRM_VERSION' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use NextCRM integration, make sure the NextCRM plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
