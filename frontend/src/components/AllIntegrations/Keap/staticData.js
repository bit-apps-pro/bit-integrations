import { __ } from "../../../Utils/i18nwrap";

export const contactFields = [
  { key: 'given_name', label: __('First Name', 'bit-integrations'), required: true },
  { key: 'middle_name', label: __('Middle Name', 'bit-integrations'), required: false },
  { key: 'family_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'job_title', label: __('Job Title', 'bit-integrations'), required: false },
  { key: 'email_addresses', label: __('Email Addresses', 'bit-integrations'), required: true },
  { key: 'phone_numbers', label: __('Phone Numbers', 'bit-integrations'), required: false },
  {
    key: 'billing_country_code',
    label: __('Billing Country Code', 'bit-integrations'),
    required: false
  },
  { key: 'billing_locality', label: __('Billing Country', 'bit-integrations'), required: false },
  {
    key: 'billing_first_address_street',
    label: __('Billing Address Street (Line 1)', 'bit-integrations'),
    required: false
  },
  {
    key: 'billing_second_address_street',
    label: __('Billing Address Street (Line 2)', 'bit-integrations'),
    required: false
  },
  { key: 'billing_zip_code', label: __('Billing Zip Code', 'bit-integrations'), required: false },
  {
    key: 'shipping_country_code',
    label: __('Shipping Country Code', 'bit-integrations'),
    required: false
  },
  {
    key: 'shipping_locality',
    label: __('Shipping Country', 'bit-integrations'),
    required: false
  },
  {
    key: 'shipping_first_address_street',
    label: __('Shipping Address Street (Line 1)', 'bit-integrations'),
    required: false
  },
  {
    key: 'shipping_second_address_street',
    label: __('Shipping Address Street (Line 2)', 'bit-integrations'),
    required: false
  },
  {
    key: 'shipping_zip_code',
    label: __('Shipping Zip Code', 'bit-integrations'),
    required: false
  },
  { key: 'anniversary', label: __('Anniversary', 'bit-integrations'), required: false },
  { key: 'birthday', label: __('Birthday', 'bit-integrations'), required: false },
  { key: 'fax_numbers', label: __('Fax Numbers', 'bit-integrations'), required: false }
]