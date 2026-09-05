import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import TagifyInput from '../../Utilities/TagifyInput'
import { addFieldMap } from '../IntegrationHelpers/GoogleIntegrationHelpers'
import { refreshSpreadsheets, refreshWorksheetHeaders, refreshWorksheets } from './GoogleSheetCommonFunc'
import GoogleSheetFieldMap from './GoogleSheetFieldMap'
import {
  hasUtilities,
  needsColumnToMatch,
  needsHeaders,
  needsSpreadsheet,
  needsWorksheet,
  textInputs
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
            onClick={() => refreshSpreadsheets(formID, sheetConf, setSheetConf, setIsLoading, setSnackbar)}
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

      {(textInputs[action] || []).map(field => (
        <div className="flx mt-3" key={`gsheet-inp-${field.key}`}>
          <b className="wdt-200 d-in-b">{`${field.label}${field.required ? ' *' : ''}`}</b>
          <TagifyInput
            onChange={e => setConfValue(field.key, e.target.value)}
            className="w-5"
            type="text"
            value={sheetConf?.[field.key] || ''}
            placeholder={field.label}
            formFields={formFields}
          />
        </div>
      ))}

      {hasUtilities.includes(action) && (
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

      {needsHeaders.includes(action) && sheetConf.spreadsheetId && sheetConf.worksheetName && (
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

      {needsHeaders.includes(action) && worksheetHeaders.length > 0 && (
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
            <GoogleSheetFieldMap
              key={`sheet-pro-m-${i + 9}`}
              i={i}
              field={itm}
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
