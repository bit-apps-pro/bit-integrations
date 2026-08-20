import bitsFetch from '../../../Utils/bitsFetch'
import { sprintf, __ } from '../../../Utils/i18nwrap'

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        clientId: conf.clientId,
        accessToken: conf.accessToken
      }

export const handleInput = (e, trelloConf, setTrelloConf, setIsLoading, setSnackbar) => {
  const newConf = { ...trelloConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value

    if (name === 'boardId') {
      fetchAllList(newConf, setTrelloConf, setIsLoading, setSnackbar)
      fetchAllCustomFields(newConf, setTrelloConf, setIsLoading, setSnackbar)
    }
  } else {
    delete newConf[name]
  }
  setTrelloConf({ ...newConf })
}

export const fetchAllBoard = (trelloConf, setTrelloConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const fetchBoardModulesRequestParams = buildAuthRequestParams(trelloConf)
  bitsFetch(fetchBoardModulesRequestParams, 'trello_fetch_all_board')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...trelloConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data.allBoardlist) {
          newConf.default.allBoardlist = result.data.allBoardlist
        }
        // if (result.data.tokenDetails) {
        //   newConf.tokenDetails = result.data.tokenDetails
        // }
        setSnackbar({ show: true, msg: __('Board list refreshed', 'bit-integrations') })
        setTrelloConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('Board list refresh failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Board list failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const fetchAllList = (trelloConf, setTrelloConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const fetchListModulesRequestParams = {
    ...buildAuthRequestParams(trelloConf),
    boardId: trelloConf.boardId
  }

  bitsFetch(fetchListModulesRequestParams, 'trello_fetch_all_list_Individual_board')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...trelloConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data?.alllists) {
          newConf.default.alllists = result.data.alllists
        }
        setSnackbar({ show: true, msg: __('Board list refreshed', 'bit-integrations') })
        setTrelloConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('Board list refresh failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Board list failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const fetchAllCustomFields = (trelloConf, setTrelloConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const requestParams = {
    ...buildAuthRequestParams(trelloConf),
    boardId: trelloConf.boardId
  }

  bitsFetch(requestParams, 'trello_fetch_all_custom_fields')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...trelloConf }
        newConf.customFields = result.data
        newConf.custom_field_map = generateMappedField(result.data)

        setSnackbar({ show: true, msg: __('Custom Fields refreshed', 'bit-integrations') })
        setTrelloConf({ ...newConf })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: sprintf(
            __('Custom Fields refresh failed Cause: %s. please try again', 'bit-integrations'),
            result.data.data || result.data
          )
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Custom Fields failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}

export const generateMappedField = cardFields => {
  const requiredFlds = cardFields.filter(fld => fld.required === true)

  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', trelloFormField: field.key }))
    : [{ formField: '', trelloFormField: '' }]
}

export const checkMappedFields = trelloConf => {
  const mappedFleld = trelloConf.field_map
    ? trelloConf.field_map.filter(mapped => !mapped.formField && !mapped.trelloFormField)
    : []
  if (mappedFleld.length > 0) {
    return false
  }
  return true
}
