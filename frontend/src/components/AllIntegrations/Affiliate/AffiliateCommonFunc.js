import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { deepCopy } from '../../../Utils/Helpers'
import { sprintf, __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, affiliateConf, setAffiliateConf, setIsLoading, setSnackbar, formID) => {
  const newConf = { ...affiliateConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }

  newConf[e.target.name] = e.target.value
  setAffiliateConf({ ...newConf })
}

export const getAllAffiliate = (affiliateConf, setAffiliateConf, setIsLoading, setSnackbar) => {
  setIsLoading(true)
  bitsFetch(null, 'affiliate_fetch_all_affiliate')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...affiliateConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data) {
          newConf.default.allAffiliate = result.data
        }
        setAffiliateConf({ ...newConf })
        setIsLoading(false)
        toast.success(__('All affiliate fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('All affiliate fetch failed. please try again', 'bit-integrations'))
    })

    .catch(() => setIsLoading(false))
}

export const generateMappedField = affiliateConf => {
  const requiredFlds = affiliateConf?.createAffiliateFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', affiliateFormField: field.key }))
    : [{ formField: '', affiliateFormField: '' }]
}

export const checkMappedFields = affiliateConf => {
  const mappedFleld = affiliateConf.field_map
    ? affiliateConf.field_map.filter(mapped => !mapped.formField || !mapped.affiliateFormField)
    : []
  if (mappedFleld.length > 0) {
    return false
  }
  return true
}
