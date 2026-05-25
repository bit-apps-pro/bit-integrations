import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import { getCustomFields } from './FluentSupportCommonFunc'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function FluentSupportAuthorization({
  fluentSupportConf,
  setFluentSupportConf,
  step,
  setstep,
  setIsLoading,
  setSnackbar,
  isInfo
}) {
  const loadCustomFields = useCallback(() => {
    getCustomFields(fluentSupportConf, setFluentSupportConf, setIsLoading, setSnackbar)
  }, [fluentSupportConf, setFluentSupportConf, setIsLoading, setSnackbar])

  const handleSetStep = useCallback(
    value => {
      if (value === 2 && !fluentSupportConf?.fluentSupportFields?.length) {
        loadCustomFields()
      }
      setstep(value)
    },
    [fluentSupportConf?.fluentSupportFields?.length, loadCustomFields, setstep]
  )

  return (
    <Authorization
      config={fluentSupportConf}
      setConfig={setFluentSupportConf}
      step={step}
      setStep={handleSetStep}
      isInfo={isInfo}
      tutorialTitle="Fluent Support"
      tutorialLinks={tutorialLinks?.fluentSupport || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: {
          checks: [{ type: 'plugin_file', value: 'fluent-support/fluent-support.php' }],
          logic: 'AND'
        }
      }}
      noteDetails={{
        note: __(
          'To use Fluent Support integration, make sure Fluent Support is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
