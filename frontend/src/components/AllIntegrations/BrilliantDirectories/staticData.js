import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_member', label: __('Create Member', 'bit-integrations'), is_pro: true },
  { name: 'update_member', label: __('Update Member', 'bit-integrations'), is_pro: true },
  { name: 'delete_member', label: __('Delete Member', 'bit-integrations'), is_pro: true },
  { name: 'create_lead', label: __('Create Lead', 'bit-integrations'), is_pro: true },
  { name: 'update_lead', label: __('Update Lead', 'bit-integrations'), is_pro: true },
  { name: 'match_lead', label: __('Match Lead to Members', 'bit-integrations'), is_pro: true },
  { name: 'delete_lead', label: __('Delete Lead', 'bit-integrations'), is_pro: true },
  {
    name: 'create_member_post',
    label: __('Create Member Post', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_review', label: __('Create Review', 'bit-integrations'), is_pro: true },
  { name: 'update_review', label: __('Update Review', 'bit-integrations'), is_pro: true },
  { name: 'delete_review', label: __('Delete Review', 'bit-integrations'), is_pro: true }
]

export const MemberFields = [
  { key: 'email', label: __('Email', 'bit-integrations'), required: true },
  { key: 'password', label: __('Password', 'bit-integrations'), required: true },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'company', label: __('Company', 'bit-integrations'), required: false },
  { key: 'phone_number', label: __('Phone Number', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'state_code', label: __('State Code', 'bit-integrations'), required: false },
  { key: 'country_code', label: __('Country Code', 'bit-integrations'), required: false },
  { key: 'website', label: __('Website', 'bit-integrations'), required: false },
  { key: 'about_me', label: __('About Me', 'bit-integrations'), required: false }
]

export const MemberUpdateFields = [
  {
    key: 'lookup_email',
    label: __('Member Email (identifies the member)', 'bit-integrations'),
    required: true
  },
  { key: 'email', label: __('New Email', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'company', label: __('Company', 'bit-integrations'), required: false },
  { key: 'phone_number', label: __('Phone Number', 'bit-integrations'), required: false }
]

export const MemberIdField = [
  {
    key: 'lookup_email',
    label: __('Member Email (identifies the member)', 'bit-integrations'),
    required: true
  }
]

export const LeadFields = [
  { key: 'lead_name', label: __('Lead Name', 'bit-integrations'), required: true },
  { key: 'lead_email', label: __('Lead Email', 'bit-integrations'), required: true },
  { key: 'lead_phone', label: __('Lead Phone', 'bit-integrations'), required: true },
  { key: 'lead_message', label: __('Lead Message', 'bit-integrations'), required: true },
  { key: 'lead_location', label: __('Lead Location', 'bit-integrations'), required: true }
]

export const LeadUpdateFields = [
  {
    key: 'lookup_lead_email',
    label: __('Lead Email (identifies the lead)', 'bit-integrations'),
    required: true
  },
  { key: 'lead_name', label: __('Lead Name', 'bit-integrations'), required: false },
  { key: 'lead_email', label: __('New Lead Email', 'bit-integrations'), required: false },
  { key: 'lead_phone', label: __('Lead Phone', 'bit-integrations'), required: false },
  { key: 'lead_message', label: __('Lead Message', 'bit-integrations'), required: false },
  { key: 'lead_notes', label: __('Lead Notes', 'bit-integrations'), required: false }
]

export const LeadIdField = [
  {
    key: 'lookup_lead_email',
    label: __('Lead Email (identifies the lead)', 'bit-integrations'),
    required: true
  }
]

export const PostFields = [
  {
    key: 'lookup_email',
    label: __('Member Email (post owner)', 'bit-integrations'),
    required: true
  },
  { key: 'post_title', label: __('Post Title', 'bit-integrations'), required: true },
  { key: 'post_content', label: __('Post Content', 'bit-integrations'), required: false },
  { key: 'post_caption', label: __('Post Caption', 'bit-integrations'), required: false },
  { key: 'post_location', label: __('Post Location', 'bit-integrations'), required: false }
]

export const ReviewFields = [
  {
    key: 'lookup_email',
    label: __('Member Email (reviewed member)', 'bit-integrations'),
    required: true
  },
  { key: 'review_email', label: __('Reviewer Email', 'bit-integrations'), required: true },
  { key: 'review_name', label: __('Reviewer Name', 'bit-integrations'), required: false },
  { key: 'review_title', label: __('Review Title', 'bit-integrations'), required: false },
  { key: 'review_description', label: __('Review Content', 'bit-integrations'), required: false },
  { key: 'rating_overall', label: __('Overall Rating (1-5)', 'bit-integrations'), required: false }
]

export const ReviewUpdateFields = [
  { key: 'review_id', label: __('Review ID', 'bit-integrations'), required: true },
  { key: 'review_title', label: __('Review Title', 'bit-integrations'), required: false },
  { key: 'review_description', label: __('Review Content', 'bit-integrations'), required: false },
  { key: 'rating_overall', label: __('Overall Rating (1-5)', 'bit-integrations'), required: false }
]

export const ReviewIdField = [
  { key: 'review_id', label: __('Review ID', 'bit-integrations'), required: true }
]

export const reviewStatusOptions = [
  { label: __('Pending', 'bit-integrations'), value: '0' },
  { label: __('Accepted', 'bit-integrations'), value: '2' },
  { label: __('Declined', 'bit-integrations'), value: '3' },
  { label: __('Waiting for Admin', 'bit-integrations'), value: '4' }
]

export const needsMembershipPlan = ['create_member']
export const needsTopCategory = ['create_lead']
export const needsPostType = ['create_member_post']
export const hasUtilities = ['create_review', 'update_review']

export const fieldsByAction = {
  create_member: MemberFields,
  create_lead: LeadFields,
  create_member_post: PostFields,
  create_review: ReviewFields,
  delete_lead: LeadIdField,
  delete_member: MemberIdField,
  delete_review: ReviewIdField,
  match_lead: LeadIdField,
  update_lead: LeadUpdateFields,
  update_member: MemberUpdateFields,
  update_review: ReviewUpdateFields
}
