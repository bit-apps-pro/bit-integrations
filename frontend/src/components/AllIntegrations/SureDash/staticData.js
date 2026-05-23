import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_post', label: __('Create Post', 'bit-integrations'), is_pro: true },
  { name: 'delete_post', label: __('Delete Post', 'bit-integrations'), is_pro: true },
  { name: 'create_comment', label: __('Create Comment', 'bit-integrations'), is_pro: true },
  { name: 'delete_comment', label: __('Delete Comment', 'bit-integrations'), is_pro: true },
  { name: 'update_user_profile', label: __('Update User Profile', 'bit-integrations'), is_pro: true },
  { name: 'bookmark_item', label: __('Bookmark Item', 'bit-integrations'), is_pro: true },
  { name: 'react_to_entity', label: __('React to Entity', 'bit-integrations'), is_pro: true }
]

export const CreatePostFields = [
  { key: 'postTitle', label: __('Post Title', 'bit-integrations'), required: true },
  { key: 'postContent', label: __('Post Content', 'bit-integrations'), required: false },
  { key: 'postStatus', label: __('Post Status', 'bit-integrations'), required: false }
]

export const DeletePostFields = [
  { key: 'postId', label: __('Post ID', 'bit-integrations'), required: true }
]

export const CreateCommentFields = [
  { key: 'commentContent', label: __('Comment Content', 'bit-integrations'), required: true }
]

export const DeleteCommentFields = [
  { key: 'commentId', label: __('Comment ID', 'bit-integrations'), required: true }
]

export const UpdateUserProfileFields = [
  { key: 'userEmail', label: __('User Email', 'bit-integrations'), required: true },
  { key: 'user_login', label: __('Username', 'bit-integrations'), required: false },
  { key: 'display_name', label: __('Display Name', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'user_pass', label: __('Password', 'bit-integrations'), required: false }
]

export const BookmarkItemFields = [
  { key: 'itemId', label: __('Item ID', 'bit-integrations'), required: true },
  { key: 'itemType', label: __('Item Type', 'bit-integrations'), required: true },
  { key: 'userEmail', label: __('User Email', 'bit-integrations'), required: true }
]

export const ReactToEntityFields = [
  { key: 'entityId', label: __('Entity ID', 'bit-integrations'), required: true },
  { key: 'entityType', label: __('Entity Type (post/comment)', 'bit-integrations'), required: true },
  { key: 'userEmail', label: __('User Email', 'bit-integrations'), required: true }
]
