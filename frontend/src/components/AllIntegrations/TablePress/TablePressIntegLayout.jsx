import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField } from './TablePressCommonFunc'
import TablePressFieldMap from './TablePressFieldMap'
import {
  actionNotes,
  fieldsByAction,
  modules,
  needsVisibility,
  tableIdNote,
  visibilityOptions
} from './staticData'

const selectKeys = ['selectedVisibility']

export default function TablePressIntegLayout({ formFields, tablePressConf, setTablePressConf }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setTablePressConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.tablePressFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.tablePressFields)
        selectKeys.forEach(key => {
          delete draftConf[key]
        })
      })
    )
  }

  const setConfValue = (key, value) => {
    setTablePressConf(prevConf =>
      create(prevConf, draftConf => {
        if (value) {
          draftConf[key] = value
        } else {
          delete draftConf[key]
        }
      })
    )
  }

  const { mainAction } = tablePressConf || {}
  const fields = tablePressConf?.tablePressFields || []
  const hasFields = fields.length > 0
  const hasOptionalFields = fields.some(field => !field.required)
  const usesTableId = fields.some(field => field.key === 'table_id')
  const renderSelect = (key, label, options) => (
    <div key={key}>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{`${label}:`}</b>
        <MultiSelect
          key={`${mainAction}-${key}`}
          title={key}
          defaultValue={tablePressConf?.[key] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={options}
          onChange={val => setConfValue(key, val)}
          singleSelect
          closeOnSelect
        />
      </div>
    </div>
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

      {needsVisibility.includes(mainAction) &&
        renderSelect('selectedVisibility', __('Visibility', 'bit-integrations'), visibilityOptions)}

      {mainAction && (actionNotes[mainAction] || usesTableId) && (
        <>
          <br />
          <Note note={actionNotes[mainAction] || tableIdNote}>
            {actionNotes[mainAction] && usesTableId && (
              <div className="note-text mt-2">{tableIdNote}</div>
            )}
          </Note>
        </>
      )}

      {mainAction && hasFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('TablePress Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {tablePressConf?.field_map?.map((itm, i) => (
            <TablePressFieldMap
              key={`tablepress-m-${i + 9}`}
              i={i}
              field={itm}
              tablePressConf={tablePressConf}
              formFields={formFields}
              setTablePressConf={setTablePressConf}
            />
          ))}
          {hasOptionalFields && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(tablePressConf.field_map.length, tablePressConf, setTablePressConf)
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
    </>
  )
}
