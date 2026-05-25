import { create } from 'mutative'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, notificationXConf, setNotificationXConf) => {
  const newConf = create(notificationXConf, draftConf => {
    draftConf[e.target.name] = e.target.value
  })
  setNotificationXConf(newConf)
}

export const generateMappedField = allFields => {
  const requiredFlds = allFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', notificationXField: field.key }))
    : [{ formField: '', notificationXField: '' }]
}

export const checkMappedFields = notificationXConf => {
  const unmapped = notificationXConf?.field_map
    ? notificationXConf.field_map.filter(
      mappedField =>
        !mappedField.formField ||
        !mappedField.notificationXField ||
        (mappedField.formField === 'custom' && !mappedField.customValue)
    )
    : []

  return unmapped.length === 0
}

export const refreshNotificationsBySource = (action, setNotificationXConf, setIsLoading, setSnackbar) => {
  if (!action) return
  setIsLoading(true)
  bitsFetch({ action: action }, 'notificationx_get_notifications_by_source').then(result => {
    if (result && result.success) {
      setNotificationXConf(prev =>
        create(prev, draft => {
          draft.notifications = result.data
        })
      )
    } else {
      const errorMsg = typeof result?.data === 'string' ? result.data : result?.message
      setSnackbar({ msg: errorMsg || __('Failed to fetch notifications', 'bit-integrations'), show: true })
    }

    setIsLoading(false)
  }).catch(() => {
    setSnackbar({ msg: __('Failed to fetch notifications', 'bit-integrations'), show: true })
    setIsLoading(false)
  })
}


