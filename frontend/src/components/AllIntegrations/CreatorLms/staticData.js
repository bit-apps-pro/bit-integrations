import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_student', label: __('Create Student', 'bit-integrations'), is_pro: true },
  { name: 'update_student_data', label: __('Update Student Data', 'bit-integrations'), is_pro: true },
  {
    name: 'enroll_user_in_course',
    label: __('Enroll User in Course', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_course', label: __('Create Course', 'bit-integrations'), is_pro: true },
  { name: 'mark_lesson_completed', label: __('Mark Lesson Completed', 'bit-integrations'), is_pro: true }
]

export const CreateStudentFields = [
  { key: 'user_email', label: __('Student Email', 'bit-integrations'), required: true },
  { key: 'username', label: __('Username', 'bit-integrations'), required: false },
  { key: 'password', label: __('Password', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false }
]

export const UpdateStudentFields = [
  { key: 'user_email', label: __('Student Email', 'bit-integrations'), required: true },
  { key: 'new_email', label: __('New Email Address', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'display_name', label: __('Display Name', 'bit-integrations'), required: false }
]

export const EnrollUserInCourseFields = [
  { key: 'user_email', label: __('Student Email', 'bit-integrations'), required: true },
  { key: 'course_id', label: __('Course ID', 'bit-integrations'), required: true }
]

export const CreateCourseFields = [
  { key: 'course_title', label: __('Course Title', 'bit-integrations'), required: true },
  { key: 'course_description', label: __('Course Description', 'bit-integrations'), required: true }
]

export const courseStatusOptions = [
  { label: __('Draft', 'bit-integrations'), value: 'draft' },
  { label: __('Publish', 'bit-integrations'), value: 'publish' },
  { label: __('Pending', 'bit-integrations'), value: 'pending' }
]

export const MarkLessonCompletedFields = [
  { key: 'user_email', label: __('Student Email', 'bit-integrations'), required: true },
  { key: 'course_id', label: __('Course ID', 'bit-integrations'), required: true },
  { key: 'lesson_id', label: __('Lesson ID', 'bit-integrations'), required: true }
]
