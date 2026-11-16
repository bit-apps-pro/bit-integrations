import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import {
  needsChannel,
  needsInvoiceStatus,
  needsList,
  needsLists,
  needsOwner,
  needsTags
} from './staticData'

export const handleInput = (e, doubleScaleCrmConf, setDoubleScaleCrmConf) => {
  const { name, value } = e.target

  setDoubleScaleCrmConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const handleCustomValue = (value, index, setDoubleScaleCrmConf) => {
  setDoubleScaleCrmConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf.field_map[index].customValue = value
    })
  )
}

const fetchList =
  (route, dataKey, confKey, successMsg, errorMsg) => (setDoubleScaleCrmConf, setIsLoading) => {
    setIsLoading(true)
    bitsFetch(null, route)
      .then(result => {
        if (result && result?.success && result?.data?.[dataKey]) {
          setDoubleScaleCrmConf(prevConf =>
            create(prevConf, draftConf => {
              draftConf[confKey] = result.data[dataKey]
            })
          )

          setIsLoading(false)
          toast.success(successMsg())
          return
        }
        setIsLoading(false)
        toast.error(typeof result?.data === 'string' ? result.data : errorMsg())
      })
      .catch(() => setIsLoading(false))
  }

export const refreshDoubleScaleCrmTags = fetchList(
  'refresh_double_scale_crm_tags',
  'tags',
  'allTags',
  () => __('The tags are loaded.', 'bit-integrations'),
  () => __('The tags did not load. Try again.', 'bit-integrations')
)

export const refreshDoubleScaleCrmLists = fetchList(
  'refresh_double_scale_crm_lists',
  'lists',
  'allLists',
  () => __('The lists are loaded.', 'bit-integrations'),
  () => __('The lists did not load. Try again.', 'bit-integrations')
)

export const refreshDoubleScaleCrmUsers = fetchList(
  'refresh_double_scale_crm_users',
  'users',
  'allUsers',
  () => __('The users are loaded.', 'bit-integrations'),
  () => __('The users did not load. Try again.', 'bit-integrations')
)

export const refreshDoubleScaleCrmMailboxes = fetchList(
  'refresh_double_scale_crm_mailboxes',
  'mailboxes',
  'allMailboxes',
  () => __('The mailboxes are loaded.', 'bit-integrations'),
  () => __('The mailboxes did not load. Try again.', 'bit-integrations')
)

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        doubleScaleCrmField: field.key
      }))
    : [{ formField: '', doubleScaleCrmField: '' }]
}

const isBlankRow = mappedField => !mappedField.formField && !mappedField.doubleScaleCrmField

export const checkMappedFields = doubleScaleCrmConf => {
  const fieldMap = doubleScaleCrmConf?.field_map || []
  const invalidRows = fieldMap.filter(
    mappedField =>
      !isBlankRow(mappedField) &&
      (!mappedField.formField ||
        !mappedField.doubleScaleCrmField ||
        (mappedField.formField === 'custom' && !mappedField.customValue))
  )

  if (invalidRows.length > 0) {
    return false
  }

  const requiredKeys = (doubleScaleCrmConf?.doubleScaleCrmFields || [])
    .filter(field => field.required === true)
    .map(field => field.key)

  return requiredKeys.every(key =>
    fieldMap.some(mappedField => mappedField.doubleScaleCrmField === key && mappedField.formField)
  )
}

const hasValue = value => (Array.isArray(value) ? value.length > 0 : !!value)

export const getConfError = doubleScaleCrmConf => {
  const { mainAction } = doubleScaleCrmConf || {}

  if (!mainAction) {
    return __('Select an action to continue.', 'bit-integrations')
  }

  const requiredSelects = [
    [needsOwner, 'owner_id', __('Select an owner to continue.', 'bit-integrations')],
    [needsChannel, 'channel', __('Select a channel to continue.', 'bit-integrations')],
    [needsTags, 'tag_ids', __('Select at least one tag to continue.', 'bit-integrations')],
    [needsLists, 'list_ids', __('Select at least one list to continue.', 'bit-integrations')],
    [needsList, 'list_id', __('Select a list to continue.', 'bit-integrations')],
    [needsInvoiceStatus, 'status', __('Select a status to continue.', 'bit-integrations')]
  ]

  const missingSelect = requiredSelects.find(
    ([actions, key]) => actions.includes(mainAction) && !hasValue(doubleScaleCrmConf?.[key])
  )

  if (missingSelect) {
    return missingSelect[2]
  }

  if (!checkMappedFields(doubleScaleCrmConf)) {
    return __('Map all required fields to continue.', 'bit-integrations')
  }

  if (
    mainAction === 'create_contact' &&
    !(doubleScaleCrmConf?.field_map || []).some(
      mappedField =>
        ['email', 'phone'].includes(mappedField.doubleScaleCrmField) && mappedField.formField
    )
  ) {
    return __('Map an email or a phone number to continue.', 'bit-integrations')
  }

  return ''
}
