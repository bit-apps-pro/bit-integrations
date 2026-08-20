import { __ } from '../../../Utils/i18nwrap'

export const moduleOptions = [
  { label: __('Lead', 'bit-integrations'), value: 'lead' },
  { label: __('Contact', 'bit-integrations'), value: 'contact' },
  { label: __('Company', 'bit-integrations'), value: 'company' },
  { label: __('Deal', 'bit-integrations'), value: 'deal' }
]

export const convertToOptions = [
  { label: __('Contact', 'bit-integrations'), value: 'contact' },
  { label: __('Company', 'bit-integrations'), value: 'company' },
  { label: __('Deal', 'bit-integrations'), value: 'deal' }
]

export const activityStatusOptions = [
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Completed', 'bit-integrations'), value: 'completed' }
]

export const invoiceStatusOptions = [
  { label: __('Draft', 'bit-integrations'), value: 'draft' },
  { label: __('Sent', 'bit-integrations'), value: 'sent' },
  { label: __('Overdue', 'bit-integrations'), value: 'overdue' },
  { label: __('Paid', 'bit-integrations'), value: 'paid' }
]

export const portalCapabilityOptions = [
  { label: __('Contact', 'bit-integrations'), value: 'contact' },
  { label: __('Deals', 'bit-integrations'), value: 'deal' },
  { label: __('Invoices', 'bit-integrations'), value: 'invoice' },
  { label: __('Notes', 'bit-integrations'), value: 'notes' },
  { label: __('Meetings', 'bit-integrations'), value: 'meetings' },
  { label: __('Calls', 'bit-integrations'), value: 'calls' }
]

export const priorityOptions = [
  { label: __('Low', 'bit-integrations'), value: 'low' },
  { label: __('Medium', 'bit-integrations'), value: 'medium' },
  { label: __('High', 'bit-integrations'), value: 'high' }
]

export const taxOptions = [
  { label: __('Tax Exclusive', 'bit-integrations'), value: 'exclusive' },
  { label: __('Tax Inclusive', 'bit-integrations'), value: 'inclusive' }
]
