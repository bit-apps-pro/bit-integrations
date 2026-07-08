import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_coupon', label: __('Create Coupon', 'bit-integrations'), is_pro: true },
  { name: 'update_coupon', label: __('Update Coupon', 'bit-integrations'), is_pro: true },
  { name: 'delete_coupon', label: __('Delete Coupon', 'bit-integrations'), is_pro: true },
  {
    name: 'toggle_auto_apply',
    label: __('Toggle Auto Apply', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'toggle_show_in_slideout',
    label: __('Toggle Show in Slideout', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'toggle_rules',
    label: __('Toggle Rules', 'bit-integrations'),
    is_pro: true
  }
]

const CouponBaseFields = [
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  {
    key: 'free_shipping',
    label: __('Free Shipping (yes/no)', 'bit-integrations'),
    required: false
  },
  {
    key: 'individual_use',
    label: __('Individual Use Only (yes/no)', 'bit-integrations'),
    required: false
  },
  {
    key: 'exclude_sale_items',
    label: __('Exclude Sale Items (yes/no)', 'bit-integrations'),
    required: false
  },
  { key: 'minimum_amount', label: __('Minimum Amount', 'bit-integrations'), required: false },
  { key: 'maximum_amount', label: __('Maximum Amount', 'bit-integrations'), required: false },
  { key: 'usage_limit', label: __('Usage Limit', 'bit-integrations'), required: false },
  {
    key: 'usage_limit_per_user',
    label: __('Usage Limit Per User', 'bit-integrations'),
    required: false
  },
  {
    key: 'product_ids',
    label: __('Product IDs (comma separated)', 'bit-integrations'),
    required: false
  },
  {
    key: 'excluded_product_ids',
    label: __('Excluded Product IDs (comma separated)', 'bit-integrations'),
    required: false
  },
  {
    key: 'product_categories',
    label: __('Product Category IDs (comma separated)', 'bit-integrations'),
    required: false
  },
  {
    key: 'excluded_product_categories',
    label: __('Excluded Product Category IDs (comma separated)', 'bit-integrations'),
    required: false
  },
  {
    key: 'email_restrictions',
    label: __('Email Restrictions (comma separated)', 'bit-integrations'),
    required: false
  },
  { key: 'expiry_date', label: __('Expiry Date (YYYY-MM-DD)', 'bit-integrations'), required: false },
  { key: 'auto_apply', label: __('Auto Apply (yes/no)', 'bit-integrations'), required: false },
  {
    key: 'show_in_slideout',
    label: __('Show in Slideout (yes/no)', 'bit-integrations'),
    required: false
  },
  { key: 'start_date', label: __('Start Date (YYYY-MM-DD)', 'bit-integrations'), required: false },
  { key: 'rules_enabled', label: __('Rules Enabled (yes/no)', 'bit-integrations'), required: false }
]

export const CouponCreateFields = [
  { key: 'code', label: __('Coupon Code', 'bit-integrations'), required: true },
  {
    key: 'discount_type',
    label: __('Discount Type (percent/fixed_cart/fixed_product)', 'bit-integrations'),
    required: true
  },
  { key: 'amount', label: __('Discount Amount', 'bit-integrations'), required: true },
  ...CouponBaseFields
]

export const CouponUpdateFields = [
  { key: 'coupon_id', label: __('Coupon ID', 'bit-integrations'), required: false },
  { key: 'coupon_code', label: __('Current Coupon Code', 'bit-integrations'), required: false },
  { key: 'code', label: __('New Coupon Code', 'bit-integrations'), required: false },
  {
    key: 'discount_type',
    label: __('Discount Type (percent/fixed_cart/fixed_product)', 'bit-integrations'),
    required: false
  },
  { key: 'amount', label: __('Discount Amount', 'bit-integrations'), required: false },
  ...CouponBaseFields
]

export const CouponDeleteFields = [
  { key: 'coupon_id', label: __('Coupon ID', 'bit-integrations'), required: false },
  { key: 'coupon_code', label: __('Coupon Code', 'bit-integrations'), required: false },
  {
    key: 'permanent_delete',
    label: __('Permanently Delete (yes/no)', 'bit-integrations'),
    required: false
  }
]

export const ToggleFields = [
  { key: 'coupon_id', label: __('Coupon ID', 'bit-integrations'), required: false },
  { key: 'coupon_code', label: __('Coupon Code', 'bit-integrations'), required: false },
  { key: 'enabled', label: __('Enabled (yes/no)', 'bit-integrations'), required: true }
]
