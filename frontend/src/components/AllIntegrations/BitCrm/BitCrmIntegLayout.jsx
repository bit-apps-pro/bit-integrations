import { create } from 'mutative'
import { useEffect, useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  conditionalFields,
  CRM_FIELDS_KEY,
  crmLookupFields,
  crmMapFields,
  crmSelectFields,
  dropStaleConditionalRows,
  fetchBitCrmFields,
  generateMappedField,
  isEmptyValue,
  refreshBitCrmList,
  syncRequiredFieldMap
} from './BitCrmCommonFunc'
import BitCrmFieldMap from './BitCrmFieldMap'
import {
  actionDropdowns,
  actionFieldModules,
  actionSelects,
  actionUtilities,
  allConfigurableKeys,
  bitCrmStaticData,
  modules
} from './staticData'

export default function BitCrmIntegLayout({ formFields, bitCrmConf, setBitCrmConf }) {
  const { isPro } = useRecoilValue($appConfigState)
  const [isLoading, setIsLoading] = useState(false)
  const [lockedSelectKey, setLockedSelectKey] = useState(0)

  const action = bitCrmConf?.mainAction
  const staticFields = bitCrmStaticData[action] ?? []
  const dropdowns = actionDropdowns[action] ?? []
  const selects = actionSelects[action] ?? []
  const utilities = actionUtilities[action] ?? []
  const crmModule = actionFieldModules[action]

  const crmSelects = crmSelectFields(bitCrmConf)
  const crmLookups = crmLookupFields(bitCrmConf)
  const mappableFields = [...staticFields, ...conditionalFields(bitCrmConf), ...crmMapFields(bitCrmConf)]

  const requiredKeys = mappableFields
    .filter(fld => fld.required === true)
    .map(fld => fld.key)
    .join(',')

  // The field map renders its required rows by position, so they have to be re-keyed
  // when the required list changes.
  // Create only: on an update an unset select leaves the column alone, and
  // seeding one would start rewriting it.
  useEffect(() => {
    if (!crmModule || bitCrmConf?.crmFieldsModule === crmModule) return

    fetchBitCrmFields(crmModule, setBitCrmConf, setIsLoading)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crmModule])

  useEffect(() => {
    if (!action || mappableFields.length === 0) return

    const pruned = dropStaleConditionalRows(bitCrmConf?.field_map ?? [], mappableFields)
    const synced = syncRequiredFieldMap(pruned, mappableFields)
    if (synced === bitCrmConf?.field_map) return

    setBitCrmConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.field_map = synced
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, requiredKeys])

  useEffect(() => {
    if (!action) return

    const unseeded = selects.filter(
      sel => sel.defaultValue !== undefined && isEmptyValue(bitCrmConf?.[sel.key])
    )
    if (unseeded.length === 0) return

    setBitCrmConf(prevConf =>
      create(prevConf, draftConf => {
        unseeded.forEach(sel => {
          draftConf[sel.key] = sel.defaultValue
        })
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action])

  useEffect(() => {
    if (!action?.startsWith('create_')) return

    const unseeded = crmSelects.filter(
      sel => sel.defaultValue !== undefined && isEmptyValue(bitCrmConf?.fieldValues?.[sel.key])
    )
    if (unseeded.length === 0) return

    setBitCrmConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.fieldValues) draftConf.fieldValues = {}

        unseeded.forEach(sel => {
          draftConf.fieldValues[sel.key] = sel.defaultValue
        })
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, crmSelects.map(sel => sel.key).join(',')])

  const setField = (key, val) =>
    setBitCrmConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = val
        // A dependent list belongs to the value just replaced.
        ;[...selects, ...dropdowns]
          .filter(item => item.dependsOn === key)
          .forEach(item => {
            delete draftConf[item.key]
            delete draftConf[item.listKey]
          })
      })
    )

  const setCrmField = (key, val) =>
    setBitCrmConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.fieldValues) draftConf.fieldValues = {}
        draftConf.fieldValues[key] = val
      })
    )

  // A locked option can still be removed by its chip's delete button or by clear.
  // Remount on a rejected delete: the dropdown re-reads the prop only when the
  // string changes, and putting the value back leaves it unchanged.
  const handleSelectChange = (sel, val) => {
    if (!sel.lockedValues) {
      setField(sel.key, val)
      return
    }

    const picked = String(val ?? '')
      .split(',')
      .filter(Boolean)
    const locked = [
      ...sel.lockedValues,
      ...picked.filter(item => !sel.lockedValues.includes(item))
    ].join(',')

    if (locked !== val) setLockedSelectKey(prevKey => prevKey + 1)
    setField(sel.key, locked)
  }

  const selectOptions = sel =>
    sel.lockedValues
      ? sel.options.map(opt => (sel.lockedValues.includes(opt.value) ? { ...opt, disabled: true } : opt))
      : sel.options

  const toggleUtility = key =>
    setBitCrmConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) draftConf.utilities = {}
        draftConf.utilities[key] = !draftConf.utilities[key]
      })
    )

  // Selects are stored flat on conf and several write the same Bit CRM field, so
  // whatever the previous action left behind has to be dropped.
  const handleMainAction = value => {
    const keepKeys = new Set(
      [...(actionSelects[value] ?? []), ...(actionDropdowns[value] ?? [])].map(item => item.key)
    )

    setBitCrmConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.field_map = generateMappedField(bitCrmStaticData[value] ?? [])
        draftConf.utilities = {}
        draftConf.fieldValues = {}

        allConfigurableKeys.forEach(key => {
          if (!keepKeys.has(key)) delete draftConf[key]
        })
        ;(actionSelects[value] ?? []).forEach(sel => {
          if (sel.defaultValue !== undefined) draftConf[sel.key] = sel.defaultValue
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
          className="w-5"
          onChange={handleMainAction}
          options={modules?.map(mod => ({
            label: checkIsPro(isPro, mod.is_pro) ? mod.label : getProLabel(mod.label),
            value: mod.name,
            disabled: !checkIsPro(isPro, mod.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
        {crmModule && (
          <button
            onClick={() => fetchBitCrmFields(crmModule, setBitCrmConf, setIsLoading, true)}
            className="icn-btn sh-sm ml-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refetch Bit CRM Fields', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading === CRM_FIELDS_KEY}>
            &#x21BB;
          </button>
        )}
      </div>

      {selects.map(sel => (
        <div
          className="flx mt-3"
          key={`bit-crm-sel-${sel.key}${sel.lockedValues ? `-${lockedSelectKey}` : ''}`}>
          <b className="wdt-200 d-in-b">
            {sel.label}
            {sel.required && <span className="required-icn">*</span>}:
          </b>
          <MultiSelect
            title={sel.key}
            defaultValue={bitCrmConf?.[sel.key] ?? null}
            className="btcd-paper-drpdwn w-5"
            options={selectOptions(sel)}
            onChange={val => handleSelectChange(sel, val)}
            singleSelect={!sel.multi}
            closeOnSelect={!sel.multi}
          />
        </div>
      ))}

      {crmSelects.map(sel => (
        <div className="flx mt-3" key={`bit-crm-crm-sel-${sel.key}`}>
          <b className="wdt-200 d-in-b">
            {sel.label}
            {sel.required && <span className="required-icn">*</span>}:
          </b>
          <MultiSelect
            title={sel.key}
            defaultValue={bitCrmConf?.fieldValues?.[sel.key] ?? null}
            className="btcd-paper-drpdwn w-5"
            options={sel.options}
            onChange={val => setCrmField(sel.key, val)}
            singleSelect
            closeOnSelect
          />
        </div>
      ))}

      {crmLookups.map(lookup => (
        <div className="flx mt-3" key={`bit-crm-lookup-${lookup.key}`}>
          <b className="wdt-200 d-in-b">
            {lookup.label}
            {lookup.required && <span className="required-icn">*</span>}:
          </b>
          <MultiSelect
            title={lookup.key}
            defaultValue={bitCrmConf?.fieldValues?.[lookup.key] ?? null}
            className="btcd-paper-drpdwn w-5"
            options={(bitCrmConf?.[lookup.listKey] ?? []).map(opt => ({
              label: opt.label,
              value: String(opt.value)
            }))}
            onChange={val => setCrmField(lookup.key, val)}
            singleSelect
            closeOnSelect
          />
          <button
            onClick={() => refreshBitCrmList(lookup.route, lookup.listKey, setBitCrmConf, setIsLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading === lookup.listKey}>
            &#x21BB;
          </button>
        </div>
      ))}

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

      {action && mappableFields.length > 0 && (
        <div className="mt-4">
          <div className="flx mt-5">
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
              bitCrmFields={mappableFields}
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
