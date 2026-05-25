/* eslint-disable no-console */
/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, pCloudConf, setPCloudConf) => {
  const newConf = { ...pCloudConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setPCloudConf({ ...newConf })
}

export const checkMappedFields = pCloudConf => {
  const mappedFields = pCloudConf?.field_map
    ? pCloudConf.field_map.filter(mappedField => !mappedField.formField || !mappedField.pCloudFormField)
    : []
  if (mappedFields.length > 0) {
    return false
  }
  return true
}

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : { tokenDetails: conf.tokenDetails }

export const getAllPCloudFolders = (pCloudConf, setPCloudConf, type) => {
  const queryParams = buildAuthRequestParams(pCloudConf)
  const loadPostTypes = bitsFetch(queryParams, 'pCloud_get_all_folders').then(result => {
    if (result && result.success) {
      const newConf = { ...pCloudConf }
      if (result.data) {
        newConf.foldersList = result.data
      }
      setPCloudConf(newConf)
      if (type === 'fetch') {
        return __('Folders fetched successfully', 'bit-integrations')
      }
      return __('Folders refreshed successfully', 'bit-integrations')
    } else {
      return __('Folders refresh failed. please try again', 'bit-integrations')
    }
  })
  toast.promise(loadPostTypes, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading PCloud Folders List...', 'bit-integrations')
  })
}
