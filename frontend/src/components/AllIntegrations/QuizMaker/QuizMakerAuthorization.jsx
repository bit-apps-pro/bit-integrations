import { useCallback } from 'react'
import { AUTH_TYPES } from '../../../Utils/connectionAuth'
import { __ } from '../../../Utils/i18nwrap'
import tutorialLinks from '../../../Utils/StaticData/tutorialLinks'
import Authorization from '../../Connections/Authorization'

export default function QuizMakerAuthorization({
  quizMakerConf,
  setQuizMakerConf,
  step,
  nextPage,
  isInfo
}) {
  const setStep = useCallback(value => nextPage(value), [nextPage])
  return (
    <Authorization
      config={quizMakerConf}
      setConfig={setQuizMakerConf}
      step={step}
      setStep={setStep}
      isInfo={isInfo}
      tutorialTitle="Quiz Maker"
      tutorialLinks={tutorialLinks?.quizMaker || {}}
      authDetails={{
        authType: AUTH_TYPES.WP_PLUGIN_CHECK,
        pluginCheck: { checks: [{ type: 'constant', value: 'AYS_QUIZ_VERSION' }], logic: 'AND' }
      }}
      noteDetails={{
        note: __(
          'To use Quiz Maker integration, make sure the Quiz Maker plugin is installed and active on your site.',
          'bit-integrations'
        )
      }}
    />
  )
}
