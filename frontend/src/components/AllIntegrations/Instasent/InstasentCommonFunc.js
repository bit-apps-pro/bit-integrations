/* eslint-disable no-else-return */
import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

// Actions that need a Project / Data Source. These ids are selected at config time
// (Project Id as text, Data Source as a fetched dropdown) instead of in the field map.
export const ACTIONS_WITH_PROJECT = [
  'create_datasource',
  'create_or_update_contact',
  'delete_contact',
  'create_contact_event'
]

export const ACTIONS_WITH_DATASOURCE = [
  'create_or_update_contact',
  'delete_contact',
  'create_contact_event'
]

// Actions whose field map may carry arbitrary keys (contact custom attributes /
// event parameters), entered via the "Custom Field..." option in the field map.
export const ACTIONS_WITH_CUSTOM_FIELDS = ['create_or_update_contact', 'create_contact_event']

// Sentinel chosen in the Instasent-field select to switch a row to a free-text key.
export const CUSTOM_FIELD_KEY = '__custom_field__'

export const InstasentStaticData = {
  send_sms: [
    { key: 'from', label: 'From', required: true },
    { key: 'to', label: 'To', required: true },
    { key: 'text', label: 'Text', required: true },
    { key: 'clientId', label: 'Client Id', required: false },
    { key: 'allowUnicode', label: 'Allow Unicode', required: false }
  ],
  create_lookup: [{ key: 'to', label: 'To', required: true }],
  create_datasource: [
    { key: 'name', label: 'Name', required: true },
    { key: 'description', label: 'Description', required: false },
    { key: 'defaultCountry', label: 'Default Country', required: false },
    { key: 'locale', label: 'Locale', required: false },
    { key: 'timezone', label: 'Timezone', required: false }
  ],
  create_or_update_contact: [
    { key: 'userId', label: 'User Id', required: true },
    { key: 'firstName', label: 'First Name', required: false },
    { key: 'lastName', label: 'Last Name', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'phoneMobile', label: 'Phone Mobile', required: false }
  ],
  delete_contact: [{ key: 'userId', label: 'User Id', required: true }],
  create_contact_event: [
    { key: 'userId', label: 'User Id', required: true },
    { key: 'eventId', label: 'Event Id', required: true },
    { key: 'eventType', label: 'Event Type', required: true }
  ]
}

export const handleInput = (e, instasentConf, setInstasentConf, loading, setLoading) => {
  const { name, value } = e.target

  const updatedConf = create(instasentConf, draftConf => {
    draftConf[name] = value

    // Changing the project invalidates the fetched data sources + the selection.
    if (name === 'projectId') {
      draftConf.datasourceId = ''
      if (draftConf.default) {
        draftConf.default.datasources = []
      }
    }
  })

  setInstasentConf(updatedConf)

  if (name === 'action' && value !== '') {
    instasentRefreshFields(updatedConf, setInstasentConf, loading, setLoading)
  }
}

export const generateMappedField = instasentConf => {
  const requiredFlds = instasentConf?.instasentFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        instasentFormField: field.key
      }))
    : [{ formField: '', instasentFormField: '' }]
}

export const checkMappedFields = instasentConf => {
  if (ACTIONS_WITH_PROJECT.includes(instasentConf?.action) && !instasentConf?.projectId) {
    return false
  }

  if (ACTIONS_WITH_DATASOURCE.includes(instasentConf?.action) && !instasentConf?.datasourceId) {
    return false
  }

  const mappedFields = instasentConf?.field_map
    ? instasentConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.instasentFormField ||
          mappedField.instasentFormField === CUSTOM_FIELD_KEY ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const authorization = (confTmp, setIsAuthorized, loading, setLoading) => {
  if (!confTmp.auth_token) {
    toast.error(__("API Token can't be empty", 'bit-integrations'))

    return
  }

  setLoading({ ...loading, auth: true })

  const requestParams = {
    auth_token: confTmp.auth_token
  }

  bitsFetch(requestParams, 'instasent_authorize').then(result => {
    setLoading({ ...loading, auth: false })

    if (result && result.success) {
      setIsAuthorized(true)

      toast.success(__('Authorized Successfully', 'bit-integrations'))

      return
    }

    toast.error(__('Authorized failed', 'bit-integrations'))
  })
}

export const instasentRefreshFields = (confTmp, setConf, loading, setLoading) => {
  setLoading({ ...loading, field: true })

  const staticFields = InstasentStaticData[confTmp?.action] || []

  setConf(prev =>
    create(prev, draftConf => {
      draftConf.instasentFields = staticFields
      draftConf.field_map = generateMappedField(draftConf)
    })
  )

  setLoading({ ...loading, field: false })

  toast.success(__('Fields refresh successfully', 'bit-integrations'))
}

export const refreshDatasources = (confTmp, setConf, loading, setLoading) => {
  if (!confTmp.auth_token) {
    toast.error(__("API Token can't be empty", 'bit-integrations'))

    return
  }

  if (!confTmp.projectId) {
    toast.error(__('Please enter a Project Id first', 'bit-integrations'))

    return
  }

  setLoading({ ...loading, datasource: true })

  const requestParams = {
    auth_token: confTmp.auth_token,
    projectId: confTmp.projectId
  }

  bitsFetch(requestParams, 'refresh_instasent_datasources').then(result => {
    setLoading({ ...loading, datasource: false })

    if (result && result.success) {
      setConf(prev =>
        create(prev, draftConf => {
          draftConf.default = draftConf.default || {}
          draftConf.default.datasources = result.data || []
        })
      )

      toast.success(__('Data sources fetched successfully', 'bit-integrations'))

      return
    }

    toast.error(__('Data sources fetch failed', 'bit-integrations'))
  })
}
