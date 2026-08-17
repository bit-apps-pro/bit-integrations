/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, dropboxConf, setDropboxConf) => {
  const newConf = { ...dropboxConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setDropboxConf({ ...newConf })
}

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        clientId: conf.clientId,
        clientSecret: conf.clientSecret,
        tokenDetails: conf.tokenDetails
      }

export const getAllDropboxFolders = (flowID, dropboxConf, setDropboxConf) => {
  const queryParams = {
    flowID: flowID ?? null,
    ...buildAuthRequestParams(dropboxConf)
  }
  const loadPostTypes = bitsFetch(queryParams, 'dropbox_get_all_folders').then(result => {
    if (result && result.success) {
      const newConf = { ...dropboxConf }
      if (result.data.dropboxFoldersList) {
        newConf.foldersList = result.data.dropboxFoldersList
        newConf.tokenDetails = result.data.tokenDetails
      }

      setDropboxConf(newConf)
      return __('Dropbox Folders List refreshed successfully', 'bit-integrations')
    } else {
      return __('Dropbox Folders List refresh failed. please try again', 'bit-integrations')
    }
  })
  toast.promise(loadPostTypes, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading Dropbox Folders List...', 'bit-integrations')
  })
}
