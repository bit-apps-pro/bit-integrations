import { useEffect } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../GlobalIntegrationHelper'
import EventbriteActions from './EventbriteActions'
import { fetchActionSources, fetchSource, generateMappedField } from './EventbriteCommonFunc'
import EventbriteFieldMap from './EventbriteFieldMap'
import { modules, selectKeys, selectsByAction, utilitiesByAction } from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function EventbriteIntegLayout({
  formFields,
  eventbriteConf,
  setEventbriteConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const action = eventbriteConf?.mainAction
  const selects = selectsByAction[action] || []

  useEffect(() => {
    if (action && eventbriteConf?.connection_id) {
      fetchActionSources(eventbriteConf, setEventbriteConf, setIsLoading)
    }
  }, [])

  const handleMainAction = value => {
    const nextConf = create(eventbriteConf, draftConf => {
      draftConf.mainAction = value
      draftConf.field_map = [{ eventbriteField: '', formField: '' }]
      draftConf.utilities = {}
      selectKeys.forEach(key => {
        delete draftConf[key]
      })
    })

    nextConf.field_map = generateMappedField(nextConf)
    setEventbriteConf(nextConf)
    fetchActionSources(nextConf, setEventbriteConf, setIsLoading)
  }

  const handleSelect = (select, value) => {
    const nextValue = select.multi ? value.split(',').filter(Boolean) : value
    const dependents = selects.filter(item => item.dependsOn === select.key)

    const nextConf = create(eventbriteConf, draftConf => {
      if (nextValue.length) {
        draftConf[select.key] = nextValue
      } else {
        delete draftConf[select.key]
      }

      dependents.forEach(dependent => {
        delete draftConf[dependent.key]
      })
    })

    setEventbriteConf(nextConf)

    dependents.forEach(dependent =>
      fetchSource(dependent.source, nextConf, setEventbriteConf, setIsLoading, true)
    )
  }

  const selectOptions = select => {
    if (select.options) return select.options

    const items = eventbriteConf?.default?.[select.source] || []

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

      {selects.map(select => (
        <div key={`${action}-${select.key}`}>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">
              {select.label}
              {select.required && ' *'}
            </b>
            <MultiSelect
              key={`${select.key}-${select.dependsOn ? eventbriteConf?.[select.dependsOn] || '' : ''}`}
              title={select.key}
              defaultValue={eventbriteConf?.[select.key] ?? null}
              className="btcd-paper-drpdwn w-5"
              options={selectOptions(select)}
              onChange={value => handleSelect(select, value)}
              singleSelect={!select.multi}
              closeOnSelect={!select.multi}
            />
            {select.source && (
              <button
                onClick={() =>
                  fetchSource(select.source, eventbriteConf, setEventbriteConf, setIsLoading)
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
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Eventbrite Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {eventbriteConf?.field_map?.map((itm, i) => (
            <EventbriteFieldMap
              key={`eb-m-${i + 9}`}
              i={i}
              field={itm}
              eventbriteConf={eventbriteConf}
              formFields={formFields}
              setEventbriteConf={setEventbriteConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(eventbriteConf.field_map.length, eventbriteConf, setEventbriteConf)
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
          <EventbriteActions eventbriteConf={eventbriteConf} setEventbriteConf={setEventbriteConf} />
        </div>
      )}
    </>
  )
}
