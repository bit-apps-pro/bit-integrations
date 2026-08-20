import { __ } from '../../../Utils/i18nwrap'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
// import { addFieldMap } from './IntegrationHelpers'
import { zoomAllWebinar } from './ZoomCommonFunc'
import ZoomWebinarFieldMap from './ZoomWebinarFieldMap'

export default function ZoomWebinarIntegLayout({
  formFields,
  handleInput,
  zoomWebinarConf,
  setZoomWebinarConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('All Webinars:', 'bit-integrations')}</b>
      <select onChange={handleInput} name="id" value={zoomWebinarConf.id} className="btcd-paper-inp w-5">
        <option value="">{__('Select Webinar', 'bit-integrations')}</option>
        {zoomWebinarConf?.default?.allWebinar &&
          zoomWebinarConf.default.allWebinar.map(({ id, topic }) => (
            <option key={id} value={id}>
              {topic}
            </option>
          ))}
      </select>
      <button
        onClick={() =>
          zoomAllWebinar(null, zoomWebinarConf, setZoomWebinarConf, setIsLoading, setSnackbar)
        }
        className="icn-btn sh-sm ml-2 mr-2 tooltip"
        style={{ '--tooltip-txt': `'${__('Fetch All Recipients', 'bit-integrations')}'` }}
        type="button"
        disabled={isLoading}>
        &#x21BB;
      </button>
      <br />
      <br />
      <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
      <select
        onChange={handleInput}
        name="selectedActions"
        value={zoomWebinarConf.selectedActions}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Action', 'bit-integrations')}</option>
        {zoomWebinarConf?.allActions &&
          zoomWebinarConf.allActions.map(({ key, value }) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
      </select>
      <div className="mt-5">
        <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
      </div>
      <div className="btcd-hr mt-1" />
      <div className="flx flx-around mt-2 mb-1">
        <div className="txt-dp">
          <b>{__('Form Fields', 'bit-integrations')}</b>
        </div>
        <div className="txt-dp">
          <b>{__('ZoomWebinar Fields', 'bit-integrations')}</b>
        </div>
      </div>

      {zoomWebinarConf?.field_map.map((itm, i) => (
        <ZoomWebinarFieldMap
          key={`rp-m-${i + 9}`}
          i={i}
          field={itm}
          zoomWebinarConf={zoomWebinarConf}
          formFields={formFields}
          setZoomWebinarConf={setZoomWebinarConf}
          setSnackbar={setSnackbar}
        />
      ))}
      <div className="txt-center  mt-2" style={{ marginRight: 85 }}>
        <button
          onClick={() =>
            addFieldMap(zoomWebinarConf.field_map.length, zoomWebinarConf, setZoomWebinarConf, false)
          }
          className="icn-btn sh-sm"
          type="button">
          +
        </button>
      </div>

      <br />
      <br />
    </>
  )
}
