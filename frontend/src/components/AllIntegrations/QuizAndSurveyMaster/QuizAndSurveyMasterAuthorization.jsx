import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function QuizAndSurveyMasterAuthorization({
  quizAndSurveyMasterConf,
  setQuizAndSurveyMasterConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={quizAndSurveyMasterConf}
      setConfig={setQuizAndSurveyMasterConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Quiz And Survey Master"
      tutorialLinks={tutorialLinks?.quizAndSurveyMaster || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'QSM_PLUGIN_PATH' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Quiz And Survey Master integration, make sure the Quiz And Survey Master plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
