// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '@wordpress/i18n'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, lemlistConf, setLemlistConf) => {
  const newConf = { ...lemlistConf }
  newConf.name = e.target.value
  setLemlistConf({ ...newConf })
}

const buildAuthRequestParams = conf =>
  conf?.connection_id ? { connection_id: conf.connection_id } : { api_key: conf.api_key }

// refreshMappedLists
export const refreshLemlistCampaign = (lemlistConf, setLemlistConf, setIsLoading, setSnackbar) => {
  if (typeof setIsLoading === 'function') setIsLoading(true)
  const refreshListsRequestParams = buildAuthRequestParams(lemlistConf)
  bitsFetch(refreshListsRequestParams, 'lemlist_campaigns')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...lemlistConf }
        if (result.data) {
          if (!newConf.default) {
            newConf.default = {}
          }
          newConf.default.lemlistCampaigns = result.data
          setSnackbar({
            show: true,
            msg: __('Lemlist Campaigns refreshed', 'bit-integrations')
          })
        } else {
          setSnackbar({
            show: true,
            msg: __(
              'No Lemlist campaigns found. Try changing the header row number or try again',
              'bit-integrations'
            )
          })
        }

        setLemlistConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Lemlist campaigns refresh failed. please try again', 'bit-integrations')
        })
      }
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
    .catch(() => {
      if (typeof setIsLoading === 'function') setIsLoading(false)
    })
}

// refreshMappedFields
export const refreshLemlistHeader = (lemlistConf, setLemlistConf, setIsLoading, setSnackbar) => {
  const leadFields = [
    { fieldValue: 'email', fieldName: __('Email', 'bit-integrations'), required: true },
    { fieldValue: 'firstName', fieldName: __('First Name', 'bit-integrations'), required: false },
    { fieldValue: 'lastName', fieldName: __('Last Name', 'bit-integrations'), required: false },
    {
      fieldValue: 'companyName',
      fieldName: __('Company Name', 'bit-integrations'),
      required: false
    },
    { fieldValue: 'phone', fieldName: __('Phone', 'bit-integrations'), required: false }
  ]

  const newConf = { ...lemlistConf }
  if (!newConf.default) {
    newConf.default = {}
  }

  newConf.default.fields = leadFields
  const { fields } = newConf.default
  newConf.field_map = Object.values(fields)
    .filter(f => f.required)
    .map(f => ({
      formField: '',
      lemlistField: f.fieldValue,
      required: true
    }))

  setSnackbar({
    show: true,
    msg: __('Lemlist fields refreshed', 'bit-integrations')
  })
  setLemlistConf({ ...newConf })
  if (typeof setIsLoading === 'function') setIsLoading(false)
}

export const checkMappedFields = lemlistConf => {
  const mappedFields = lemlistConf?.field_map
    ? lemlistConf.field_map.filter(
        mappedField => !mappedField.formField && mappedField.lemlistField && mappedField.required
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}
