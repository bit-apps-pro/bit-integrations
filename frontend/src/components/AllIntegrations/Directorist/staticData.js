import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_listing', label: __('Create Listing', 'bit-integrations'), is_pro: true },
  { name: 'update_listing', label: __('Update Listing', 'bit-integrations'), is_pro: true },
  { name: 'delete_listing', label: __('Delete Listing', 'bit-integrations'), is_pro: true },
  {
    name: 'change_listing_status',
    label: __('Change Listing Status', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'set_listing_featured',
    label: __('Set Listing Featured', 'bit-integrations'),
    is_pro: true
  },
  { name: 'set_listing_expiry', label: __('Set Listing Expiry', 'bit-integrations'), is_pro: true },
  {
    name: 'assign_listing_terms',
    label: __('Assign Listing Terms', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_category', label: __('Create Category', 'bit-integrations'), is_pro: true },
  { name: 'create_location', label: __('Create Location', 'bit-integrations'), is_pro: true },
  { name: 'create_tag', label: __('Create Tag', 'bit-integrations'), is_pro: true },
  {
    name: 'add_favorite_listing',
    label: __('Add Listing to Favorites', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'remove_favorite_listing',
    label: __('Remove Listing from Favorites', 'bit-integrations'),
    is_pro: true
  },
  { name: 'update_user_profile', label: __('Update User Profile', 'bit-integrations'), is_pro: true },
  { name: 'add_review', label: __('Add Review', 'bit-integrations'), is_pro: true },
  { name: 'delete_review', label: __('Delete Review', 'bit-integrations'), is_pro: true },
  { name: 'update_order_status', label: __('Update Order Status', 'bit-integrations'), is_pro: true }
]

const listingContentFields = [
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'excerpt', label: __('Short Description', 'bit-integrations'), required: false },
  { key: 'tagline', label: __('Tagline', 'bit-integrations'), required: false },
  { key: 'address', label: __('Address', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'website', label: __('Website', 'bit-integrations'), required: false },
  { key: 'zip', label: __('Zip Code', 'bit-integrations'), required: false },
  { key: 'fax', label: __('Fax', 'bit-integrations'), required: false },
  { key: 'price', label: __('Price', 'bit-integrations'), required: false },
  { key: 'price_range', label: __('Price Range', 'bit-integrations'), required: false },
  { key: 'video_url', label: __('Video URL', 'bit-integrations'), required: false },
  { key: 'latitude', label: __('Latitude', 'bit-integrations'), required: false },
  { key: 'longitude', label: __('Longitude', 'bit-integrations'), required: false },
  { key: 'expiry_date', label: __('Expiry Date', 'bit-integrations'), required: false }
]

export const CreateListingFields = [
  { key: 'title', label: __('Listing Title', 'bit-integrations'), required: true },
  ...listingContentFields
]

export const UpdateListingFields = [
  { key: 'listing_id', label: __('Listing ID', 'bit-integrations'), required: true },
  { key: 'title', label: __('Listing Title', 'bit-integrations'), required: false },
  ...listingContentFields
]

export const ListingIdField = [
  { key: 'listing_id', label: __('Listing ID', 'bit-integrations'), required: true }
]

export const ListingExpiryFields = [
  { key: 'listing_id', label: __('Listing ID', 'bit-integrations'), required: true },
  { key: 'expiry_date', label: __('Expiry Date', 'bit-integrations'), required: false }
]

export const TermFields = [
  { key: 'name', label: __('Name', 'bit-integrations'), required: true },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const FavoriteFields = [
  { key: 'user_id', label: __('User ID', 'bit-integrations'), required: true },
  { key: 'listing_id', label: __('Listing ID', 'bit-integrations'), required: true }
]

export const UserProfileFields = [
  { key: 'user_id', label: __('User ID', 'bit-integrations'), required: true },
  { key: 'display_name', label: __('Display Name', 'bit-integrations'), required: false },
  { key: 'email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'website', label: __('Website', 'bit-integrations'), required: false },
  { key: 'address', label: __('Address', 'bit-integrations'), required: false },
  { key: 'bio', label: __('Bio', 'bit-integrations'), required: false },
  { key: 'facebook', label: __('Facebook URL', 'bit-integrations'), required: false },
  { key: 'twitter', label: __('Twitter URL', 'bit-integrations'), required: false },
  { key: 'linkedin', label: __('LinkedIn URL', 'bit-integrations'), required: false },
  { key: 'youtube', label: __('YouTube URL', 'bit-integrations'), required: false }
]

export const ReviewFields = [
  { key: 'listing_id', label: __('Listing ID', 'bit-integrations'), required: true },
  { key: 'rating', label: __('Rating', 'bit-integrations'), required: true },
  { key: 'content', label: __('Review', 'bit-integrations'), required: true },
  { key: 'user_id', label: __('Review Author User ID', 'bit-integrations'), required: false },
  { key: 'author_name', label: __('Author Name', 'bit-integrations'), required: false },
  { key: 'author_email', label: __('Author Email', 'bit-integrations'), required: false },
  { key: 'parent_id', label: __('Reply To Review ID', 'bit-integrations'), required: false }
]

export const ReviewIdField = [
  { key: 'review_id', label: __('Review ID', 'bit-integrations'), required: true }
]

export const OrderIdField = [
  { key: 'order_id', label: __('Order ID', 'bit-integrations'), required: true }
]

export const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: 'yes' },
  { label: __('No', 'bit-integrations'), value: 'no' }
]

// Actions whose required option is picked in the integration layout.
export const needsDirectory = ['create_listing', 'update_listing', 'assign_listing_terms']
export const needsListingStatus = ['change_listing_status']
export const needsFeatured = ['set_listing_featured']
export const needsOrderStatus = ['update_order_status']

// Actions that expose optional options in the Utilities section.
export const hasUtilities = [
  'create_listing',
  'update_listing',
  'delete_listing',
  'set_listing_expiry',
  'assign_listing_terms',
  'create_category',
  'create_location',
  'create_tag',
  'add_review',
  'delete_review'
]
