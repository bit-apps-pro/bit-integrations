import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, charitableConf, setCharitableConf) => {
  const { name, value } = e.target

  setCharitableConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

const fetchList =
  (route, dataKey, confKey, successMsg, errorMsg) => (setCharitableConf, setIsLoading) => {
    setIsLoading(true)
    bitsFetch(null, route)
      .then(result => {
        if (result && result?.success && result?.data?.[dataKey]) {
          setCharitableConf(prevConf =>
            create(prevConf, draftConf => {
              draftConf[confKey] = result.data[dataKey]
            })
          )

          setIsLoading(false)
          toast.success(successMsg())
          return
        }
        setIsLoading(false)
        toast.error(errorMsg())
      })
      .catch(() => setIsLoading(false))
  }

export const refreshCharitableCampaigns = fetchList(
  'refresh_charitable_campaigns',
  'campaigns',
  'allCampaigns',
  () => __('All campaigns fetched successfully', 'bit-integrations'),
  () => __('Charitable campaigns fetch failed. Please try again', 'bit-integrations')
)

export const refreshCharitableDonationStatuses = fetchList(
  'refresh_charitable_donation_statuses',
  'statuses',
  'allDonationStatuses',
  () => __('All donation statuses fetched successfully', 'bit-integrations'),
  () => __('Charitable donation statuses fetch failed. Please try again', 'bit-integrations')
)

export const refreshCharitableDonors = fetchList(
  'refresh_charitable_donors',
  'donors',
  'allDonors',
  () => __('All donors fetched successfully', 'bit-integrations'),
  () => __('Charitable donors fetch failed. Please try again', 'bit-integrations')
)

export const refreshCharitableUsers = fetchList(
  'refresh_charitable_users',
  'users',
  'allUsers',
  () => __('All users fetched successfully', 'bit-integrations'),
  () => __('Charitable users fetch failed. Please try again', 'bit-integrations')
)

export const refreshCharitableCampaignCategories = fetchList(
  'refresh_charitable_campaign_categories',
  'categories',
  'allCampaignCategories',
  () => __('All campaign categories fetched successfully', 'bit-integrations'),
  () => __('Charitable campaign categories fetch failed. Please try again', 'bit-integrations')
)

export const refreshCharitableCampaignTags = fetchList(
  'refresh_charitable_campaign_tags',
  'tags',
  'allCampaignTags',
  () => __('All campaign tags fetched successfully', 'bit-integrations'),
  () => __('Charitable campaign tags fetch failed. Please try again', 'bit-integrations')
)

export const refreshCharitableUserRoles = fetchList(
  'refresh_charitable_user_roles',
  'roles',
  'allUserRoles',
  () => __('All user roles fetched successfully', 'bit-integrations'),
  () => __('Charitable user roles fetch failed. Please try again', 'bit-integrations')
)

export const checkMappedFields = charitableConf => {
  const mappedFields = charitableConf?.field_map
    ? charitableConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.charitableField ||
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
        charitableField: field.key
      }))
    : [{ formField: '', charitableField: '' }]
}
