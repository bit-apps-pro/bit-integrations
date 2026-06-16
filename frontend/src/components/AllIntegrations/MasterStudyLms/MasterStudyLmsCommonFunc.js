import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { deepCopy } from '../../../Utils/Helpers'
import { sprintf, __ } from '../../../Utils/i18nwrap'

export const MS_LMS_ACTIONS = {
  COMPLETE_COURSE: '1',
  COMPLETE_LESSON: '2',
  COMPLETE_QUIZ: '3',
  RESET_COURSE: '4',
  RESET_LESSON: '5',
  ENROLL_USER: '6',
  UNENROLL_USER: '7',
  MARK_COURSE_COMPLETE: '8',
  MARK_LESSON_COMPLETE: '9'
}

// Field-map definition for the email-based (Pro) actions.
export const msLmsUserFields = [
  { key: 'user_email', label: __('User Email', 'bit-integrations'), required: true }
]

export const generateMappedField = (fields = msLmsUserFields) => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', msLmsFormField: field.key }))
    : [{ formField: '', msLmsFormField: '' }]
}

export const isUserEmailMapped = conf =>
  Boolean(
    conf?.field_map?.some(
      f =>
        f.msLmsFormField === 'user_email' &&
        (f.formField === 'custom' ? f.customValue : f.formField)
    )
  )

export const allActions = [
  { key: MS_LMS_ACTIONS.COMPLETE_COURSE, label: __('Course complete for the user', 'bit-integrations') },
  { key: MS_LMS_ACTIONS.COMPLETE_LESSON, label: __('Lesson complete for the user', 'bit-integrations') },
  { key: MS_LMS_ACTIONS.COMPLETE_QUIZ, label: __('Quiz complete for the user', 'bit-integrations') },
  { key: MS_LMS_ACTIONS.RESET_COURSE, label: __('Reset user course', 'bit-integrations') },
  { key: MS_LMS_ACTIONS.RESET_LESSON, label: __('Reset user lesson', 'bit-integrations') },
  {
    key: MS_LMS_ACTIONS.ENROLL_USER,
    label: __('Enroll user in a course', 'bit-integrations'),
    is_pro: true
  },
  {
    key: MS_LMS_ACTIONS.UNENROLL_USER,
    label: __('Unenroll user from a course', 'bit-integrations'),
    is_pro: true
  },
  {
    key: MS_LMS_ACTIONS.MARK_COURSE_COMPLETE,
    label: __('Mark a course complete for the user', 'bit-integrations'),
    is_pro: true
  },
  {
    key: MS_LMS_ACTIONS.MARK_LESSON_COMPLETE,
    label: __('Mark a lesson complete for the user', 'bit-integrations'),
    is_pro: true
  }
]

// Per-action required-field validation shared by the New wizard and Edit screen.
export const isActionConfigIncomplete = conf => {
  switch (conf?.mainAction) {
    case MS_LMS_ACTIONS.COMPLETE_COURSE:
    case MS_LMS_ACTIONS.RESET_COURSE:
      return !conf.courseId
    case MS_LMS_ACTIONS.COMPLETE_LESSON:
    case MS_LMS_ACTIONS.RESET_LESSON:
      return !conf.lessonId
    case MS_LMS_ACTIONS.COMPLETE_QUIZ:
      return !conf.quizId
    case MS_LMS_ACTIONS.ENROLL_USER:
    case MS_LMS_ACTIONS.UNENROLL_USER:
    case MS_LMS_ACTIONS.MARK_COURSE_COMPLETE:
      return !conf.courseId || !isUserEmailMapped(conf)
    case MS_LMS_ACTIONS.MARK_LESSON_COMPLETE:
      return !conf.courseId || !conf.lessonId || !isUserEmailMapped(conf)
    default:
      return false
  }
}

export const handleInput = (e, msLmsConf, setMsLmsConf, setIsLoading, setSnackbar, formID) => {
  const newConf = { ...msLmsConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  newConf[e.target.name] = e.target.value
  setMsLmsConf({ ...newConf })
}

export const checkMappedFields = msLmsConf => {
  const mappedFleld = msLmsConf.field_map
    ? msLmsConf.field_map.filter(mapped => !mapped.formField && !mapped.msLmsFormField)
    : []
  if (mappedFleld.length > 0) {
    return false
  }
  return true
}

export const fetchAllMsLmsCourse = (msLmsConf, setMsLmsConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const queryPrarms = { courseId: msLmsConf.courseId }
  bitsFetch({}, 'mslms_fetch_all_course')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...msLmsConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.default.allCourse = result.data
        }
        setMsLmsConf({ ...newConf })
        setIsLoading(false)
        toast.success(__('Course fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Course fetch failed. please try again', 'bit-integrations'))
    })

    .catch(() => setIsLoading(false))
}

export const fetchAllLesson = (msLmsConf, setMsLmsConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const queryPrarms = { courseId: msLmsConf.courseId }
  bitsFetch(queryPrarms, 'msLms_fetch_all_lesson')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...msLmsConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.default.allLesson = result.data
        }
        setMsLmsConf({ ...newConf })
        setIsLoading(false)
        toast.success(__('Lesson fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Lesson fetch failed. please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const fetchAllQuiz = (msLmsConf, setMsLmsConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const queryPrarms = { courseId: msLmsConf.courseId }
  bitsFetch(queryPrarms, 'msLms_fetch_all_quiz')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...msLmsConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.default.allQuiz = result.data
        }
        setMsLmsConf({ ...newConf })
        setIsLoading(false)
        toast.success(__('Quiz fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Quiz fetch failed. please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}
