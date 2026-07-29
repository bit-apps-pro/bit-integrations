import { create } from 'mutative'
import { useEffect, useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField, refreshBitCrmList, syncRequiredFieldMap } from './BitCrmCommonFunc'
import BitCrmFieldMap from './BitCrmFieldMap'
import {
  actionDropdowns,
  actionSelects,
  actionUtilities,
  allConfigurableKeys,
  bitCrmStaticData,
  modules
} from './staticData'

export default function BitCrmIntegLayout({ formFields, bitCrmConf, setBitCrmConf }) {
  const { isPro } = useRecoilValue($appConfigState)
  const [isLoading, setIsLoading] = useState(false)

  const action = bitCrmConf?.mainAction
  const bitCrmFields = bitCrmStaticData[action] ?? []
  const dropdowns = actionDropdowns[action] ?? []
  const selects = actionSelects[action] ?? []
  const utilities = actionUtilities[action] ?? []

  // A config saved before a field became required still lists the old rows, and
  // the field map renders its required rows by position.
  useEffect(() => {
    if (!action || bitCrmFields.length === 0) return

    const synced = syncRequiredFieldMap(bitCrmConf?.field_map ?? [], bitCrmFields)
    if (synced === bitCrmConf?.field_map) return

    setBitCrmConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.field_map = synced
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action])

  const setField = (key, val) =>
    setBitCrmConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = val

        // A dependent list belongs to the value just replaced, so drop it along
        // with the selection made from it.
        ;[...selects, ...dropdowns]
          .filter(item => item.dependsOn === key)
          .forEach(item => {
            delete draftConf[item.key]
            delete draftConf[item.listKey]
          })
      })
    )

  const toggleUtility = key =>
    setBitCrmConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) draftConf.utilities = {}
        draftConf.utilities[key] = !draftConf.utilities[key]
      })
    )

  // Selects are stored flat on conf, and several of them write the same Bit CRM
  // field (status, type, lead source). Drop whatever the previous action left
  // behind, so a stale value can never be sent with the new action.
  const handleMainAction = value => {
    const keepKeys = new Set(
      [...(actionSelects[value] ?? []), ...(actionDropdowns[value] ?? [])].map(item => item.key)
    )

    setBitCrmConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.field_map = generateMappedField(bitCrmStaticData[value] ?? [])
        draftConf.utilities = {}

        allConfigurableKeys.forEach(key => {
          if (!keepKeys.has(key)) delete draftConf[key]
        })
      })
    )
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={action ?? null}
          className="mt-2 w-5"
          onChange={handleMainAction}
          options={modules?.map(mod => ({
            label: checkIsPro(isPro, mod.is_pro) ? mod.label : getProLabel(mod.label),
            value: mod.name,
            disabled: !checkIsPro(isPro, mod.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {/* Fixed enum selects */}
      {selects.map(sel => (
        <div className="flx mt-3" key={`bit-crm-sel-${sel.key}`}>
          <b className="wdt-200 d-in-b">
            {sel.label}
            {sel.required && <span className="required-icn">*</span>}:
          </b>
          <MultiSelect
            title={sel.key}
            defaultValue={bitCrmConf?.[sel.key] ?? null}
            className="btcd-paper-drpdwn w-5"
            options={sel.options}
            onChange={val => setField(sel.key, val)}
            singleSelect={!sel.multi}
            closeOnSelect={!sel.multi}
          />
          {sel.helperText && <small className="ml-2 txt-dp">{sel.helperText}</small>}
        </div>
      ))}

      {/* Fetched dropdowns */}
      {dropdowns.map(dd => (
        <div className="flx mt-3" key={`bit-crm-dd-${dd.key}-${dd.route}`}>
          <b className="wdt-200 d-in-b">
            {dd.label}
            {dd.required && <span className="required-icn">*</span>}:
          </b>
          <MultiSelect
            title={dd.key}
            defaultValue={bitCrmConf?.[dd.key] ?? null}
            className="btcd-paper-drpdwn w-5"
            options={(bitCrmConf?.[dd.listKey] ?? []).map(opt => ({
              label: opt.label,
              value: String(opt.value)
            }))}
            onChange={val => setField(dd.key, val)}
            singleSelect={!dd.multi}
            closeOnSelect={!dd.multi}
          />
          <button
            onClick={() =>
              refreshBitCrmList(
                dd.route,
                dd.listKey,
                setBitCrmConf,
                setIsLoading,
                dd.dependsOn ? { [dd.dependsOn]: bitCrmConf?.[dd.dependsOn] } : null
              )
            }
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading === dd.listKey || (dd.dependsOn && !bitCrmConf?.[dd.dependsOn])}>
            &#x21BB;
          </button>
          {dd.dependsOn && !bitCrmConf?.[dd.dependsOn] && (
            <small className="ml-2 txt-dp">{__('Select a module first.', 'bit-integrations')}</small>
          )}
        </div>
      ))}

      {/* Field map (map dynamic form fields onto free-text / identifier fields) */}
      {action && bitCrmFields.length > 0 && (
        <div className="mt-4">
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>

          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Bit CRM Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {bitCrmConf?.field_map?.map((field, i) => (
            <BitCrmFieldMap
              // eslint-disable-next-line react/no-array-index-key
              key={`bit-crm-fm-${i}`}
              i={i}
              field={field}
              formFields={formFields}
              bitCrmFields={bitCrmFields}
              bitCrmConf={bitCrmConf}
              setBitCrmConf={setBitCrmConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(bitCrmConf.field_map.length, bitCrmConf, setBitCrmConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
          </div>
        </div>
      )}

      {/* Utilities (booleans) */}
      {utilities.length > 0 && (
        <div className="mt-4">
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1 mb-2" />
          {utilities.map(util => (
            <TableCheckBox
              key={`bit-crm-util-${util.key}`}
              checked={bitCrmConf?.utilities?.[util.key] || false}
              onChange={() => toggleUtility(util.key)}
              className="wdt-200 mt-2 mr-2"
              value={util.key}
              title={util.label}
              subTitle={util.subTitle}
            />
          ))}
        </div>
      )}
    </>
  )
}
