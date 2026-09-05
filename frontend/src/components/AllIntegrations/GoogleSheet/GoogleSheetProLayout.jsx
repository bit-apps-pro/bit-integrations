import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../IntegrationHelpers/GoogleIntegrationHelpers'
import { refreshSpreadsheets, refreshWorksheetHeaders, refreshWorksheets } from './GoogleSheetCommonFunc'
import GoogleSheetProFieldMap from './GoogleSheetProFieldMap'
import {
  actionFields,
  hasUtilities,
  needsColumnToMatch,
  needsFieldMap,
  needsHeaders,
  needsSpreadsheet,
  needsWorksheet
} from './staticData'

export default function GoogleSheetProLayout({
  action,
  formID,
  formFields,
  handleInput,
  sheetConf,
  setSheetConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const worksheetHeaders =
    sheetConf?.default?.headers?.[sheetConf.spreadsheetId]?.[sheetConf.worksheetName]?.[
      sheetConf.headerRow
    ] || []

  const targetFields = [
    ...(actionFields[action] || []).map(field => ({
      value: field.key,
      label: field.label,
      required: field.required
    })),
    ...(needsHeaders.includes(action)
      ? worksheetHeaders.map((header, indx) => ({
          value: header,
          label: header.replace(`_${indx}`, ''),
          required: false
        }))
      : [])
  ]

  const spreadsheetReady = !needsSpreadsheet.includes(action) || !!sheetConf.spreadsheetId
  const worksheetReady = !needsWorksheet.includes(action) || !!sheetConf.worksheetName
  const headersReady = !needsHeaders.includes(action) || worksheetHeaders.length > 0

  // Every section waits on what the chosen action actually needs, so an action with
  // no worksheet never shows a worksheet select and a row action never offers a field
  // map before its headers are known.
  const showFieldMap =
    needsFieldMap.includes(action) &&
    targetFields.length > 0 &&
    spreadsheetReady &&
    worksheetReady &&
    headersReady

  const setConfValue = (name, value) =>
    setSheetConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[name] = value
      })
    )

  const setUtility = (name, value) =>
    setSheetConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = value
      })
    )

  return (
    <>
      {needsSpreadsheet.includes(action) && (
        <>
          <br />
          <b className="wdt-200 d-in-b">{__('Spreadsheets:', 'bit-integrations')}</b>
          <select
            onChange={handleInput}
            name="spreadsheetId"
            value={sheetConf.spreadsheetId || ''}
            className="btcd-paper-inp w-5">
            <option value="">{__('Select Spreadsheet', 'bit-integrations')}</option>
            {sheetConf?.default?.spreadsheets &&
              Object.keys(sheetConf.default.spreadsheets).map(spreadSheetApiName => (
                <option
                  key={spreadSheetApiName}
                  value={sheetConf.default.spreadsheets[spreadSheetApiName].spreadsheetId}>
                  {sheetConf.default.spreadsheets[spreadSheetApiName].spreadsheetName}
                </option>
              ))}
          </select>
          <button
            onClick={() =>
              refreshSpreadsheets(formID, sheetConf, setSheetConf, setIsLoading, setSnackbar)
            }
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': '"Refresh Spreadsheet"' }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
          <br />
        </>
      )}

      {needsWorksheet.includes(action) && sheetConf.spreadsheetId && (
        <>
          <br />
          <b className="wdt-200 d-in-b">{__('Worksheet:', 'bit-integrations')}</b>
          <select
            onChange={handleInput}
            name="worksheetName"
            value={sheetConf.worksheetName || ''}
            className="btcd-paper-inp w-5">
            <option value="">{__('Select Worksheet', 'bit-integrations')}</option>
            {sheetConf?.default?.worksheets?.[sheetConf.spreadsheetId] &&
              sheetConf.default.worksheets[sheetConf.spreadsheetId].map(worksheet => (
                <option key={worksheet.properties.sheetId} value={worksheet.properties.title}>
                  {worksheet.properties.title}
                </option>
              ))}
          </select>
          <button
            onClick={() => refreshWorksheets(formID, sheetConf, setSheetConf, setIsLoading, setSnackbar)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': '"Refresh Sheet Worksheets"' }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
          <br />
        </>
      )}

      {hasUtilities.includes(action) && spreadsheetReady && worksheetReady && (
        <div className="flx mt-3">
          <b className="wdt-200 d-in-b">{__('Utilities:', 'bit-integrations')}</b>
          <label className="flx" htmlFor="gsheet-keep-headers">
            <input
              id="gsheet-keep-headers"
              type="checkbox"
              className="mr-2"
              checked={sheetConf?.utilities?.selected_first_row_headers || false}
              onChange={e => setUtility('selected_first_row_headers', e.target.checked)}
            />
            {__('Keep the first row as headers', 'bit-integrations')}
          </label>
        </div>
      )}

      {needsHeaders.includes(action) && spreadsheetReady && worksheetReady && (
        <>
          <br />
          <b className="wdt-200 d-in-b">{__('Header Row:', 'bit-integrations')}</b>
          <input
            type="text"
            min="1"
            className="btcd-paper-inp w-5"
            placeholder="Header Row"
            onChange={handleInput}
            value={sheetConf.headerRow || ''}
            name="headerRow"
          />
          <button
            onClick={() =>
              refreshWorksheetHeaders(formID, sheetConf, setSheetConf, setIsLoading, setSnackbar)
            }
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': '"Refresh Worksheet Headers"' }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
          <br />
        </>
      )}

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

      {needsColumnToMatch.includes(action) && worksheetHeaders.length > 0 && (
        <div className="flx mt-3">
          <b className="wdt-200 d-in-b">{__('Column to Match on:', 'bit-integrations')}</b>
          <MultiSelect
            title="columnToMatch"
            defaultValue={sheetConf?.columnToMatch ?? null}
            className="btcd-paper-drpdwn w-5"
            options={worksheetHeaders.map((header, indx) => ({
              label: header.replace(`_${indx}`, ''),
              value: header
            }))}
            onChange={val => setConfValue('columnToMatch', val)}
            singleSelect
            closeOnSelect
          />
        </div>
      )}

      {showFieldMap && (
        <>
          <div className="mt-4">
            <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Google Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {(sheetConf.field_map || []).map((itm, i) => (
            <GoogleSheetProFieldMap
              key={`sheet-pro-m-${i + 9}`}
              i={i}
              field={itm}
              targetFields={targetFields}
              sheetConf={sheetConf}
              formFields={formFields}
              setSheetConf={setSheetConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap((sheetConf.field_map || []).length, sheetConf, setSheetConf)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </>
      )}
      <br />
      <br />
    </>
  )
}
