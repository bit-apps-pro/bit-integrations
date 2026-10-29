import { useEffect } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import BookneticActions from './BookneticActions'
import {
  generateMappedField,
  isFieldMapped,
  refreshBookneticOptions,
  selectsForAction
} from './BookneticCommonFunc'
import BookneticFieldMap from './BookneticFieldMap'
import Note from '../../Utilities/Note'
import { actionNotes, BookneticStaticData, modules, requiredSelects, utilities } from './staticData'

export default function BookneticIntegLayout({
  formFields,
  bookneticConf,
  setBookneticConf,
  isLoading,
  setIsLoading
}) {
  const { isPro } = useRecoilValue($appConfigState)
  const action = bookneticConf?.mainAction
  const actionSelects = selectsForAction(requiredSelects, action)

  const loadSources = sources => {
    if (!sources.size) {
      return
    }

    setIsLoading(true)
    Promise.all(
      [...sources].map(source => refreshBookneticOptions(source, setBookneticConf, () => {}))
    ).finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadSources(
      new Set(
        actionSelects
          .map(select => select.source)
          .filter(source => source && !bookneticConf?.default?.[source])
      )
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMainAction = value => {
    setBookneticConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.field_map = generateMappedField(BookneticStaticData[value] ?? [])
        draftConf.utilities = {}
        requiredSelects.forEach(select => delete draftConf[select.key])
      })
    )

    const sources = new Set(
      selectsForAction(requiredSelects, value)
        .map(select => select.source)
        .filter(Boolean)
    )
    loadSources(sources)
  }

  const selectOptions = select => select.options ?? bookneticConf?.default?.[select.source] ?? []

  const mapLabel = key =>
    (BookneticStaticData[action] ?? []).find(fieldDef => fieldDef.key === key)?.label ?? key

  const setSelect = (key, val) => {
    setBookneticConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = val
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
          onChange={value => handleMainAction(value)}
          options={modules.map(module => ({
            label: checkIsPro(isPro, module.is_pro) ? module.label : getProLabel(module.label),
            value: module.name,
            disabled: !checkIsPro(isPro, module.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {actionSelects.map(select => (
        <div key={`${action}-${select.key}`}>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{select.label}:</b>
            <MultiSelect
              title={select.key}
              defaultValue={bookneticConf?.[select.key] ?? null}
              className="btcd-paper-drpdwn w-5"
              key={selectOptions(select).length}
              options={selectOptions(select)}
              onChange={val => setSelect(select.key, val)}
              singleSelect={!select.multi}
              closeOnSelect={!select.multi}
            />
            {select.source && (
              <button
                onClick={() => refreshBookneticOptions(select.source, setBookneticConf, setIsLoading)}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh List', 'bit-integrations')}'` }}
                type="button"
                disabled={isLoading}>
                &#x21BB;
              </button>
            )}
          </div>
          {select.mapKey && (
            <small className="d-blk mt-1 txt-dp" style={{ marginLeft: 200 }}>
              {isFieldMapped(bookneticConf, select.mapKey)
                ? sprintf(
                    // translators: %s: field label
                    __('The mapped %s field is used.', 'bit-integrations'),
                    mapLabel(select.mapKey)
                  )
                : sprintf(
                    // translators: %s: field label
                    __('Or map the %s field below to use a value from the trigger.', 'bit-integrations'),
                    mapLabel(select.mapKey)
                  )}
            </small>
          )}
        </div>
      ))}

      {isLoading && (
        <Loader
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            transform: 'scale(0.7)'
          }}
        />
      )}

      {action && BookneticStaticData[action] && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Booknetic Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {bookneticConf?.field_map?.map((itm, i) => (
            <BookneticFieldMap
              key={`booknetic-m-${i + 9}`}
              i={i}
              field={itm}
              bookneticConf={bookneticConf}
              formFields={formFields}
              setBookneticConf={setBookneticConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(bookneticConf.field_map.length, bookneticConf, setBookneticConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {actionNotes[action] && <Note note={actionNotes[action]} />}

      {selectsForAction(utilities, action).length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <BookneticActions bookneticConf={bookneticConf} setBookneticConf={setBookneticConf} />
        </div>
      )}
    </>
  )
}
