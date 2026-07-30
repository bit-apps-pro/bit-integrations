/* eslint-disable no-unused-vars */
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { __ } from '../../../Utils/i18nwrap'
import ACPTFieldMap from './ACPTFieldMap'
import { addFieldMap } from './IntegrationHelpers'

export default function FieldMappingLayout({
  formFields,
  acptConf,
  setAcptConf,
  label,
  fieldMappingKey,
  setSnackbar,
  fieldKey
}) {
  return (
    <>
      <br />
      <div className="mt-3">
        <b className="wdt-100">{label}</b>
      </div>

      <br />
      <div className="btcd-hr mt-1" />
      <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
        <div className="txt-dp">
          <b>{__('Form Fields', 'bit-integrations')}</b>
        </div>
        <div className="txt-dp">
          <b>{__('ACPT Fields', 'bit-integrations')}</b>
        </div>
      </div>

      {acptConf[fieldMappingKey].map((itm, i) => (
        <ACPTFieldMap
          key={`rp-m-${i + 9}`}
          i={i}
          field={itm}
          acptConf={acptConf}
          formFields={formFields}
          setAcptConf={setAcptConf}
          setSnackbar={setSnackbar}
          fieldMappingKey={fieldMappingKey}
          fieldKey={fieldKey}
        />
      ))}

      <div className="txt-center btcbi-field-map-button mt-2">
        <button
          onClick={() =>
            addFieldMap(acptConf[fieldMappingKey].length, acptConf, setAcptConf, fieldMappingKey)
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
