import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_lead', label: __('Create Lead', 'bit-integrations'), is_pro: true },
  { name: 'create_client', label: __('Create Client', 'bit-integrations'), is_pro: true },
  { name: 'create_deal', label: __('Create Deal', 'bit-integrations'), is_pro: true }
]

export const LeadFields = [
  { key: 'name', label: __('Name', 'bit-integrations'), required: true },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'mobile', label: __('Mobile', 'bit-integrations'), required: false },
  { key: 'secondaryMobile', label: __('Secondary Mobile', 'bit-integrations'), required: false },
  { key: 'title', label: __('Title', 'bit-integrations'), required: false },
  { key: 'value', label: __('Value', 'bit-integrations'), required: false },
  { key: 'website', label: __('Website', 'bit-integrations'), required: false }
]

export const ClientFields = [
  { key: 'name', label: __('Name', 'bit-integrations'), required: false },
  { key: 'firstName', label: __('First Name', 'bit-integrations'), required: true },
  { key: 'lastName', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'salutation', label: __('Salutation', 'bit-integrations'), required: false },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'jobTitle', label: __('Job Title', 'bit-integrations'), required: false },
  { key: 'website', label: __('Website', 'bit-integrations'), required: false },
  { key: 'taxNumber', label: __('Tax Number', 'bit-integrations'), required: false },
  { key: 'openingBalance', label: __('Opening Balance', 'bit-integrations'), required: false },
  { key: 'billingStreet', label: __('Billing Address', 'bit-integrations'), required: false },
  { key: 'billingCity', label: __('Billing City', 'bit-integrations'), required: false },
  { key: 'billingState', label: __('Billing State', 'bit-integrations'), required: false },
  { key: 'billingCountry', label: __('Billing Country', 'bit-integrations'), required: false },
  { key: 'billingPostalCode', label: __('Billing Postal Code', 'bit-integrations'), required: false },
  { key: 'billingLandmark', label: __('Billing Landmark', 'bit-integrations'), required: false },
  { key: 'primaryContactFirstName', label: __('Primary Contact First Name', 'bit-integrations'), required: false },
  { key: 'primaryContactLastName', label: __('Primary Contact Last Name', 'bit-integrations'), required: false },
  { key: 'primaryContactEmail', label: __('Primary Contact Email', 'bit-integrations'), required: false },
  { key: 'primaryContactPhone', label: __('Primary Contact Phone', 'bit-integrations'), required: false },
  { key: 'primaryContactSalutation', label: __('Primary Contact Salutation', 'bit-integrations'), required: false },
  { key: 'primaryContactJobTitle', label: __('Primary Contact Job Title', 'bit-integrations'), required: false }
]

export const DealFields = [
  { key: 'title', label: __('Title', 'bit-integrations'), required: true },
  { key: 'price', label: __('Price', 'bit-integrations'), required: false },
  { key: 'expectedCloseDate', label: __('Expected Close Date', 'bit-integrations'), required: false }
]

export const ClientTypes = [
  { label: __('Company', 'bit-integrations'), value: 'company' },
  { label: __('Contact', 'bit-integrations'), value: 'contact' }
]

export const DealPriorities = [
  { label: __('Low', 'bit-integrations'), value: 'LOW' },
  { label: __('Medium', 'bit-integrations'), value: 'MEDIUM' },
  { label: __('High', 'bit-integrations'), value: 'HIGH' }
]
