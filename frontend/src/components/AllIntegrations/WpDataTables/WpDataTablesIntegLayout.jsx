import { create } from 'mutative'
import { useEffect } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  refreshWpDataTablesColumns,
  refreshWpDataTablesTables
} from './WpDataTablesCommonFunc'
import WpDataTablesFieldMap from './WpDataTablesFieldMap'
import { modules } from './staticData'

export default function WpDataTablesIntegLayout({
  formFields,
  wpDataTablesConf,
  setWpDataTablesConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  useEffect(() => {
    if (wpDataTablesConf?.mainAction === 'add_row' && !wpDataTablesConf?.allTables?.length) {
      refreshWpDataTablesTables(setWpDataTablesConf, setIsLoading)
    }
  }, [wpDataTablesConf?.mainAction])

  useEffect(() => {
    if (wpDataTablesConf?.selectedTable && !wpDataTablesConf?.wpDataTablesFields?.length) {
      refreshWpDataTablesColumns(wpDataTablesConf.selectedTable, setWpDataTablesConf, setIsLoading)
    }
  }, [wpDataTablesConf?.selectedTable])

  const handleMainAction = value => {
    setWpDataTablesConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.selectedTable = ''
        draftConf.wpDataTablesFields = []
        draftConf.field_map = [{ formField: '', wpDataTablesField: '' }]
      })
    )
    if (value === 'add_row') {
      refreshWpDataTablesTables(setWpDataTablesConf, setIsLoading)
    }
  }

  const handleTableSelect = value => {
    setWpDataTablesConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.selectedTable = value
        draftConf.wpDataTablesFields = []
        draftConf.field_map = [{ formField: '', wpDataTablesField: '' }]
      })
    )
    if (value) {
      refreshWpDataTablesColumns(value, setWpDataTablesConf, setIsLoading)
    }
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={wpDataTablesConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: !checkIsPro(isPro, action.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {wpDataTablesConf?.mainAction === 'add_row' && (
        <div className="mt-3 flx">
          <b className="wdt-200 d-in-b">{__('Select Table:', 'bit-integrations')}</b>
          <MultiSelect
            defaultValue={wpDataTablesConf?.selectedTable ?? null}
            className="mt-2 w-5"
            onChange={value => handleTableSelect(value)}
            options={wpDataTablesConf?.allTables ?? []}
            singleSelect
            closeOnSelect
          />
          <button
            onClick={() => refreshWpDataTablesTables(setWpDataTablesConf, setIsLoading)}
            className="icn-btn sh-sm ml-2 mt-2"
            type="button"
            title={__('Refresh tables', 'bit-integrations')}>
            ↻
          </button>
        </div>
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

      {wpDataTablesConf?.selectedTable && wpDataTablesConf?.wpDataTablesFields?.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <button
            onClick={() => refreshWpDataTablesColumns(wpDataTablesConf.selectedTable, setWpDataTablesConf, setIsLoading)}
            className="icn-btn sh-sm ml-2 mt-2"
            type="button"
            title={__('Refresh Columns', 'bit-integrations')}>
            ↻
          </button>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('wpDataTables Columns', 'bit-integrations')}</b>
            </div>
          </div>

          {wpDataTablesConf?.field_map?.map((itm, i) => (
            <WpDataTablesFieldMap
              key={`wpdatatables-m-${i + 9}`}
              i={i}
              field={itm}
              wpDataTablesConf={wpDataTablesConf}
              formFields={formFields}
              setWpDataTablesConf={setWpDataTablesConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(wpDataTablesConf.field_map.length, wpDataTablesConf, setWpDataTablesConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}
    </>
  )
}
