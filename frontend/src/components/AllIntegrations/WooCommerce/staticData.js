import { __ } from '../../../Utils/i18nwrap'

export const moduleGroups = [
  {
    title: __('Order', 'bit-integrations'),
    modules: [
      { name: 'order', label: __('Create-Order', 'bit-integrations') },
      { name: 'changestatus', label: __('Change Order Status', 'bit-integrations') },
      { name: 'add_order_note', label: __('Add Order Note', 'bit-integrations'), is_pro: true },
      {
        name: 'update_order_meta',
        label: __('Add or Update Order Meta', 'bit-integrations'),
        is_pro: true
      }
    ]
  },
  {
    title: __('Customer', 'bit-integrations'),
    modules: [
      { name: 'customer', label: __('Create-Customer', 'bit-integrations') },
      { name: 'update_customer', label: __('Update Customer', 'bit-integrations'), is_pro: true },
      { name: 'delete_customer', label: __('Delete Customer', 'bit-integrations'), is_pro: true }
    ]
  },
  {
    title: __('Product', 'bit-integrations'),
    modules: [
      { name: 'product', label: __('Create-Product', 'bit-integrations') },
      { name: 'update_product', label: __('Update Product', 'bit-integrations'), is_pro: true },
      {
        name: 'update_product_stock',
        label: __('Update Product Stock', 'bit-integrations'),
        is_pro: true
      },
      {
        name: 'update_product_status',
        label: __('Update Product Status', 'bit-integrations'),
        is_pro: true
      },
      {
        name: 'update_product_price',
        label: __('Update Product Price', 'bit-integrations'),
        is_pro: true
      },
      { name: 'delete_product', label: __('Delete Product', 'bit-integrations'), is_pro: true }
    ]
  },
  {
    title: __('Product Variation', 'bit-integrations'),
    modules: [
      {
        name: 'create_product_variation',
        label: __('Create Product Variation', 'bit-integrations'),
        is_pro: true
      },
      {
        name: 'update_product_variation',
        label: __('Update Product Variation', 'bit-integrations'),
        is_pro: true
      }
    ]
  },
  {
    title: __('Product Taxonomy', 'bit-integrations'),
    modules: [
      {
        name: 'create_product_term',
        label: __('Create Category, Tag, Brand or Shipping Class', 'bit-integrations'),
        is_pro: true
      },
      {
        name: 'update_product_term',
        label: __('Update Category, Tag, Brand or Shipping Class', 'bit-integrations'),
        is_pro: true
      },
      {
        name: 'delete_product_term',
        label: __('Delete Category, Tag, Brand or Shipping Class', 'bit-integrations'),
        is_pro: true
      }
    ]
  },
  {
    title: __('Product Attribute', 'bit-integrations'),
    modules: [
      { name: 'create_attribute', label: __('Create Attribute', 'bit-integrations'), is_pro: true },
      { name: 'update_attribute', label: __('Update Attribute', 'bit-integrations'), is_pro: true },
      { name: 'delete_attribute', label: __('Delete Attribute', 'bit-integrations'), is_pro: true },
      {
        name: 'add_attribute_terms',
        label: __('Add Attribute Terms', 'bit-integrations'),
        is_pro: true
      },
      {
        name: 'add_product_attribute',
        label: __('Add Attribute to Product', 'bit-integrations'),
        is_pro: true
      },
      {
        name: 'remove_product_attribute',
        label: __('Remove Attribute from Product', 'bit-integrations'),
        is_pro: true
      }
    ]
  },
  {
    title: __('Cart', 'bit-integrations'),
    modules: [
      {
        name: 'add_product_to_cart',
        label: __('Add Product to Cart', 'bit-integrations'),
        is_pro: true
      },
      {
        name: 'remove_product_from_cart',
        label: __('Remove Product from Cart', 'bit-integrations'),
        is_pro: true
      },
      {
        name: 'apply_coupon_to_cart',
        label: __('Apply Coupon to Cart', 'bit-integrations'),
        is_pro: true
      },
      {
        name: 'remove_coupon_from_cart',
        label: __('Remove Coupon from Cart', 'bit-integrations'),
        is_pro: true
      },
      {
        name: 'send_abandoned_cart_email',
        label: __('Send Abandoned Cart Email', 'bit-integrations'),
        is_pro: true
      }
    ]
  },
  {
    title: __('Coupon', 'bit-integrations'),
    modules: [
      { name: 'create_coupon', label: __('Create Coupon', 'bit-integrations'), is_pro: true },
      { name: 'update_coupon', label: __('Update Coupon', 'bit-integrations'), is_pro: true },
      { name: 'update_coupon_code', label: __('Change Coupon Code', 'bit-integrations'), is_pro: true },
      {
        name: 'add_emails_to_coupon',
        label: __('Add Allowed Emails to Coupon', 'bit-integrations'),
        is_pro: true
      },
      { name: 'delete_coupon', label: __('Delete Coupon', 'bit-integrations'), is_pro: true }
    ]
  },
  {
    title: __('Review', 'bit-integrations'),
    modules: [
      {
        name: 'create_product_review',
        label: __('Create Product Review', 'bit-integrations'),
        is_pro: true
      },
      {
        name: 'update_product_review',
        label: __('Update Product Review', 'bit-integrations'),
        is_pro: true
      },
      {
        name: 'approve_product_review',
        label: __('Approve Product Review', 'bit-integrations'),
        is_pro: true
      },
      {
        name: 'delete_product_review',
        label: __('Delete Product Review', 'bit-integrations'),
        is_pro: true
      }
    ]
  },
  {
    title: __('Subscription', 'bit-integrations'),
    modules: [{ name: 'cancelSubscription', label: __('Cancel Subscription', 'bit-integrations') }]
  }
]

