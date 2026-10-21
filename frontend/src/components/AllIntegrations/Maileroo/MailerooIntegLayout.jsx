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
import MailerooActions from './MailerooActions'
import {
  fetchActionSources,
  fetchSource,
  generateMappedField,
  syncMappedFields
} from './MailerooCommonFunc'
import MailerooFieldMap from './MailerooFieldMap'
import { modules, notesByAction, selectKeys, selectsByAction, utilitiesByAction } from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function MailerooIntegLayout({
  formFields,
  mailerooConf,
  setMailerooConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const action = mailerooConf?.mainAction
  const selects = selectsByAction[action] || []

  useEffect(() => {
    if (action && mailerooConf?.connection_id) {
      fetchActionSources(mailerooConf, setMailerooConf, setIsLoading)
    }
  }, [])

  const handleMainAction = value => {
    const nextConf = create(mailerooConf, draftConf => {
      draftConf.mainAction = value
      draftConf.utilities = {}
      selectKeys.forEach(key => {
        delete draftConf[key]
      })
    })

    nextConf.field_map = generateMappedField(nextConf)
    setMailerooConf(nextConf)
    fetchActionSources(nextConf, setMailerooConf, setIsLoading)
  }

  const handleSelect = (select, value) => {
    setMailerooConf(prevConf => {
      const nextConf = create(prevConf, draftConf => {
        if (value) {
          draftConf[select.key] = value
        } else {
          delete draftConf[select.key]
        }
      })

      return { ...nextConf, field_map: syncMappedFields(nextConf) }
    })
  }

  const selectOptions = select => {
    if (select.options) return select.options

    const items = mailerooConf?.default?.[select.source] || []

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
          <div key={`${action}-${select.key}`}>
            <br />
            <div className="flx">
              <b className="wdt-200 d-in-b">
                {select.label}
                {select.required && ' *'}
              </b>
              <MultiSelect
                key={`${select.key}-${options.length}`}
                title={select.key}
                defaultValue={mailerooConf?.[select.key] ?? null}
                className="btcd-paper-drpdwn w-5"
                options={options}
                onChange={value => handleSelect(select, value)}
                singleSelect={!select.multi}
                closeOnSelect={!select.multi}
              />
              {select.source && (
                <button
                  onClick={() => fetchSource(select.source, mailerooConf, setMailerooConf, setIsLoading)}
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

      {mailerooConf?.field_map?.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Maileroo Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {mailerooConf.field_map.map((itm, i) => (
            <MailerooFieldMap
              key={`mr-m-${i + 9}`}
              i={i}
              field={itm}
              mailerooConf={mailerooConf}
              formFields={formFields}
              setMailerooConf={setMailerooConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(mailerooConf.field_map.length, mailerooConf, setMailerooConf)}
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
          <MailerooActions mailerooConf={mailerooConf} setMailerooConf={setMailerooConf} />
        </div>
      )}
    </>
  )
}
