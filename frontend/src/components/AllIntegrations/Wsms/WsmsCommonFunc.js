import { create } from 'mutative'
import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, wsmsConf, setWsmsConf) => {
  const { name, value } = e.target

  setWsmsConf(prevConf =>
    create(prevConf, draftConf => {
      draftConf[name] = value
    })
  )
}

export const refreshGroups = (setWsmsConf, setIsLoading) => {
  setIsLoading(true)
  bitsFetch(null, 'refresh_wsms_groups')
    .then(result => {
      if (result && result?.success && result?.data?.groups) {
        setWsmsConf(prevConf =>
          create(prevConf, draftConf => {
            draftConf.allGroups = result.data.groups
          })
        )

        setIsLoading(false)
        toast.success(__('All groups fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('WSMS groups fetch failed. Please try again', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}

export const checkMappedFields = wsmsConf => {
  const mappedFields = wsmsConf?.field_map
    ? wsmsConf.field_map.filter(
        mappedField =>
          !mappedField.formField ||
          !mappedField.wsmsField ||
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
        wsmsField: field.key
      }))
    : [{ formField: '', wsmsField: '' }]
}
