import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { deepCopy } from '../../../Utils/Helpers'
import { sprintf, __ } from '../../../Utils/i18nwrap'
import {
  ADD_POST_GRP_ACTIVITY_STREAM_PRO,
  ADD_POST_SITE_WIDE_ACTIVITY_STREAM_PRO,
  ADD_POST_USER_ACTIVITY_STREAM_PRO,
  CREATE_GROUP_PRO,
  POST_REPLY_TOPIC_FORUM_PRO,
  POST_TOPIC_FORUM_PRO,
  REMOVE_USER_FROM_GROUP_PRO,
  SEND_NOTIFICATION_MEMBER_GRP_PRO,
  SEND_NOTIFICATION_USER_PRO,
  SEND_PRIVATE_MSG_MEMBER_GRP_PRO,
  SEND_PRIVATE_MSG_USER_PRO
} from './IntegrationHelpers'

export const handleInput = (e, buddyBossConf, setBuddyBossConf, setIsLoading, setSnackbar, formID) => {
  const newConf = { ...buddyBossConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  if (name === 'mainAction') {
    newConf.field_map = [{ formField: '', buddyBossFormField: '' }]
  }

  newConf[e.target.name] = e.target.value
  setBuddyBossConf({ ...newConf })
}

export const getAllBuddyBossGroup = (buddyBossConf, setBuddyBossConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  bitsFetch(null, 'fetch_all_group')
    .then(result => {
      if (result && result.success) {
        setBuddyBossConf(oldConf => {
          const newConf = { ...oldConf }
          if (!newConf.default) {
            newConf.default = {}
          }
          if (result.data) {
            if (
              Number(buddyBossConf.mainAction) === REMOVE_USER_FROM_GROUP_PRO ||
              Number(buddyBossConf.mainAction) === ADD_POST_GRP_ACTIVITY_STREAM_PRO
            ) {
              const newGroupAdd = { id: 'any', name: 'Any' }
              const allGroupModify = [newGroupAdd, ...result.data]
              newConf.default.allGroup = allGroupModify
            } else {
              newConf.default.allGroup = result.data
            }
          }
          return newConf
        })
        setIsLoading(false)
        toast.success(__('All Group fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Group fetch failed. please try again', 'bit-integrations'))
    })

    .catch(() => setIsLoading(false))
}

export const getAllUser = (buddyBossConf, setBuddyBossConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  bitsFetch(null, 'fetch_all_user')
    .then(result => {
      if (result && result.success) {
        setBuddyBossConf(oldConf => {
          const newConf = { ...oldConf }
          if (!newConf.default) {
            newConf.default = {}
          }
          if (result.data) {
            newConf.default.allUser = result.data
          }
          return newConf
        })
        setIsLoading(false)
        toast.success(__('All User fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('User fetch failed. please try again', 'bit-integrations'))
    })

    .catch(() => setIsLoading(false))
}

export const getAllForum = (buddyBossConf, setBuddyBossConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  bitsFetch(null, 'fetch_all_forum')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...buddyBossConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.default.allForum = result.data
        }
        setBuddyBossConf({ ...newConf })
        setIsLoading(false)
        toast.success(__('All Forum fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Forum list fetch failed. please try again', 'bit-integrations'))
    })

    .catch(() => setIsLoading(false))
}

export const getAllTopic = (buddyBossConf, setBuddyBossConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = { forumID: buddyBossConf.forumId }
  bitsFetch(requestParams, 'fetch_all_topic')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...buddyBossConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.default.allTopic = result.data
        }
        setBuddyBossConf({ ...newConf })
        setIsLoading(false)
        toast.success(__('All Topic fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Topic list fetch failed. please try again', 'bit-integrations'))
    })

    .catch(() => setIsLoading(false))
}

export const generateMappedField = buddyBossConf => {
  var fields = []

  switch (Number(buddyBossConf.mainAction)) {
    case CREATE_GROUP_PRO:
      fields = buddyBossConf?.createGroupFields
      break

    case POST_TOPIC_FORUM_PRO:
      fields = buddyBossConf?.topicInForumFields
      break

    case SEND_NOTIFICATION_MEMBER_GRP_PRO:
    case SEND_NOTIFICATION_USER_PRO:
      fields = buddyBossConf?.sendAllUserNotificationFields
      break

    case SEND_PRIVATE_MSG_MEMBER_GRP_PRO:
    case SEND_PRIVATE_MSG_USER_PRO:
      fields = buddyBossConf?.sendAllGroupPrivateMessageFields
      break

    case ADD_POST_GRP_ACTIVITY_STREAM_PRO:
      fields = buddyBossConf?.addPostToGroupFields
      break

    case ADD_POST_SITE_WIDE_ACTIVITY_STREAM_PRO:
      fields = buddyBossConf?.addPostSiteWideActivityStreamFields
      break

    case POST_REPLY_TOPIC_FORUM_PRO:
      fields = buddyBossConf?.postReplyTopicForumFields
      break
  }

  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', buddyBossFormField: field.key }))
    : [{ formField: '', buddyBossFormField: '' }]
}

export const checkMappedFields = buddyBossConf => {
  if (
    ![
      CREATE_GROUP_PRO,
      POST_TOPIC_FORUM_PRO,
      SEND_NOTIFICATION_MEMBER_GRP_PRO,
      SEND_PRIVATE_MSG_MEMBER_GRP_PRO,
      SEND_PRIVATE_MSG_USER_PRO,
      SEND_NOTIFICATION_USER_PRO,
      ADD_POST_GRP_ACTIVITY_STREAM_PRO,
      ADD_POST_SITE_WIDE_ACTIVITY_STREAM_PRO,
      ADD_POST_USER_ACTIVITY_STREAM_PRO,
      POST_REPLY_TOPIC_FORUM_PRO
    ].includes(buddyBossConf.mainAction)
  ) {
    return true
  }

  const mappedFleld = buddyBossConf.field_map
    ? buddyBossConf.field_map.filter(mapped => !mapped.formField && !mapped.buddyBossFormField)
    : []
  if (mappedFleld.length > 0) {
    return false
  }
  return true
}
