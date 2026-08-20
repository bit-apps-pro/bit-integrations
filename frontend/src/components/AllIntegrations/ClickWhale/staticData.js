import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_link', label: __('Create Link', 'bit-integrations'), is_pro: true },
  { name: 'update_link', label: __('Update Link', 'bit-integrations'), is_pro: true },
  { name: 'delete_link', label: __('Delete Link', 'bit-integrations'), is_pro: true }
]

export const CreateLinkFields = [
  { key: 'title', label: __('Title', 'bit-integrations'), required: true },
  { key: 'url', label: __('Target URL', 'bit-integrations'), required: true },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const UpdateLinkFields = [
  { key: 'link_id', label: __('Link ID', 'bit-integrations'), required: true },
  { key: 'title', label: __('Title', 'bit-integrations'), required: false },
  { key: 'url', label: __('Target URL', 'bit-integrations'), required: false },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const DeleteLinkFields = [
  { key: 'link_id', label: __('Link ID', 'bit-integrations'), required: true }
]

export const redirectionOptions = [
  { label: __('301: Moved permanently', 'bit-integrations'), value: '301' },
  { label: __('302: Found / Moved temporarily', 'bit-integrations'), value: '302' },
  { label: __('303: See other', 'bit-integrations'), value: '303' },
  { label: __('307: Temporarily redirect', 'bit-integrations'), value: '307' },
  { label: __('308: Permanent redirect', 'bit-integrations'), value: '308' }
]

export const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: 'yes' },
  { label: __('No', 'bit-integrations'), value: 'no' }
]

export const needsAuthor = ['create_link']

export const hasUtilities = ['create_link', 'update_link']
