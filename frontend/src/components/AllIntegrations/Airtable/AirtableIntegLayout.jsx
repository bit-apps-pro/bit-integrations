/* eslint-disable no-console */
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import AirtableActions from './AirtableActions'
import { fetchAllBases, getAllFields, getAllTables } from './AirtableCommonFunc'
import AirtableFieldMap from './AirtableFieldMap'
import { addFieldMap } from './IntegrationHelpers'

export default function AirtableIntegLayout({
  formFields,
  handleInput,
  airtableConf,
  setAirtableConf,
  loading,
  setLoading,
  setSnackbar
}) {
  const setChanges = (val, name) => {
    const newConf = { ...airtableConf }
    newConf[name] = val
    if (name === 'selectedBase') {
      newConf.selectedTable = ''
      if (val !== '') {
        getAllTables(newConf, setAirtableConf, loading, setLoading)
      }
    } else if (name === 'selectedTable' && val !== '') {
      getAllFields(newConf, setAirtableConf, loading, setLoading, 'fetch')
    }
    setAirtableConf({ ...newConf })
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Select Base:', 'bit-integrations')}</b>
        <MultiSelect
          singleSelect
          options={airtableConf.bases?.map(base => ({ label: base.name, value: base.id }))}
          className="msl-wrp-options dropdown-custom-width"
          defaultValue={airtableConf?.selectedBase}
          onChange={val => setChanges(val, 'selectedBase')}
        />
        <button
          onClick={() =>
            fetchAllBases(airtableConf, setAirtableConf, loading, setLoading, 'refresh')
          }
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh  Bases', 'bit-integrations')}'` }}
          type="button"
          disabled={loading.bases}>
          &#x21BB;
        </button>
      </div>

      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Select Table:', 'bit-integrations')}</b>
        <MultiSelect
          singleSelect
          options={airtableConf?.tables?.map(table => ({ label: table.name, value: table.id }))}
          className="msl-wrp-options dropdown-custom-width"
          defaultValue={airtableConf?.selectedTable}
          onChange={val => setChanges(val, 'selectedTable')}
          disabled={!airtableConf.selectedBase || loading.tables}
        />
        <button
          onClick={() => getAllTables(airtableConf, setAirtableConf, loading, setLoading)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh  Tables', 'bit-integrations')}'` }}
          type="button"
          disabled={loading.tables || loading.bases || !airtableConf.selectedBase}>
          &#x21BB;
        </button>
      </div>

      {(loading.bases || loading.tables) && (
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
      <div>
        <br />
        <div className="mt-5">
          <b className="wdt-100">
            {__('Field Map', 'bit-integrations')}
            {loading.airtableFields && airtableConf.selectedTable && (
              <button
                onClick={() =>
                  getAllFields(airtableConf, setAirtableConf, loading, setLoading, 'refresh')
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh fields', 'bit-integrations')}'` }}
                type="button"
                disabled={loading.customFields}>
                &#x21BB;
              </button>
            )}
          </b>
        </div>
        <br />
        <div className="btcd-hr mt-1" />
        <br />
        {loading.customFields && (
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
        <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
          <div className="txt-dp">
            <b>{__('Form Fields', 'bit-integrations')}</b>
          </div>
          <div className="txt-dp">
            <b>{__('Airtable Fields', 'bit-integrations')}</b>
          </div>
        </div>

        {loading.airtableFields && airtableConf.selectedTable && (
          <div>
            {' '}
            {airtableConf?.field_map.map((itm, i) => (
              <AirtableFieldMap
                key={`rp-m-${i + 9}`}
                i={i}
                field={itm}
                airtableConf={airtableConf}
                formFields={formFields}
                setAirtableConf={setAirtableConf}
                setSnackbar={setSnackbar}
              />
            ))}
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(airtableConf.field_map.length, airtableConf, setAirtableConf, false)
                }
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
            <br />
            <br />
            {/* <div className="mt-4"><b className="wdt-100">{__('Utilities', 'bit-integrations')}</b></div>
            <div className="btcd-hr mt-1" />
            <AirtableActions
              airtableConf={airtableConf}
              setAirtableConf={setAirtableConf}
              formFields={formFields}
              loading={loading}
              setLoading={setLoading}
            /> */}
          </div>
        )}
      </div>
    </>
  )
}
