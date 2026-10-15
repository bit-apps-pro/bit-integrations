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
import FreshBooksActions from './FreshBooksActions'
import {
  clearScopedOptions,
  fetchActionSources,
  fetchSource,
  fetchSources,
  generateMappedField
} from './FreshBooksCommonFunc'
import FreshBooksFieldMap from './FreshBooksFieldMap'
import {
  fieldsByAction,
  modules,
  notesByAction,
  scopeKeyOf,
  selectKeys,
  selectsByAction,
  utilitiesByAction
} from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function FreshBooksIntegLayout({
  formFields,
  freshBooksConf,
  setFreshBooksConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const action = freshBooksConf?.mainAction
  const selects = selectsByAction[action] || []
  const scopeKey = scopeKeyOf(action)
  const isScopeSelected = !!freshBooksConf?.[scopeKey]

  useEffect(() => {
    if (action && freshBooksConf?.connection_id) {
      fetchActionSources(freshBooksConf, setFreshBooksConf, setIsLoading)
    }
  }, [])

  const handleMainAction = value => {
    const nextScopeKey = scopeKeyOf(value)
    const nextConf = create(freshBooksConf, draftConf => {
      draftConf.mainAction = value
      draftConf.field_map = generateMappedField(value)
      draftConf.utilities = {}
      selectKeys.forEach(key => {
        if (key !== nextScopeKey) delete draftConf[key]
      })
    })

    setFreshBooksConf(nextConf)
    fetchActionSources(nextConf, setFreshBooksConf, setIsLoading)
  }

  const handleScopeSelect = value => {
    const dependentSelects = selects.filter(select => select.key !== scopeKey && select.source)
    const nextConf = create(freshBooksConf, draftConf => {
      if (value) {
        draftConf[scopeKey] = value
      } else {
        delete draftConf[scopeKey]
      }

      dependentSelects.forEach(select => {
        delete draftConf[select.key]
      })
      clearScopedOptions(draftConf, scopeKey)
    })

    setFreshBooksConf(nextConf)

    if (value) {
      fetchSources(dependentSelects, nextConf, setFreshBooksConf, setIsLoading)
    }
  }

  const handleSelect = (select, value) => {
    if (select.key === scopeKey) {
      handleScopeSelect(value)
      return
    }

    setFreshBooksConf(prevConf =>
      create(prevConf, draftConf => {
        if (value) {
          draftConf[select.key] = value
        } else {
          delete draftConf[select.key]
        }
      })
    )
  }

  const selectOptions = select => {
    if (select.options) return select.options

    const items = freshBooksConf?.default?.[select.source] || []

    return items.map(({ id, name }) => ({
      label: items.filter(item => item.name === name).length > 1 ? `${name} (#${id})` : name,
      value: String(id)
    }))
  }

  const visibleSelects = selects.filter(select => select.key === scopeKey || isScopeSelected)

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
          options={modules?.map(module => ({
            disabled: !checkIsPro(isPro, module.is_pro),
            label: checkIsPro(isPro, module.is_pro) ? module.label : getProLabel(module.label),
            value: module.name
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {visibleSelects.map(select => {
        const options = selectOptions(select)

        return (
          <div key={`${action}-${select.key}-${options.length > 0 ? 'loaded' : 'empty'}`}>
            <br />
            <div className="flx">
              <b className="wdt-200 d-in-b">
                {select.label}
                {select.required && ' *'}
              </b>
              <MultiSelect
                title={select.key}
                defaultValue={freshBooksConf?.[select.key] ?? null}
                className="btcd-paper-drpdwn w-5"
                options={options}
                onChange={value => handleSelect(select, value)}
                singleSelect
                closeOnSelect
              />
              {select.source && (
                <button
                  onClick={() =>
                    fetchSource(select.source, freshBooksConf, setFreshBooksConf, setIsLoading)
                  }
                  className="icn-btn sh-sm ml-2 mr-2 tooltip"
                  style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
                  type="button"
                  disabled={isLoading}>
                  &#x21BB;
                </button>
              )}
            </div>
          </div>
        )
      })}

      {notesByAction[action] && (
        <>
          <br />
          <Note note={notesByAction[action]} />
        </>
      )}

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

      {fieldsByAction[action]?.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('FreshBooks Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {freshBooksConf?.field_map?.map((itm, i) => (
            <FreshBooksFieldMap
              key={`fb-m-${i + 9}`}
              i={i}
              field={itm}
              freshBooksConf={freshBooksConf}
              formFields={formFields}
              setFreshBooksConf={setFreshBooksConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(freshBooksConf.field_map.length, freshBooksConf, setFreshBooksConf)
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
          <FreshBooksActions freshBooksConf={freshBooksConf} setFreshBooksConf={setFreshBooksConf} />
        </div>
      )}
    </>
  )
}
