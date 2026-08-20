import { useEffect } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import WpTableBuilderActions from './WpTableBuilderActions'
import { generateMappedField, refreshColumns, refreshTables } from './WpTableBuilderCommonFunc'
import WpTableBuilderFieldMap from './WpTableBuilderFieldMap'
import {
  CreateTableFields,
  DeleteTableFields,
  fetchesColumns,
  hasUtilities,
  modules,
  UpdateTableFields
} from './staticData'

const fieldsByAction = {
  create_table: CreateTableFields,
  update_table: UpdateTableFields,
  delete_table: DeleteTableFields,
  add_row: []
}

export default function WpTableBuilderIntegLayout({
  formID,
  formFields,
  wpTableBuilderConf,
  setWpTableBuilderConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const mainAction = wpTableBuilderConf?.mainAction
  const needsColumns = fetchesColumns.includes(mainAction)

  const handleMainAction = value => {
    setWpTableBuilderConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.wpTableBuilderFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.wpTableBuilderFields)
      })
    )

    if (fetchesColumns.includes(value)) {
      refreshTables(wpTableBuilderConf, setWpTableBuilderConf, setIsLoading)
    }
  }

  const handleTableChange = value => {
    setWpTableBuilderConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.selectedTable = value
      })
    )

    refreshColumns(wpTableBuilderConf, setWpTableBuilderConf, setIsLoading, value)
  }

  useEffect(() => {
    if (needsColumns && !wpTableBuilderConf?.tables?.length) {
      refreshTables(wpTableBuilderConf, setWpTableBuilderConf, setIsLoading)
    }
  }, [needsColumns])

  const renderRefresh = (onClick, tooltip) => (
    <button
      onClick={onClick}
      className="icn-btn sh-sm ml-2 mr-2 tooltip"
      style={{ '--tooltip-txt': `'${tooltip}'` }}
      type="button"
      disabled={isLoading}>
      &#x21BB;
    </button>
  )

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={mainAction ?? null}
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

      {needsColumns && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Table:', 'bit-integrations')}</b>
            <MultiSelect
              key={`selectedTable-${wpTableBuilderConf?.tables?.length ?? 0}`}
              title="selectedTable"
              defaultValue={wpTableBuilderConf?.selectedTable ?? null}
              className="btcd-paper-drpdwn w-5"
              options={wpTableBuilderConf?.tables || []}
              onChange={handleTableChange}
              singleSelect
              closeOnSelect
            />
            {renderRefresh(
              () => refreshTables(wpTableBuilderConf, setWpTableBuilderConf, setIsLoading),
              __('Refresh Tables', 'bit-integrations')
            )}
          </div>
        </>
      )}

      {isLoading && needsColumns && (
        <div className="mt-2">
          <Loader className="ml-2" style={{ height: 20, width: 20 }} />
        </div>
      )}

      {mainAction && wpTableBuilderConf.wpTableBuilderFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          {wpTableBuilderConf?.selectedTable &&
            renderRefresh(
              () => refreshColumns(wpTableBuilderConf, setWpTableBuilderConf, setIsLoading),
              __('Refresh Columns', 'bit-integrations')
            )}
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('WP Table Builder Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {wpTableBuilderConf?.field_map?.map((itm, i) => (
            <WpTableBuilderFieldMap
              key={`wptablebuilder-m-${i + 9}`}
              i={i}
              field={itm}
              wpTableBuilderConf={wpTableBuilderConf}
              formFields={formFields}
              setWpTableBuilderConf={setWpTableBuilderConf}
            />
          ))}
          {needsColumns && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(
                    wpTableBuilderConf.field_map.length,
                    wpTableBuilderConf,
                    setWpTableBuilderConf
                  )
                }
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          )}
          <br />
        </div>
      )}

      {mainAction === 'create_table' && (
        <Note
          note={__(
            'Table Content is rendered WP Table Builder HTML — a <table class="wptb-preview-table"> block, not the editor JSON. Copy it from an existing table, then map it as a Custom Value so ${field} tokens fill from the trigger. New tables are created as drafts.',
            'bit-integrations'
          )}
        />
      )}

      {mainAction === 'update_table' && (
        <Note
          note={__(
            'Map at least Title or Content — mapping only Table ID changes nothing. Unmapped fields keep their stored value.',
            'bit-integrations'
          )}
        />
      )}

      {mainAction === 'delete_table' && (
        <Note
          note={__(
            'The table is moved to the trash unless Delete Permanently is enabled under Utilities.',
            'bit-integrations'
          )}
        />
      )}

      {mainAction === 'add_row' && (
        <Note
          note={__(
            'The new row copies the layout of the table’s last row, so it keeps the existing styling. Cells left unmapped are added empty. Reorder or rename columns in WP Table Builder and refresh the columns here to match.',
            'bit-integrations'
          )}
        />
      )}

      {hasUtilities.includes(mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <WpTableBuilderActions
            wpTableBuilderConf={wpTableBuilderConf}
            setWpTableBuilderConf={setWpTableBuilderConf}
          />
        </div>
      )}
    </>
  )
}
