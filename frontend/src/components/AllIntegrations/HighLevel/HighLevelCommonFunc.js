// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import toast from 'react-hot-toast'
import { TASK_LIST_VALUES } from './highlevelConstants'

export const handleInput = (e, highLevelConf, setHighLevelConf) => {
  const newConf = { ...highLevelConf }
  newConf.name = e.target.value
  setHighLevelConf({ ...newConf })
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : {
        api_key: confTmp.api_key,
        version: confTmp?.version,
        location_id: confTmp?.location_id
      }

export const checkMappedFields = highLevelConf => {
  const mappedFields = highLevelConf?.field_map
    ? highLevelConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.highLevelField ||
          (!mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const getCustomFields = (confTmp, setConf, loading, setLoading) => {
  const requestParams = buildAuthRequestParams(confTmp)

  setLoading({ ...loading, customFields: true })
  bitsFetch(requestParams, 'get_highLevel_contact_custom_fields').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      const staticFields = contactStaticFields(confTmp.selectedTask)
      newConf.highLevelFields = [...staticFields, ...result.data]
      setConf(newConf)
      setLoading({ ...loading, customFields: false })
      toast.success(__('Custom fields fetch successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, customFields: false })
    toast.error(result?.data ? result.data : __('Something went wrong!', 'bit-integrations'))
  })
}

export const getContacts = (confTmp, setConf, loading, setLoading) => {
  const requestParams = buildAuthRequestParams(confTmp)

  setLoading({ ...loading, contacts: true })
  bitsFetch(requestParams, 'get_highLevel_contacts').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.contacts = result.data
      setConf(newConf)
      setLoading({ ...loading, contacts: false })
      toast.success(__('Contacts fetched successfully', 'bit-integrations'))
      if (newConf.selectedTask === TASK_LIST_VALUES.UPDATE_CONTACT) {
        getCustomFields(newConf, setConf, loading, setLoading)
      }
      if (
        newConf.selectedTask === TASK_LIST_VALUES.CREATE_TASK ||
        newConf.selectedTask === TASK_LIST_VALUES.UPDATE_TASK ||
        newConf.selectedTask === TASK_LIST_VALUES.CREATE_OPPORTUNITY
      ) {
        getUsers(newConf, setConf, loading, setLoading)
      }
      return
    }
    setLoading({ ...loading, contacts: false })
    toast.error(result?.data ? result.data : __('Something went wrong!', 'bit-integrations'))
  })
}

export const getUsers = (confTmp, setConf, loading, setLoading) => {
  const requestParams = buildAuthRequestParams(confTmp)

  setLoading({ ...loading, users: true })
  bitsFetch(requestParams, 'get_highLevel_users').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.users = result.data
      setConf(newConf)
      setLoading({ ...loading, users: false })
      toast.success(__('Users fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, users: false })
    toast.error(result?.data ? result.data : __('Something went wrong!', 'bit-integrations'))
  })
}

export const getHLTasks = (confTmp, setConf, loading, setLoading) => {
  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    contact_id: confTmp.selectedContact
  }

  setLoading({ ...loading, hlTasks: true })
  bitsFetch(requestParams, 'get_highLevel_tasks').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.hlTasks = result.data
      setConf(newConf)
      setLoading({ ...loading, hlTasks: false })
      toast.success(__('Task fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, hlTasks: false })
    toast.error(result?.data ? result.data : __('Something went wrong!', 'bit-integrations'))
  })
}

export const getPipelines = (confTmp, setConf, loading, setLoading) => {
  const requestParams = buildAuthRequestParams(confTmp)

  setLoading({ ...loading, pipelines: true })
  bitsFetch(requestParams, 'get_highLevel_pipelines').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.pipelines = result.data.pipelineList
      newConf.stages = result.data.stages
      setConf(newConf)
      setLoading({ ...loading, pipelines: false })
      toast.success(__('Pipelines fetched successfully', 'bit-integrations'))
      if (
        newConf.selectedTask === TASK_LIST_VALUES.CREATE_OPPORTUNITY ||
        newConf.selectedTask === TASK_LIST_VALUES.UPDATE_OPPORTUNITY
      ) {
        getContacts(newConf, setConf, loading, setLoading)
      }
      return
    }
    setLoading({ ...loading, pipelines: false })
    toast.error(result?.data ? result.data : __('Something went wrong!', 'bit-integrations'))
  })
}

