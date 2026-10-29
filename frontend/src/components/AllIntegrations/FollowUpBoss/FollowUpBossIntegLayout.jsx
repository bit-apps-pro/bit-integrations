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
import FollowUpBossActions from './FollowUpBossActions'
import { fetchActionSources, fetchSource, generateMappedField } from './FollowUpBossCommonFunc'
import FollowUpBossFieldMap from './FollowUpBossFieldMap'
import {
  customFieldActions,
  fieldsByAction,
  modules,
  notesByAction,
  selectKeys,
  selectsByAction,
  utilitiesByAction
} from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function FollowUpBossIntegLayout({
  formFields,
  followUpBossConf,
  setFollowUpBossConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const action = followUpBossConf?.mainAction
  const selects = selectsByAction[action] || []

  useEffect(() => {
    if (action && followUpBossConf?.connection_id) {
      fetchActionSources(followUpBossConf, setFollowUpBossConf, setIsLoading)
    }
  }, [])

  const handleMainAction = value => {
    const nextConf = create(followUpBossConf, draftConf => {
      draftConf.mainAction = value
      draftConf.field_map = generateMappedField(value)
      draftConf.utilities = {}
      selectKeys.forEach(key => {
        delete draftConf[key]
      })
    })

    setFollowUpBossConf(nextConf)
    fetchActionSources(nextConf, setFollowUpBossConf, setIsLoading)
  }

  const handleSelect = (select, value) => {
    setFollowUpBossConf(prevConf =>
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

    const items = followUpBossConf?.default?.[select.source] || []

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
                defaultValue={followUpBossConf?.[select.key] ?? null}
                className="btcd-paper-drpdwn w-5"
                options={options}
                onChange={value => handleSelect(select, value)}
                singleSelect={!select.multi}
                closeOnSelect={!select.multi}
              />
              {select.source && (
                <button
                  onClick={() =>
                    fetchSource(select.source, followUpBossConf, setFollowUpBossConf, setIsLoading)
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
          <div className="flx">
            <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
            {customFieldActions.includes(action) && (
              <button
                onClick={() =>
                  fetchSource('customFields', followUpBossConf, setFollowUpBossConf, setIsLoading)
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                data-refresh="customFields"
                style={{ '--tooltip-txt': `'${__('Refresh custom fields', 'bit-integrations')}'` }}
                type="button"
                disabled={isLoading}>
                &#x21BB;
              </button>
            )}
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Follow Up Boss Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {followUpBossConf?.field_map?.map((itm, i) => (
            <FollowUpBossFieldMap
              key={`fub-m-${i + 9}`}
              i={i}
              field={itm}
              followUpBossConf={followUpBossConf}
              formFields={formFields}
              setFollowUpBossConf={setFollowUpBossConf}
            />
          ))}

          {fieldsByAction[action].some(actionField => !actionField.required) && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(followUpBossConf.field_map.length, followUpBossConf, setFollowUpBossConf)
                }
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

      {utilitiesByAction[action]?.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <FollowUpBossActions
            followUpBossConf={followUpBossConf}
            setFollowUpBossConf={setFollowUpBossConf}
          />
        </div>
      )}
    </>
  )
}
