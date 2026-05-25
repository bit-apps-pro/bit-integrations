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
  { key: 'name', label: __('Name', 'bit-integrations'), required: true },
  { key: 'firstName', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'lastName', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'website', label: __('Website', 'bit-integrations'), required: false },
  { key: 'taxNumber', label: __('Tax Number', 'bit-integrations'), required: false }
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
