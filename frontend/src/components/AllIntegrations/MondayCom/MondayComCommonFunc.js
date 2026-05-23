/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { create } from 'mutative'
import { staticFieldsMap, needsColumnMap } from './staticData'

export const handleInput = (e, mondayComConf, setMondayComConf) => {
  setMondayComConf(mondayComConf =>
    create(mondayComConf, draftConf => {
      const { name, value } = e.target
      if (value !== '') {
        draftConf[name] = value
      } else {
        delete draftConf[name]
      }
    })
  )
}

export const generateMappedField = mondayComFields => {
  const requiredFlds = mondayComFields?.filter(fld => fld.required === true) || []

  if (requiredFlds.length > 0) {
    return requiredFlds.map(field => ({ formField: '', mondayComField: field.key }))
  }

  if (!mondayComFields || mondayComFields.length === 0) {
    return []
  }

  return [{ formField: '', mondayComField: '' }]
}

export const checkMappedFields = mondayComConf => {
  const mappedFields = mondayComConf?.field_map
    ? mondayComConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.mondayComField ||
          (mappedField.formField === 'custom' && !mappedField.customValue)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

export const mondayComAuthentication = (confTmp, setError, setIsAuthorized, loading, setLoading) => {
  if (!confTmp.apiToken) {
    setError({
      apiToken: !confTmp.apiToken ? __("API Token can't be empty", 'bit-integrations') : ''
    })
    return
  }

  setError({})
  setLoading({ ...loading, auth: true })

  const requestParams = {
    apiToken: confTmp.apiToken
  }

  bitsFetch(requestParams, 'mondayCom_authentication').then(result => {
    if (result && result.success) {
      setIsAuthorized(true)
      setLoading({ ...loading, auth: false })
      toast.success(__('Authorized Successfully', 'bit-integrations'))
      return
    }
    setLoading({ ...loading, auth: false })
    const message = typeof result?.data === 'string' ? result.data : result?.data?.message
    const authErrorMessage = result?.message || result?.error || message
    toast.error(
      authErrorMessage
        ? `${__('Authorization failed', 'bit-integrations')}: ${authErrorMessage}`
        : __('Authorization failed', 'bit-integrations')
    )
  })
}

export const getAllBoards = (confTmp, setConf, setLoading) => {
  setLoading(prev => ({ ...prev, board: true }))

  const requestParams = {
    apiToken: confTmp.apiToken
  }

  bitsFetch(requestParams, 'mondayCom_fetch_boards').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.boards = result.data
          })
        )

        setLoading(prev => ({ ...prev, board: false }))
        toast.success(__('Boards fetched successfully', 'bit-integrations'))
        return
      }
      setLoading(prev => ({ ...prev, board: false }))
      toast.error(__('Boards Not Found!', 'bit-integrations'))
      return
    }
    setLoading(prev => ({ ...prev, board: false }))
    toast.error(__('Boards fetching failed', 'bit-integrations'))
  })
}

export const getAllGroups = (confTmp, setConf, boardId, setLoading) => {
  setLoading(prev => ({ ...prev, group: true }))

  const requestParams = {
    apiToken: confTmp.apiToken,
    boardId
  }

  bitsFetch(requestParams, 'mondayCom_fetch_groups').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.groups = result.data
          })
        )

        setLoading(prev => ({ ...prev, group: false }))
        return
      }
      setLoading(prev => ({ ...prev, group: false }))
      toast.error(__('Groups Not Found!', 'bit-integrations'))
      return
    }
    setLoading(prev => ({ ...prev, group: false }))
    toast.error(__('Groups fetching failed', 'bit-integrations'))
  })
}

export const getAllColumns = (confTmp, setConf, boardId, setLoading) => {
  setLoading(prev => ({ ...prev, column: true }))

  const requestParams = {
    apiToken: confTmp.apiToken,
    boardId
  }

  bitsFetch(requestParams, 'mondayCom_fetch_columns').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.columns = result.data
            if (needsColumnMap.includes(draftConf.mainAction)) {
              const base = staticFieldsMap[draftConf.mainAction] || []
              draftConf.mondayComFields = [...base, ...result.data]
              draftConf.field_map = generateMappedField(draftConf.mondayComFields)
            }
          })
        )

        setLoading(prev => ({ ...prev, column: false }))
        return
      }
      setLoading(prev => ({ ...prev, column: false }))
      toast.error(__('Columns Not Found!', 'bit-integrations'))
      return
    }
    setLoading(prev => ({ ...prev, column: false }))
    toast.error(__('Columns fetching failed', 'bit-integrations'))
  })
}

export const getAllItems = (confTmp, setConf, boardId, setLoading) => {
  setLoading(prev => ({ ...prev, item: true }))

  const requestParams = {
    apiToken: confTmp.apiToken,
    boardId
  }

  bitsFetch(requestParams, 'mondayCom_fetch_items').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.items = result.data
          })
        )

        setLoading(prev => ({ ...prev, item: false }))
        return
      }
      setLoading(prev => ({ ...prev, item: false }))
      toast.error(__('Items Not Found!', 'bit-integrations'))
      return
    }
    setLoading(prev => ({ ...prev, item: false }))
    toast.error(__('Items fetching failed', 'bit-integrations'))
  })
}
