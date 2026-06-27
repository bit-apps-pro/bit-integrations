import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  // User/Post actions moved to dedicated actions:
  // - WP User Registration
  // - WP Post Creation
  // Post Types
  { name: 'registerPostType', label: __('Register Post Type', 'bit-integrations'), is_pro: true },
  { name: 'unregisterPostType', label: __('Unregister Post Type', 'bit-integrations'), is_pro: true },
  { name: 'addPostTypeFeatures', label: __('Add Post Type Features', 'bit-integrations'), is_pro: true },
  // Post Tags
  { name: 'createPostTag', label: __('Create Post Tag', 'bit-integrations'), is_pro: true },
  { name: 'updatePostTag', label: __('Update Post Tag', 'bit-integrations'), is_pro: true },
  { name: 'deletePostTag', label: __('Delete Post Tag', 'bit-integrations'), is_pro: true },
  { name: 'addTaxonomyToPost', label: __('Add Taxonomy To Post', 'bit-integrations'), is_pro: true },
  {
    name: 'removeTaxonomyFromPost',
    label: __('Remove Taxonomy From Post', 'bit-integrations'),
    is_pro: true
  },
  { name: 'addTagsToPost', label: __('Add Tags To Post', 'bit-integrations'), is_pro: true },
  { name: 'removeTagsFromPost', label: __('Remove Tags From Post', 'bit-integrations'), is_pro: true },
  // Media
  { name: 'addNewImage', label: __('Add New Image', 'bit-integrations'), is_pro: true },
  { name: 'deleteMedia', label: __('Delete Media', 'bit-integrations'), is_pro: true },
  { name: 'renameMedia', label: __('Rename Media', 'bit-integrations'), is_pro: true },
  // Taxonomies
  { name: 'registerTaxonomy', label: __('Register Taxonomy', 'bit-integrations'), is_pro: true },
  { name: 'unregisterTaxonomy', label: __('Unregister Taxonomy', 'bit-integrations'), is_pro: true },
  // Terms
  { name: 'createNewTerm', label: __('Create New Term', 'bit-integrations'), is_pro: true },
  { name: 'updateTerm', label: __('Update Term', 'bit-integrations'), is_pro: true },
  { name: 'termDelete', label: __('Delete Term', 'bit-integrations'), is_pro: true },
  // Categories
  { name: 'createCategory', label: __('Create Category', 'bit-integrations'), is_pro: true },
  { name: 'updateCategory', label: __('Update Category', 'bit-integrations'), is_pro: true },
  { name: 'deleteCategory', label: __('Delete Category', 'bit-integrations'), is_pro: true },
  { name: 'addCategoryToPost', label: __('Add Category To Post', 'bit-integrations'), is_pro: true },
  // WooCommerce Product Tags
  { name: 'createProductTag', label: __('Create Product Tag', 'bit-integrations'), is_pro: true },
  { name: 'updateProductTag', label: __('Update Product Tag', 'bit-integrations'), is_pro: true },
  { name: 'deleteProductTag', label: __('Delete Product Tag', 'bit-integrations'), is_pro: true },
  // WooCommerce Product Categories
  {
    name: 'createProductCategory',
    label: __('Create Product Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'updateProductCategory',
    label: __('Update Product Category', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'deleteProductCategory',
    label: __('Delete Product Category', 'bit-integrations'),
    is_pro: true
  },
  // WooCommerce Product Types
  { name: 'createProductType', label: __('Create Product Type', 'bit-integrations'), is_pro: true },
  { name: 'updateProductType', label: __('Update Product Type', 'bit-integrations'), is_pro: true },
  { name: 'deleteProductType', label: __('Delete Product Type', 'bit-integrations'), is_pro: true },
  // Plugin Management
  {
    name: 'checkPluginActivationStatus',
    label: __('Check Plugin Activation Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'activatePlugin', label: __('Activate Plugin', 'bit-integrations'), is_pro: true }
]

// === User Fields ===
export const CreateUserFields = [
  { key: 'user_login', label: __('Username', 'bit-integrations'), required: true },
  { key: 'user_email', label: __('Email', 'bit-integrations'), required: true },
  { key: 'user_pass', label: __('Password', 'bit-integrations'), required: true },
  { key: 'display_name', label: __('Display Name', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'user_url', label: __('Website URL', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'role', label: __('Role', 'bit-integrations'), required: false }
]

export const UpdateUserFields = [
  { key: 'user_id', label: __('User ID', 'bit-integrations'), required: true },
  { key: 'user_email', label: __('Email', 'bit-integrations'), required: false },
  { key: 'user_pass', label: __('Password', 'bit-integrations'), required: false },
  { key: 'display_name', label: __('Display Name', 'bit-integrations'), required: false },
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'user_url', label: __('Website URL', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'role', label: __('Role', 'bit-integrations'), required: false }
]

export const UserIdField = [{ key: 'user_id', label: __('User ID', 'bit-integrations'), required: true }]

export const UserEmailField = [
  { key: 'user_email', label: __('Email', 'bit-integrations'), required: true }
]

export const UserByFieldFields = [
  { key: 'field', label: __('Field Name (login/email/slug/id)', 'bit-integrations'), required: true },
  { key: 'value', label: __('Field Value', 'bit-integrations'), required: true }
]

export const UserRoleField = [{ key: 'role', label: __('Role', 'bit-integrations'), required: true }]

export const UserMetaFields = [
  { key: 'user_id', label: __('User ID', 'bit-integrations'), required: true },
  { key: 'meta_key', label: __('Meta Key', 'bit-integrations'), required: true }
]

export const UpdateUserMetaFields = [
  { key: 'user_id', label: __('User ID', 'bit-integrations'), required: true },
  { key: 'meta_key', label: __('Meta Key', 'bit-integrations'), required: true },
  { key: 'meta_value', label: __('Meta Value', 'bit-integrations'), required: true }
]

// === Role Fields ===
export const CreateRoleFields = [
  { key: 'role_name', label: __('Role Name (slug)', 'bit-integrations'), required: true },
  { key: 'display_name', label: __('Display Name', 'bit-integrations'), required: true },
  {
    key: 'capabilities',
    label: __('Capabilities (comma separated)', 'bit-integrations'),
    required: false
  }
]

export const RoleNameField = [
  { key: 'role_name', label: __('Role Name', 'bit-integrations'), required: true }
]

export const UserRoleManageFields = [
  { key: 'user_id', label: __('User ID', 'bit-integrations'), required: true },
  { key: 'role', label: __('Role', 'bit-integrations'), required: true }
]

export const UpdateUserRoleFields = [
  { key: 'user_id', label: __('User ID', 'bit-integrations'), required: true },
  { key: 'old_role', label: __('Old Role', 'bit-integrations'), required: true },
  { key: 'new_role', label: __('New Role', 'bit-integrations'), required: true }
]

// === Capability Fields ===
export const RoleCapabilitiesFields = [
  { key: 'role_name', label: __('Role Name', 'bit-integrations'), required: true },
  {
    key: 'capabilities',
    label: __('Capabilities (comma separated)', 'bit-integrations'),
    required: true
  }
]

export const UserCapabilitiesFields = [
  { key: 'user_id', label: __('User ID', 'bit-integrations'), required: true },
  {
    key: 'capabilities',
    label: __('Capabilities (comma separated)', 'bit-integrations'),
    required: true
  }
]

// === Post Fields ===
export const CreatePostFields = [
  { key: 'post_title', label: __('Post Title', 'bit-integrations'), required: true },
  { key: 'post_content', label: __('Post Content', 'bit-integrations'), required: false },
  { key: 'post_status', label: __('Post Status', 'bit-integrations'), required: false },
  { key: 'post_type', label: __('Post Type', 'bit-integrations'), required: false },
  { key: 'post_author', label: __('Post Author ID', 'bit-integrations'), required: false },
  { key: 'post_date', label: __('Post Date', 'bit-integrations'), required: false },
  { key: 'post_name', label: __('Post Slug', 'bit-integrations'), required: false },
  { key: 'post_excerpt', label: __('Post Excerpt', 'bit-integrations'), required: false },
  { key: 'menu_order', label: __('Menu Order', 'bit-integrations'), required: false },
  {
    key: 'comment_status',
    label: __('Comment Status (open/closed)', 'bit-integrations'),
    required: false
  },
  { key: 'featured_image_url', label: __('Featured Image URL', 'bit-integrations'), required: false },
  { key: 'post_password', label: __('Post Password', 'bit-integrations'), required: false }
]

export const UpdatePostFields = [
  { key: 'post_id', label: __('Post ID', 'bit-integrations'), required: true },
  { key: 'post_title', label: __('Post Title', 'bit-integrations'), required: false },
  { key: 'post_content', label: __('Post Content', 'bit-integrations'), required: false },
  { key: 'post_status', label: __('Post Status', 'bit-integrations'), required: false },
  { key: 'post_type', label: __('Post Type', 'bit-integrations'), required: false },
  { key: 'post_author', label: __('Post Author ID', 'bit-integrations'), required: false },
  { key: 'post_date', label: __('Post Date', 'bit-integrations'), required: false },
  { key: 'post_name', label: __('Post Slug', 'bit-integrations'), required: false },
  { key: 'post_excerpt', label: __('Post Excerpt', 'bit-integrations'), required: false },
  { key: 'featured_image_url', label: __('Featured Image URL', 'bit-integrations'), required: false }
]

export const PostIdField = [{ key: 'post_id', label: __('Post ID', 'bit-integrations'), required: true }]

export const PostTypeField = [{ key: 'key', label: __('Post Type', 'bit-integrations'), required: true }]

export const PostsByMetaFields = [
  { key: 'meta_key', label: __('Meta Key', 'bit-integrations'), required: true },
  { key: 'meta_value', label: __('Meta Value', 'bit-integrations'), required: true }
]

export const PostMetaByKeyFields = [
  { key: 'post_id', label: __('Post ID', 'bit-integrations'), required: true },
  { key: 'meta_key', label: __('Meta Key', 'bit-integrations'), required: true }
]

export const UpdatePostStatusFields = [
  { key: 'post_id', label: __('Post ID', 'bit-integrations'), required: true },
  { key: 'post_status', label: __('Post Status', 'bit-integrations'), required: true }
]

// === Comment Fields ===
export const CreateCommentFields = [
  { key: 'comment_post_ID', label: __('Post ID', 'bit-integrations'), required: true },
  { key: 'comment_content', label: __('Comment Content', 'bit-integrations'), required: true },
  { key: 'comment_author', label: __('Author Name', 'bit-integrations'), required: false },
  { key: 'comment_author_email', label: __('Author Email', 'bit-integrations'), required: false },
  { key: 'comment_author_url', label: __('Author URL', 'bit-integrations'), required: false },
  { key: 'comment_parent', label: __('Parent Comment ID', 'bit-integrations'), required: false }
]

export const ReplyCommentFields = [
  { key: 'comment_parent', label: __('Parent Comment ID', 'bit-integrations'), required: true },
  { key: 'comment_content', label: __('Comment Content', 'bit-integrations'), required: true },
  { key: 'comment_post_ID', label: __('Post ID', 'bit-integrations'), required: false },
  { key: 'comment_author', label: __('Author Name', 'bit-integrations'), required: false },
  { key: 'comment_author_email', label: __('Author Email', 'bit-integrations'), required: false }
]

export const CommentIdField = [
  { key: 'comment_id', label: __('Comment ID', 'bit-integrations'), required: true }
]

export const CommentMetaByKeyFields = [
  { key: 'comment_id', label: __('Comment ID', 'bit-integrations'), required: true },
  { key: 'meta_key', label: __('Meta Key', 'bit-integrations'), required: true }
]

// === Post Type Fields ===
export const RegisterPostTypeFields = [
  { key: 'key', label: __('Post Type Slug', 'bit-integrations'), required: true },
  { key: 'label', label: __('Label', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'supports', label: __('Supports (comma separated)', 'bit-integrations'), required: false },
  { key: 'menuPosition', label: __('Menu Position', 'bit-integrations'), required: false },
  { key: 'rewriteSlug', label: __('Rewrite Slug', 'bit-integrations'), required: false }
]

export const PostTypeFeaturesFields = [
  { key: 'key', label: __('Post Type', 'bit-integrations'), required: true },
  { key: 'supports', label: __('Features (comma separated)', 'bit-integrations'), required: true }
]

// === Tag / Taxonomy / Term Fields ===
export const CreateTagFields = [
  { key: 'name', label: __('Tag Name', 'bit-integrations'), required: true },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const UpdateTagFields = [
  { key: 'termId', label: __('Tag ID', 'bit-integrations'), required: true },
  { key: 'name', label: __('Tag Name', 'bit-integrations'), required: false },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const TagIdField = [{ key: 'termId', label: __('Tag ID', 'bit-integrations'), required: true }]

export const TaxonomyToPostFields = [
  { key: 'postId', label: __('Post ID', 'bit-integrations'), required: true },
  { key: 'taxonomy', label: __('Taxonomy', 'bit-integrations'), required: true },
  { key: 'term', label: __('Term (ID or slug)', 'bit-integrations'), required: true }
]

export const TagsToPostFields = [
  { key: 'postId', label: __('Post ID', 'bit-integrations'), required: true },
  { key: 'tags', label: __('Tags (comma separated IDs/slugs)', 'bit-integrations'), required: true }
]

// === Media Fields ===
export const AddImageFields = [
  { key: 'image_url', label: __('Image URL', 'bit-integrations'), required: true },
  { key: 'title', label: __('Title', 'bit-integrations'), required: false },
  { key: 'caption', label: __('Caption', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'altText', label: __('Alt Text', 'bit-integrations'), required: false }
]

export const MediaIdField = [{ key: 'id', label: __('Media ID', 'bit-integrations'), required: true }]

export const RenameMediaFields = [
  { key: 'id', label: __('Media ID', 'bit-integrations'), required: true },
  { key: 'title', label: __('New Title', 'bit-integrations'), required: true }
]

export const MediaTitleField = [{ key: 'title', label: __('Title', 'bit-integrations'), required: true }]

// === Taxonomy Fields ===
export const TaxonomyField = [{ key: 'slug', label: __('Taxonomy', 'bit-integrations'), required: true }]

export const RegisterTaxonomyFields = [
  { key: 'slug', label: __('Taxonomy Slug', 'bit-integrations'), required: true },
  { key: 'postTypes', label: __('Post Types (comma separated)', 'bit-integrations'), required: true },
  { key: 'name', label: __('Label', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false },
  { key: 'rewriteSlug', label: __('Rewrite Slug', 'bit-integrations'), required: false }
]

// === Term Fields ===
export const TermIdTaxonomyFields = [
  { key: 'termId', label: __('Term ID', 'bit-integrations'), required: true },
  { key: 'taxonomy', label: __('Taxonomy', 'bit-integrations'), required: true }
]

export const TermByFieldFields = [
  { key: 'field', label: __('Field (id/name/slug)', 'bit-integrations'), required: true },
  { key: 'value', label: __('Value', 'bit-integrations'), required: true },
  { key: 'taxonomy', label: __('Taxonomy', 'bit-integrations'), required: true }
]

export const CreateTermFields = [
  { key: 'name', label: __('Term Name', 'bit-integrations'), required: true },
  { key: 'taxonomy', label: __('Taxonomy', 'bit-integrations'), required: true },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const UpdateTermFields = [
  { key: 'termId', label: __('Term ID', 'bit-integrations'), required: true },
  { key: 'taxonomy', label: __('Taxonomy', 'bit-integrations'), required: true },
  { key: 'name', label: __('Term Name', 'bit-integrations'), required: false },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

// === Category Fields ===
export const CreateCategoryFields = [
  { key: 'name', label: __('Category Name', 'bit-integrations'), required: true },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const UpdateCategoryFields = [
  { key: 'termId', label: __('Category ID', 'bit-integrations'), required: true },
  { key: 'name', label: __('Category Name', 'bit-integrations'), required: false },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const CategoryIdField = [
  { key: 'termId', label: __('Category ID', 'bit-integrations'), required: true }
]

export const AddCategoryToPostFields = [
  { key: 'postId', label: __('Post ID', 'bit-integrations'), required: true },
  {
    key: 'categories',
    label: __('Category IDs (comma separated)', 'bit-integrations'),
    required: true
  }
]

// === WooCommerce Tag/Category/Type Fields ===
export const CreateProductTagFields = [
  { key: 'name', label: __('Tag Name', 'bit-integrations'), required: true },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const UpdateProductTagFields = [
  { key: 'termId', label: __('Tag ID', 'bit-integrations'), required: true },
  { key: 'name', label: __('Tag Name', 'bit-integrations'), required: false },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const CreateProductCategoryFields = [
  { key: 'name', label: __('Category Name', 'bit-integrations'), required: true },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const UpdateProductCategoryFields = [
  { key: 'termId', label: __('Category ID', 'bit-integrations'), required: true },
  { key: 'name', label: __('Category Name', 'bit-integrations'), required: false },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const CreateProductTypeFields = [
  { key: 'name', label: __('Type Name', 'bit-integrations'), required: true },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false }
]

export const UpdateProductTypeFields = [
  { key: 'termId', label: __('Type ID', 'bit-integrations'), required: true },
  { key: 'name', label: __('Type Name', 'bit-integrations'), required: false },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false }
]

export const ProductTypeIdField = [
  { key: 'termId', label: __('Type ID', 'bit-integrations'), required: true }
]

// === Plugin Fields ===
export const PluginPathField = [
  { key: 'pluginFile', label: __('Plugin Path (folder/file.php)', 'bit-integrations'), required: true }
]

export const EmptyFields = []
