import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, quizAndSurveyMasterConf, setQuizAndSurveyMasterConf) => {
  const { name, value } = e.target

  setQuizAndSurveyMasterConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshQuizAndSurveyMasterThemes = (setQuizAndSurveyMasterConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_quiz_and_survey_master_themes')
    .then(result => {
      if (result && result?.success && result?.data?.themes) {
        setQuizAndSurveyMasterConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allThemes = result.data.themes
          })
        )

        setIsLoading(false)
        toast.success(__('All themes fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(
        __('Quiz And Survey Master themes fetch failed. Please try again', 'bit-integrations')
      )
    })
    .catch(() => setIsLoading(false))
}

export const refreshQuizAndSurveyMasterQuestionTypes = (
  setQuizAndSurveyMasterConf,
  setIsLoading
) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_quiz_and_survey_master_question_types')
    .then(result => {
      if (result && result?.success && result?.data?.questionTypes) {
        setQuizAndSurveyMasterConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allQuestionTypes = result.data.questionTypes
          })
        )

        setIsLoading(false)
        toast.success(__('All question types fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(
        __('Quiz And Survey Master question types fetch failed. Please try again', 'bit-integrations')
      )
    })
    .catch(() => setIsLoading(false))
}

export const refreshQuizAndSurveyMasterSettingKeys = (
  section,
  setQuizAndSurveyMasterConf,
  setIsLoading
) => {
  setIsLoading(true)
  bitsFetch({ section }, 'refresh_quiz_and_survey_master_setting_keys')
    .then(result => {
      if (result && result?.success && result?.data?.settingKeys) {
        setQuizAndSurveyMasterConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allSettingKeys = result.data.settingKeys
          })
        )

        setIsLoading(false)
        toast.success(__('All setting keys fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(
        __('Quiz And Survey Master setting keys fetch failed. Please try again', 'bit-integrations')
      )
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = quizAndSurveyMasterConf => {
  const mappedFields = quizAndSurveyMasterConf?.field_map
    ? quizAndSurveyMasterConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.quizAndSurveyMasterField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        quizAndSurveyMasterField: field.key
      }))
    : [{ formField: '', quizAndSurveyMasterField: '' }]
}
