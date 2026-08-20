import { useEffect } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import ZohoCRMActions from './ZohoCRMActions'
import { handleTabChange, refreshLayouts } from './ZohoCRMCommonFunc'
import ZohoCRMFieldMap from './ZohoCRMFieldMap'
import { APP_CONFIG } from '../../../config/app'

export default function ZohoCRMNewRecord({
  tab,
  settab,
  formID,
  formFields,
  crmConf,
  setCrmConf,
  handleInput,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  useEffect(() => {
    handleTabChange(0, settab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // eslint-disable-next-line no-undef
  const isPro = APP_CONFIG.isPro
  return (
    <>
      {isLoading && (
        <Loader
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            transform: 'scale(0.7)'
          }}
        />
      )}
      <br />
      <br />
      <b className="wdt-200 d-in-b">{__('Layout:', 'bit-integrations')}</b>
      <select onChange={handleInput} name="layout" value={crmConf.layout} className="btcd-paper-inp w-5">
        <option value="">{__('Select Layout', 'bit-integrations')}</option>
        {crmConf?.default?.layouts?.[crmConf.module] &&
          Object.keys(crmConf.default.layouts[crmConf.module]).map(layoutApiName => (
            <option key={layoutApiName} value={layoutApiName}>
              {layoutApiName}
            </option>
          ))}
      </select>
      <button
        onClick={() => refreshLayouts(tab, formID, crmConf, setCrmConf, setIsLoading, setSnackbar)}
        className="icn-btn sh-sm ml-2 mr-2 tooltip"
        style={{ '--tooltip-txt': `'${__('Refresh CRM Layouts', 'bit-integrations')}'` }}
        type="button"
        disabled={isLoading}>
        &#x21BB;
      </button>
      <br />
      <br />

      {crmConf.default?.layouts?.[crmConf.module]?.[crmConf.layout]?.fields && (
        <>
          <div className="mt-4">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Zoho Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {crmConf.field_map.map((itm, i) => (
            <ZohoCRMFieldMap
              key={`crm-m-${i + 9}`}
              i={i}
              field={itm}
              crmConf={crmConf}
              formFields={formFields}
              setCrmConf={setCrmConf}
              tab={tab}
              setSnackbar={setSnackbar}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(crmConf.field_map.length, crmConf, setCrmConf, false, tab)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
          <br />
          {Object.keys(crmConf.default.layouts[crmConf.module][crmConf.layout]?.fileUploadFields)
            .length !== 0 && (
            <div className="pos-rel">
              <div className="mt-4">
                <b className="wdt-100">{__('Map File Upload Fields', 'bit-integrations')}</b>
              </div>
              <div className="btcd-hr mt-1" />
              <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
                <div className="txt-dp">
                  <b>{__('Form Fields', 'bit-integrations')}</b>
                </div>
                <div className="txt-dp">
                  <b>{__('Zoho Fields', 'bit-integrations')}</b>
                </div>
              </div>

              {crmConf.upload_field_map.map((itm, i) => (
                <ZohoCRMFieldMap
                  key={`crm-m-${i + 9}`}
                  i={i}
                  uploadFields
                  field={itm}
                  crmConf={crmConf}
                  formFields={formFields}
                  setCrmConf={setCrmConf}
                  tab={tab}
                  setSnackbar={setSnackbar}
                />
              ))}
              <div className="txt-center btcbi-field-map-button mt-2">
                <button
                  onClick={() =>
                    addFieldMap(crmConf.upload_field_map.length, crmConf, setCrmConf, true, tab)
                  }
                  className="icn-btn sh-sm"
                  type="button">
                  +
                </button>
              </div>
              <br />
              <br />
            </div>
          )}
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />

          <ZohoCRMActions
            formID={formID}
            formFields={formFields}
            crmConf={crmConf}
            setCrmConf={setCrmConf}
            tab={tab}
            setSnackbar={setSnackbar}
          />
        </>
      )}
    </>
  )
}
