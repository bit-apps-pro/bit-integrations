import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/GoogleIntegrationHelpers'
import {
  generateMappedField,
  refreshSpreadsheets,
  refreshWorksheetHeaders,
  refreshWorksheets
} from './GoogleSheetCommonFunc'
import GoogleSheetActions from './GoogleSheetActions'
import GoogleSheetFieldMap from './GoogleSheetFieldMap'
import {
  actionFields,
  DEFAULT_ACTION,
  hasUtilities,
  modules,
  needsColumnToMatch,
  needsFieldMap,
  needsHeaders,
  needsSpreadsheet,
  needsWorksheet
} from './staticData'

export default function GoogleSheetIntegLayout({
  formID,
  formFields,
  handleInput,
  sheetConf,
  setSheetConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const { isPro } = useRecoilValue($appConfigState)
  const action = sheetConf?.mainAction ?? DEFAULT_ACTION

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

  const showFieldMap =
    needsFieldMap.includes(action) &&
    targetFields.length > 0 &&
    spreadsheetReady &&
    worksheetReady &&
    headersReady

  const handleMainAction = value => {
    if (!value || value === action) {
      return
    }

    const nextConf = create(sheetConf, draftConf => {
      draftConf.mainAction = value
      draftConf.field_map = generateMappedField(value)
      draftConf.columnToMatch = ''
    })

    setSheetConf(nextConf)

    const hasSpreadsheets = Object.keys(nextConf?.default?.spreadsheets || {}).length > 0

    if (needsSpreadsheet.includes(value) && !hasSpreadsheets) {
      refreshSpreadsheets(formID, nextConf, setSheetConf, setIsLoading, setSnackbar)
    }
  }

  const setConfValue = (name, value) =>
    setSheetConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[name] = value
      })
    )

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={action}
          className="mt-2 w-5"
          onChange={handleMainAction}
          options={modules.map(module => ({
            label: checkIsPro(isPro, module.is_pro) ? module.label : getProLabel(module.label),
            value: module.name,
            disabled: !checkIsPro(isPro, module.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>
      <br />

      {needsSpreadsheet.includes(action) && (
        <>
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
          <br />
        </>
      )}

      {needsWorksheet.includes(action) && sheetConf.spreadsheetId && (
        <>
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
          <br />
        </>
      )}

      {needsHeaders.includes(action) && spreadsheetReady && worksheetReady && (
        <>
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
          <small
            className="mt-3 d-blk w-5"
            style={{ marginLeft: 200, lineHeight: 1.8, textAlign: 'justify' }}>
            {__(
              'By default, first row of the worksheet is considered as header row. This can be used if tabular data starts from any row other than the first row.',
              'bit-integrations'
            )}
          </small>
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
            <GoogleSheetFieldMap
              key={`sheet-m-${i + 9}`}
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

      {hasUtilities.includes(action) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <GoogleSheetActions sheetConf={sheetConf} setSheetConf={setSheetConf} />
        </div>
      )}
    </>
  )
}
