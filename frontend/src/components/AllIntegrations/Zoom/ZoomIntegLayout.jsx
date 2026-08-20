import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import ZoomActions from './ZoomActions'
// import { addFieldMap } from './IntegrationHelpers'
import { refreshFields, zoomAllMeeting } from './ZoomCommonFunc'
import ZoomFieldMap from './ZoomFieldMap'

export default function ZoomIntegLayout({
  formFields,
  handleInput,
  zoomConf,
  setZoomConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('All Meetings:', 'bit-integrations')}</b>
      <select onChange={handleInput} name="id" value={zoomConf.id} className="btcd-paper-inp w-5">
        <option value="">{__('Select Meeting', 'bit-integrations')}</option>
        {zoomConf?.default?.allMeeting &&
          zoomConf.default.allMeeting.map(({ id, topic }) => (
            <option key={id} value={id}>
              {topic}
            </option>
          ))}
      </select>
      <button
        onClick={() => zoomAllMeeting(null, zoomConf, setZoomConf, setIsLoading, setSnackbar)}
        className="icn-btn sh-sm ml-2 mr-2 tooltip"
        style={{ '--tooltip-txt': `'${__('Fetch All Meeting', 'bit-integrations')}'` }}
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
        value={zoomConf.selectedActions}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Action', 'bit-integrations')}</option>
        {zoomConf?.allActions &&
          zoomConf.allActions.map(({ key, value }) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
      </select>
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
      {zoomConf.id && !isLoading && (
        <>
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
            <button
              onClick={() => refreshFields(zoomConf, setZoomConf, setIsLoading, setSnackbar)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh fields', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-1">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Zoom Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {zoomConf?.field_map.map((itm, i) => (
            <ZoomFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              zoomConf={zoomConf}
              formFields={formFields}
              setZoomConf={setZoomConf}
              setSnackbar={setSnackbar}
            />
          ))}
          <div className="txt-center  mt-2" style={{ marginRight: 85 }}>
            <button
              onClick={() => addFieldMap(zoomConf.field_map.length, zoomConf, setZoomConf, false)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>

          <br />
          <br />
        </>
      )}
    </>
  )
}
