import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, nextCrmConf, setNextCrmConf) => {
  const { name, value } = e.target

  setNextCrmConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const refreshOptions =
  (route, dataKey, confKey, successMsg, errorMsg) => (setNextCrmConf, setIsLoading) => {
    setIsLoading(true)
    bitsFetch(null, route)
      .then(result => {
        if (result && result?.success && result?.data?.[dataKey]) {
          setNextCrmConf(prevConf =>
            create(prevConf, draftConf => {
              draftConf[confKey] = result.data[dataKey]
            })
          )

          setIsLoading(false)
          toast.success(successMsg)
          return
        }
        setIsLoading(false)
        toast.error(errorMsg)
      })
      .catch(() => setIsLoading(false))
  }

export const refreshNextCrmTags = refreshOptions(
  'refresh_next_crm_tags',
  'tags',
  'allTags',
  __('All tags fetched successfully', 'bit-integrations'),
  __('NextCRM tags fetch failed. Please try again', 'bit-integrations')
)

export const refreshNextCrmLists = refreshOptions(
  'refresh_next_crm_lists',
  'lists',
  'allLists',
  __('All lists fetched successfully', 'bit-integrations'),
  __('NextCRM lists fetch failed. Please try again', 'bit-integrations')
)

export const refreshNextCrmCampaigns = refreshOptions(
  'refresh_next_crm_campaigns',
  'campaigns',
  'allCampaigns',
  __('All campaigns fetched successfully', 'bit-integrations'),
  __('NextCRM campaigns fetch failed. Please try again', 'bit-integrations')
)

export const refreshNextCrmContactFields = refreshOptions(
  'refresh_next_crm_contact_fields',
  'contactFields',
  'allContactFields',
  __('All contact fields fetched successfully', 'bit-integrations'),
  __('NextCRM contact fields fetch failed. Please try again', 'bit-integrations')
)

export const refreshNextCrmContactTypes = refreshOptions(
  'refresh_next_crm_contact_types',
  'contactTypes',
  'allContactTypes',
  __('All contact types fetched successfully', 'bit-integrations'),
  __('NextCRM contact types fetch failed. Please try again', 'bit-integrations')
)

export const refreshNextCrmContactStatuses = refreshOptions(
  'refresh_next_crm_contact_statuses',
  'contactStatuses',
  'allContactStatuses',
  __('All contact statuses fetched successfully', 'bit-integrations'),
  __('NextCRM contact statuses fetch failed. Please try again', 'bit-integrations')
)

export const checkMappedFields = nextCrmConf => {
  const mappedFields = nextCrmConf?.field_map
    ? nextCrmConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.nextCrmField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const generateMappedField = fields => {
  const requiredFlds = fields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        nextCrmField: field.key
      }))
    : [{ formField: '', nextCrmField: '' }]
}
