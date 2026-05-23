/* eslint-disable no-unused-vars */
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../IntegrationHelpers/FieldMapHelper'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import {
  getAllBoards,
  getAllGroups,
  getAllColumns,
  getAllItems,
  generateMappedField
} from './MondayComCommonFunc'
import MondayComFieldMap from './MondayComFieldMap'
import {
  staticFieldsMap,
  columnTypeList,
  needsBoard,
  needsItem,
  needsColumnMap
} from './staticData'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { create } from 'mutative'
import MondayComActions from './MondayComActions'

export default function MondayComIntegLayout({
  formFields,
  mondayComConf,
  setMondayComConf,
  loading,
  setLoading,
  isLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleActionChange = (value, name) => {
    const needBoard = needsBoard.includes(value)
    setMondayComConf(prevConf =>
      create(prevConf, draftConf => {
        if (value !== '') {
          draftConf[name] = value
        } else {
          delete draftConf[name]
        }

        delete draftConf.selectedBoard
        delete draftConf.selectedGroup
        delete draftConf.selectedItem
        delete draftConf.columns
        delete draftConf.groups
        delete draftConf.items
        delete draftConf.columnType
        delete draftConf.addToTop

        const base = staticFieldsMap[value] || []
        draftConf.mondayComFields = base
        draftConf.field_map = generateMappedField(base)
      })
    )

    if (needBoard) {
      getAllBoards(mondayComConf, setMondayComConf, setLoading)
    }
  }

  const handleBoardChange = val => {
    setMondayComConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.selectedBoard = val
        delete draftConf.selectedGroup
        delete draftConf.selectedItem
        delete draftConf.groups
        delete draftConf.items
        delete draftConf.columns
      })
    )

    if (!val) return

    const action = mondayComConf.mainAction

    getAllGroups(mondayComConf, setMondayComConf, val, setLoading)

    if (needsColumnMap.includes(action)) {
      getAllColumns(mondayComConf, setMondayComConf, val, setLoading)
    }
    if (needsItem.includes(action)) {
      getAllItems(mondayComConf, setMondayComConf, val, setLoading)
    }
  }

  const handleSelectChange = (val, name) => {
    setMondayComConf(prevConf =>
      create(prevConf, draftConf => {
        if (val === '' || val === null || val === undefined) {
          delete draftConf[name]
        } else {
          draftConf[name] = val
        }
      })
    )
  }

  const mainAction = mondayComConf?.mainAction
  const hasFieldMap =
    mainAction
    && (staticFieldsMap[mainAction]?.length > 0 || needsColumnMap.includes(mainAction))

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Select Action:', 'bit-integrations')}</b>
        <MultiSelect
          defaultValue={mainAction}
          value={mainAction}
          disabled={loading.board || loading.group || loading.column || loading.item}
          className="mt-2 w-5"
          onChange={val => handleActionChange(val, 'mainAction')}
          options={mondayComConf?.actionLists?.map(actionType => ({
            label: checkIsPro(isPro, actionType.is_pro)
              ? actionType.label
              : getProLabel(actionType.label),
            value: actionType.name,
            disabled: !checkIsPro(isPro, actionType.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {mainAction && needsBoard.includes(mainAction) && !loading.board && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Board:', 'bit-integrations')}</b>
            <MultiSelect
              options={
                mondayComConf?.boards?.map(b => ({ label: b.name, value: `${b.id}` })) || []
              }
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={mondayComConf?.selectedBoard}
              onChange={handleBoardChange}
              singleSelect
              closeOnSelect
              disabled={loading.board}
            />
            <button
              onClick={() => getAllBoards(mondayComConf, setMondayComConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Boards', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.board}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {mainAction
        && !['create_column', 'delete_group', 'archive_group', 'duplicate_group', 'archive_item', 'delete_item', 'move_item_to_group'].includes(mainAction)
        && mondayComConf?.selectedBoard
        && !loading.group && (
          <>
            <br />
            <div className="flx">
              <b className="wdt-200 d-in-b">{__('Select Group:', 'bit-integrations')}</b>
              <MultiSelect
                options={
                  mondayComConf?.groups?.map(g => ({ label: g.name, value: `${g.id}` })) || []
                }
                className="msl-wrp-options dropdown-custom-width"
                defaultValue={mondayComConf?.selectedGroup}
                onChange={val => handleSelectChange(val, 'selectedGroup')}
                singleSelect
                closeOnSelect
              />
              <button
                onClick={() =>
                  getAllGroups(
                    mondayComConf,
                    setMondayComConf,
                    mondayComConf.selectedBoard,
                    setLoading
                  )
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh Groups', 'bit-integrations')}'` }}
                type="button"
                disabled={loading.group}>
                &#x21BB;
              </button>
            </div>
          </>
        )}

      {mainAction
        && needsItem.includes(mainAction)
        && mondayComConf?.selectedBoard
        && !loading.item && (
          <>
            <br />
            <div className="flx">
              <b className="wdt-200 d-in-b">{__('Select Item:', 'bit-integrations')}</b>
              <MultiSelect
                options={
                  mondayComConf?.items?.map(it => ({ label: it.name, value: `${it.id}` })) || []
                }
                className="msl-wrp-options dropdown-custom-width"
                defaultValue={mondayComConf?.selectedItem}
                onChange={val => handleSelectChange(val, 'selectedItem')}
                singleSelect
                closeOnSelect
              />
              <button
                onClick={() =>
                  getAllItems(
                    mondayComConf,
                    setMondayComConf,
                    mondayComConf.selectedBoard,
                    setLoading
                  )
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh Items', 'bit-integrations')}'` }}
                type="button"
                disabled={loading.item}>
                &#x21BB;
              </button>
            </div>
          </>
        )}

      {mainAction === 'create_column' && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Column Type:', 'bit-integrations')}</b>
            <MultiSelect
              options={columnTypeList}
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={mondayComConf?.columnType}
              onChange={val => handleSelectChange(val, 'columnType')}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {(loading.board || loading.group || loading.column || loading.item) && (
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

      {mainAction && hasFieldMap && !isLoading && (
        <div>
          <br />
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>
          <br />
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Monday.com Fields', 'bit-integrations')}</b>
            </div>
          </div>
          {mondayComConf?.field_map?.map((itm, i) => (
            <MondayComFieldMap
              key={`mc-fm-${i + 9}`}
              i={i}
              field={itm}
              mondayComConf={mondayComConf}
              formFields={formFields}
              setMondayComConf={setMondayComConf}
            />
          ))}
          {needsColumnMap.includes(mainAction) && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(
                    mondayComConf.field_map.length,
                    mondayComConf,
                    setMondayComConf,
                    false
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

      {mainAction === 'duplicate_group' && (
        <>
          <br />
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <MondayComActions mondayComConf={mondayComConf} setMondayComConf={setMondayComConf} />
        </>
      )}
    </>
  )
}
