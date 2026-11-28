import { __ } from '../../../Utils/i18nwrap'
import GoogleDriveBrowser from '../../Utilities/GoogleDriveBrowser'
import { browseDriveFolders, createDriveFolder, findFolderInDrive } from './GoogleDriveCommonFunc'

const folderLabel = (folderId, foldersList) => {
  if (!folderId) return ''
  if (folderId === 'root') return __('My Drive', 'bit-integrations')
  return foldersList?.find(({ id }) => id === folderId)?.name || folderId
}

export default function GoogleDriveFolderSelect({ value, onChange, googleDriveConf }) {
  return (
    <GoogleDriveBrowser
      mode="folder"
      label={folderLabel(value, googleDriveConf?.foldersList)}
      placeholder={__('Select Folder', 'bit-integrations')}
      isOneClick={Boolean(googleDriveConf?.one_click_app)}
      browse={(parentId, location) => browseDriveFolders(googleDriveConf, parentId, location)}
      createFolder={(parentId, name) => createDriveFolder(googleDriveConf, parentId, name)}
      findInDrive={(onOpen, folder) => findFolderInDrive(googleDriveConf, onOpen, folder)}
      onSelect={onChange}
    />
  )
}
