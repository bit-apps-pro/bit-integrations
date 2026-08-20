import { __ } from '../../../Utils/i18nwrap'

export const TASKS = {
  NEW_POST: 'newPost',
  NEW_COLLECTION_POST: 'newCollectionPost',
  NEW_PROFILE: 'newProfile',
  UPDATE_POST: 'updatePost',
  UPDATE_COLLECTION_POST: 'updateCollectionPost',
  UPDATE_PROFILE: 'updateProfile',
  SET_POST_VERIFIED: 'setPostVerified',
  SET_COLLECTION_POST_VERIFIED: 'setCollectionPostVerified',
  SET_PROFILE_VERIFIED: 'setProfileVerified'
}

export const TASK_LIST = [
  { label: __('Create New Post', 'bit-integrations'), value: TASKS.NEW_POST },
  { label: __('Create New Collection Post', 'bit-integrations'), value: TASKS.NEW_COLLECTION_POST },
  { label: __('Create New Profile', 'bit-integrations'), value: TASKS.NEW_PROFILE },
  { label: __('Update Post', 'bit-integrations'), value: TASKS.UPDATE_POST },
  { label: __('Update Collection Post', 'bit-integrations'), value: TASKS.UPDATE_COLLECTION_POST },
  { label: __('Update Profile', 'bit-integrations'), value: TASKS.UPDATE_PROFILE },
  { label: __('Set Post as Verified', 'bit-integrations'), value: TASKS.SET_POST_VERIFIED },
  {
    label: __('Set Collection Post as Verified', 'bit-integrations'),
    value: TASKS.SET_COLLECTION_POST_VERIFIED
  },
  { label: __('Set Profile as Verified', 'bit-integrations'), value: TASKS.SET_PROFILE_VERIFIED }
]

export const POST_TYPE_TASK_ARRAY = [
  TASKS.NEW_POST,
  TASKS.NEW_COLLECTION_POST,
  TASKS.UPDATE_POST,
  TASKS.UPDATE_COLLECTION_POST
]

// constants for static post type

export const COLLECTION_POST_TYPE = 'collection'
export const PROFILE_POST_TYPE = 'profile'
