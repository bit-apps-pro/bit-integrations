import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'sync_site', label: __('Sync Site', 'bit-integrations'), is_pro: true },
  { name: 'sync_all_sites', label: __('Sync All Sites', 'bit-integrations'), is_pro: true },
  { name: 'create_post', label: __('Create Post', 'bit-integrations'), is_pro: true },
  { name: 'update_post', label: __('Update Post', 'bit-integrations'), is_pro: true },
  { name: 'delete_post', label: __('Delete Post', 'bit-integrations'), is_pro: true },
  { name: 'activate_plugin', label: __('Activate Plugin', 'bit-integrations'), is_pro: true },
  { name: 'deactivate_plugin', label: __('Deactivate Plugin', 'bit-integrations'), is_pro: true },
  { name: 'create_user', label: __('Create User', 'bit-integrations'), is_pro: true }
]

export const SyncSiteFields = []

export const SyncAllSitesFields = []

export const CreatePostFields = [
  { key: 'post_type', label: __('Post Type', 'bit-integrations'), required: true },
  { key: 'post_title', label: __('Post Title', 'bit-integrations'), required: true },
  { key: 'post_content', label: __('Post Content', 'bit-integrations'), required: false },
  { key: 'post_status', label: __('Post Status', 'bit-integrations'), required: false },
  { key: 'post_excerpt', label: __('Post Excerpt', 'bit-integrations'), required: false },
  { key: 'post_author', label: __('Post Author ID', 'bit-integrations'), required: false },
  { key: 'post_date', label: __('Post Date', 'bit-integrations'), required: false },
  { key: 'comment_status', label: __('Comment Status', 'bit-integrations'), required: false }
]

export const UpdatePostFields = [
  { key: 'post_id', label: __('Post ID', 'bit-integrations'), required: true },
  { key: 'post_title', label: __('Post Title', 'bit-integrations'), required: false },
  { key: 'post_content', label: __('Post Content', 'bit-integrations'), required: false },
  { key: 'post_status', label: __('Post Status', 'bit-integrations'), required: false },
  { key: 'post_excerpt', label: __('Post Excerpt', 'bit-integrations'), required: false }
]

export const DeletePostFields = [
  { key: 'post_id', label: __('Post ID', 'bit-integrations'), required: true }
]

export const PluginActionFields = [
  { key: 'plugin_slug', label: __('Plugin Slug', 'bit-integrations'), required: true }
]

export const CreateUserFields = [
  { key: 'user_login', label: __('Username', 'bit-integrations'), required: true },
  { key: 'user_email', label: __('User Email', 'bit-integrations'), required: true },
  { key: 'user_pass', label: __('Password', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'role', label: __('User Role', 'bit-integrations'), required: false }
]
