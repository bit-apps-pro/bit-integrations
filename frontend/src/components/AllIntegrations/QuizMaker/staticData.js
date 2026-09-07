import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_quiz', label: __('Create Quiz', 'bit-integrations'), is_pro: true },
  { name: 'update_quiz', label: __('Update Quiz', 'bit-integrations'), is_pro: true },
  { name: 'change_quiz_status', label: __('Change Quiz Status', 'bit-integrations'), is_pro: true },
  { name: 'delete_quiz', label: __('Delete Quiz', 'bit-integrations'), is_pro: true },
  { name: 'create_question', label: __('Create Question', 'bit-integrations'), is_pro: true },
  { name: 'update_question', label: __('Update Question', 'bit-integrations'), is_pro: true },
  {
    name: 'change_question_status',
    label: __('Change Question Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'delete_question', label: __('Delete Question', 'bit-integrations'), is_pro: true },
  {
    name: 'create_quiz_category',
    label: __('Create Quiz Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_quiz_category',
    label: __('Update Quiz Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_quiz_category',
    label: __('Delete Quiz Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_question_category',
    label: __('Create Question Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_question_category',
    label: __('Update Question Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_question_category',
    label: __('Delete Question Category', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_result', label: __('Create Quiz Result', 'bit-integrations'), is_pro: true },
  {
    name: 'mark_result_as_read',
    label: __('Mark Result as Read', 'bit-integrations'),
    is_pro: true
  },
  { name: 'delete_result', label: __('Delete Quiz Result', 'bit-integrations'), is_pro: true },
  { name: 'create_review', label: __('Create Review', 'bit-integrations'), is_pro: true },
  { name: 'delete_review', label: __('Delete Review', 'bit-integrations'), is_pro: true },
  {
    name: 'create_question_report',
    label: __('Create Question Report', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'resolve_question_report',
    label: __('Resolve Question Report', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_question_report',
    label: __('Delete Question Report', 'bit-integrations'),
    is_pro: true
  }
]

export const QuizFields = [
  { key: 'title', label: __('Quiz Title', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'quiz_image', label: __('Quiz Image URL', 'bit-integrations'), required: false },
  { key: 'quiz_url', label: __('Quiz URL', 'bit-integrations'), required: false },
  { key: 'ordering', label: __('Ordering', 'bit-integrations'), required: false }
]

export const QuizUpdateFields = [
  { key: 'quiz_id', label: __('Quiz ID', 'bit-integrations'), required: true },
  { key: 'title', label: __('Quiz Title', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'quiz_image', label: __('Quiz Image URL', 'bit-integrations'), required: false },
  { key: 'quiz_url', label: __('Quiz URL', 'bit-integrations'), required: false },
  { key: 'ordering', label: __('Ordering', 'bit-integrations'), required: false }
]

export const QuizIdField = [{ key: 'quiz_id', label: __('Quiz ID', 'bit-integrations'), required: true }]

export const QuestionFields = [
  { key: 'question', label: __('Question', 'bit-integrations'), required: true },
  { key: 'question_title', label: __('Question Title', 'bit-integrations'), required: false },
  { key: 'question_image', label: __('Question Image URL', 'bit-integrations'), required: false },
  { key: 'question_hint', label: __('Hint', 'bit-integrations'), required: false },
  { key: 'explanation', label: __('Explanation', 'bit-integrations'), required: false },
  { key: 'right_answer_text', label: __('Right Answer Text', 'bit-integrations'), required: false },
  { key: 'wrong_answer_text', label: __('Wrong Answer Text', 'bit-integrations'), required: false },
  { key: 'weight', label: __('Weight', 'bit-integrations'), required: false },
  {
    key: 'answers',
    label: __('Answers (JSON array)', 'bit-integrations'),
    required: false
  }
]

export const QuestionUpdateFields = [
  { key: 'question_id', label: __('Question ID', 'bit-integrations'), required: true },
  { key: 'question', label: __('Question', 'bit-integrations'), required: false },
  { key: 'question_title', label: __('Question Title', 'bit-integrations'), required: false },
  { key: 'question_image', label: __('Question Image URL', 'bit-integrations'), required: false },
  { key: 'question_hint', label: __('Hint', 'bit-integrations'), required: false },
  { key: 'explanation', label: __('Explanation', 'bit-integrations'), required: false },
  { key: 'right_answer_text', label: __('Right Answer Text', 'bit-integrations'), required: false },
  { key: 'wrong_answer_text', label: __('Wrong Answer Text', 'bit-integrations'), required: false },
  { key: 'weight', label: __('Weight', 'bit-integrations'), required: false },
  {
    key: 'answers',
    label: __('Answers (JSON array)', 'bit-integrations'),
    required: false
  }
]

export const QuestionIdField = [
  { key: 'question_id', label: __('Question ID', 'bit-integrations'), required: true }
]

export const CategoryFields = [
  { key: 'title', label: __('Title', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const QuizCategoryUpdateFields = [
  { key: 'quiz_category_id', label: __('Quiz Category ID', 'bit-integrations'), required: true },
  { key: 'title', label: __('Title', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const QuizCategoryIdField = [
  { key: 'quiz_category_id', label: __('Quiz Category ID', 'bit-integrations'), required: true }
]

export const QuestionCategoryUpdateFields = [
  {
    key: 'question_category_id',
    label: __('Question Category ID', 'bit-integrations'),
    required: true
  },
  { key: 'title', label: __('Title', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const QuestionCategoryIdField = [
  {
    key: 'question_category_id',
    label: __('Question Category ID', 'bit-integrations'),
    required: true
  }
]

export const ResultFields = [
  { key: 'quiz_id', label: __('Quiz ID', 'bit-integrations'), required: true },
  { key: 'score', label: __('Score', 'bit-integrations'), required: true },
  { key: 'user_name', label: __('User Name', 'bit-integrations'), required: false },
  { key: 'user_email', label: __('User Email', 'bit-integrations'), required: false },
  { key: 'user_phone', label: __('User Phone', 'bit-integrations'), required: false },
  { key: 'user_ip', label: __('User IP', 'bit-integrations'), required: false },
  { key: 'corrects_count', label: __('Correct Answers Count', 'bit-integrations'), required: false },
  { key: 'questions_count', label: __('Questions Count', 'bit-integrations'), required: false },
  { key: 'start_date', label: __('Start Date', 'bit-integrations'), required: false },
  { key: 'end_date', label: __('End Date', 'bit-integrations'), required: false },
  { key: 'duration', label: __('Duration', 'bit-integrations'), required: false },
  { key: 'user_explanation', label: __('User Explanation', 'bit-integrations'), required: false }
]

export const ResultIdField = [
  { key: 'result_id', label: __('Quiz Result ID', 'bit-integrations'), required: true }
]

export const ReviewFields = [
  { key: 'quiz_id', label: __('Quiz ID', 'bit-integrations'), required: true },
  { key: 'review', label: __('Review', 'bit-integrations'), required: false },
  { key: 'user_name', label: __('User Name', 'bit-integrations'), required: false },
  { key: 'user_email', label: __('User Email', 'bit-integrations'), required: false },
  { key: 'user_phone', label: __('User Phone', 'bit-integrations'), required: false },
  { key: 'user_ip', label: __('User IP', 'bit-integrations'), required: false }
]

export const ReviewIdField = [
  { key: 'review_id', label: __('Review ID', 'bit-integrations'), required: true }
]

export const QuestionReportFields = [
  { key: 'question_id', label: __('Question ID', 'bit-integrations'), required: true },
  { key: 'report_text', label: __('Report Text', 'bit-integrations'), required: true },
  { key: 'user_name', label: __('User Name', 'bit-integrations'), required: false },
  { key: 'user_email', label: __('User Email', 'bit-integrations'), required: false },
  { key: 'user_ip', label: __('User IP', 'bit-integrations'), required: false }
]

export const QuestionReportIdField = [
  {
    key: 'question_report_id',
    label: __('Question Report ID', 'bit-integrations'),
    required: true
  }
]

export const publishStatusOptions = [
  { label: __('Published', 'bit-integrations'), value: '1' },
  { label: __('Unpublished', 'bit-integrations'), value: '0' }
]

export const questionTypeOptions = [
  { label: __('Radio', 'bit-integrations'), value: 'radio' },
  { label: __('Checkbox (Multiple)', 'bit-integrations'), value: 'checkbox' },
  { label: __('Dropdown', 'bit-integrations'), value: 'select' },
  { label: __('Text', 'bit-integrations'), value: 'text' },
  { label: __('Short Text', 'bit-integrations'), value: 'short_text' },
  { label: __('Number', 'bit-integrations'), value: 'number' },
  { label: __('Date', 'bit-integrations'), value: 'date' },
  { label: __('True/False', 'bit-integrations'), value: 'true_or_false' },
  { label: __('Info Banner', 'bit-integrations'), value: 'custom' },
  { label: __('Fill in the Blanks', 'bit-integrations'), value: 'fill_in_blank' },
  {
    label: __('Dropdown Fill in the Blanks', 'bit-integrations'),
    value: 'dropdown_fill_in_blank'
  },
  { label: __('Matching', 'bit-integrations'), value: 'matching' },
  { label: __('Ranking', 'bit-integrations'), value: 'ranking' },
  { label: __('Upload File', 'bit-integrations'), value: 'upload_file' }
]

export const reviewScoreOptions = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' }
]

export const needsQuizCategory = ['create_quiz', 'update_quiz']
export const needsQuestionList = ['create_quiz', 'update_quiz']
export const needsQuestionCategory = ['create_question', 'update_question']
export const needsQuestionType = ['create_question']
export const needsQuizStatus = ['change_quiz_status']
export const needsQuestionStatus = ['change_question_status']
export const needsReviewScore = ['create_review']
export const needsUser = ['create_result', 'create_review', 'create_question_report']

export const hasUtilities = [
  'create_quiz',
  'update_quiz',
  'create_question',
  'update_question',
  'create_quiz_category',
  'update_quiz_category',
  'create_question_category',
  'update_question_category'
]
