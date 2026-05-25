/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'
import { TASK_LIST_VALUES } from './wpforoConstants'

export const handleInput = (e, wpforoConf, setWPForoConf) => {
  const newConf = create(wpforoConf, draftConf => {
    const { name } = e.target
    if (e.target.value !== '') {
      draftConf[name] = e.target.value
    } else {
      delete draftConf[name]
    }
  })

  setWPForoConf(newConf)
}

export const checkMappedFields = wpforoConf => {
  const mappedFields = wpforoConf?.field_map
    ? wpforoConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.wpforoField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}


export const getWPForoReputations = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, reputation: true })

  bitsFetch({}, 'wpforo_fetch_reputations').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.reputations = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, reputation: false })

      toast.success(__('Reputations fetch successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, reputation: false })
    toast.error(__(result?.data ? result.data : 'Something went wrong!', 'bit-integrations'))
  })
}

export const getWPForoGroups = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, groups: true })

  bitsFetch({}, 'wpforo_fetch_groups').then(result => {
    if (result && result.success) {
      const newConf = { ...confTmp }
      if (result.data) {
        newConf.groups = result.data
      }
      setConf(newConf)
      setLoading({ ...setLoading, groups: false })

      toast.success(__('Groups fetch successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, groups: false })
    toast.error(__(result?.data ? result.data : 'Something went wrong!', 'bit-integrations'))
  })
}

export const getWPForoForums = (confTmp, setConf, setLoading) => {
  setLoading({ ...setLoading, forums: true })

  bitsFetch({}, 'wpforo_fetch_forums').then(result => {
    if (result && result.data) {
      const newConf = { ...confTmp }
      newConf.forums = result.data
      setConf(newConf)
      setLoading({ ...setLoading, forums: false })
      toast.success(__('Forums fetch successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...setLoading, forums: false })
    toast.error(__(result?.data ? result.data : 'Something went wrong!', 'bit-integrations'))
  })
}

export const getWPForoTopics = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, topics: true })

  bitsFetch({}, 'wpforo_fetch_topics').then(result => {
    if (result && result.data) {
      const newConf = { ...confTmp }
      newConf.topics = result.data
      setConf(newConf)
      setLoading({ ...loading, topics: false })
      toast.success(__('Topics fetch successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, topics: false })
    toast.error(__(result?.data ? result.data : 'Something went wrong!', 'bit-integrations'))
  })
}

export const wpforoStaticFields = selectedTask => {
  if (
    selectedTask === TASK_LIST_VALUES.USER_REPUTATION ||
    selectedTask === TASK_LIST_VALUES.ADD_TO_GROUP ||
    selectedTask === TASK_LIST_VALUES.REMOVE_FROM_GROUP
  ) {
    return {
      staticFields: [{ key: 'email', label: __('User Email', 'bit-integrations'), required: true }],
      fieldMap: [{ formField: '', wpforoField: 'email' }]
    }
  } else if (selectedTask === TASK_LIST_VALUES.CREATE_TOPIC) {
    return {
      staticFields: [
        { key: 'email', label: __('User Email', 'bit-integrations'), required: true },
        { key: 'topic_title', label: __('Topic Title', 'bit-integrations'), required: true },
        { key: 'topic_content', label: __('Topic Content', 'bit-integrations'), required: true }
      ],
      fieldMap: [
        { formField: '', wpforoField: 'email' },
        { formField: '', wpforoField: 'topic_title' },
        { formField: '', wpforoField: 'topic_content' }
      ]
    }
  } else if (selectedTask === TASK_LIST_VALUES.DELETE_TOPIC) {
    return {
      staticFields: [{ key: 'topic_id', label: __('Topic ID', 'bit-integrations'), required: true }],
      fieldMap: [{ formField: '', wpforoField: 'topic_id' }]
    }
  }

  return { staticFields: [], fieldMap: [] }
}