const addressFields = [
  { key: 'billing_first_name', label: __('Billing First Name', 'bit-integrations'), required: false },
  { key: 'billing_last_name', label: __('Billing Last Name', 'bit-integrations'), required: false },
  { key: 'billing_company', label: __('Billing Company', 'bit-integrations'), required: false },
  { key: 'billing_address_1', label: __('Billing Address 1', 'bit-integrations'), required: false },
  { key: 'billing_address_2', label: __('Billing Address 2', 'bit-integrations'), required: false },
  { key: 'billing_city', label: __('Billing City', 'bit-integrations'), required: false },
  { key: 'billing_postcode', label: __('Billing Post Code', 'bit-integrations'), required: false },
  { key: 'billing_country', label: __('Billing Country', 'bit-integrations'), required: false },
  { key: 'billing_state', label: __('Billing State', 'bit-integrations'), required: false },
  { key: 'billing_email', label: __('Billing Email', 'bit-integrations'), required: false },
  { key: 'billing_phone', label: __('Billing Phone', 'bit-integrations'), required: false },
  { key: 'shipping_first_name', label: __('Shipping First Name', 'bit-integrations'), required: false },
  { key: 'shipping_last_name', label: __('Shipping Last Name', 'bit-integrations'), required: false },
  { key: 'shipping_company', label: __('Shipping Company', 'bit-integrations'), required: false },
  { key: 'shipping_address_1', label: __('Shipping Address 1', 'bit-integrations'), required: false },
  { key: 'shipping_address_2', label: __('Shipping Address 2', 'bit-integrations'), required: false },
  { key: 'shipping_city', label: __('Shipping City', 'bit-integrations'), required: false },
  { key: 'shipping_postcode', label: __('Shipping Post Code', 'bit-integrations'), required: false },
  { key: 'shipping_country', label: __('Shipping Country', 'bit-integrations'), required: false },
  { key: 'shipping_state', label: __('Shipping State', 'bit-integrations'), required: false },
  { key: 'shipping_phone', label: __('Shipping Phone', 'bit-integrations'), required: false }
]

