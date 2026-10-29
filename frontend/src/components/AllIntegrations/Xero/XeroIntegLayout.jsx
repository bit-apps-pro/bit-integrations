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
import { fetchActionSources, fetchSource, generateMappedField } from './XeroCommonFunc'
import XeroFieldMap from './XeroFieldMap'
import { fieldsByAction, modules, notesByAction, selectKeys, selectsByAction } from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function XeroIntegLayout({ formFields, xeroConf, setXeroConf, isLoading, setIsLoading }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const action = xeroConf?.mainAction
  const selects = selectsByAction[action] || []

  useEffect(() => {
    if (action && xeroConf?.connection_id) {
      fetchActionSources(xeroConf, setXeroConf, setIsLoading)
    }
  }, [])

  const handleMainAction = value => {
    const nextConf = create(xeroConf, draftConf => {
      draftConf.mainAction = value
      draftConf.field_map = generateMappedField(value)
      draftConf.utilities = {}
      selectKeys.forEach(key => {
        delete draftConf[key]
      })
    })

    setXeroConf(nextConf)
    fetchActionSources(nextConf, setXeroConf, setIsLoading)
  }

  const handleSelect = (select, value) => {
    setXeroConf(prevConf =>
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

    const items = xeroConf?.default?.[select.source] || []

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
                defaultValue={xeroConf?.[select.key] ?? null}
                className="btcd-paper-drpdwn w-5"
                options={options}
                onChange={value => handleSelect(select, value)}
                singleSelect
                closeOnSelect
              />
              {select.source && (
                <button
                  onClick={() => fetchSource(select.source, xeroConf, setXeroConf, setIsLoading)}
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
              <b>{__('Xero Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {xeroConf?.field_map?.map((itm, i) => (
            <XeroFieldMap
              key={`xero-m-${i + 9}`}
              i={i}
              field={itm}
              xeroConf={xeroConf}
              formFields={formFields}
              setXeroConf={setXeroConf}
            />
          ))}

          {fieldsByAction[action].some(actionField => !actionField.required) && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() => addFieldMap(xeroConf.field_map.length, xeroConf, setXeroConf)}
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          )}
        </div>
      )}

      {notesByAction[action] && (
        <>
          <br />
          <Note note={notesByAction[action]} />
        </>
      )}
    </>
  )
}
