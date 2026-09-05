import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_quiz', label: __('Create Quiz', 'bit-integrations'), is_pro: true },
  { name: 'update_quiz_name', label: __('Update Quiz Name', 'bit-integrations'), is_pro: true },
  { name: 'duplicate_quiz', label: __('Duplicate Quiz', 'bit-integrations'), is_pro: true },
  { name: 'delete_quiz', label: __('Delete Quiz', 'bit-integrations'), is_pro: true },
  {
    name: 'update_quiz_settings',
    label: __('Update Quiz Settings', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_question', label: __('Create Question', 'bit-integrations'), is_pro: true },
  { name: 'update_question', label: __('Update Question', 'bit-integrations'), is_pro: true },
  { name: 'delete_question', label: __('Delete Question', 'bit-integrations'), is_pro: true },
  { name: 'delete_result', label: __('Delete Result', 'bit-integrations'), is_pro: true }
]

const answerFields = [
  { key: 'answer_1', label: __('Answer 1', 'bit-integrations'), required: false },
  { key: 'answer_1_points', label: __('Answer 1 Points', 'bit-integrations'), required: false },
  { key: 'answer_1_correct', label: __('Answer 1 Correct (1 or 0)', 'bit-integrations'), required: false },
  { key: 'answer_2', label: __('Answer 2', 'bit-integrations'), required: false },
  { key: 'answer_2_points', label: __('Answer 2 Points', 'bit-integrations'), required: false },
  { key: 'answer_2_correct', label: __('Answer 2 Correct (1 or 0)', 'bit-integrations'), required: false },
  { key: 'answer_3', label: __('Answer 3', 'bit-integrations'), required: false },
  { key: 'answer_3_points', label: __('Answer 3 Points', 'bit-integrations'), required: false },
  { key: 'answer_3_correct', label: __('Answer 3 Correct (1 or 0)', 'bit-integrations'), required: false },
  { key: 'answer_4', label: __('Answer 4', 'bit-integrations'), required: false },
  { key: 'answer_4_points', label: __('Answer 4 Points', 'bit-integrations'), required: false },
  { key: 'answer_4_correct', label: __('Answer 4 Correct (1 or 0)', 'bit-integrations'), required: false }
]

const questionDetailFields = [
  { key: 'question_order', label: __('Question Order', 'bit-integrations'), required: false },
  { key: 'hint', label: __('Hint', 'bit-integrations'), required: false },
  { key: 'answer_info', label: __('Correct Answer Info', 'bit-integrations'), required: false },
  { key: 'category', label: __('Category', 'bit-integrations'), required: false }
]

export const QuizNameField = [
  { key: 'quiz_name', label: __('Quiz Name', 'bit-integrations'), required: true }
]

export const QuizIdNameFields = [
  { key: 'quiz_id', label: __('Quiz Id', 'bit-integrations'), required: true },
  { key: 'quiz_name', label: __('Quiz Name', 'bit-integrations'), required: true }
]

export const QuizIdField = [
  { key: 'quiz_id', label: __('Quiz Id', 'bit-integrations'), required: true }
]

export const QuizSettingsFields = [
  { key: 'quiz_id', label: __('Quiz Id', 'bit-integrations'), required: true },
  { key: 'setting_value', label: __('Setting Value', 'bit-integrations'), required: true }
]

export const CreateQuestionFields = [
  { key: 'quiz_id', label: __('Quiz Id', 'bit-integrations'), required: true },
  { key: 'question_name', label: __('Question', 'bit-integrations'), required: true },
  ...questionDetailFields,
  ...answerFields
]

export const UpdateQuestionFields = [
  { key: 'question_id', label: __('Question Id', 'bit-integrations'), required: true },
  { key: 'question_name', label: __('Question', 'bit-integrations'), required: false },
  ...questionDetailFields,
  ...answerFields
]

export const QuestionIdField = [
  { key: 'question_id', label: __('Question Id', 'bit-integrations'), required: true }
]

export const ResultIdField = [
  { key: 'result_id', label: __('Result Id', 'bit-integrations'), required: true }
]

export const settingSections = [
  { label: __('Quiz Options', 'bit-integrations'), value: 'quiz_options' },
  { label: __('Quiz Text', 'bit-integrations'), value: 'quiz_text' },
  { label: __('Quiz Style', 'bit-integrations'), value: 'quiz_style' },
  { label: __('Display Options', 'bit-integrations'), value: 'display_options' },
  { label: __('Certificate', 'bit-integrations'), value: 'certificate' }
]

export const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: '1' },
  { label: __('No', 'bit-integrations'), value: '0' }
]

export const needsQuestionType = ['create_question', 'update_question']
export const needsSettingSection = ['update_quiz_settings']
export const hasUtilities = [
  'create_quiz',
  'duplicate_quiz',
  'delete_quiz',
  'create_question',
  'update_question',
  'delete_result'
]
