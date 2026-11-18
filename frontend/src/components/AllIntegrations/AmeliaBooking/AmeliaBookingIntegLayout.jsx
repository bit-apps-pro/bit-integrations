import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import AmeliaBookingActions from './AmeliaBookingActions'
import { generateMappedField, listConfKey, refreshAmeliaBookingLists } from './AmeliaBookingCommonFunc'
import AmeliaBookingFieldMap from './AmeliaBookingFieldMap'
import {
  fieldSets,
  listsByAction,
  modules,
  oneOfFieldsNote,
  selectsByAction,
  utilitiesByAction
} from './staticData'

const selectConfKeys = [
  ...new Set(
    Object.values(selectsByAction)
      .flat()
      .map(item => item.confKey)
  )
]

export default function AmeliaBookingIntegLayout({
  formFields,
  ameliaBookingConf,
  setAmeliaBookingConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setField = (key, value) =>
    setAmeliaBookingConf(prevConf =>
      create(prevConf, draftConf => {
        if (value) {
          draftConf[key] = value
        } else {
          delete draftConf[key]
        }
      })
    )

  const handleMainAction = value => {
    setAmeliaBookingConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        selectConfKeys.forEach(key => {
          delete draftConf[key]
        })
        draftConf.ameliaBookingFields = fieldSets[value] || []
        draftConf.field_map = generateMappedField(draftConf.ameliaBookingFields)
        draftConf.utilities = {}
      })
    )

    refreshAmeliaBookingLists(listsByAction[value] || [], setAmeliaBookingConf, setIsLoading)
  }

  const mainAction = ameliaBookingConf?.mainAction
  const selects = selectsByAction[mainAction] || []

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules.map(item => ({
            label: checkIsPro(isPro, item.is_pro) ? item.label : getProLabel(item.label),
            value: item.name,
            disabled: !checkIsPro(isPro, item.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {selects.map(({ confKey, label, list, multi, options }) => {
        const selectOptions = list ? ameliaBookingConf?.[listConfKey(list)] || [] : options

        return (
          <div key={`${mainAction}-${confKey}`}>
            <br />
            <div className="flx">
              <b className="wdt-200 d-in-b">{label}</b>
              <MultiSelect
                key={`${mainAction}-${confKey}-${selectOptions.length}`}
                title={confKey}
                defaultValue={ameliaBookingConf?.[confKey] ?? null}
                className="btcd-paper-drpdwn w-5"
                options={selectOptions}
                onChange={val => setField(confKey, val)}
                singleSelect={!multi}
                closeOnSelect={!multi}
              />
              {list && (
                <button
                  onClick={() => refreshAmeliaBookingLists([list], setAmeliaBookingConf, setIsLoading)}
                  className="icn-btn sh-sm ml-2 mr-2 tooltip"
                  style={{ '--tooltip-txt': `'${__('Refresh the list', 'bit-integrations')}'` }}
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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            transform: 'scale(0.7)'
          }}
        />
      )}

      {mainAction && ameliaBookingConf?.ameliaBookingFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          {oneOfFieldsNote[mainAction] && (
            <p className="mt-2 mb-0 txt-dp">{oneOfFieldsNote[mainAction]}</p>
          )}
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Amelia Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {ameliaBookingConf?.field_map?.map((itm, i) => (
            <AmeliaBookingFieldMap
              key={`amelia-booking-m-${i + 9}`}
              i={i}
              field={itm}
              ameliaBookingConf={ameliaBookingConf}
              formFields={formFields}
              setAmeliaBookingConf={setAmeliaBookingConf}
            />
          ))}
          {ameliaBookingConf.ameliaBookingFields.some(item => !item.required) && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(
                    ameliaBookingConf.field_map.length,
                    ameliaBookingConf,
                    setAmeliaBookingConf
                  )
                }
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          )}
          <br />
        </div>
      )}

      {mainAction && utilitiesByAction[mainAction] && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <AmeliaBookingActions
            ameliaBookingConf={ameliaBookingConf}
            setAmeliaBookingConf={setAmeliaBookingConf}
          />
        </div>
      )}
    </>
  )
}
