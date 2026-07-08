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

export const discountTypeOptions = [
  { label: __('Percentage discount', 'bit-integrations'), value: 'percent' },
  { label: __('Fixed cart discount', 'bit-integrations'), value: 'fixed_cart' },
  { label: __('Fixed product discount', 'bit-integrations'), value: 'fixed_product' }
]

export const updateDiscountTypeOptions = [
  { label: __('No Change', 'bit-integrations'), value: '' },
  ...discountTypeOptions
]

export const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: 'yes' },
  { label: __('No', 'bit-integrations'), value: 'no' }
]

export const updateYesNoOptions = [{ label: __('No Change', 'bit-integrations'), value: '' }, ...yesNoOptions]

export const booleanUtilityFields = [
  {
    key: 'free_shipping',
    label: __('Free Shipping', 'bit-integrations'),
    subTitle: __('Allow free shipping for this coupon', 'bit-integrations')
  },
  {
    key: 'individual_use',
    label: __('Individual Use Only', 'bit-integrations'),
    subTitle: __('Prevent use with other coupons', 'bit-integrations')
  },
  {
    key: 'exclude_sale_items',
    label: __('Exclude Sale Items', 'bit-integrations'),
    subTitle: __('Exclude discounted products', 'bit-integrations')
  },
  {
    key: 'auto_apply',
    label: __('Auto Apply', 'bit-integrations'),
    subTitle: __('Apply coupon automatically', 'bit-integrations')
  },
  {
    key: 'show_in_slideout',
    label: __('Show in Slideout', 'bit-integrations'),
    subTitle: __('Show coupon in the slideout', 'bit-integrations')
  },
  {
    key: 'rules_enabled',
    label: __('Rules Enabled', 'bit-integrations'),
    subTitle: __('Enable coupon rules', 'bit-integrations')
  }
]

export const actionUtilityKeys = {
  create_coupon: ['discount_type', ...booleanUtilityFields.map(field => field.key)],
  update_coupon: ['discount_type', ...booleanUtilityFields.map(field => field.key)],
  delete_coupon: ['permanent_delete'],
  toggle_auto_apply: ['enabled'],
  toggle_show_in_slideout: ['enabled'],
  toggle_rules: ['enabled']
}

export const actionUtilityDefaults = {
  create_coupon: {
    discount_type: 'percent',
    free_shipping: false,
    individual_use: false,
    exclude_sale_items: false,
    auto_apply: false,
    show_in_slideout: false,
    rules_enabled: false
  },
  update_coupon: {
    discount_type: '',
    free_shipping: '',
    individual_use: '',
    exclude_sale_items: '',
    auto_apply: '',
    show_in_slideout: '',
    rules_enabled: ''
  },
  delete_coupon: {
    permanent_delete: false
  },
  toggle_auto_apply: {
    enabled: 'yes'
  },
  toggle_show_in_slideout: {
    enabled: 'yes'
  },
  toggle_rules: {
    enabled: 'yes'
  }
}

export const getUtilityDefaults = action => ({ ...(actionUtilityDefaults[action] || {}) })

const CouponBaseFields = [
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
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
  { key: 'start_date', label: __('Start Date (YYYY-MM-DD)', 'bit-integrations'), required: false }
]

export const CouponCreateFields = [
  { key: 'code', label: __('Coupon Code', 'bit-integrations'), required: true },
  { key: 'amount', label: __('Discount Amount', 'bit-integrations'), required: true },
  ...CouponBaseFields
]

export const CouponUpdateFields = [
  { key: 'coupon_code', label: __('Current Coupon Code', 'bit-integrations'), required: true },
  { key: 'code', label: __('New Coupon Code', 'bit-integrations'), required: false },
  { key: 'amount', label: __('Discount Amount', 'bit-integrations'), required: false },
  ...CouponBaseFields
]

export const CouponDeleteFields = [
  { key: 'coupon_code', label: __('Coupon Code', 'bit-integrations'), required: true }
]

export const ToggleFields = [
  { key: 'coupon_code', label: __('Coupon Code', 'bit-integrations'), required: true }
]
