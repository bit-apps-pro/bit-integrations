import { __ } from '../../../Utils/i18nwrap'
import FieldMap from './FieldMap'
import { addFieldMap } from './UserHelperFunction'

export default function CustomFieldMap({ formFields, userConf, setUserConf }) {
  const metaFields = []

  return (
    <div>
      <div>
        <div className="mt-3 mb-1">
          <b>{__('User Meta Field Mappping', 'bit-integrations')}</b>
        </div>
        <div className="btcd-hr" />
        <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
          <div className="txt-dp">
            <b>{__('Meta Value', 'bit-integrations')}</b>
          </div>
          <div className="txt-dp">
            <b>{__('Meta Key', 'bit-integrations')}</b>
          </div>
        </div>
      </div>
      {userConf?.meta_map?.map((itm, i) => (
        <FieldMap
          key={`analytics-m-${i + 9}`}
          i={i}
          type="meta"
          field={itm}
          formFields={formFields}
          userConf={userConf}
          setUserConf={setUserConf}
          customFields={metaFields}
          fieldType="meta"
        />
      ))}

      <div className="txt-center btcbi-field-map-button mt-2">
        <button
          onClick={() => addFieldMap('meta_map', userConf?.meta_map?.length, userConf, setUserConf)}
          className="icn-btn sh-sm"
          type="button">
          +
        </button>
      </div>
    </div>
  )
}
