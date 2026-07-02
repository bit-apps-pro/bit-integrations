import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        auth_token: conf.auth_token
      }

const hasAuthParams = conf => Boolean(conf?.connection_id || conf?.auth_token)

export const handleInput = (e, acumbamailConf, setAcumbamailConf, setIsLoading, setSnackbar, formID) => {
  let newConf = { ...acumbamailConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }

  newConf[e.target.name] = e.target.value
  switch (e.target.name) {
    case 'listId':
      if (newConf.listId && !newConf.default?.allFields?.[newConf.listId]) {
        newConf = refreshFields(formID, newConf, setAcumbamailConf, setIsLoading, setSnackbar)
      }
      break
    default:
      break
  }
  setAcumbamailConf({ ...newConf })
}

export const refreshFields = (formID, acumbamailConf, setAcumbamailConf, setIsLoading, setSnackbar) => {
  const { listId } = acumbamailConf
  if (!listId || !hasAuthParams(acumbamailConf)) {
    return
  }
  setIsLoading(true)
  const refreshFieldsRequestParams = {
    ...buildAuthRequestParams(acumbamailConf),
    list_id: listId
  }
  bitsFetch(refreshFieldsRequestParams, 'acumbamail_refresh_fields')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...acumbamailConf }
        if (result.data) {
          if (!newConf.default?.allFields) {
            newConf.default.allFields = {}
          }
          if (!newConf.default.allFields?.[listId]) {
            newConf.default.allFields[listId] = {}
          }
          newConf.default.allFields[listId].fields = result.data
          newConf.default.allFields[listId].required = ['EMAIL']

          setAcumbamailConf({ ...newConf })
          setIsLoading(false)
          toast.success(__('All list field fetched successfully', 'bit-integrations'))
          return
        }
        setIsLoading(false)
        toast.error(__('Failed to fetch list fields', 'bit-integrations'))
      }
    })

    .catch(() => setIsLoading(false))
}

export const fetchAllList = (acumbamailConf, setAcumbamailConf, setIsLoading, setSnackbar) => {
  if (!hasAuthParams(acumbamailConf)) {
    setSnackbar({
      show: true,
      msg: __('Authorization info is missing. please authorize again', 'bit-integrations')
    })
    return
  }

  setIsLoading(true)
  const requestParams = buildAuthRequestParams(acumbamailConf)

  bitsFetch(requestParams, 'acumbamail_fetch_all_list')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...acumbamailConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.default.allLists = result.data
        }
        setAcumbamailConf({ ...newConf })
        setIsLoading(false)
        toast.success(__('Lists fetched successfully.', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Lists fetch failed. please try again', 'bit-integrations'))
    })

    .catch(() => setIsLoading(false))
}

export const checkMappedFields = acumbamailConf => {
  const mappedFields = acumbamailConf?.field_map
    ? acumbamailConf.field_map.filter(
        mappedField =>
          !mappedField.formField &&
          mappedField.acumbamailFormField &&
          acumbamailConf?.default?.allFields?.[acumbamailConf.listId]?.required.indexOf(
            mappedField.acumbamailFormField
          ) !== -1
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }

  return true
}
