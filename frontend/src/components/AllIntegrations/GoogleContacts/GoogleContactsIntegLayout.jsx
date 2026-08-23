import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import { addFieldMap } from './IntegrationHelpers'
import GoogleContactsFieldMap from './GoogleContactsFieldMap'
import GoogleContactsActions from './GoogleContactsActions'

export default function GoogleContactsIntegLayout({
  flowID,
  formFields,
  googleContactsConf,
  setGoogleContactsConf
}) {
  const inputHandler = e => {
    const newConf = { ...googleContactsConf }
    const { name } = e.target
    if (e.target.value !== '') {
      newConf[name] = e.target.value
    } else {
      delete newConf[name]
    }

    newConf[e.target.name] = e.target.value
    setGoogleContactsConf({ ...newConf })
  }

  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Actions:', 'bit-integrations')}</b>
      <select
        onChange={inputHandler}
        name="mainAction"
        value={googleContactsConf?.mainAction}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Actions', 'bit-integrations')}</option>
        {googleContactsConf?.allActions &&
          googleContactsConf.allActions.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
      </select>
      <br />
      <br />
      <div className="mt-5">
        <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
      </div>
      <div className="btcd-hr mt-1" />
      <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
        <div className="txt-dp">
          <b>{__('Form Fields', 'bit-integrations')}</b>
        </div>
        <div className="txt-dp">
          <b>{__('Google Contacts Fields', 'bit-integrations')}</b>
        </div>
      </div>

      {googleContactsConf?.field_map.map((itm, i) => (
        <GoogleContactsFieldMap
          key={`rp-m-${i + 9}`}
          i={i}
          field={itm}
          formFields={formFields}
          googleContactsConf={googleContactsConf}
          setGoogleContactsConf={setGoogleContactsConf}
        />
      ))}
      <div className="txt-center btcbi-field-map-button mt-2">
        <button
          onClick={() =>
            addFieldMap(
              googleContactsConf.field_map.length,
              googleContactsConf,
              setGoogleContactsConf,
              false
            )
          }
          className="icn-btn sh-sm"
          type="button">
          +
        </button>
      </div>
      <br />
      <div className="mt-4">
        <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
      </div>
      <div className="btcd-hr mt-1" />
      <GoogleContactsActions
        googleContactsConf={googleContactsConf}
        setGoogleContactsConf={setGoogleContactsConf}
        formFields={formFields}
      />
    </>
  )
}
