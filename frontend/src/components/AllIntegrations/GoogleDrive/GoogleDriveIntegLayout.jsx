import { useState } from 'react'
import googleDriveLogo from '../../../resource/img/integ/googleDrive.webp'
import { __ } from '../../../Utils/i18nwrap'
import { addFieldMap } from './IntegrationHelpers'
import GoogleDriveFieldMap from './GoogleDriveFieldMap'
import GoogleDriveActions from './GoogleDriveActions'
import { getAllGoogleDriveFolders, handleInput, pickFolderFromDrive } from './GoogleDriveCommonFunc'

export default function GoogleDriveIntegLayout({
  flowID,
  formFields,
  googleDriveConf,
  setGoogleDriveConf
}) {
  const [isOpeningPicker, setIsOpeningPicker] = useState(false)

  const handlePickFolder = async () => {
    setIsOpeningPicker(true)
    await pickFolderFromDrive(googleDriveConf, setGoogleDriveConf, () => setIsOpeningPicker(false))
    setIsOpeningPicker(false)
  }

  return (
    <>
      <div className="mt-5 btcd-section-head">
        <b>{__('Field Map', 'bit-integrations')}</b>
        <button
          onClick={() => getAllGoogleDriveFolders(flowID, googleDriveConf, setGoogleDriveConf)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{
            '--tooltip-txt': `'${__('Fetch All GoogleDrive Folders', 'bit-integrations')}'`
          }}
          type="button">
          &#x21BB;
        </button>
        {googleDriveConf?.one_click_app && (
          <button
            onClick={handlePickFolder}
            className="btcd-drive-pick-btn btcd-section-head-action"
            type="button"
            disabled={isOpeningPicker}
            aria-busy={isOpeningPicker}>
            <img src={googleDriveLogo} alt="" width="18" height="18" />
            {__('Choose folder from Google Drive', 'bit-integrations')}
          </button>
        )}
      </div>
      <div className="btcd-hr mt-1" />
      {googleDriveConf?.one_click_app && (
        <p className="btcd-drive-pick-hint btcd-section-head-hint">
          {__('Only folders you chose from Drive are listed.', 'bit-integrations')}
        </p>
      )}
      <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
        <div className="txt-dp">
          <b>{__('File Input', 'bit-integrations')}</b>
        </div>
        <div className="txt-dp">
          <b>{__('GoogleDrive Folder', 'bit-integrations')}</b>
        </div>
      </div>

      {googleDriveConf?.field_map.map((itm, i) => (
        <GoogleDriveFieldMap
          key={`rp-m-${i + 9}`}
          i={i}
          field={itm}
          formFields={formFields}
          googleDriveConf={googleDriveConf}
          setGoogleDriveConf={setGoogleDriveConf}
        />
      ))}
      <div className="txt-center btcbi-field-map-button mt-2">
        <button
          onClick={() =>
            addFieldMap(googleDriveConf.field_map.length, googleDriveConf, setGoogleDriveConf, false)
          }
          className="icn-btn sh-sm"
          type="button">
          +
        </button>
      </div>
      <div className="mt-4">
        <b className="wdt-200 d-in-b">{__('Subfolder Path:', 'bit-integrations')}</b>
        <input
          type="text"
          name="folderPath"
          className="btcd-paper-inp w-5"
          placeholder={__('Forms/Invoices', 'bit-integrations')}
          value={googleDriveConf?.folderPath || ''}
          onChange={e => handleInput(e, googleDriveConf, setGoogleDriveConf)}
        />
        <small className="d-blk mt-1" style={{ marginLeft: 200 }}>
          {__(
            'Optional. Files go into this path inside each chosen folder. Missing folders are created.',
            'bit-integrations'
          )}
        </small>
      </div>
      <br />
      <div className="mt-4">
        <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
      </div>
      <div className="btcd-hr mt-1" />
      <GoogleDriveActions googleDriveConf={googleDriveConf} setGoogleDriveConf={setGoogleDriveConf} />
    </>
  )
}
