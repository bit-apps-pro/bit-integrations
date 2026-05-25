/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, salesmateConf, setSalesmateConf) => {
  const newConf = { ...salesmateConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setSalesmateConf({ ...newConf })
}

export const generateMappedField = livestormFields => {
  const requiredFlds = livestormFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({
        formField: '',
        livestormFormField: field.key
      }))
    : [{ formField: '', livestormFormField: '' }]
}

export const checkMappedFields = livestormConf => {
  const mappedFields = livestormConf?.field_map
    ? livestormConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.livestormFormField ||
          (mappedField.formField === 'custom' && !mappedField.customValue) ||
          (mappedField.livestormFormField === 'customFieldKey' && !mappedField.customFieldKey)
      )
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = conf =>
  conf?.connection_id ? { connection_id: conf.connection_id } : { api_key: conf.api_key }

export const getAllEvents = (confTmp, setConf, loading, setLoading, setSnackbar = null) => {
  setLoading({ ...loading, event: true })
  const requestParams = buildAuthRequestParams(confTmp)

  bitsFetch(requestParams, 'livestorm_fetch_all_events').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf => {
          prevConf.events = result.data.events
          prevConf.allFields = result.data.allFields
          return prevConf
        })

        setLoading({ ...loading, event: false })
        toast.success(__('Events fetched successfully', 'bit-integrations'))
        if (typeof setSnackbar === 'function') {
          setSnackbar({ show: true, msg: __('Events fetched successfully', 'bit-integrations') })
        }
        return
      }
      setLoading({ ...loading, event: false })
      toast.error(__('Events Not Found!', 'bit-integrations'))
      if (typeof setSnackbar === 'function') {
        setSnackbar({ show: true, msg: __('Events Not Found!', 'bit-integrations') })
      }
      return
    }
    setLoading({ ...loading, event: false })
    toast.error(__('Events fetching failed', 'bit-integrations'))
    if (typeof setSnackbar === 'function') {
      setSnackbar({ show: true, msg: __('Events fetching failed', 'bit-integrations') })
    }
  })
}

export const getAllSessions = (
  confTmp,
  setConf,
  event_id,
  loading,
  setLoading,
  setSnackbar = null
) => {
  setLoading({ ...loading, session: true })

  const requestParams = {
    ...buildAuthRequestParams(confTmp),
    event_id: event_id
  }

  bitsFetch(requestParams, 'livestorm_fetch_all_sessions').then(result => {
    if (result && result.success) {
      if (result.data) {
        setConf(prevConf => {
          prevConf.sessions = result.data
          return prevConf
        })

        setLoading({ ...loading, session: false })
        toast.success(__('Sessions fetched successfully', 'bit-integrations'))
        if (typeof setSnackbar === 'function') {
          setSnackbar({ show: true, msg: __('Sessions fetched successfully', 'bit-integrations') })
        }
        return
      }
      setLoading({ ...loading, session: false })
      toast.error(__('Sessions Not Found!', 'bit-integrations'))
      if (typeof setSnackbar === 'function') {
        setSnackbar({ show: true, msg: __('Sessions Not Found!', 'bit-integrations') })
      }
      return
    }
    setLoading({ ...loading, session: false })
    toast.error(__('Sessions fetching failed', 'bit-integrations'))
    if (typeof setSnackbar === 'function') {
      setSnackbar({ show: true, msg: __('Sessions fetching failed', 'bit-integrations') })
    }
  })
}
