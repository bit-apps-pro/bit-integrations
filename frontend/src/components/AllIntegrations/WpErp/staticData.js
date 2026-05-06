import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  // CRM
  { name: 'createContact', label: __('Create Contact', 'bit-integrations'), is_pro: true, group: 'CRM' },
  { name: 'updateContact', label: __('Update Contact', 'bit-integrations'), is_pro: true, group: 'CRM' },
  { name: 'createCompany', label: __('Create Company', 'bit-integrations'), is_pro: true, group: 'CRM' },
  { name: 'updateCompany', label: __('Update Company', 'bit-integrations'), is_pro: true, group: 'CRM' },
  { name: 'createContactGroup', label: __('Create Contact Group', 'bit-integrations'), is_pro: true, group: 'CRM' },
  { name: 'addContactToGroup', label: __('Add Contact To Group', 'bit-integrations'), is_pro: true, group: 'CRM' },
  { name: 'removeContactFromGroup', label: __('Remove Contact From Group', 'bit-integrations'), is_pro: true, group: 'CRM' },
  { name: 'addNote', label: __('Add Note To Contact', 'bit-integrations'), is_pro: true, group: 'CRM' },
  { name: 'createTask', label: __('Create Task', 'bit-integrations'), is_pro: true, group: 'CRM' },
  // HRM
  { name: 'createDepartment', label: __('Create Department', 'bit-integrations'), is_pro: true, group: 'HRM' },
  { name: 'createDesignation', label: __('Create Designation', 'bit-integrations'), is_pro: true, group: 'HRM' },
  { name: 'createHoliday', label: __('Create Holiday', 'bit-integrations'), is_pro: true, group: 'HRM' },
  // Accounting
  { name: 'createExpense', label: __('Create Expense', 'bit-integrations'), is_pro: true, group: 'Accounting' },
  { name: 'createPayment', label: __('Create Payment', 'bit-integrations'), is_pro: true, group: 'Accounting' }
]

export const ContactFields = [
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: true },
  { key: 'email', label: __('Email', 'bit-integrations'), required: true },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'company', label: __('Company', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'mobile', label: __('Mobile', 'bit-integrations'), required: false },
  { key: 'website', label: __('Website', 'bit-integrations'), required: false },
  { key: 'fax', label: __('Fax', 'bit-integrations'), required: false },
  { key: 'notes', label: __('Notes', 'bit-integrations'), required: false },
  { key: 'street_1', label: __('Street 1', 'bit-integrations'), required: false },
  { key: 'street_2', label: __('Street 2', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'state', label: __('State', 'bit-integrations'), required: false },
  { key: 'postal_code', label: __('Postal Code', 'bit-integrations'), required: false },
  { key: 'country', label: __('Country', 'bit-integrations'), required: false },
  { key: 'currency', label: __('Currency', 'bit-integrations'), required: false }
]

export const ContactUpdateFields = [
  { key: 'id', label: __('Contact ID', 'bit-integrations'), required: true },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'mobile', label: __('Mobile', 'bit-integrations'), required: false },
  { key: 'company', label: __('Company', 'bit-integrations'), required: false },
  { key: 'website', label: __('Website', 'bit-integrations'), required: false },
  { key: 'street_1', label: __('Street 1', 'bit-integrations'), required: false },
  { key: 'street_2', label: __('Street 2', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'state', label: __('State', 'bit-integrations'), required: false },
  { key: 'postal_code', label: __('Postal Code', 'bit-integrations'), required: false },
  { key: 'country', label: __('Country', 'bit-integrations'), required: false }
]

export const CompanyFields = [
  { key: 'company', label: __('Company Name', 'bit-integrations'), required: true },
  { key: 'email', label: __('Email', 'bit-integrations'), required: true },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'website', label: __('Website', 'bit-integrations'), required: false },
  { key: 'fax', label: __('Fax', 'bit-integrations'), required: false },
  { key: 'street_1', label: __('Street 1', 'bit-integrations'), required: false },
  { key: 'street_2', label: __('Street 2', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'state', label: __('State', 'bit-integrations'), required: false },
  { key: 'postal_code', label: __('Postal Code', 'bit-integrations'), required: false },
  { key: 'country', label: __('Country', 'bit-integrations'), required: false }
]

export const CompanyUpdateFields = [
  { key: 'id', label: __('Company ID', 'bit-integrations'), required: true },
  ...CompanyFields.map(f => ({ ...f, required: false })).filter(f => f.key !== 'id')
]

export const ContactGroupFields = [
  { key: 'name', label: __('Group Name', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const GroupSubscriberFields = [
  { key: 'contact_id', label: __('Contact ID', 'bit-integrations'), required: true },
]

export const NoteFields = [
  { key: 'user_id', label: __('Contact User ID', 'bit-integrations'), required: true },
  { key: 'message', label: __('Message', 'bit-integrations'), required: true }
]

export const TaskFields = [
  { key: 'title', label: __('Title', 'bit-integrations'), required: true },
  { key: 'contact_id', label: __('Contact ID', 'bit-integrations'), required: true },
  { key: 'message', label: __('Message', 'bit-integrations'), required: false },
  { key: 'start_date', label: __('Start Date (Y-m-d H:i:s)', 'bit-integrations'), required: false },
  { key: 'end_date', label: __('End Date (Y-m-d H:i:s)', 'bit-integrations'), required: false },
  { key: 'assigned_to', label: __('Assigned To User ID', 'bit-integrations'), required: false }
]

export const DepartmentFields = [
  { key: 'title', label: __('Department Title', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'lead', label: __('Lead User ID', 'bit-integrations'), required: false },
  { key: 'parent', label: __('Parent Department ID', 'bit-integrations'), required: false }
]

export const DesignationFields = [
  { key: 'title', label: __('Designation Title', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const HolidayFields = [
  { key: 'title', label: __('Title', 'bit-integrations'), required: true },
  { key: 'start', label: __('Start Date', 'bit-integrations'), required: true },
  { key: 'end', label: __('End Date', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const ExpenseFields = [
  { key: 'amount', label: __('Amount', 'bit-integrations'), required: true },
  { key: 'people_id', label: __('People ID', 'bit-integrations'), required: false },
  { key: 'voucher_date', label: __('Voucher Date (Y-m-d)', 'bit-integrations'), required: false },
  { key: 'trn_date', label: __('Transaction Date (Y-m-d)', 'bit-integrations'), required: false },
  { key: 'ref', label: __('Reference', 'bit-integrations'), required: false },
  { key: 'check_no', label: __('Check No', 'bit-integrations'), required: false },
  { key: 'name', label: __('Name', 'bit-integrations'), required: false },
  { key: 'particulars', label: __('Particulars', 'bit-integrations'), required: false },
  { key: 'trn_by', label: __('Transaction By (1=Cash)', 'bit-integrations'), required: false },
  { key: 'ledger_id', label: __('Ledger ID', 'bit-integrations'), required: false }
]

export const PaymentFields = [
  { key: 'amount', label: __('Amount', 'bit-integrations'), required: true },
  { key: 'customer_id', label: __('Customer ID', 'bit-integrations'), required: false },
  { key: 'trn_date', label: __('Transaction Date (Y-m-d)', 'bit-integrations'), required: false },
  { key: 'particulars', label: __('Particulars', 'bit-integrations'), required: false },
  { key: 'ref', label: __('Reference', 'bit-integrations'), required: false },
  { key: 'deposit_to', label: __('Deposit To', 'bit-integrations'), required: false },
  { key: 'trn_by', label: __('Transaction By (1=Cash)', 'bit-integrations'), required: false }
]
