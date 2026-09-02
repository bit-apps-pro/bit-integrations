import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_donation', label: __('Create Donation', 'bit-integrations'), is_pro: true },
  {
    name: 'update_donation_status',
    label: __('Update Donation Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'add_donation_note', label: __('Add Donation Note', 'bit-integrations'), is_pro: true },
  { name: 'delete_donation', label: __('Delete Donation', 'bit-integrations'), is_pro: true },
  { name: 'create_campaign', label: __('Create Campaign', 'bit-integrations'), is_pro: true },
  { name: 'update_campaign', label: __('Update Campaign', 'bit-integrations'), is_pro: true },
  { name: 'delete_campaign', label: __('Delete Campaign', 'bit-integrations'), is_pro: true },
  { name: 'create_donor', label: __('Create Donor', 'bit-integrations'), is_pro: true },
  { name: 'update_donor', label: __('Update Donor', 'bit-integrations'), is_pro: true },
  {
    name: 'create_user_profile',
    label: __('Create User Profile', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_user_profile',
    label: __('Update User Profile', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'mark_user_verified',
    label: __('Mark User as Verified', 'bit-integrations'),
    is_pro: true
  }
]

export const DonationFields = [
  { key: 'amount', label: __('Donation Amount', 'bit-integrations'), required: true },
  { key: 'email', label: __('Donor Email', 'bit-integrations'), required: true },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'company', label: __('Company', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'address', label: __('Address', 'bit-integrations'), required: false },
  { key: 'address_2', label: __('Address Line 2', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'state', label: __('State', 'bit-integrations'), required: false },
  { key: 'postcode', label: __('Postcode', 'bit-integrations'), required: false },
  { key: 'country', label: __('Country', 'bit-integrations'), required: false },
  { key: 'gateway', label: __('Payment Gateway', 'bit-integrations'), required: false },
  { key: 'note', label: __('Donation Note', 'bit-integrations'), required: false }
]

export const DonationIdField = [
  { key: 'donation_id', label: __('Donation ID', 'bit-integrations'), required: true }
]

export const DonationNoteFields = [
  { key: 'donation_id', label: __('Donation ID', 'bit-integrations'), required: true },
  { key: 'note', label: __('Note', 'bit-integrations'), required: true }
]

export const CampaignFields = [
  { key: 'title', label: __('Campaign Title', 'bit-integrations'), required: true },
  { key: 'content', label: __('Campaign Content', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'goal', label: __('Fundraising Goal', 'bit-integrations'), required: false },
  {
    key: 'end_date',
    label: __('End Date (Y-m-d H:i:s)', 'bit-integrations'),
    required: false
  },
  {
    key: 'minimum_donation_amount',
    label: __('Minimum Donation Amount', 'bit-integrations'),
    required: false
  },
  {
    key: 'suggested_donations_default',
    label: __('Default Suggested Amount', 'bit-integrations'),
    required: false
  }
]

export const CampaignUpdateFields = [
  { key: 'campaign_id', label: __('Campaign ID', 'bit-integrations'), required: true },
  { key: 'title', label: __('Campaign Title', 'bit-integrations'), required: false },
  { key: 'content', label: __('Campaign Content', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'goal', label: __('Fundraising Goal', 'bit-integrations'), required: false },
  {
    key: 'end_date',
    label: __('End Date (Y-m-d H:i:s)', 'bit-integrations'),
    required: false
  },
  {
    key: 'minimum_donation_amount',
    label: __('Minimum Donation Amount', 'bit-integrations'),
    required: false
  },
  {
    key: 'suggested_donations_default',
    label: __('Default Suggested Amount', 'bit-integrations'),
    required: false
  }
]

export const CampaignIdField = [
  { key: 'campaign_id', label: __('Campaign ID', 'bit-integrations'), required: true }
]

export const DonorFields = [
  { key: 'email', label: __('Donor Email', 'bit-integrations'), required: true },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false }
]

export const DonorUpdateFields = [
  { key: 'donor_id', label: __('Donor ID', 'bit-integrations'), required: true },
  { key: 'email', label: __('Donor Email', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false }
]

export const UserFields = [
  { key: 'user_email', label: __('Email', 'bit-integrations'), required: true },
  { key: 'user_login', label: __('Username', 'bit-integrations'), required: false },
  { key: 'user_pass', label: __('Password', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'display_name', label: __('Display Name', 'bit-integrations'), required: false },
  { key: 'nickname', label: __('Nickname', 'bit-integrations'), required: false },
  { key: 'user_url', label: __('Website', 'bit-integrations'), required: false },
  { key: 'organisation', label: __('Organisation', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'address', label: __('Address', 'bit-integrations'), required: false },
  { key: 'address_2', label: __('Address Line 2', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'state', label: __('State', 'bit-integrations'), required: false },
  { key: 'postcode', label: __('Postcode', 'bit-integrations'), required: false },
  { key: 'country', label: __('Country', 'bit-integrations'), required: false },
  { key: 'description', label: __('Biography', 'bit-integrations'), required: false }
]

export const UserUpdateFields = [
  { key: 'user_id', label: __('User ID', 'bit-integrations'), required: true },
  { key: 'user_email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'display_name', label: __('Display Name', 'bit-integrations'), required: false },
  { key: 'nickname', label: __('Nickname', 'bit-integrations'), required: false },
  { key: 'user_url', label: __('Website', 'bit-integrations'), required: false },
  { key: 'organisation', label: __('Organisation', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'address', label: __('Address', 'bit-integrations'), required: false },
  { key: 'address_2', label: __('Address Line 2', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'state', label: __('State', 'bit-integrations'), required: false },
  { key: 'postcode', label: __('Postcode', 'bit-integrations'), required: false },
  { key: 'country', label: __('Country', 'bit-integrations'), required: false },
  { key: 'description', label: __('Biography', 'bit-integrations'), required: false }
]

export const UserIdField = [{ key: 'user_id', label: __('User ID', 'bit-integrations'), required: true }]

export const campaignStatusOptions = [
  { label: __('Published', 'bit-integrations'), value: 'publish' },
  { label: __('Draft', 'bit-integrations'), value: 'draft' },
  { label: __('Pending Review', 'bit-integrations'), value: 'pending' },
  { label: __('Private', 'bit-integrations'), value: 'private' }
]

export const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: 'yes' },
  { label: __('No', 'bit-integrations'), value: 'no' }
]

export const needsCampaign = ['create_donation']

export const needsDonationStatus = ['update_donation_status']

export const hasUtilities = [
  'create_donation',
  'delete_donation',
  'create_campaign',
  'update_campaign',
  'delete_campaign',
  'create_donor',
  'update_donor',
  'create_user_profile',
  'update_user_profile',
  'mark_user_verified'
]
