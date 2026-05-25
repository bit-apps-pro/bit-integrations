/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'
import { TASKS } from './VoxelConstants'

export const handleInput = (e, voxelConf, setVoxelConf) => {
  const newConf = create(voxelConf, draftConf => {
    const { name } = e.target
    if (e.target.value !== '') {
      draftConf[name] = e.target.value
    } else {
      delete draftConf[name]
    }
  })

  setVoxelConf(newConf)
}

export const checkMappedFields = voxelConf => {
  const mappedFields = voxelConf?.field_map
    ? voxelConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.voxelField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}


export const getPostTypes = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, postTypes: true })

  bitsFetch({}, 'get_voxel_post_types').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.postTypes = result.data
      setConf(newConf)
      setLoading({ ...loading, postTypes: false })
      toast.success(__('Post Types fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, postTypes: false })
    toast.error(result?.data ? result.data : __('Something went wrong!', 'bit-integrations'))
  })
}

export const getPostFields = (confTmp, setConf, postType, loading, setLoading) => {
  setLoading({ ...loading, postFields: true })

  bitsFetch({ postType, selectedTask: confTmp.selectedTask }, 'get_voxel_post_fields').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.voxelFields = result.data.fields
      newConf.field_map = result.data.fieldMap
      setConf(newConf)
      setLoading({ ...loading, postFields: false })
      toast.success(__('Fields fetched successfully', 'bit-integrations'))
      if (
        newConf.selectedTask === TASKS.UPDATE_POST ||
        newConf.selectedTask === TASKS.UPDATE_COLLECTION_POST
      ) {
        getPosts(newConf, setConf, postType, loading, setLoading)
      }
      return
    }
    setLoading({ ...loading, postFields: false })
    toast.error(result?.data ? result.data : __('Something went wrong!', 'bit-integrations'))
  })
}

export const getPosts = (confTmp, setConf, postType, loading, setLoading) => {
  setLoading({ ...loading, posts: true })

  bitsFetch({ postType }, 'get_voxel_posts').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.posts = result.data
      setConf(newConf)
      setLoading({ ...loading, posts: false })
      toast.success(__('Posts fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, posts: false })
    toast.error(result?.data ? result.data : __('Something went wrong!', 'bit-integrations'))
  })
}

export const voxelStaticFields = selectedTask => {
  if (selectedTask === TASKS.SET_POST_VERIFIED || selectedTask === TASKS.SET_COLLECTION_POST_VERIFIED) {
    return {
      staticFields: [{ key: 'post_id', label: __('Post ID', 'bit-integrations'), required: true }],
      fieldMap: [{ formField: '', voxelField: 'post_id' }]
    }
  } else if (selectedTask === TASKS.SET_PROFILE_VERIFIED) {
    return {
      staticFields: [{ key: 'profile_id', label: __('Profile ID', 'bit-integrations'), required: true }],
      fieldMap: [{ formField: '', voxelField: 'profile_id' }]
    }
  }

  return { staticFields: [], fieldMap: [] }
}
