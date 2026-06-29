// eslint-disable-next-line no-unused-vars
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { postFields as defaultPostFields } from '../../../Utils/StaticData/postField'

export const postCreationExtraActions = [
  { value: 'createNewPost', label: __('Create New Post', 'bit-integrations'), is_pro: false },
  { value: 'updateExistingPost', label: __('Update Existing Post', 'bit-integrations'), is_pro: true },
  { value: 'updatePostStatus', label: __('Update Post Status', 'bit-integrations'), is_pro: true },
  { value: 'deleteExistingPost', label: __('Delete Existing Post', 'bit-integrations'), is_pro: true },
  { value: 'createNewComment', label: __('Create New Comment', 'bit-integrations'), is_pro: true },
  { value: 'replyToComment', label: __('Reply To Comment', 'bit-integrations'), is_pro: true },
  {
    value: 'deleteExistingComment',
    label: __('Delete Existing Comment', 'bit-integrations'),
    is_pro: true
  }
]

export const isLegacyPostCreationAction = actionType => !actionType || actionType === 'createNewPost'

const postCreationActionFields = {
  updateExistingPost: [
    { key: 'post_id', name: __('Post ID', 'bit-integrations'), required: true },
    { key: 'post_title', name: __('Post Title', 'bit-integrations'), required: false },
    { key: 'post_content', name: __('Post Content', 'bit-integrations'), required: false },
    { key: 'post_status', name: __('Post Status', 'bit-integrations'), required: false },
    { key: 'post_type', name: __('Post Type', 'bit-integrations'), required: false },
    { key: 'post_author', name: __('Post Author ID', 'bit-integrations'), required: false },
    { key: 'post_date', name: __('Post Date', 'bit-integrations'), required: false },
    { key: 'post_name', name: __('Post Slug', 'bit-integrations'), required: false },
    { key: 'post_excerpt', name: __('Post Excerpt', 'bit-integrations'), required: false },
    { key: 'featured_image_url', name: __('Featured Image URL', 'bit-integrations'), required: false }
  ],
  updatePostStatus: [
    { key: 'post_id', name: __('Post ID', 'bit-integrations'), required: true },
    { key: 'post_status', name: __('Post Status', 'bit-integrations'), required: true }
  ],
  deleteExistingPost: [
    { key: 'post_id', name: __('Post ID', 'bit-integrations'), required: true },
    { key: 'force_delete', name: __('Force Delete (true/false)', 'bit-integrations'), required: false }
  ],
  createNewComment: [
    { key: 'comment_post_ID', name: __('Post ID', 'bit-integrations'), required: true },
    { key: 'comment_content', name: __('Comment Content', 'bit-integrations'), required: true },
    { key: 'comment_author', name: __('Author Name', 'bit-integrations'), required: false },
    { key: 'comment_author_email', name: __('Author Email', 'bit-integrations'), required: false },
    { key: 'comment_author_url', name: __('Author URL', 'bit-integrations'), required: false },
    { key: 'comment_parent', name: __('Parent Comment ID', 'bit-integrations'), required: false }
  ],
  replyToComment: [
    { key: 'comment_parent', name: __('Parent Comment ID', 'bit-integrations'), required: true },
    { key: 'comment_content', name: __('Comment Content', 'bit-integrations'), required: true },
    { key: 'comment_post_ID', name: __('Post ID', 'bit-integrations'), required: true },
    { key: 'comment_author', name: __('Author Name', 'bit-integrations'), required: false },
    { key: 'comment_author_email', name: __('Author Email', 'bit-integrations'), required: false }
  ],
  deleteExistingComment: [
    { key: 'comment_id', name: __('Comment ID', 'bit-integrations'), required: true },
    { key: 'force_delete', name: __('Force Delete (true/false)', 'bit-integrations'), required: false }
  ]
}

export const getPostCreationFieldsByAction = actionType => {
  if (isLegacyPostCreationAction(actionType)) {
    return defaultPostFields
  }

  return postCreationActionFields[actionType] || defaultPostFields
}

export const generatePostCreationFieldMap = actionType => {
  const fields = getPostCreationFieldsByAction(actionType)
  const requiredFields = fields.filter(field => field.required)

  if (requiredFields.length > 0) {
    return requiredFields.map(field => ({
      formField: '',
      postField: field.key,
      required: true
    }))
  }

  return [{ formField: '', postField: '' }]
}

export const addFieldMap = (fldProp, i, confTmp, setConf) => {
  const newConf = { ...confTmp }
  newConf[fldProp].splice(i, 0, {})

  setConf({ ...newConf })
}

export const delFieldMap = (fldProp, i, confTmp, setConf) => {
  const newConf = { ...confTmp }
  if (newConf[fldProp].length > 1) {
    newConf[fldProp].splice(i, 1)
  }

  setConf({ ...newConf })
}

export const handleFieldMapping = (fldProp, event, index, conftTmp, setConf) => {
  const newConf = { ...conftTmp }
  newConf[fldProp][index][event.target.name] = event.target.value

  setConf({ ...newConf })
}

export const checkMappedPostFields = data => {
  const mappedFields = data?.post_map
    ? data.post_map.filter(
        mappedField => !mappedField.formField && mappedField.postField && mappedField.required
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
export const checkMappedAcfFields = data => {
  const mappedFields = data?.acf_map
    ? data.acf_map.filter(
        mappedField => !mappedField.formField && mappedField.acfField && mappedField.required
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }

  return true
}

export const checkMappedMbFields = data => {
  const mappedFields = data?.metabox_map
    ? data.metabox_map.filter(
        mappedField => !mappedField.formField && mappedField.metaboxField && mappedField.required
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }

  return true
}

export const checkMappedJEFields = data => {
  const mappedFields = data?.je_cpt_meta_map
    ? data.je_cpt_meta_map.filter(
        mappedField => !mappedField.formField && mappedField.jeCPTField && mappedField.required
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }

  return true
}

export const refreshPostTypes = setPostTypes => {
  const loadPostTypes = bitsFetch({}, 'post-types/list').then(result => {
    if (result && result.success) {
      const { data } = result
      if (data) {
        setPostTypes(data)
      }
      if (data !== 0) return 'Successfully refresh Post Types.'
      return __('Post Types not found', 'bit-integrations')
    }
  })

  toast.promise(loadPostTypes, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading Post Types...')
  })
}

export const refreshPostCategories = (postType, setPostCategories) => {
  const loadPostCategories = bitsFetch({ post_type: postType }, 'post-categories/list').then(result => {
    if (result && result.success) {
      const { data } = result
      if (data) {
        setPostCategories(data)
      }
      if (data && data.length > 0)
        return __('Successfully refreshed Post Categories.', 'bit-integrations')
      return __('Post Categories not found', 'bit-integrations')
    }
  })

  toast.promise(loadPostCategories, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading Post Categories...')
  })
}
