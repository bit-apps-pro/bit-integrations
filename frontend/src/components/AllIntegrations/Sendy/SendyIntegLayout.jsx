import { useEffect } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import { addFieldMap } from './IntegrationHelpers'
import { getAllBrand, getAllList } from './SendyCommonFunc'
import SendyFieldMap from './SendyFieldMap'

// import { addFieldMap } from './IntegrationHelpers'
// import { getAllRecipient } from './RapidmailCommonFunc'
// import RapidmailFieldMap from './RapidmailFieldMap'

export default function SendyIntegLayout({
  formFields,
  handleInput,
  sendyConf,
  setSendyConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const handleChange = e => {
    const newConf = { ...sendyConf }
    const { name } = e.target
    if (e.target.value !== '') {
      newConf[name] = e.target.value
    } else {
      delete newConf[name]
    }
    if (name === 'brand_id') {
      getAllList(newConf, setSendyConf, setIsLoading, setSnackbar)
    }
    setSendyConf({ ...newConf })
  }

  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Brand:', 'bit-integrations')}</b>
      <select
        onChange={handleChange}
        name="brand_id"
        value={sendyConf.brand_id}
        className="btcd-paper-inp w-5">
        <option value="test">{__('Select Brand', 'bit-integrations')}</option>
        {sendyConf?.default?.brandList &&
          sendyConf.default.brandList.map(({ brandId, brandName }) => (
            <option key={brandId} value={brandId}>
              {brandName}
            </option>
          ))}
      </select>
      <button
        onClick={() => getAllBrand(sendyConf, setSendyConf, setIsLoading, setSnackbar)}
        className="icn-btn sh-sm ml-2 mr-2 tooltip"
        style={{ '--tooltip-txt': `'${__('Fetch All List', 'bit-integrations')}'` }}
        type="button"
        disabled={isLoading}>
        &#x21BB;
      </button>
      <br />
      <br />

      {sendyConf?.brand_id && (
        <>
          <b className="wdt-200 d-in-b">{__('List:', 'bit-integrations')}</b>
          <select
            onChange={handleChange}
            name="list_id"
            value={sendyConf.list_id}
            className="btcd-paper-inp w-5">
            <option value="test">{__('Select List', 'bit-integrations')}</option>
            {sendyConf?.default?.lists &&
              sendyConf.default.lists.map(({ listId, listName }) => (
                <option key={listId} value={listId}>
                  {listName}
                </option>
              ))}
          </select>
          <button
            onClick={() => getAllList(sendyConf, setSendyConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch All List', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </>
      )}
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
          <b>{__('Sendy Fields', 'bit-integrations')}</b>
        </div>
      </div>

      {sendyConf?.field_map.map((itm, i) => (
        <SendyFieldMap
          key={`rp-m-${i + 9}`}
          i={i}
          field={itm}
          sendyConf={sendyConf}
          formFields={formFields}
          setSendyConf={setSendyConf}
          setSnackbar={setSnackbar}
        />
      ))}
      <div className="txt-center btcbi-field-map-button mt-2">
        <button
          onClick={() => addFieldMap(sendyConf.field_map.length, sendyConf, setSendyConf, false)}
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
