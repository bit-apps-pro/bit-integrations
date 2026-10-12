import { useEffect } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../GlobalIntegrationHelper'
import MicrosoftExcelActions from './MicrosoftExcelActions'
import { fetchActionSources, fetchSource, generateMappedField } from './MicrosoftExcelCommonFunc'
import MicrosoftExcelFieldMap from './MicrosoftExcelFieldMap'
import {
  modules,
  notesByAction,
  rowActions,
  selectKeys,
  selectsByAction,
  utilitiesByAction
} from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const dependentsOf = (selects, key) =>
  selects
    .filter(select => select.dependsOn === key)
    .flatMap(select => [select, ...dependentsOf(selects, select.key)])

export default function MicrosoftExcelIntegLayout({
  formFields,
  microsoftExcelConf,
  setMicrosoftExcelConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const action = microsoftExcelConf?.mainAction
  const selects = selectsByAction[action] || []
  const isRowAction = rowActions.includes(action)

  useEffect(() => {
    if (action && microsoftExcelConf?.connection_id) {
      fetchActionSources(microsoftExcelConf, setMicrosoftExcelConf, setIsLoading)
    }
  }, [])

  const handleMainAction = value => {
    const keptSelects = (selectsByAction[value] || []).map(select => select.key)

    const nextConf = create(microsoftExcelConf, draftConf => {
      draftConf.mainAction = value
      draftConf.field_map = generateMappedField({ mainAction: value })
      draftConf.utilities = {}
      selectKeys
        .filter(key => !keptSelects.includes(key))
        .forEach(key => {
          delete draftConf[key]
        })
    })

    setMicrosoftExcelConf(nextConf)
    fetchActionSources(nextConf, setMicrosoftExcelConf, setIsLoading)
  }

  const handleSelect = (select, value) => {
    const dependents = dependentsOf(selects, select.key)

    const nextConf = create(microsoftExcelConf, draftConf => {
      if (value) {
        draftConf[select.key] = value
      } else {
        delete draftConf[select.key]
      }

      dependents.forEach(dependent => {
        delete draftConf[dependent.key]
      })
    })

    setMicrosoftExcelConf(nextConf)

    dependents.forEach(dependent =>
      fetchSource(dependent.source, nextConf, setMicrosoftExcelConf, setIsLoading, true)
    )

    if (isRowAction) {
      fetchSource('columns', nextConf, setMicrosoftExcelConf, setIsLoading, true)
    }
  }

  const selectOptions = select => {
    const items = microsoftExcelConf?.default?.[select.source] || []
    const nameCounts = items.reduce(
      (counts, { name }) => counts.set(name, (counts.get(name) || 0) + 1),
      new Map()
    )

    return items.map(({ id, name }) => ({
      label: nameCounts.get(name) > 1 ? `${name} (#${id})` : name,
      value: String(id)
    }))
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
          onChange={value => handleMainAction(value)}
          options={modules.map(module => ({
            disabled: !checkIsPro(isPro, module.is_pro),
            label: checkIsPro(isPro, module.is_pro) ? module.label : getProLabel(module.label),
            value: module.name
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {selects.map(select => (
        <div key={`${action}-${select.key}`}>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">
              {select.label}
              {select.required && ' *'}
            </b>
            <MultiSelect
              key={`${select.key}-${select.dependsOn ? microsoftExcelConf?.[select.dependsOn] || '' : ''}`}
              title={select.key}
              defaultValue={microsoftExcelConf?.[select.key] ?? null}
              className="btcd-paper-drpdwn w-5"
              options={selectOptions(select)}
              onChange={value => handleSelect(select, value)}
              placeholder={select.placeholder}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() =>
                fetchSource(select.source, microsoftExcelConf, setMicrosoftExcelConf, setIsLoading)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </div>
      ))}

      {isLoading && (
        <Loader
          style={{
            alignItems: 'center',
            display: 'flex',
            height: 100,
            justifyContent: 'center',
            transform: 'scale(0.7)'
          }}
        />
      )}

      {action && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          {isRowAction && (
            <button
              onClick={() =>
                fetchSource('columns', microsoftExcelConf, setMicrosoftExcelConf, setIsLoading)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh columns', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading || !microsoftExcelConf?.worksheet_id}>
              &#x21BB;
            </button>
          )}
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Microsoft Excel Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {microsoftExcelConf?.field_map?.map((itm, i) => (
            <MicrosoftExcelFieldMap
              key={`mse-m-${i + 9}`}
              i={i}
              field={itm}
              microsoftExcelConf={microsoftExcelConf}
              formFields={formFields}
              setMicrosoftExcelConf={setMicrosoftExcelConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(
                  microsoftExcelConf.field_map.length,
                  microsoftExcelConf,
                  setMicrosoftExcelConf
                )
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </div>
      )}

      {utilitiesByAction[action]?.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <MicrosoftExcelActions
            microsoftExcelConf={microsoftExcelConf}
            setMicrosoftExcelConf={setMicrosoftExcelConf}
          />
        </div>
      )}

      {notesByAction[action] && (
        <div className="mt-4">
          <Note note={notesByAction[action]} />
        </div>
      )}
    </>
  )
}
