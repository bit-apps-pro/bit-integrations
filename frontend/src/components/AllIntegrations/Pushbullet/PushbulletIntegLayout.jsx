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
import PushbulletActions from './PushbulletActions'
import { fetchActionSources, fetchSource, generateMappedField } from './PushbulletCommonFunc'
import PushbulletFieldMap from './PushbulletFieldMap'
import {
  customKeyActions,
  fieldsByAction,
  modules,
  notesByAction,
  selectKeys,
  selectsByAction,
  utilitiesByAction
} from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function PushbulletIntegLayout({
  formFields,
  pushbulletConf,
  setPushbulletConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const action = pushbulletConf?.mainAction
  const selects = selectsByAction[action] || []

  useEffect(() => {
    if (action && pushbulletConf?.connection_id) {
      fetchActionSources(pushbulletConf, setPushbulletConf, setIsLoading)
    }
  }, [])

  const handleMainAction = value => {
    const nextConf = create(pushbulletConf, draftConf => {
      draftConf.mainAction = value
      draftConf.field_map = [{ pushbulletField: '', formField: '' }]
      draftConf.utilities = {}
      selectKeys.forEach(key => {
        delete draftConf[key]
      })
    })

    nextConf.field_map = generateMappedField(nextConf)
    setPushbulletConf(nextConf)
    fetchActionSources(nextConf, setPushbulletConf, setIsLoading)
  }

  const handleSelect = (select, value) => {
    setPushbulletConf(prevConf =>
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

    const items = pushbulletConf?.default?.[select.source] || []

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
              title={select.key}
              defaultValue={pushbulletConf?.[select.key] ?? null}
              className="btcd-paper-drpdwn w-5"
              options={selectOptions(select)}
              onChange={value => handleSelect(select, value)}
              singleSelect
              closeOnSelect
            />
            {select.source && (
              <button
                onClick={() =>
                  fetchSource(select.source, pushbulletConf, setPushbulletConf, setIsLoading)
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

      {(fieldsByAction[action]?.length > 0 || customKeyActions.includes(action)) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Pushbullet Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {pushbulletConf?.field_map?.map((itm, i) => (
            <PushbulletFieldMap
              key={`pb-m-${i + 9}`}
              i={i}
              field={itm}
              pushbulletConf={pushbulletConf}
              formFields={formFields}
              setPushbulletConf={setPushbulletConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(pushbulletConf.field_map.length, pushbulletConf, setPushbulletConf)
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
          <PushbulletActions pushbulletConf={pushbulletConf} setPushbulletConf={setPushbulletConf} />
        </div>
      )}
    </>
  )
}
