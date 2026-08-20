// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '../../../Utils/i18nwrap'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import ZagoMailActions from './ZagoMailActions'
import { refreshZagoMailFields, refreshZagoMailList, refreshZagoMailTags } from './ZagoMailCommonFunc'
import ZagoMailFieldMap from './ZagoMailFieldMap'

export default function ZagoMailIntegLayout({
  formID,
  formFields,
  zagoMailConf,
  setZagoMailConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const setTags = val => {
    const newConf = { ...zagoMailConf }
    if (val) {
      newConf.tagIds = val ? val.split(',') : []
    } else {
      delete newConf.tagIds
    }
    setZagoMailConf({ ...newConf })
  }

  const handleInput = e => {
    const listid = e.target.value
    const newConf = { ...zagoMailConf }
    if (listid) {
      newConf.listId = listid
    } else {
      delete newConf.listId
    }
    refreshZagoMailFields(newConf, setZagoMailConf, setIsLoading, setSnackbar)
    setZagoMailConf({ ...newConf })
  }

  const zagoMailLists = zagoMailConf?.default?.zagoMailLists

  //   // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('List:', 'bit-integrations')}</b>
      <select
        value={zagoMailConf?.listId}
        name="listId"
        id=""
        className="btcd-paper-inp w-5"
        onChange={handleInput}>
        <option value="">{__('Select List', 'bit-integrations')}</option>
        {zagoMailConf?.default?.zagoMailLists &&
          Object.keys(zagoMailConf.default.zagoMailLists).map(listname => (
            <option key={`${listname + 1}`} value={zagoMailConf.default.zagoMailLists[listname].listId}>
              {zagoMailConf.default.zagoMailLists[listname].listName}
            </option>
          ))}
      </select>
      <button
        onClick={() => refreshZagoMailList(zagoMailConf, setZagoMailConf, setIsLoading, setSnackbar)}
        className="icn-btn sh-sm ml-2 mr-2 tooltip"
        style={{ '--tooltip-txt': '"Refresh ZagoMail list"' }}
        type="button"
        disabled={isLoading}>
        &#x21BB;
      </button>
      <br />
      <br />
      {isLoading && (
        <Loader
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            translist: 'scale(0.7)'
          }}
        />
      )}

      <div className="mt-4">
        <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
        <button
          onClick={() => refreshZagoMailFields(zagoMailConf, setZagoMailConf, setIsLoading, setSnackbar)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh ZagoMail Field', 'bit-integrations')}'` }}
          type="button"
          disabled={isLoading}>
          &#x21BB;
        </button>
      </div>
      {(zagoMailConf?.listId || zagoMailConf?.default?.fields) && (
        <>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('List Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('ZagoMail Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {zagoMailConf.field_map.map((itm, i) => (
            <ZagoMailFieldMap
              key={`ZagoMail-m-${i + 9}`}
              i={i}
              field={itm}
              zagoMailConf={zagoMailConf}
              formFields={formFields}
              setZagoMailConf={setZagoMailConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(zagoMailConf.field_map.length, zagoMailConf, setZagoMailConf)}
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
          <ZagoMailActions
            zagoMailConf={zagoMailConf}
            setZagoMailConf={setZagoMailConf}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </>
      )}
    </>
  )
}
