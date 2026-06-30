import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, senseiLMSConf, setSenseiLMSConf) => {
  const { name, value } = e.target

  setSenseiLMSConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const refreshResource = (route, dataKey, confKey, setSenseiLMSConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, route)
    .then(result => {
      if (result && result?.success && result?.data?.[dataKey]) {
        setSenseiLMSConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf[confKey] = result.data[dataKey]
          })
        )
        setIsLoading(false)
        toast.success(__('Fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Sensei LMS fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const refreshCourses = (setSenseiLMSConf, setIsLoading) =>
  refreshResource('refresh_sensei_lms_courses', 'courses', 'allCourses', setSenseiLMSConf, setIsLoading)

export const refreshLessons = (setSenseiLMSConf, setIsLoading) =>
  refreshResource('refresh_sensei_lms_lessons', 'lessons', 'allLessons', setSenseiLMSConf, setIsLoading)

export const refreshQuizzes = (setSenseiLMSConf, setIsLoading) =>
  refreshResource('refresh_sensei_lms_quizzes', 'quizzes', 'allQuizzes', setSenseiLMSConf, setIsLoading)

export const checkMappedFields = senseiLMSConf => {
  const mappedFields = senseiLMSConf?.field_map
    ? senseiLMSConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.senseiLMSField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  if (!senseiLMSConf?.mainAction || mappedFields.length > 0) {
    return false
  }

  return true
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)

  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', senseiLMSField: field.key }))
    : [{ formField: '', senseiLMSField: '' }]
}
