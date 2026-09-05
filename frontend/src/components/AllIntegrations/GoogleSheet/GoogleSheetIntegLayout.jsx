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
import GoogleSheetFieldMap from './GoogleSheetFieldMap'
import GoogleSheetProLayout from './GoogleSheetProLayout'
import { DEFAULT_ACTION, modules } from './staticData'

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
  const action = sheetConf?.mainAction || DEFAULT_ACTION

  const handleMainAction = value => {
    if (!value || value === action) {
      return
    }
    setSheetConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.field_map = generateMappedField(value)
        draftConf.columnToMatch = ''
      })
    )
  }

  const actionSelect = (
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
  )

  if (action !== DEFAULT_ACTION) {
    return (
      <>
        <br />
        {actionSelect}
        <GoogleSheetProLayout
          action={action}
          formID={formID}
          formFields={formFields}
          handleInput={handleInput}
          sheetConf={sheetConf}
          setSheetConf={setSheetConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />
      </>
    )
  }

  return (
    <>
      <br />
      {actionSelect}
      <br />
      <b className="wdt-200 d-in-b">{__('Spreadsheets:', 'bit-integrations')}</b>
      <select
        onChange={handleInput}
        name="spreadsheetId"
        value={sheetConf.spreadsheetId}
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
      <br />

      {sheetConf.spreadsheetId && (
        <>
          <b className="wdt-200 d-in-b">Worksheet:</b>
          <select
            onChange={handleInput}
            name="worksheetName"
            value={sheetConf.worksheetName}
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
        </>
      )}
      <br />
      <br />
      {sheetConf.spreadsheetId && sheetConf.worksheetName && (
        <>
          <b className="wdt-200 d-in-b">{__('Header Row:', 'bit-integrations')}</b>
          <input
            type="text"
            min="1"
            className="btcd-paper-inp w-5"
            placeholder="Header Row"
            onChange={handleInput}
            value={sheetConf.headerRow}
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
      {sheetConf.default?.headers?.[sheetConf.spreadsheetId]?.[sheetConf.worksheetName]?.[
        sheetConf.headerRow
      ] && (
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

          {sheetConf.field_map.map((itm, i) => (
            <GoogleSheetFieldMap
              key={`sheet-m-${i + 9}`}
              i={i}
              field={itm}
              sheetConf={sheetConf}
              formFields={formFields}
              setSheetConf={setSheetConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(sheetConf.field_map.length, sheetConf, setSheetConf)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
          <br />
        </>
      )}
    </>
  )
}
