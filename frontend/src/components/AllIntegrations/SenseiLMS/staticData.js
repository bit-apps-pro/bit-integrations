import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'enroll_user_in_course', label: __('Enroll User in Course', 'bit-integrations'), is_pro: true },
  { name: 'withdraw_user_from_course', label: __('Withdraw User from Course', 'bit-integrations'), is_pro: true },
  { name: 'start_course_for_user', label: __('Start Course for User', 'bit-integrations'), is_pro: true },
  { name: 'complete_course_for_user', label: __('Complete Course for User', 'bit-integrations'), is_pro: true },
  { name: 'reset_course_for_user', label: __('Reset Course Progress', 'bit-integrations'), is_pro: true },
  { name: 'start_lesson_for_user', label: __('Start Lesson for User', 'bit-integrations'), is_pro: true },
  { name: 'update_lesson_status', label: __('Update Lesson Status', 'bit-integrations'), is_pro: true },
  { name: 'reset_lesson_for_user', label: __('Reset Lesson Progress', 'bit-integrations'), is_pro: true },
  { name: 'grade_quiz', label: __('Grade Quiz for User', 'bit-integrations'), is_pro: true },
  { name: 'create_course', label: __('Create Course', 'bit-integrations'), is_pro: true },
  { name: 'create_lesson', label: __('Create Lesson', 'bit-integrations'), is_pro: true },
  { name: 'create_certificate', label: __('Create Certificate for User', 'bit-integrations'), is_pro: true }
]

const userEmailFields = [
  { key: 'user_email', label: __('User Email', 'bit-integrations'), required: true }
]

const postContentFields = [
  { key: 'post_content', label: __('Content', 'bit-integrations'), required: false },
  { key: 'post_excerpt', label: __('Excerpt', 'bit-integrations'), required: false }
]

export const senseiLMSStaticData = {
  enroll_user_in_course: userEmailFields,
  withdraw_user_from_course: userEmailFields,
  start_course_for_user: userEmailFields,
  complete_course_for_user: userEmailFields,
  reset_course_for_user: userEmailFields,
  reset_lesson_for_user: userEmailFields,
  create_certificate: userEmailFields,
  start_lesson_for_user: userEmailFields,
  update_lesson_status: userEmailFields,
  grade_quiz: [
    ...userEmailFields,
    { key: 'grade', label: __('Grade', 'bit-integrations'), required: true }
  ],
  create_course: [
    { key: 'post_title', label: __('Title', 'bit-integrations'), required: true },
    ...postContentFields,
    { key: 'author_email', label: __('Author Email', 'bit-integrations'), required: false }
  ],
  create_lesson: [
    { key: 'post_title', label: __('Title', 'bit-integrations'), required: true },
    ...postContentFields
  ]
}

// action -> which resource dropdown it needs
export const courseActions = [
  'enroll_user_in_course',
  'withdraw_user_from_course',
  'start_course_for_user',
  'complete_course_for_user',
  'reset_course_for_user',
  'create_lesson',
  'create_certificate'
]
export const lessonActions = ['start_lesson_for_user', 'update_lesson_status', 'reset_lesson_for_user']
export const quizActions = ['grade_quiz']

// actions whose static choices are shown as Utilities dropdowns (not field-map rows)
export const statusActions = ['create_course', 'create_lesson']
export const markCompleteActions = ['start_lesson_for_user']
export const gradeTypeActions = ['grade_quiz']
export const lessonStatusActions = ['update_lesson_status']

export const postStatusOptions = [
  { label: __('Publish', 'bit-integrations'), value: 'publish' },
  { label: __('Draft', 'bit-integrations'), value: 'draft' },
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Private', 'bit-integrations'), value: 'private' }
]
export const markCompleteOptions = [
  { label: __('No', 'bit-integrations'), value: 'no' },
  { label: __('Yes', 'bit-integrations'), value: 'yes' }
]
export const gradeTypeOptions = [
  { label: __('Auto', 'bit-integrations'), value: 'auto' },
  { label: __('Manual', 'bit-integrations'), value: 'manual' }
]
export const lessonStatusOptions = [
  { label: __('In Progress', 'bit-integrations'), value: 'in-progress' },
  { label: __('Ungraded', 'bit-integrations'), value: 'ungraded' },
  { label: __('Graded', 'bit-integrations'), value: 'graded' },
  { label: __('Passed', 'bit-integrations'), value: 'passed' },
  { label: __('Failed', 'bit-integrations'), value: 'failed' }
]
