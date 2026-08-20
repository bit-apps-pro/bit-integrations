import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  ACTIONS,
  generateMappedField,
  refreshNinjaTables,
  refreshNinjaTablesColumns,
  refreshNinjaTablesRows,
  refreshNinjaTablesUsers
} from './NinjaTablesCommonFunc'
import NinjaTablesFieldMap from './NinjaTablesFieldMap'
import { modules } from './staticData'

const requiresFieldMap = action => [ACTIONS.ADD_ROW, ACTIONS.UPDATE_ROW].includes(action)

const hasData = (conf, key) => conf?.default?.[key]?.length > 0

export default function NinjaTablesIntegLayout({
  formID,
  formFields,
  ninjaTablesConf,
  setNinjaTablesConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const { isPro } = useRecoilValue($appConfigState)

  /**
   * Reset configuration fields when action changes
   */
  const resetConfigFields = draftConf => {
    delete draftConf.selectedTable
    delete draftConf.selectedRow
    delete draftConf.selectedUser
  }

  const autoFetchDataForAction = (action, hasDataLoaded) => {
    if (requiresFieldMap(action) && !hasDataLoaded('allTables')) {
      refreshNinjaTables(formID, setNinjaTablesConf, setIsLoading, setSnackbar)
    }
    if (action === ACTIONS.ADD_ROW && !hasDataLoaded('allUsers')) {
      refreshNinjaTablesUsers(formID, setNinjaTablesConf, setIsLoading, setSnackbar)
    }
  }

  const handleMainAction = value => {
    const previousAction = ninjaTablesConf.mainAction
    if (previousAction === value) return

    setNinjaTablesConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.field_map = generateMappedField(value)
        resetConfigFields(draftConf)
      })
    )

    // Auto-fetch data only if action changed
    const hasDataLoaded = key => hasData(ninjaTablesConf, key)
    autoFetchDataForAction(value, hasDataLoaded)
  }

  const handleTableChange = value => {
    setNinjaTablesConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.selectedTable = value
        delete draftConf.selectedRow
      })
    )

    const action = ninjaTablesConf.mainAction

    // Auto-fetch rows for update action
    if (action === ACTIONS.UPDATE_ROW) {
      refreshNinjaTablesRows(formID, value, setNinjaTablesConf, setIsLoading, setSnackbar)
    }

    // Auto-fetch columns for add/update actions
    if (requiresFieldMap(action)) {
      refreshNinjaTablesColumns(formID, value, setNinjaTablesConf, setIsLoading, setSnackbar)
    }
  }

  const updateConfig = (key, value) => {
    setNinjaTablesConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const renderRefreshButton = ({ onClick, tooltip, disabled = false }) => (
    <button
      onClick={onClick}
      className="icn-btn sh-sm ml-2 mr-2 tooltip"
      style={{ '--tooltip-txt': `'${tooltip}'` }}
      type="button"
      disabled={disabled || isLoading}>
      &#x21BB;
    </button>
  )

  const formatOptions = (items, labelKey, valueKey, labelFormatter) => {
    if (!Array.isArray(items)) return []
    return items.map(item => ({
      label: labelFormatter ? labelFormatter(item) : item[labelKey],
      value: item[valueKey]?.toString()
    }))
  }

  const showTableSelector = requiresFieldMap(ninjaTablesConf?.mainAction)
  const showUserSelector = ninjaTablesConf?.mainAction === ACTIONS.ADD_ROW
  const showRowSelector = ninjaTablesConf?.mainAction === ACTIONS.UPDATE_ROW

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={ninjaTablesConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={handleMainAction}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: !checkIsPro(isPro, action.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {showTableSelector && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Table:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedTable"
              defaultValue={ninjaTablesConf?.selectedTable ?? null}
              className="btcd-paper-drpdwn w-5"
              options={formatOptions(
                ninjaTablesConf?.default?.allTables,
                'table_name',
                'table_id',
                table => table.table_name || `Table #${table.table_id}`
              )}
              onChange={handleTableChange}
              singleSelect
              closeOnSelect
            />
            {renderRefreshButton({
              onClick: () => refreshNinjaTables(formID, setNinjaTablesConf, setIsLoading, setSnackbar),
              tooltip: __('Refresh Tables', 'bit-integrations')
            })}
          </div>
        </>
      )}

      {showUserSelector && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Owner (User):', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedUser"
              defaultValue={ninjaTablesConf?.selectedUser ?? null}
              className="btcd-paper-drpdwn w-5"
              options={formatOptions(ninjaTablesConf?.default?.allUsers, 'user_name', 'user_id')}
              onChange={val => updateConfig('selectedUser', val)}
              singleSelect
              closeOnSelect
            />
            {renderRefreshButton({
              onClick: () =>
                refreshNinjaTablesUsers(formID, setNinjaTablesConf, setIsLoading, setSnackbar),
              tooltip: __('Refresh Users', 'bit-integrations')
            })}
          </div>
        </>
      )}

      {showRowSelector && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Row:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedRow"
              defaultValue={ninjaTablesConf?.selectedRow ?? null}
              className="btcd-paper-drpdwn w-5"
              options={formatOptions(ninjaTablesConf?.default?.allRows, 'row_name', 'row_id')}
              onChange={val => updateConfig('selectedRow', val)}
              singleSelect
              closeOnSelect
              disabled={!ninjaTablesConf?.selectedTable}
            />
            {renderRefreshButton({
              onClick: () =>
                refreshNinjaTablesRows(
                  formID,
                  ninjaTablesConf.selectedTable,
                  setNinjaTablesConf,
                  setIsLoading,
                  setSnackbar
                ),
              tooltip: __('Refresh Rows', 'bit-integrations'),
              disabled: !ninjaTablesConf?.selectedTable
            })}
          </div>
        </>
      )}

      {showRowSelector && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Update Owner (Optional):', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedUser"
              defaultValue={ninjaTablesConf?.selectedUser ?? null}
              className="btcd-paper-drpdwn w-5"
              options={formatOptions(ninjaTablesConf?.default?.allUsers, 'user_name', 'user_id')}
              onChange={val => updateConfig('selectedUser', val)}
              singleSelect
              closeOnSelect
            />
            {renderRefreshButton({
              onClick: () =>
                refreshNinjaTablesUsers(formID, setNinjaTablesConf, setIsLoading, setSnackbar),
              tooltip: __('Refresh Users', 'bit-integrations')
            })}
          </div>
        </>
      )}

      {showTableSelector && (
        <>
          <br />
          <div className="mt-4">
            <b className="wdt-200">{__('Field Map', 'bit-integrations')}</b>
            {renderRefreshButton({
              onClick: () =>
                refreshNinjaTablesColumns(
                  formID,
                  ninjaTablesConf.selectedTable,
                  setNinjaTablesConf,
                  setIsLoading,
                  setSnackbar
                ),
              tooltip: __('Refresh Columns', 'bit-integrations'),
              disabled: !ninjaTablesConf?.selectedTable
            })}
            <br />
          </div>
          <div className="btcd-hr" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Table Columns', 'bit-integrations')}</b>
            </div>
          </div>

          {ninjaTablesConf?.field_map?.map((itm, i) => (
            <NinjaTablesFieldMap
              key={`ninja-m-${i + 9}`}
              i={i}
              field={itm}
              formFields={formFields}
              ninjaTablesConf={ninjaTablesConf}
              setNinjaTablesConf={setNinjaTablesConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(ninjaTablesConf.field_map?.length || 0, ninjaTablesConf, setNinjaTablesConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </>
      )}
    </>
  )
}
