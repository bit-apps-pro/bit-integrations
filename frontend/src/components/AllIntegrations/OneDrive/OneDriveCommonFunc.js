/* eslint-disable no-else-return */
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import bitsFetch from '../../../Utils/bitsFetch'
import { sortArrOfObj } from '../../../Utils/Helpers'

export const handleInput = (
  e,
  oneDriveConf,
  setOneDriveConf,
  formID,
  setIsLoading,
  setSnackbar,
  i = 0
) => {
  let newConf = { ...oneDriveConf }
  const { name } = e.target
  if (e.target.value !== '') {
    newConf[name] = e.target.value
  } else {
    delete newConf[name]
  }
  // new

  newConf[e.target.name] = e.target.value
  switch (e.target.name) {
    case 'folder':
      newConf.folderMap = newConf.folderMap.slice(0, i)
      newConf = folderChange(newConf, formID, setOneDriveConf, setIsLoading, setSnackbar)
      break
    default:
      break
  }
  // end
  setOneDriveConf({ ...newConf })
}

const folderChange = (oneDriveConf, formID, setOneDriveConf, setIsLoading, setSnackbar) => {
  const newConf = { ...oneDriveConf }
  delete newConf.teamType

  if (newConf.folder && !newConf.default?.folders?.[newConf.folder]) {
    if (newConf.default?.teamFolders?.[newConf.team]?.[newConf.folder]?.type === 'private') {
      newConf.teamType = 'private'
    }
    getSingleOneDriveFolders(formID, newConf, setOneDriveConf, setIsLoading, setSnackbar)
  } else if (newConf.folder && newConf.folder !== newConf.folderMap[newConf.folderMap.length - 1])
    newConf.folderMap.push(newConf.folder)

  return newConf
}

const buildAuthRequestParams = conf =>
  conf?.connection_id
    ? { connection_id: conf.connection_id }
    : {
        clientId: conf.clientId,
        clientSecret: conf.clientSecret,
        tokenDetails: conf.tokenDetails
      }

export const getAllOneDriveFolders = (
  flowID,
  oneDriveConf,
  setOneDriveConf,
  setIsLoading,
  setSnackbar
) => {
  setIsLoading(true)
  const queryParams = {
    flowID: flowID ?? null,
    ...buildAuthRequestParams(oneDriveConf)
  }
  const loadPostTypes = bitsFetch(queryParams, 'oneDrive_get_all_folders')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...oneDriveConf }
        if (!newConf.default) newConf.default = {}
        if (result.data.oneDriveFoldersList) {
          newConf.default.rootFolders = result.data.oneDriveFoldersList
          newConf.tokenDetails = result.data.tokenDetails
        }

        setOneDriveConf(newConf)
        setIsLoading(false)
        return __('OneDrive Folders List refreshed successfully', 'bit-integrations')
      } else {
        setIsLoading(false)
        return __('OneDrive Folders List refresh failed. please try again', 'bit-integrations')
      }
    })
    .catch(() => setIsLoading(false))
  toast.promise(loadPostTypes, {
    success: data => data,
    error: __('Error Occurred', 'bit-integrations'),
    loading: __('Loading OneDrive Folders List...', 'bit-integrations')
  })
}

export const getSingleOneDriveFolders = (
  formID,
  oneDriveConf,
  setOneDriveConf,
  setIsLoading,
  setSnackbar,
  ind
) => {
  const folder = ind ? oneDriveConf.folderMap[ind] : oneDriveConf.folder
  setIsLoading(true)
  const refreshSubFoldersRequestParams = {
    formID,
    dataCenter: oneDriveConf.dataCenter,
    ...buildAuthRequestParams(oneDriveConf),
    team: oneDriveConf.team,
    folder,
    teamType: 'teamType' in oneDriveConf ? 'private' : 'team'
  }

  bitsFetch(refreshSubFoldersRequestParams, 'oneDrive_get_single_folder')
    .then(result => {
      if (result && result.success) {
        const newConf = { ...oneDriveConf }
        if (result.data.folders) {
          if (!newConf.default.folders) {
            newConf.default.folders = {}
          }

          newConf.default.folders[folder] = sortArrOfObj(result.data.folders, 'folderName')
          if (!newConf.folderMap.includes(folder)) newConf.folderMap.push(folder)
          setSnackbar({ show: true, msg: __('Sub Folders refreshed', 'bitform') })
        } else {
          setSnackbar({ show: true, msg: __('No Sub Folder Found', 'bitform') })
        }

        if (result.data.tokenDetails) {
          newConf.tokenDetails = result.data.tokenDetails
        }
        setOneDriveConf({ ...newConf })
      } else {
        setSnackbar({
          show: true,
          msg: __('Sub Folders refresh failed. please try again', 'bitform')
        })
      }
      setIsLoading(false)
    })
    .catch(() => setIsLoading(false))
}
