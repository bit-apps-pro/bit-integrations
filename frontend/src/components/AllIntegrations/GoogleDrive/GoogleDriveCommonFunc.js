/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'

export const handleInput = (e, googleDriveConf, setGoogleDriveConf) => {
  const newConf = { ...googleDriveConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  setGoogleDriveConf({ ...newConf })
}

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        clientId: conf.clientId,
        clientSecret: conf.clientSecret,
        tokenDetails: conf.tokenDetails
      }

export const getAllGoogleDriveFolders = (flowID, googleDriveConf, setGoogleDriveConf) => {
  const queryParams = {
    flowID: flowID ?? null,
    ...buildAuthRequestParams(googleDriveConf)
  }
  const loadPostTypes = bitsFetch(queryParams, 'googleDrive_get_all_folders').then(result => {
    if (result && result.success) {
      const newConf = { ...googleDriveConf }
      if (result.data.googleDriveFoldersList) {
        newConf.foldersList = result.data.googleDriveFoldersList
        newConf.tokenDetails = result.data.tokenDetails
      }

      setGoogleDriveConf(newConf)
      return __('GoogleDrive Folders List refreshed successfully', 'bit-integrations')
    } else {
      return __('Failed to refresh GoogleDrive Folders List. please try again', 'bit-integrations')
    }
  })
  toast.promise(loadPostTypes, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading GoogleDrive Folders List...', 'bit-integrations')
  })
}
