/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, slackConf, setSlackConf) => {
  const newConf = { ...slackConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setSlackConf({ ...newConf })
}

const buildAuthRequestParams = confTmp =>
  confTmp?.connection_id
    ? { connection_id: confTmp.connection_id }
    : {
        userName: confTmp.userName,
        api_key: confTmp.api_key
      }

export const getAllList = (kirimEmailConf, setKirimEmailConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  const tokenRequestParams = buildAuthRequestParams(kirimEmailConf)

  bitsFetch(tokenRequestParams, 'kirimEmail_fetch_all_list')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...kirimEmailConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.default.allLists = result.data
        }
        setKirimEmailConf({ ...newConf })
        setIsLoading(false)
        toast.success(__('All list fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Kirim Email list fetch failed. please try again', 'bit-integrations'))
    })

    .catch(() => setIsLoading(false))
}

export const checkMappedFields = fieldsMapped => {
  const checkedField = fieldsMapped
    ? fieldsMapped?.filter(item => !item.formField || !item.kirimEmailFormField)
    : []
  if (checkedField.length > 0) return false
  return true
}

// export const checkMappedFields = (kirimEmailConf) => {
//   const mappedFleld = kirimEmailConf.field_map ? kirimEmailConf.field_map.filter(mapped => (!mapped.formField && !mapped.kirimEmailFormField)) : []
//   if (mappedFleld.length > 0) {
//     return false
//   }
//   return true
// }

export const generateMappedField = kirimEmailConf => {
  const requiredFlds = kirimEmailConf?.subscriberFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', kirimEmailFormField: field.key }))
    : [{ formField: '', kirimEmailFormField: '' }]
}
