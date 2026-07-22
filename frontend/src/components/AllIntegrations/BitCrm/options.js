import { __ } from '../../../Utils/i18nwrap'

export const titleOptions = [
  { label: __('Mr', 'bit-integrations'), value: 'mr' },
  { label: __('Mrs', 'bit-integrations'), value: 'mrs' },
  { label: __('Miss', 'bit-integrations'), value: 'miss' },
  { label: __('Ms', 'bit-integrations'), value: 'ms' },
  { label: __('Dr', 'bit-integrations'), value: 'dr' }
]

export const leadSourceOptions = [
  { label: __('None', 'bit-integrations'), value: 'none' },
  { label: __('Advertisement', 'bit-integrations'), value: 'advertisement' },
  { label: __('Cold Call', 'bit-integrations'), value: 'cold_call' },
  { label: __('Employee Referral', 'bit-integrations'), value: 'employee_referral' },
  { label: __('External Referral', 'bit-integrations'), value: 'external_referral' },
  { label: __('Online Store', 'bit-integrations'), value: 'online_store' },
  { label: __('Facebook', 'bit-integrations'), value: 'facebook' }
]

export const leadStatusOptions = [
  { label: __('Qualifies', 'bit-integrations'), value: 'qualifies' },
  { label: __('Negotiation Done', 'bit-integrations'), value: 'negotiation_done' },
  { label: __('Discount Approved', 'bit-integrations'), value: 'discount_approved' },
  { label: __('Discount Rejected', 'bit-integrations'), value: 'discount_rejected' },
  { label: __('Contract Sent', 'bit-integrations'), value: 'contract_sent' },
  { label: __('Deal Win', 'bit-integrations'), value: 'deal_win' },
  { label: __('Deal Lost', 'bit-integrations'), value: 'deal_lost' }
]

// Deal enums use hyphenated values (the CRM stores them hyphenated for deals).
export const dealTypeOptions = [
  { label: __('New Business', 'bit-integrations'), value: 'new-business' },
  { label: __('Existing Business', 'bit-integrations'), value: 'existing-business' }
]

export const dealLeadSourceOptions = [
  { label: __('None', 'bit-integrations'), value: 'none' },
  { label: __('Advertisement', 'bit-integrations'), value: 'advertisement' },
  { label: __('Cold Call', 'bit-integrations'), value: 'cold-call' },
  { label: __('Employee Referral', 'bit-integrations'), value: 'employee-referral' },
  { label: __('External Referral', 'bit-integrations'), value: 'external-referral' },
  { label: __('Online Store', 'bit-integrations'), value: 'online-store' },
  { label: __('Facebook', 'bit-integrations'), value: 'facebook' }
]

export const productTypeOptions = [
  { label: __('Goods', 'bit-integrations'), value: 'goods' },
  { label: __('Service', 'bit-integrations'), value: 'service' }
]

// '1'/'0' (not 'true'/'false'): the CRM casts status via boolval(), and
// boolval('false') === true, which would make Inactive unsettable.
export const productStatusOptions = [
  { label: __('Active', 'bit-integrations'), value: '1' },
  { label: __('Inactive', 'bit-integrations'), value: '0' }
]

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

export const activityTypeOptions = [
  { label: __('Task', 'bit-integrations'), value: 'task' },
  { label: __('Meeting', 'bit-integrations'), value: 'meeting' },
  { label: __('Call', 'bit-integrations'), value: 'call' },
  { label: __('Note', 'bit-integrations'), value: 'note' }
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
