import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'add_product_to_cart', label: __('Add Product to Cart', 'bit-integrations'), is_pro: true },
  {
    name: 'update_cart_quantity',
    label: __('Update Cart Quantity', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'remove_product_from_cart',
    label: __('Remove Product from Cart', 'bit-integrations'),
    is_pro: true
  }
]

export const AddProductToCartFields = [
  { key: 'quantity', label: __('Quantity', 'bit-integrations'), required: false },
  {
    key: 'variations_json',
    label: __('Variations JSON', 'bit-integrations'),
    required: false
  }
]

export const UpdateCartQuantityFields = [
  { key: 'quantity', label: __('Quantity', 'bit-integrations'), required: true }
]
