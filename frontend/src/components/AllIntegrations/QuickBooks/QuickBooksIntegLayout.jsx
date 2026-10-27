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
import QuickBooksActions from './QuickBooksActions'
import { fetchActionSources, fetchSource, generateMappedField } from './QuickBooksCommonFunc'
import QuickBooksFieldMap from './QuickBooksFieldMap'
import {
  fieldsByAction,
  modules,
  notesByAction,
  selectKeys,
  selectsByAction,
  utilitiesByAction
} from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function QuickBooksIntegLayout({
  formFields,
  quickBooksConf,
  setQuickBooksConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const action = quickBooksConf?.mainAction
  const selects = selectsByAction[action] || []

  useEffect(() => {
    if (action && quickBooksConf?.connection_id) {
      fetchActionSources(quickBooksConf, setQuickBooksConf, setIsLoading)
    }
  }, [])

  const handleMainAction = value => {
    const nextConf = create(quickBooksConf, draftConf => {
      draftConf.mainAction = value
      draftConf.field_map = generateMappedField(value)
      draftConf.utilities = {}
      selectKeys.forEach(key => {
        delete draftConf[key]
      })
    })

    setQuickBooksConf(nextConf)
    fetchActionSources(nextConf, setQuickBooksConf, setIsLoading)
  }

  const handleSelect = (select, value) => {
    setQuickBooksConf(prevConf =>
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

    const items = quickBooksConf?.default?.[select.source] || []

    return items.map(({ id, name }) => ({
      label: items.filter(item => item.name === name).length > 1 ? `${name} (#${id})` : name,
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
          options={modules?.map(module => ({
            disabled: !checkIsPro(isPro, module.is_pro),
            label: checkIsPro(isPro, module.is_pro) ? module.label : getProLabel(module.label),
            value: module.name
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {selects.map(select => {
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
                defaultValue={quickBooksConf?.[select.key] ?? null}
                className="btcd-paper-drpdwn w-5"
                options={options}
                onChange={value => handleSelect(select, value)}
                singleSelect
                closeOnSelect
              />
              {select.source && (
                <button
                  onClick={() =>
                    fetchSource(select.source, quickBooksConf, setQuickBooksConf, setIsLoading)
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
              <b>{__('QuickBooks Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {quickBooksConf?.field_map?.map((itm, i) => (
            <QuickBooksFieldMap
              key={`qb-m-${i + 9}`}
              i={i}
              field={itm}
              quickBooksConf={quickBooksConf}
              formFields={formFields}
              setQuickBooksConf={setQuickBooksConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(quickBooksConf.field_map.length, quickBooksConf, setQuickBooksConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </div>
      )}

      {notesByAction[action] && (
        <>
          <br />
          <Note note={notesByAction[action]} />
        </>
      )}

      {utilitiesByAction[action]?.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <QuickBooksActions quickBooksConf={quickBooksConf} setQuickBooksConf={setQuickBooksConf} />
        </div>
      )}
    </>
  )
}
