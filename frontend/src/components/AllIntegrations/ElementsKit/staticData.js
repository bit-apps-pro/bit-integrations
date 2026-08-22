import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_template', label: __('Create Template', 'bit-integrations'), is_pro: true },
  { name: 'update_template', label: __('Update Template', 'bit-integrations'), is_pro: true },
  {
    name: 'update_template_activation',
    label: __('Update Template Activation', 'bit-integrations'),
    is_pro: true
  },
  { name: 'delete_template', label: __('Delete Template', 'bit-integrations'), is_pro: true },
  { name: 'create_widget', label: __('Create Widget', 'bit-integrations'), is_pro: true },
  { name: 'update_widget', label: __('Update Widget', 'bit-integrations'), is_pro: true },
  { name: 'delete_widget', label: __('Delete Widget', 'bit-integrations'), is_pro: true },
  {
    name: 'create_content',
    label: __('Create Dynamic Content', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_content',
    label: __('Update Dynamic Content', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_content',
    label: __('Delete Dynamic Content', 'bit-integrations'),
    is_pro: true
  }
]

// Field maps hold only the required identifier of the record being acted on plus free
// text. Every enum lives in a select, and the optional parent item is a fetched dropdown.
export const TemplateCreateFields = [
  { key: 'title', label: __('Title', 'bit-integrations'), required: true },
  {
    key: 'condition_singular_id',
    label: __('Singular Post IDs', 'bit-integrations'),
    required: false
  }
]

export const TemplateUpdateFields = [
  { key: 'template_id', label: __('Template ID', 'bit-integrations'), required: true },
  { key: 'title', label: __('Title', 'bit-integrations'), required: false },
  {
    key: 'condition_singular_id',
    label: __('Singular Post IDs', 'bit-integrations'),
    required: false
  }
]

export const TemplateIdField = [
  { key: 'template_id', label: __('Template ID', 'bit-integrations'), required: true }
]

export const WidgetCreateFields = [
  { key: 'title', label: __('Title', 'bit-integrations'), required: true },
  { key: 'icon', label: __('Icon', 'bit-integrations'), required: false },
  { key: 'categories', label: __('Categories', 'bit-integrations'), required: false },
  { key: 'markup', label: __('Markup', 'bit-integrations'), required: false },
  { key: 'css', label: __('CSS', 'bit-integrations'), required: false },
  { key: 'js', label: __('JavaScript', 'bit-integrations'), required: false },
  { key: 'widget_data', label: __('Widget Controls (JSON)', 'bit-integrations'), required: false }
]

export const WidgetUpdateFields = [
  { key: 'widget_id', label: __('Widget ID', 'bit-integrations'), required: true },
  { key: 'title', label: __('Title', 'bit-integrations'), required: false },
  { key: 'icon', label: __('Icon', 'bit-integrations'), required: false },
  { key: 'categories', label: __('Categories', 'bit-integrations'), required: false },
  { key: 'markup', label: __('Markup', 'bit-integrations'), required: false },
  { key: 'css', label: __('CSS', 'bit-integrations'), required: false },
  { key: 'js', label: __('JavaScript', 'bit-integrations'), required: false },
  { key: 'widget_data', label: __('Widget Controls (JSON)', 'bit-integrations'), required: false }
]

export const WidgetIdField = [
  { key: 'widget_id', label: __('Widget ID', 'bit-integrations'), required: true }
]

export const ContentCreateFields = [
  { key: 'title', label: __('Title', 'bit-integrations'), required: true },
  { key: 'content', label: __('Content', 'bit-integrations'), required: false }
]

export const ContentUpdateFields = [
  { key: 'content_id', label: __('Content ID', 'bit-integrations'), required: true },
  { key: 'title', label: __('Title', 'bit-integrations'), required: false },
  { key: 'content', label: __('Content', 'bit-integrations'), required: false }
]

export const ContentIdField = [
  { key: 'content_id', label: __('Content ID', 'bit-integrations'), required: true }
]

// Fixed option sets — rendered as selects, never mapped.
export const templateTypeOptions = [
  { label: __('Header', 'bit-integrations'), value: 'header' },
  { label: __('Footer', 'bit-integrations'), value: 'footer' },
  { label: __('Section', 'bit-integrations'), value: 'section' }
]

export const activationOptions = [
  { label: __('Active', 'bit-integrations'), value: 'yes' },
  { label: __('Inactive', 'bit-integrations'), value: 'no' }
]

export const statusOptions = [
  { label: __('Publish', 'bit-integrations'), value: 'publish' },
  { label: __('Draft', 'bit-integrations'), value: 'draft' },
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Private', 'bit-integrations'), value: 'private' }
]

export const conditionOptions = [
  { label: __('Entire Site', 'bit-integrations'), value: 'entire_site' },
  { label: __('Singular (ElementsKit Pro)', 'bit-integrations'), value: 'singular' },
  { label: __('Archive (ElementsKit Pro)', 'bit-integrations'), value: 'archive' }
]

export const singularConditionOptions = [
  { label: __('All Singulars', 'bit-integrations'), value: 'all_singular' },
  { label: __('Front Page', 'bit-integrations'), value: 'front_page' },
  { label: __('All Posts', 'bit-integrations'), value: 'all_post' },
  { label: __('All Pages', 'bit-integrations'), value: 'all_page' },
  { label: __('Selective Singular', 'bit-integrations'), value: 'selective_singular' },
  { label: __('404 Page', 'bit-integrations'), value: 'not_found404' }
]

export const forceDeleteOptions = [
  { label: __('Move to Trash', 'bit-integrations'), value: 'no' },
  { label: __('Delete Permanently', 'bit-integrations'), value: 'yes' }
]

// Required options render in IntegLayout; optional ones live behind Utilities.
export const needsTemplateType = ['create_template']
export const needsActivation = ['update_template_activation']
export const needsParentContent = ['create_content', 'update_content']
export const hasUtilities = [
  'create_template',
  'update_template',
  'delete_template',
  'create_widget',
  'update_widget',
  'delete_widget',
  'create_content',
  'update_content',
  'delete_content'
]
