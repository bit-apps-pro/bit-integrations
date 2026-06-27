import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  {
    label: __('Create Documentation', 'bit-integrations'),
    name: 'create_documentation',
    is_pro: true
  },
  {
    label: __('Create Section', 'bit-integrations'),
    name: 'create_section',
    is_pro: true
  },
  {
    label: __('Create Article', 'bit-integrations'),
    name: 'create_article',
    is_pro: true
  }
]

export const weDocsActionFields = [
  { key: 'post_title', label: __('Title', 'bit-integrations'), required: true },
  { key: 'post_content', label: __('Content', 'bit-integrations'), required: false },
  { key: 'post_status', label: __('Status', 'bit-integrations'), required: false }
]

export const documentationSelectionActions = ['create_section', 'create_article']

export const sectionSelectionActions = ['create_article']

export const requiredDocumentationSelectionActions = ['create_section', 'create_article']

export const requiredSectionSelectionActions = ['create_article']
