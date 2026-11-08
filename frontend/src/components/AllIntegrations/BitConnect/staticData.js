import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_post', label: __('Create Post', 'bit-integrations'), is_pro: false },
  {
    name: 'set_post_status',
    label: __('Set Post Status or Stage', 'bit-integrations'),
    is_pro: false
  },
  { name: 'vote_for_post', label: __('Vote for Post', 'bit-integrations'), is_pro: false },
  { name: 'add_comment', label: __('Add Comment', 'bit-integrations'), is_pro: false },
  { name: 'award_badge', label: __('Award Badge', 'bit-integrations'), is_pro: false },
  { name: 'add_member_to_group', label: __('Add Member to Group', 'bit-integrations'), is_pro: false },
  {
    name: 'remove_member_from_group',
    label: __('Remove Member from Group', 'bit-integrations'),
    is_pro: false
  }
]

export const CreatePostFields = [
  { key: 'post_title', label: __('Post Title', 'bit-integrations'), required: true },
  { key: 'author_email', label: __('Member Email', 'bit-integrations'), required: true },
  { key: 'post_content', label: __('Post Content', 'bit-integrations'), required: false },
  { key: 'post_name', label: __('Post Slug', 'bit-integrations'), required: false }
]

export const PostIdFields = [
  { key: 'post_id', label: __('Post ID', 'bit-integrations'), required: true }
]

export const VoteFields = [
  { key: 'post_id', label: __('Post ID', 'bit-integrations'), required: true },
  { key: 'author_email', label: __('Member Email', 'bit-integrations'), required: true }
]

export const CommentFields = [
  { key: 'post_id', label: __('Post ID', 'bit-integrations'), required: true },
  { key: 'content', label: __('Comment Content', 'bit-integrations'), required: true },
  { key: 'author_email', label: __('Member Email', 'bit-integrations'), required: true },
  { key: 'parent_id', label: __('Parent Comment ID', 'bit-integrations'), required: false }
]

export const MemberEmailFields = [
  { key: 'email', label: __('Member Email', 'bit-integrations'), required: true }
]

export const groupRoleOptions = [
  { label: __('Member', 'bit-integrations'), value: 'member' },
  { label: __('Moderator', 'bit-integrations'), value: 'moderator' }
]

export const needsTopicTypeSelect = ['create_post']
export const needsGroupSelect = ['create_post', 'add_member_to_group', 'remove_member_from_group']
export const needsTagSelect = ['create_post']
export const needsStatusSelect = ['set_post_status']
export const needsBadgeSelect = ['award_badge']
export const needsRoleSelect = ['add_member_to_group']
export const requiredGroupActions = ['add_member_to_group', 'remove_member_from_group']
export const actsAsMember = ['create_post', 'vote_for_post', 'add_comment']
