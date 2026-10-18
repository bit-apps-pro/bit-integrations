import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import {
  fieldSets,
  needsAssignAgent,
  needsCustomFields,
  needsDocAuthor,
  needsReplyAuthor,
  needsSentiment,
  needsTicketStatus
} from './staticData'

export const handleInput = (e, niroHelpConf, setNiroHelpConf) => {
  const { name, value } = e.target

  setNiroHelpConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const lists = {
  products: {
    route: 'refresh_niro_help_products',
    dataKey: 'products',
    confKey: 'allProducts',
    success: __('NiroHelp products are fetched.', 'bit-integrations'),
    error: __('NiroHelp did not send the products. Try again.', 'bit-integrations')
  },
  reasons: {
    route: 'refresh_niro_help_reasons',
    dataKey: 'reasons',
    confKey: 'allReasons',
    success: __('NiroHelp reasons are fetched.', 'bit-integrations'),
    error: __('NiroHelp did not send the reasons. Try again.', 'bit-integrations')
  },
  topics: {
    route: 'refresh_niro_help_topics',
    dataKey: 'topics',
    confKey: 'allTopics',
    success: __('NiroHelp topics are fetched.', 'bit-integrations'),
    error: __('NiroHelp did not send the topics. Try again.', 'bit-integrations')
  },
  agents: {
    route: 'refresh_niro_help_agents',
    dataKey: 'agents',
    confKey: 'allAgents',
    success: __('NiroHelp agents are fetched.', 'bit-integrations'),
    error: __('NiroHelp did not send the agents. Try again.', 'bit-integrations')
  },
  users: {
    route: 'refresh_niro_help_users',
    dataKey: 'users',
    confKey: 'allUsers',
    success: __('NiroHelp users are fetched.', 'bit-integrations'),
    error: __('NiroHelp did not send the users. Try again.', 'bit-integrations')
  }
}

const fetchList = listName => {
  const list = lists[listName]

  return bitsFetch(null, list.route)
    .then(result => ({ list, result }))
    .catch(() => ({ list, result: null }))
}

const storeList = (setNiroHelpConf, list, result) => {
  if (!result?.success || !result?.data?.[list.dataKey]) {
    toast.error(list.error)
    return false
  }

  setNiroHelpConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[list.confKey] = result.data[list.dataKey]
    })
  )

  return true
}

const fetchCustomFields = () => bitsFetch(null, 'refresh_niro_help_custom_fields').catch(() => null)

const storeCustomFields = (setNiroHelpConf, result) => {
  if (!result?.success) {
    toast.error(__('NiroHelp did not send the custom fields. Try again.', 'bit-integrations'))
    return false
  }

  setNiroHelpConf(prevConf =>
    create(prevConf, draftConf => {
      if (!needsCustomFields.includes(draftConf.mainAction)) {
        return
      }

      draftConf.niroHelpFields = [
        ...(fieldSets[draftConf.mainAction] || []),
        ...(result.data?.customFields || [])
      ]
    })
  )

  return true
}

export const refreshNiroHelpList = (listName, setNiroHelpConf, setIsLoading) => {
  setIsLoading(true)
  fetchList(listName).then(({ list, result }) => {
    setIsLoading(false)

    if (storeList(setNiroHelpConf, list, result)) {
      toast.success(list.success)
    }
  })
}

export const refreshNiroHelpCustomFields = (setNiroHelpConf, setIsLoading) => {
  setIsLoading(true)
  fetchCustomFields().then(result => {
    setIsLoading(false)

    if (storeCustomFields(setNiroHelpConf, result)) {
      toast.success(__('NiroHelp custom fields are fetched.', 'bit-integrations'))
    }
  })
}

export const refreshNiroHelpLists = (listNames, setNiroHelpConf, setIsLoading) => {
  if (!listNames.length) {
    return
  }

  setIsLoading(true)
  Promise.all(
    listNames.map(listName =>
      listName === 'customFields'
        ? fetchCustomFields().then(result => storeCustomFields(setNiroHelpConf, result))
        : fetchList(listName).then(({ list, result }) => storeList(setNiroHelpConf, list, result))
    )
  ).then(() => setIsLoading(false))
}

export const checkMappedFields = niroHelpConf => {
  const mappedFields = niroHelpConf?.field_map
    ? niroHelpConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.niroHelpField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []

  return mappedFields.length === 0
}

export const requiredSelectMissing = niroHelpConf => {
  const { mainAction } = niroHelpConf

  if (needsTicketStatus.includes(mainAction) && !niroHelpConf?.status) {
    return __('Select a status to continue.', 'bit-integrations')
  }
  if (needsAssignAgent.includes(mainAction) && !niroHelpConf?.agentId) {
    return __('Select an agent to continue.', 'bit-integrations')
  }
  if (needsSentiment.includes(mainAction) && !niroHelpConf?.sentiment) {
    return __('Select a sentiment to continue.', 'bit-integrations')
  }
  if (needsReplyAuthor.includes(mainAction) && !niroHelpConf?.replyBy) {
    return __('Select who writes the reply to continue.', 'bit-integrations')
  }
  if (needsDocAuthor.includes(mainAction) && !niroHelpConf?.authorId) {
    return __('Select a doc author to continue.', 'bit-integrations')
  }

  return ''
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)

  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', niroHelpField: field.key }))
    : [{ formField: '', niroHelpField: '' }]
}
