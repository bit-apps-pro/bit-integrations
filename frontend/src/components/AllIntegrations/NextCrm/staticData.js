import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_contact', label: __('Create Contact', 'bit-integrations'), is_pro: true },
  { name: 'update_contact', label: __('Update Contact', 'bit-integrations'), is_pro: true },
  { name: 'delete_contact', label: __('Delete Contact', 'bit-integrations'), is_pro: true },
  {
    name: 'change_contact_status',
    label: __('Change Contact Status', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_contact_field',
    label: __('Update Contact Field', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'add_contact_activity',
    label: __('Add Contact Activity', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_tag', label: __('Create Tag', 'bit-integrations'), is_pro: true },
  { name: 'add_tag_to_contact', label: __('Add Tag to Contact', 'bit-integrations'), is_pro: true },
  {
    name: 'remove_tag_from_contact',
    label: __('Remove Tag from Contact', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_list', label: __('Create List', 'bit-integrations'), is_pro: true },
  {
    name: 'add_contact_to_list',
    label: __('Add Contact to List', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'remove_contact_from_list',
    label: __('Remove Contact from List', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'send_campaign_email',
    label: __('Send Campaign Email to Contact', 'bit-integrations'),
    is_pro: true
  }
]

const ContactEmailField = {
  key: 'contact_email',
  label: __('Contact Email', 'bit-integrations'),
  required: true
}

const AdditionalFields = [
  { key: 'mobile', label: __('Mobile', 'bit-integrations'), required: false },
  { key: 'source', label: __('Source', 'bit-integrations'), required: false },
  { key: 'date_of_birth', label: __('Date of Birth', 'bit-integrations'), required: false },
  { key: 'gender', label: __('Gender', 'bit-integrations'), required: false },
  { key: 'address', label: __('Address', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'state', label: __('State', 'bit-integrations'), required: false },
  { key: 'zip', label: __('Zip', 'bit-integrations'), required: false },
  { key: 'country', label: __('Country', 'bit-integrations'), required: false }
]

const ContactProfileFields = [
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'photo', label: __('Photo URL', 'bit-integrations'), required: false },
  { key: 'rating', label: __('Rating', 'bit-integrations'), required: false },
  ...AdditionalFields
]

export const CreateContactFields = [
  { key: 'email_address', label: __('Email Address', 'bit-integrations'), required: true },
  ...ContactProfileFields
]

export const UpdateContactFields = [
  ContactEmailField,
  { key: 'new_email_address', label: __('New Email Address', 'bit-integrations'), required: false },
  ...ContactProfileFields
]

export const ContactEmailOnlyFields = [ContactEmailField]

export const UpdateContactFieldFields = [
  ContactEmailField,
  { key: 'value', label: __('Value', 'bit-integrations'), required: true }
]

export const ContactActivityFields = [
  ContactEmailField,
  { key: 'title', label: __('Title', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const TaxonomyFields = [
  { key: 'title', label: __('Title', 'bit-integrations'), required: true },
  { key: 'name', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const CampaignEmailFields = [
  ContactEmailField,
  { key: 'body', label: __('Email Body', 'bit-integrations'), required: true },
  { key: 'subject', label: __('Subject', 'bit-integrations'), required: false }
]

export const nextCrmStaticData = {
  create_contact: CreateContactFields,
  update_contact: UpdateContactFields,
  delete_contact: ContactEmailOnlyFields,
  change_contact_status: ContactEmailOnlyFields,
  update_contact_field: UpdateContactFieldFields,
  add_contact_activity: ContactActivityFields,
  create_tag: TaxonomyFields,
  create_list: TaxonomyFields,
  add_tag_to_contact: ContactEmailOnlyFields,
  remove_tag_from_contact: ContactEmailOnlyFields,
  add_contact_to_list: ContactEmailOnlyFields,
  remove_contact_from_list: ContactEmailOnlyFields,
  send_campaign_email: CampaignEmailFields
}

// Fixed option sets — rendered as selects, never mapped.
export const activityStatusOptions = [
  { label: __('Active', 'bit-integrations'), value: 'active' },
  { label: __('Deactive', 'bit-integrations'), value: 'deactive' },
  { label: __('Delete', 'bit-integrations'), value: 'delete' }
]

export const yesNoOptions = [
  { label: __('No', 'bit-integrations'), value: 'no' },
  { label: __('Yes', 'bit-integrations'), value: 'yes' }
]

// Required config selects → IntegLayout.
export const needsStatus = ['change_contact_status']
export const needsContactField = ['update_contact_field']
export const needsTag = ['add_tag_to_contact', 'remove_tag_from_contact']
export const needsList = ['add_contact_to_list', 'remove_contact_from_list']
export const needsCampaign = ['send_campaign_email']

// Optional config selects → Utilities.
export const hasUtilities = [
  'create_contact',
  'update_contact',
  'add_contact_activity',
  'send_campaign_email'
]
