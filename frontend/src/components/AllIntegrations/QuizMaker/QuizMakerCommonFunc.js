import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, quizMakerConf, setQuizMakerConf) => {
  const { name, value } = e.target

  setQuizMakerConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const fetchList = (setQuizMakerConf, setIsLoading, route, dataKey, confKey, successMsg, errorMsg) => {
  setIsLoading(true)
  bitsFetch(null, route)
    .then(result => {
      if (result && result?.success && result?.data?.[dataKey]) {
        setQuizMakerConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf[confKey] = result.data[dataKey]
          })
        )

        setIsLoading(false)
        toast.success(successMsg)
        return
      }
      setIsLoading(false)
      toast.error(errorMsg)
    })
    .catch(() => setIsLoading(false))
}

export const refreshQuizMakerQuizCategories = (setQuizMakerConf, setIsLoading) =>
  fetchList(
    setQuizMakerConf,
    setIsLoading,
    'refresh_quiz_maker_quiz_categories',
    'quizCategories',
    'allQuizCategories',
    __('All quiz categories fetched successfully', 'bit-integrations'),
    __('Quiz Maker quiz categories fetch failed. Please try again', 'bit-integrations')
  )

export const refreshQuizMakerQuestionCategories = (setQuizMakerConf, setIsLoading) =>
  fetchList(
    setQuizMakerConf,
    setIsLoading,
    'refresh_quiz_maker_question_categories',
    'questionCategories',
    'allQuestionCategories',
    __('All question categories fetched successfully', 'bit-integrations'),
    __('Quiz Maker question categories fetch failed. Please try again', 'bit-integrations')
  )

export const refreshQuizMakerQuestions = (setQuizMakerConf, setIsLoading) =>
  fetchList(
    setQuizMakerConf,
    setIsLoading,
    'refresh_quiz_maker_questions',
    'questions',
    'allQuestions',
    __('All questions fetched successfully', 'bit-integrations'),
    __('Quiz Maker questions fetch failed. Please try again', 'bit-integrations')
  )

export const refreshQuizMakerUsers = (setQuizMakerConf, setIsLoading) =>
  fetchList(
    setQuizMakerConf,
    setIsLoading,
    'refresh_quiz_maker_users',
    'users',
    'allUsers',
    __('All users fetched successfully', 'bit-integrations'),
    __('Quiz Maker users fetch failed. Please try again', 'bit-integrations')
  )

export const checkMappedFields = quizMakerConf => {
  const mappedFields = quizMakerConf?.field_map
    ? quizMakerConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.quizMakerField ||
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
        quizMakerField: field.key
      }))
    : [{ formField: '', quizMakerField: '' }]
}
