/* eslint-disable no-unused-vars */
import { __ } from '../../../Utils/i18nwrap'
import { addFieldMap } from './IntegrationHelpers'
import PCloudFieldMap from './PCloudFieldMap'
import PCloudActions from './PCloudActions'
import { getAllPCloudFolders } from './PCloudCommonFunc'

export default function PCloudIntegLayout({ formFields, pCloudConf, setPCloudConf }) {
  return (
    <>
      <div className="mt-5">
        <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
        <button
          onClick={() => getAllPCloudFolders(pCloudConf, setPCloudConf, 'refresh')}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Fetch All PCloud Folders', 'bit-integrations')}'` }}
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
          <b>{__('PCloud Folder', 'bit-integrations')}</b>
        </div>
      </div>

      {pCloudConf?.field_map.map((itm, i) => (
        <PCloudFieldMap
          key={`rp-m-${i + 9}`}
          i={i}
          field={itm}
          formFields={formFields}
          pCloudConf={pCloudConf}
          setPCloudConf={setPCloudConf}
        />
      ))}
      <div className="txt-center btcbi-field-map-button mt-2">
        <button
          onClick={() => addFieldMap(pCloudConf.field_map.length, pCloudConf, setPCloudConf, false)}
          className="icn-btn sh-sm"
          type="button">
          +
        </button>
      </div>
      <br />
      <br />
      <div className="mt-4">
        <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
      </div>
      <div className="btcd-hr mt-1" />
      <PCloudActions pCloudConf={pCloudConf} setPCloudConf={setPCloudConf} />
    </>
  )
}
