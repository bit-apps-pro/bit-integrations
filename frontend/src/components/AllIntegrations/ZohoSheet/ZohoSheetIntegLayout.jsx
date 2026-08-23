/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import ZohoSheetActions from './ZohoSheetActions'
import { getAllWorkbooks, getAllWorksheets, getWorksheetHeader } from './ZohoSheetCommonFunc'
import ZohoSheetFieldMap from './ZohoSheetFieldMap'
import { addFieldMap } from './IntegrationHelpers'

export default function ZohoSheetIntegLayout({
  formFields,
  zohoSheetConf,
  setZohoSheetConf,
  loading,
  setLoading
}) {
  const setChanges = (val, name) => {
    const newConf = { ...zohoSheetConf }
    newConf[name] = val
    if (name === 'selectedWorkbook') {
      newConf.selectedWorksheet = ''
      if (val !== '') {
        getAllWorksheets(newConf, setZohoSheetConf, loading, setLoading)
      }
    } else if (name === 'selectedWorksheet' && val !== '') {
      getWorksheetHeader(newConf, setZohoSheetConf, loading, setLoading)
    }
    setZohoSheetConf({ ...newConf })
  }

  const handleHeaderRowInput = e => {
    const newConf = { ...zohoSheetConf }
    const { name } = e.target
    if (e.target.value !== '') {
      newConf[name] = e.target.value
      getWorksheetHeader(newConf, setZohoSheetConf, loading, setLoading)
    } else {
      delete newConf[name]
    }
    setZohoSheetConf({ ...newConf })
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Select workbook:', 'bit-integrations')}</b>
        <MultiSelect
          singleSelect
          options={zohoSheetConf.workbooks?.map(workbook => ({
            label: workbook.name,
            value: workbook.id
          }))}
          className="msl-wrp-options dropdown-custom-width"
          defaultValue={zohoSheetConf?.selectedWorkbook}
          onChange={val => setChanges(val, 'selectedWorkbook')}
        />
        <button
          onClick={() => getAllWorkbooks(zohoSheetConf, setZohoSheetConf, loading, setLoading)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh  workbooks', 'bit-integrations')}'` }}
          type="button"
          disabled={loading.workbooks}>
          &#x21BB;
        </button>
      </div>

      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Select worksheet:', 'bit-integrations')}</b>
        <MultiSelect
          singleSelect
          options={zohoSheetConf?.worksheets?.map(table => ({
            label: table.name,
            value: table.id
          }))}
          className="msl-wrp-options dropdown-custom-width"
          defaultValue={zohoSheetConf?.selectedWorksheet}
          onChange={val => setChanges(val, 'selectedWorksheet')}
          disabled={!zohoSheetConf.selectedWorkbook || loading.worksheets}
        />
        <button
          onClick={() => getAllWorksheets(zohoSheetConf, setZohoSheetConf, loading, setLoading)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh  worksheets', 'bit-integrations')}'` }}
          type="button"
          disabled={loading.worksheets || loading.workbooks || !zohoSheetConf.selectedWorkbook}>
          &#x21BB;
        </button>
      </div>

      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Header Row:', 'bit-integrations')}</b>
        <input
          type="number"
          min="1"
          className="btcd-paper-inp w-5"
          placeholder="Header Row"
          onChange={e => handleHeaderRowInput(e)}
          value={zohoSheetConf.headerRow}
          name="headerRow"
          disabled={
            loading.worksheets ||
            loading.workbooks ||
            !zohoSheetConf.selectedWorkbook ||
            !zohoSheetConf.selectedWorksheet
          }
        />
        <button
          onClick={() => getWorksheetHeader(zohoSheetConf, setZohoSheetConf, loading, setLoading)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh  worksheet headers', 'bit-integrations')}'` }}
          type="button"
          disabled={
            loading.worksheets ||
            loading.workbooks ||
            !zohoSheetConf.selectedWorkbook ||
            !zohoSheetConf.selectedWorksheet ||
            loading.header
          }>
          &#x21BB;
        </button>
      </div>

      {(loading.workbooks || loading.worksheets) && (
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
          <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
        </div>
        <br />
        <div className="btcd-hr mt-1" />
        <br />
        {loading.header && (
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
            <b>{__('ZohoSheet Fields', 'bit-integrations')}</b>
          </div>
        </div>

        {loading.workSheetHeaders && zohoSheetConf.selectedWorksheet && (
          <div>
            {' '}
            {zohoSheetConf?.field_map.map((itm, i) => (
              <ZohoSheetFieldMap
                key={`rp-m-${i + 9}`}
                i={i}
                field={itm}
                zohoSheetConf={zohoSheetConf}
                formFields={formFields}
                setZohoSheetConf={setZohoSheetConf}
              />
            ))}
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(zohoSheetConf.field_map.length, zohoSheetConf, setZohoSheetConf, false)
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
      </div>
    </>
  )
}
