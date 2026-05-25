import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        clientId: conf.clientId,
        clientSecret: conf.clientSecret,
        tokenDetails: conf.tokenDetails
      }


export const handleInput = (
  e,
  formID,
  marketingHubConf,
  setMarketingHubConf,
  setIsLoading,
  setSnackbar,
  isNew,
  error,
  setError
) => {
  let newConf = { ...marketingHubConf }
  if (isNew) {
    const rmError = { ...error }
    rmError[e.target.name] = ''
    setError({ ...rmError })
  }
  newConf[e.target.name] = e.target.value

  switch (e.target.name) {
    case 'list':
      newConf = listChange(newConf, formID, setMarketingHubConf, setIsLoading, setSnackbar)
      break
    default:
      break
  }
  setMarketingHubConf({ ...newConf })
}

const listChange = (marketingHubConf, formID, setMarketingHubConf, setIsLoading, setSnackbar) => {
  const newConf = { ...marketingHubConf }
  newConf.field_map = [{ formField: '', zohoFormField: 'Contact Email' }]

  if (!newConf?.default?.fields?.[newConf.list]) {
    refreshContactFields(formID, newConf, setMarketingHubConf, setIsLoading, setSnackbar)
  }
  return newConf
}

export const refreshLists = (
  formID,
  marketingHubConf,
  setMarketingHubConf,
  setIsLoading,
  setSnackbar
) => {
  setIsLoading(true)
  const refreshListsRequestParams = {
    formID,
    id: marketingHubConf.id,
    ...buildAuthRequestParams(marketingHubConf),
    dataCenter: marketingHubConf.dataCenter,
  }
  bitsFetch(refreshListsRequestParams, 'zmarketingHub_refresh_lists')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...marketingHubConf }
        if (result.data.lists) {
          newConf.default = { ...newConf.default, lists: result.data.lists }
        }
        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setSnackbar({ show: true, msg: __('Lists refreshed', 'bit-integrations') })
        setMarketingHubConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: `${__('Lists refresh failed Cause:')}${result.data.data || result.data}. ${__(
            'please try again',
            'bit-integrations'
          )}`
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Lists refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const refreshContactFields = (
  formID,
  marketingHubConf,
  setMarketingHubConf,
  setIsLoading,
  setSnackbar
) => {
  const { list } = marketingHubConf
  if (!list) {
    return
  }

  setIsLoading(true)
  const refreshContactFieldsRequestParams = {
    formID,
    list,
    ...buildAuthRequestParams(marketingHubConf),
    dataCenter: marketingHubConf.dataCenter,
  }
  bitsFetch(refreshContactFieldsRequestParams, 'zmarketingHub_refresh_contact_fields')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...marketingHubConf }
        if (result.data.fields) {
          if (!newConf.default.fields) {
            newConf.default.fields = {}
          }

          newConf.default.fields[list] = result.data

          setSnackbar({ show: true, msg: __('Contact Fields refreshed', 'bit-integrations') })
        } else {
          setSnackbar({
            show: true,
            msg: __("Zoho didn't provide fields names for this list", 'bit-integrations')
          })
        }

        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setMarketingHubConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Contact Fields refresh failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = marketingHubConf => {
  const mappedFields = marketingHubConf?.field_map
    ? marketingHubConf.field_map.filter(
        mappedField =>
          !mappedField.formField &&
          mappedField.zohoFormField &&
          marketingHubConf?.default?.fields?.[marketingHubConf.list]?.required.indexOf(
            mappedField.zohoFormField
          ) !== -1
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }

  return true
}