export const getOpportunities = (confTmp, setConf, loading, setLoading) => {
  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    pipeline_id: confTmp.selectedPipeline
  }

  setLoading({ ...loading, opportunities: true })
  bitsFetch(requestParams, 'get_highLevel_opportunities').then(result => {
    if (result.success && result.data) {
      const newConf = { ...confTmp }
      newConf.opportunities = result.data
      setConf(newConf)
      setLoading({ ...loading, opportunities: false })
      toast.success(__('Opportunities fetched successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, opportunities: false })
    toast.error(result?.data ? result.data : __('Something went wrong!', 'bit-integrations'))
  })
}

export const getHighLevelOptions = (
  route,
  confTmp,
  utilityOptions,
  setUtilityOptions,
  type,
  loading,
  setLoading,
  name = ''
) => {
  if (!route) {
    return
  }

  const requestParams = {
    ...buildAuthRequestParams(confTmp)
  }

  setLoading({ ...loading, options: true })
  bitsFetch(requestParams, route).then(result => {
    if (result.success && result.data) {
      const tmpOptions = { ...utilityOptions }
      tmpOptions[type] = result.data
      setUtilityOptions(tmpOptions)
      setLoading({ ...loading, options: false })
      toast.success(__(`${name} fetched successfully`, 'bit-integrations'))
      return
    }
    setLoading({ ...loading, options: false })
    toast.error(result?.data ? result.data : __('Something went wrong!', 'bit-integrations'))
  })
}

const contactStaticFields = selectedTask => {
  const fields = [
    {
      key: 'email',
      label: 'Email',
      required: selectedTask === TASK_LIST_VALUES.CREATE_CONTACT ? true : false
    },
    { key: 'firstName', label: 'First Name', required: false },
    { key: 'lastName', label: 'Last Name', required: false },
    { key: 'name', label: 'Full Name', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'dateOfBirth', label: 'Date of Birth', required: false },
    { key: 'address1', label: 'Address 1', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'state', label: 'State', required: false },
    { key: 'country', label: 'Country', required: false },
    { key: 'postalCode', label: 'postalCode (Zip)', required: false },
    { key: 'companyName', label: 'Company Name', required: false },
    { key: 'website', label: 'Website', required: false }
  ]

  if (selectedTask === TASK_LIST_VALUES.UPDATE_CONTACT) {
    fields.unshift({ key: 'id', label: 'ID', required: false })
  }

  return fields
}

export const highLevelStaticFields = (selectedTask, version = 'v1') => {
  if (selectedTask === TASK_LIST_VALUES.CREATE_CONTACT) {
    return {
      staticFields: contactStaticFields(selectedTask),
      fieldMap: [{ formField: '', highLevelField: 'email' }]
    }
  } else if (selectedTask === TASK_LIST_VALUES.UPDATE_CONTACT) {
    return {
      staticFields: contactStaticFields(selectedTask),
      fieldMap: [{ formField: '', highLevelField: '' }]
    }
  } else if (selectedTask === TASK_LIST_VALUES.CREATE_TASK) {
    return {
      staticFields: [
        { key: 'title', label: 'Title', required: true },
        { key: 'dueDate', label: 'Due Date', required: true },
        { key: 'description', label: 'Description', required: false },
        { key: 'contactId', label: 'Contact ID', required: false }
      ],
      fieldMap: [
        { formField: '', highLevelField: 'title' },
        { formField: '', highLevelField: 'dueDate' }
      ]
    }
  } else if (selectedTask === TASK_LIST_VALUES.UPDATE_TASK) {
    return {
      staticFields: [
        { key: 'title', label: 'Title', required: true },
        { key: 'dueDate', label: 'Due Date', required: true },
        { key: 'taskId', label: 'Task ID', required: false },
        { key: 'description', label: 'Description', required: false },
        { key: 'contactId', label: 'Contact ID', required: false }
      ],
      fieldMap: [
        { formField: '', highLevelField: 'title' },
        { formField: '', highLevelField: 'dueDate' }
      ]
    }
  } else if (selectedTask === TASK_LIST_VALUES.CREATE_OPPORTUNITY) {
    return version === 'v1'
      ? {
          staticFields: [
            { key: 'title', label: 'Title', required: true },
            { key: 'name', label: 'Name', required: false },
            { key: 'email', label: 'Email', required: false },
            { key: 'phone', label: 'Phone Number', required: false },
            { key: 'companyName', label: 'Company Name', required: false },
            { key: 'monetaryValue', label: 'Monetary Value', required: false },
            { key: 'contactId', label: 'Contact ID', required: false }
          ],
          fieldMap: [{ formField: '', highLevelField: 'title' }]
        }
      : {
          staticFields: [
            { key: 'name', label: 'Name', required: true },
            { key: 'monetaryValue', label: 'Monetary Value', required: false },
            { key: 'contactId', label: 'Contact ID', required: false }
          ],
          fieldMap: [{ formField: '', highLevelField: 'name' }]
        }
  } else if (selectedTask === TASK_LIST_VALUES.UPDATE_OPPORTUNITY) {
    return version === 'v1'
      ? {
          staticFields: [
            { key: 'title', label: 'Title', required: true },
            { key: 'name', label: 'Name', required: false },
            { key: 'email', label: 'Email', required: false },
            { key: 'phone', label: 'Phone Number', required: false },
            { key: 'companyName', label: 'Company Name', required: false },
            { key: 'monetaryValue', label: 'Monetary Value', required: false },
            { key: 'opportunityId', label: 'Opportunity ID', required: false },
            { key: 'contactId', label: 'Contact ID', required: false }
          ],
          fieldMap: [{ formField: '', highLevelField: 'title' }]
        }
      : {
          staticFields: [
            { key: 'name', label: 'Name', required: true },
            { key: 'monetaryValue', label: 'Monetary Value', required: false },
            { key: 'contactId', label: 'Contact ID', required: false },
            { key: 'opportunityId', label: 'Opportunity ID', required: false }
          ],
          fieldMap: [{ formField: '', highLevelField: 'name' }]
        }
  }
}
