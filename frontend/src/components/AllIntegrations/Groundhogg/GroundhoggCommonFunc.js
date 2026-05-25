import toast from 'react-hot-toast'
import bitsFetch from '../../../Utils/bitsFetch'
import { deepCopy } from '../../../Utils/Helpers'
import { sprintf, __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, groundhoggConf, setGroundhoggConf) => {
  const newConf = { ...groundhoggConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setGroundhoggConf({ ...newConf })
}

export const generateMappedField = groundhoggConf => {
  const requiredFlds = groundhoggConf?.contactsFields.filter(fld => fld.required === true)
  return requiredFlds.length > 0
    ? requiredFlds.map(field => ({ formField: '', GroundhoggMapField: field.key }))
    : [{ formField: '', GroundhoggMapField: '' }]
}

export const checkMappedFields = groundhoggConf => {
  const canNotSave = groundhoggConf.field_map
    ? groundhoggConf.field_map.find(f => !f.formField || !f.GroundhoggMapField)
    : false
  if (canNotSave) {
    return false
  }
  const mappedFleld = groundhoggConf.field_map
    ? groundhoggConf.field_map.filter(mapped => !mapped.formField && !mapped.GroundhoggMapField)
    : []
  if (mappedFleld.length > 0) {
    return false
  }
  return true
}
export const checkMetaMappedFields = groundhoggConf => {
  const canNotSave = groundhoggConf.field_map_meta
    ? groundhoggConf.field_map_meta.find(f => !f.formField || !f.GroundhoggMetaMapField)
    : false
  if (canNotSave) {
    return false
  }
  const mappedFleld = groundhoggConf.field_map_meta
    ? groundhoggConf.field_map_meta.filter(mapped => !mapped.formField && !mapped.GroundhoggMetaMapField)
    : []
  if (mappedFleld.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = confTmp =>
  confTmp.connection_id
    ? { connection_id: confTmp.connection_id }
    : {
        public_key: confTmp.public_key,
        token: confTmp.token,
        domainName: confTmp.domainName
      }

export const fetchAllTags = (groundhoggConf, setGroundhoggConf, setIsLoading, setSnackbar) => {
  if (!groundhoggConf.connection_id && (!groundhoggConf.public_key || !groundhoggConf.token || !groundhoggConf.domainName)) {
    toast.error(__('Authorization data is missing', 'bit-integrations'))
    return
  }

  setIsLoading(true)

  bitsFetch(buildAuthRequestParams(groundhoggConf), 'groundhogg_fetch_all_tags')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...groundhoggConf }
        if (!newConf.default) {
          newConf.default = {}
        }
        if (result.data.tags) {
          newConf.default.tags = result.data.tags
        }
        setGroundhoggConf({ ...newConf })
        setIsLoading(false)
        toast.success(__('Groundhogg all tag fetched successfully', 'bit-integrations'))
        return
      }
      setIsLoading(false)
      toast.error(__('Failed to fetch groundhoggtag', 'bit-integrations'))
    })
    .catch(() => setIsLoading(false))
}
