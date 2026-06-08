import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_wishlist', label: __('Create Wishlist', 'bit-integrations'), is_pro: true },
  { name: 'update_wishlist', label: __('Update Wishlist', 'bit-integrations'), is_pro: true },
  { name: 'delete_wishlist', label: __('Delete Wishlist', 'bit-integrations'), is_pro: true },
  {
    name: 'add_product_to_wishlist',
    label: __('Add Product to Wishlist', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'remove_product_from_wishlist',
    label: __('Remove Product from Wishlist', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_customer', label: __('Create Customer', 'bit-integrations'), is_pro: true },
  { name: 'subscribe_customer', label: __('Subscribe Customer', 'bit-integrations'), is_pro: true },
  {
    name: 'unsubscribe_customer',
    label: __('Unsubscribe Customer', 'bit-integrations'),
    is_pro: true
  }
]

export const CreateWishlistFields = [
  { key: 'name', label: __('Wishlist Name', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const UpdateWishlistFields = [
  { key: 'id', label: __('Wishlist ID', 'bit-integrations'), required: true },
  { key: 'name', label: __('Wishlist Name', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const WishlistIdField = [
  { key: 'id', label: __('Wishlist ID', 'bit-integrations'), required: true }
]

export const ProductWishlistFields = [
  { key: 'productId', label: __('Product ID', 'bit-integrations'), required: true }
]

export const CreateCustomerFields = [
  { key: 'email', label: __('Email Address', 'bit-integrations'), required: true },
  { key: 'firstName', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'lastName', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false }
]

export const CustomerIdField = [
  { key: 'id', label: __('Customer ID', 'bit-integrations'), required: true }
]

export const privacyOptions = [
  { label: __('Public', 'bit-integrations'), value: '0' },
  { label: __('Shared', 'bit-integrations'), value: '1' },
  { label: __('Private', 'bit-integrations'), value: '2' }
]

export const defaultWishlistOptions = [
  { label: __('No', 'bit-integrations'), value: '0' },
  { label: __('Yes', 'bit-integrations'), value: '1' }
]