const variationFields = [
  { key: 'sale_price', label: __('Sale Price', 'bit-integrations'), required: false },
  {
    key: 'date_on_sale_from',
    label: __('Sale Start Date (YYYY-MM-DD)', 'bit-integrations'),
    required: false
  },
  {
    key: 'date_on_sale_to',
    label: __('Sale End Date (YYYY-MM-DD)', 'bit-integrations'),
    required: false
  },
  { key: 'sku', label: __('SKU', 'bit-integrations'), required: false },
  { key: 'stock_quantity', label: __('Stock Quantity', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'weight', label: __('Weight', 'bit-integrations'), required: false },
  { key: 'length', label: __('Length', 'bit-integrations'), required: false },
  { key: 'width', label: __('Width', 'bit-integrations'), required: false },
  { key: 'height', label: __('Height', 'bit-integrations'), required: false },
  { key: 'variation_image', label: __('Variation Image URL', 'bit-integrations'), required: false }
]

const couponFields = [
  { key: 'expiry_date', label: __('Expiry Date (YYYY-MM-DD)', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'minimum_amount', label: __('Minimum Spend', 'bit-integrations'), required: false },
  { key: 'maximum_amount', label: __('Maximum Spend', 'bit-integrations'), required: false },
  {
    key: 'allowed_emails',
    label: __('Allowed Emails (comma separated)', 'bit-integrations'),
    required: false
  },
  { key: 'usage_limit', label: __('Usage Limit Per Coupon', 'bit-integrations'), required: false },
  {
    key: 'usage_limit_per_user',
    label: __('Usage Limit Per User', 'bit-integrations'),
    required: false
  },
  {
    key: 'limit_usage_to_x_items',
    label: __('Limit Usage to X Items', 'bit-integrations'),
    required: false
  }
]

const termFields = [
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'parent', label: __('Parent Term ID', 'bit-integrations'), required: false }
]

const productIdField = { key: 'product_id', label: __('Product ID', 'bit-integrations'), required: true }
const customerIdField = {
  key: 'customer_id',
  label: __('Customer ID', 'bit-integrations'),
  required: true
}
const termIdField = { key: 'term_id', label: __('Term ID', 'bit-integrations'), required: true }
const attributeIdField = {
  key: 'attribute_id',
  label: __('Attribute ID', 'bit-integrations'),
  required: true
}
const couponCodeField = {
  key: 'coupon_code',
  label: __('Coupon Code', 'bit-integrations'),
  required: true
}
const couponCodeOrIdField = {
  key: 'coupon_code_or_id',
  label: __('Coupon Code or ID', 'bit-integrations'),
  required: true
}
const reviewIdField = { key: 'review_id', label: __('Review ID', 'bit-integrations'), required: true }

export const moduleFields = {
  add_order_note: [
    { key: 'order_id', label: __('Order ID', 'bit-integrations'), required: true },
    { key: 'note', label: __('Note', 'bit-integrations'), required: true }
  ],
  update_order_meta: [
    { key: 'order_id', label: __('Order ID', 'bit-integrations'), required: true },
    { key: 'meta_key', label: __('Meta Key', 'bit-integrations'), required: true },
    { key: 'meta_value', label: __('Meta Value', 'bit-integrations'), required: false }
  ],
  update_customer: [
    customerIdField,
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'display_name', label: __('Display Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    ...addressFields
  ],
  delete_customer: [customerIdField],
  update_product: [
    productIdField,
    { key: 'name', label: __('Name', 'bit-integrations'), required: false },
    { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
    { key: 'short_description', label: __('Short Description', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'regular_price', label: __('Regular Price', 'bit-integrations'), required: false },
    { key: 'sale_price', label: __('Sale Price', 'bit-integrations'), required: false },
    {
      key: 'date_on_sale_from',
      label: __('Sale Start Date (YYYY-MM-DD)', 'bit-integrations'),
      required: false
    },
    {
      key: 'date_on_sale_to',
      label: __('Sale End Date (YYYY-MM-DD)', 'bit-integrations'),
      required: false
    },
    { key: 'sku', label: __('SKU', 'bit-integrations'), required: false },
    { key: 'stock_quantity', label: __('Stock Quantity', 'bit-integrations'), required: false },
    { key: 'low_stock_amount', label: __('Low Stock Threshold', 'bit-integrations'), required: false },
    { key: 'tax_class', label: __('Tax Class', 'bit-integrations'), required: false },
    { key: 'weight', label: __('Weight', 'bit-integrations'), required: false },
    { key: 'length', label: __('Length', 'bit-integrations'), required: false },
    { key: 'width', label: __('Width', 'bit-integrations'), required: false },
    { key: 'height', label: __('Height', 'bit-integrations'), required: false },
    { key: 'external_url', label: __('External Product URL', 'bit-integrations'), required: false },
    {
      key: 'button_text',
      label: __('External Product Button Text', 'bit-integrations'),
      required: false
    },
    { key: 'purchase_note', label: __('Purchase Note', 'bit-integrations'), required: false },
    { key: 'menu_order', label: __('Menu Order', 'bit-integrations'), required: false },
    { key: 'featured_image', label: __('Featured Image URL', 'bit-integrations'), required: false },
    {
      key: 'gallery_images',
      label: __('Gallery Image URLs (comma separated)', 'bit-integrations'),
      required: false
    }
  ],
  update_product_stock: [
    productIdField,
    { key: 'stock_quantity', label: __('Stock Quantity', 'bit-integrations'), required: true }
  ],
  update_product_status: [productIdField],
  update_product_price: [
    { key: 'product_id_or_sku', label: __('Product ID or SKU', 'bit-integrations'), required: true },
    { key: 'regular_price', label: __('Regular Price', 'bit-integrations'), required: false },
    { key: 'sale_price', label: __('Sale Price', 'bit-integrations'), required: false }
  ],
  delete_product: [productIdField],
  create_product_variation: [
    { key: 'product_id', label: __('Parent Product ID', 'bit-integrations'), required: true },
    {
      key: 'attributes',
      label: __('Attributes (e.g. Color: Red, Size: Large)', 'bit-integrations'),
      required: true
    },
    { key: 'regular_price', label: __('Regular Price', 'bit-integrations'), required: true },
    ...variationFields
  ],
  update_product_variation: [
    { key: 'variation_id', label: __('Variation ID', 'bit-integrations'), required: true },
    {
      key: 'attributes',
      label: __('Attributes (e.g. Color: Red, Size: Large)', 'bit-integrations'),
      required: false
    },
    { key: 'regular_price', label: __('Regular Price', 'bit-integrations'), required: false },
    ...variationFields
  ],
  create_product_term: [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    ...termFields
  ],
  update_product_term: [
    termIdField,
    { key: 'name', label: __('Name', 'bit-integrations'), required: false },
    ...termFields
  ],
  delete_product_term: [termIdField],
  create_attribute: [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'slug', label: __('Slug', 'bit-integrations'), required: false }
  ],
  update_attribute: [
    attributeIdField,
    { key: 'name', label: __('Name', 'bit-integrations'), required: false },
    { key: 'slug', label: __('Slug', 'bit-integrations'), required: false }
  ],
  delete_attribute: [attributeIdField],
  add_attribute_terms: [
    attributeIdField,
    { key: 'terms', label: __('Terms (comma separated)', 'bit-integrations'), required: true }
  ],
  add_product_attribute: [
    productIdField,
    { key: 'attribute_name', label: __('Attribute Name', 'bit-integrations'), required: true },
    {
      key: 'attribute_values',
      label: __('Attribute Values (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  remove_product_attribute: [
    productIdField,
    {
      key: 'attribute_names',
      label: __('Attribute Names (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  add_product_to_cart: [
    productIdField,
    { key: 'quantity', label: __('Quantity', 'bit-integrations'), required: true },
    { key: 'variation_id', label: __('Variation ID', 'bit-integrations'), required: false }
  ],
  remove_product_from_cart: [productIdField],
  apply_coupon_to_cart: [couponCodeField],
  remove_coupon_from_cart: [couponCodeField],
  send_abandoned_cart_email: [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'subject', label: __('Subject', 'bit-integrations'), required: false },
    { key: 'body', label: __('Body (HTML allowed)', 'bit-integrations'), required: false }
  ],
  create_coupon: [
    couponCodeField,
    { key: 'amount', label: __('Amount', 'bit-integrations'), required: true },
    ...couponFields
  ],
  update_coupon: [
    couponCodeOrIdField,
    { key: 'amount', label: __('Amount', 'bit-integrations'), required: false },
    ...couponFields
  ],
  update_coupon_code: [
    { key: 'coupon_id', label: __('Coupon ID', 'bit-integrations'), required: true },
    { key: 'new_coupon_code', label: __('New Coupon Code', 'bit-integrations'), required: true }
  ],
  add_emails_to_coupon: [
    couponCodeOrIdField,
    { key: 'emails', label: __('Emails (comma separated)', 'bit-integrations'), required: true }
  ],
  delete_coupon: [couponCodeOrIdField],
  create_product_review: [
    productIdField,
    { key: 'reviewer_name', label: __('Reviewer Name', 'bit-integrations'), required: true },
    { key: 'reviewer_email', label: __('Reviewer Email', 'bit-integrations'), required: true },
    { key: 'rating', label: __('Rating (1-5)', 'bit-integrations'), required: true },
    { key: 'review', label: __('Review', 'bit-integrations'), required: true }
  ],
  update_product_review: [
    reviewIdField,
    { key: 'reviewer_name', label: __('Reviewer Name', 'bit-integrations'), required: false },
    { key: 'reviewer_email', label: __('Reviewer Email', 'bit-integrations'), required: false },
    { key: 'rating', label: __('Rating (1-5)', 'bit-integrations'), required: false },
    { key: 'review', label: __('Review', 'bit-integrations'), required: false }
  ],
  approve_product_review: [reviewIdField],
  delete_product_review: [reviewIdField]
}

const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: 'yes' },
  { label: __('No', 'bit-integrations'), value: 'no' }
]

const productStatusOptions = [
  { label: __('Published', 'bit-integrations'), value: 'publish' },
  { label: __('Draft', 'bit-integrations'), value: 'draft' },
  { label: __('Pending Review', 'bit-integrations'), value: 'pending' },
  { label: __('Private', 'bit-integrations'), value: 'private' }
]

const stockStatusOptions = [
  { label: __('In Stock', 'bit-integrations'), value: 'instock' },
  { label: __('Out of Stock', 'bit-integrations'), value: 'outofstock' },
  { label: __('On Backorder', 'bit-integrations'), value: 'onbackorder' }
]

const taxonomyOptions = [
  { label: __('Category', 'bit-integrations'), value: 'product_cat' },
  { label: __('Tag', 'bit-integrations'), value: 'product_tag' },
  { label: __('Brand', 'bit-integrations'), value: 'product_brand' },
  { label: __('Shipping Class', 'bit-integrations'), value: 'product_shipping_class' }
]

const attributeOrderOptions = [
  { label: __('Custom Ordering', 'bit-integrations'), value: 'menu_order' },
  { label: __('Name', 'bit-integrations'), value: 'name' },
  { label: __('Name (Numeric)', 'bit-integrations'), value: 'name_num' },
  { label: __('Term ID', 'bit-integrations'), value: 'id' }
]

const discountTypeOptions = [
  { label: __('Percentage Discount', 'bit-integrations'), value: 'percent' },
  { label: __('Fixed Cart Discount', 'bit-integrations'), value: 'fixed_cart' },
  { label: __('Fixed Product Discount', 'bit-integrations'), value: 'fixed_product' }
]

const shippingClassSelect = {
  key: 'shipping_class_id',
  label: __('Shipping Class', 'bit-integrations'),
  source: 'product_shipping_class'
}

const stockStatusSelect = {
  key: 'stock_status',
  label: __('Stock Status', 'bit-integrations'),
  options: stockStatusOptions
}

const taxonomySelect = {
  key: 'taxonomy',
  label: __('Taxonomy', 'bit-integrations'),
  options: taxonomyOptions,
  required: true
}

const couponRestrictionSelects = [
  { key: 'product_ids', label: __('Products', 'bit-integrations'), source: 'products', multi: true },
  {
    key: 'exclude_product_ids',
    label: __('Exclude Products', 'bit-integrations'),
    source: 'products',
    multi: true
  },
  {
    key: 'product_categories',
    label: __('Product Categories', 'bit-integrations'),
    source: 'product_cat',
    multi: true
  },
  {
    key: 'exclude_product_categories',
    label: __('Exclude Categories', 'bit-integrations'),
    source: 'product_cat',
    multi: true
  }
]

export const moduleSelects = {
  update_product: [
    { key: 'status', label: __('Status', 'bit-integrations'), options: productStatusOptions },
    {
      key: 'catalog_visibility',
      label: __('Catalog Visibility', 'bit-integrations'),
      options: [
        { label: __('Shop and Search Results', 'bit-integrations'), value: 'visible' },
        { label: __('Shop Only', 'bit-integrations'), value: 'catalog' },
        { label: __('Search Results Only', 'bit-integrations'), value: 'search' },
        { label: __('Hidden', 'bit-integrations'), value: 'hidden' }
      ]
    },
    stockStatusSelect,
    {
      key: 'backorders',
      label: __('Allow Backorders', 'bit-integrations'),
      options: [
        { label: __('Do Not Allow', 'bit-integrations'), value: 'no' },
        { label: __('Allow, but Notify Customer', 'bit-integrations'), value: 'notify' },
        { label: __('Allow', 'bit-integrations'), value: 'yes' }
      ]
    },
    {
      key: 'tax_status',
      label: __('Tax Status', 'bit-integrations'),
      options: [
        { label: __('Taxable', 'bit-integrations'), value: 'taxable' },
        { label: __('Shipping Only', 'bit-integrations'), value: 'shipping' },
        { label: __('None', 'bit-integrations'), value: 'none' }
      ]
    },
    { key: 'manage_stock', label: __('Manage Stock', 'bit-integrations'), options: yesNoOptions },
    {
      key: 'sold_individually',
      label: __('Sold Individually', 'bit-integrations'),
      options: yesNoOptions
    },
    { key: 'virtual', label: __('Virtual', 'bit-integrations'), options: yesNoOptions },
    { key: 'reviews_allowed', label: __('Allow Reviews', 'bit-integrations'), options: yesNoOptions },
    { key: 'featured', label: __('Featured', 'bit-integrations'), options: yesNoOptions },
    shippingClassSelect,
    {
      key: 'category_ids',
      label: __('Categories', 'bit-integrations'),
      source: 'product_cat',
      multi: true
    },
    { key: 'tag_ids', label: __('Tags', 'bit-integrations'), source: 'product_tag', multi: true },
    { key: 'brand_ids', label: __('Brands', 'bit-integrations'), source: 'product_brand', multi: true },
    { key: 'upsell_ids', label: __('Upsells', 'bit-integrations'), source: 'products', multi: true },
    {
      key: 'cross_sell_ids',
      label: __('Cross-sells', 'bit-integrations'),
      source: 'products',
      multi: true
    }
  ],
  update_product_stock: [
    {
      key: 'stock_operation',
      label: __('Stock Operation', 'bit-integrations'),
      options: [
        { label: __('Set Stock To', 'bit-integrations'), value: 'set' },
        { label: __('Increase Stock By', 'bit-integrations'), value: 'increase' },
        { label: __('Decrease Stock By', 'bit-integrations'), value: 'decrease' }
      ],
      required: true
    }
  ],
  update_product_status: [
    {
      key: 'status',
      label: __('Status', 'bit-integrations'),
      options: productStatusOptions,
      required: true
    }
  ],
  update_product_price: [
    {
      key: 'find_product_by',
      label: __('Find Product By', 'bit-integrations'),
      options: [
        { label: __('Product ID', 'bit-integrations'), value: 'id' },
        { label: __('SKU', 'bit-integrations'), value: 'sku' }
      ],
      placeholder: __('Product ID, then SKU', 'bit-integrations')
    }
  ],
  create_product_variation: [stockStatusSelect, shippingClassSelect],
  update_product_variation: [stockStatusSelect, shippingClassSelect],
  create_product_term: [taxonomySelect],
  update_product_term: [taxonomySelect],
  delete_product_term: [taxonomySelect],
  create_attribute: [
    {
      key: 'order_by',
      label: __('Default Sort Order', 'bit-integrations'),
      options: attributeOrderOptions
    }
  ],
  update_attribute: [
    {
      key: 'order_by',
      label: __('Default Sort Order', 'bit-integrations'),
      options: attributeOrderOptions
    },
    { key: 'has_archives', label: __('Enable Archives', 'bit-integrations'), options: yesNoOptions }
  ],
  create_coupon: [
    {
      key: 'discount_type',
      label: __('Discount Type', 'bit-integrations'),
      options: discountTypeOptions,
      required: true
    },
    ...couponRestrictionSelects
  ],
  update_coupon: [
    {
      key: 'discount_type',
      label: __('Discount Type', 'bit-integrations'),
      options: discountTypeOptions
    },
    ...couponRestrictionSelects,
    {
      key: 'free_shipping',
      label: __('Allow Free Shipping', 'bit-integrations'),
      options: yesNoOptions
    },
    {
      key: 'individual_use',
      label: __('Individual Use Only', 'bit-integrations'),
      options: yesNoOptions
    },
    {
      key: 'exclude_sale_items',
      label: __('Exclude Sale Items', 'bit-integrations'),
      options: yesNoOptions
    }
  ]
}

export const moduleUtilities = {
  add_order_note: [
    {
      key: 'customer_note',
      title: __('Note to Customer', 'bit-integrations'),
      subTitle: __('Show the note to the customer and email it to them', 'bit-integrations')
    }
  ],
  update_customer: [
    {
      key: 'shipping_same_as_billing',
      title: __('Shipping Same as Billing', 'bit-integrations'),
      subTitle: __('Copy the mapped billing address to the shipping address', 'bit-integrations')
    }
  ],
  update_product_price: [
    {
      key: 'remove_sale_price',
      title: __('Remove Sale Price', 'bit-integrations'),
      subTitle: __('End the current sale; a mapped sale price is ignored', 'bit-integrations')
    }
  ],
  delete_product: [
    {
      key: 'force_delete',
      title: __('Delete Permanently', 'bit-integrations'),
      subTitle: __('Skip the trash', 'bit-integrations')
    }
  ],
  create_attribute: [
    {
      key: 'has_archives',
      title: __('Enable Archives', 'bit-integrations'),
      subTitle: __('Give the attribute terms their own shop archive pages', 'bit-integrations')
    }
  ],
  add_product_attribute: [
    {
      key: 'hide_on_product_page',
      title: __('Hide on Product Page', 'bit-integrations'),
      subTitle: __('Leave the attribute out of the Additional Information tab', 'bit-integrations')
    },
    {
      key: 'used_for_variations',
      title: __('Used for Variations', 'bit-integrations'),
      subTitle: __('Let variable products build variations from it', 'bit-integrations')
    }
  ],
  create_coupon: [
    {
      key: 'free_shipping',
      title: __('Allow Free Shipping', 'bit-integrations'),
      subTitle: __('Needs a free shipping method that requires a coupon', 'bit-integrations')
    },
    {
      key: 'individual_use',
      title: __('Individual Use Only', 'bit-integrations'),
      subTitle: __('The coupon cannot be combined with other coupons', 'bit-integrations')
    },
    {
      key: 'exclude_sale_items',
      title: __('Exclude Sale Items', 'bit-integrations'),
      subTitle: __('The coupon does not apply to items on sale', 'bit-integrations')
    }
  ],
  add_emails_to_coupon: [
    {
      key: 'replace_emails',
      title: __('Replace Existing Emails', 'bit-integrations'),
      subTitle: __('Keep only the mapped emails instead of adding them to the list', 'bit-integrations')
    }
  ],
  delete_coupon: [
    {
      key: 'force_delete',
      title: __('Delete Permanently', 'bit-integrations'),
      subTitle: __('Skip the trash', 'bit-integrations')
    }
  ],
  create_product_review: [
    {
      key: 'verified',
      title: __('Verified Owner', 'bit-integrations'),
      subTitle: __('Mark the reviewer as a verified buyer', 'bit-integrations')
    },
    {
      key: 'approved',
      title: __('Approve Review', 'bit-integrations'),
      subTitle: __('Publish the review right away', 'bit-integrations')
    }
  ],
  update_product_review: [
    {
      key: 'approved',
      title: __('Approve Review', 'bit-integrations'),
      subTitle: __('Approve the review if it is pending', 'bit-integrations')
    }
  ],
  delete_product_review: [
    {
      key: 'force_delete',
      title: __('Delete Permanently', 'bit-integrations'),
      subTitle: __('Skip the trash', 'bit-integrations')
    }
  ]
}
