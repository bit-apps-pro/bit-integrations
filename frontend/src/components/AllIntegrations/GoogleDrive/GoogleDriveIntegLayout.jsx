import { __ } from '../../../Utils/i18nwrap'
import { addFieldMap } from './IntegrationHelpers'
import GoogleDriveFieldMap from './GoogleDriveFieldMap'
import GoogleDriveActions from './GoogleDriveActions'
import { getAllGoogleDriveFolders } from './GoogleDriveCommonFunc'

export default function GoogleDriveIntegLayout({
  flowID,
  formFields,
  googleDriveConf,
  setGoogleDriveConf
}) {
  return (
    <>
      <div className="mt-5 btcd-section-head">
        <b>{__('Field Map', 'bit-integrations')}</b>
        <button
          onClick={() => getAllGoogleDriveFolders(flowID, googleDriveConf, setGoogleDriveConf)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{
            '--tooltip-txt': `'${__('Refresh folders', 'bit-integrations')}'`
          }}
          type="button">
          &#x21BB;
        </button>
      </div>
      <div className="btcd-hr mt-1" />
      <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
        <div className="txt-dp">
          <b>{__('File Input', 'bit-integrations')}</b>
        </div>
        <div className="txt-dp">
          <b>{__('Google Drive Folder', 'bit-integrations')}</b>
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
      <div className="mt-5">
        <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
      </div>
      <div className="btcd-hr mt-1" />
      <GoogleDriveActions googleDriveConf={googleDriveConf} setGoogleDriveConf={setGoogleDriveConf} />
    </>
  )
}
