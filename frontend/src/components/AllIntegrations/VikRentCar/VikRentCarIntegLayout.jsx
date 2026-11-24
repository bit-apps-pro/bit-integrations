import { useEffect } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import VikRentCarActions from './VikRentCarActions'
import { generateMappedField, refreshVikRentCarCars, requiredSelectKeys } from './VikRentCarCommonFunc'
import VikRentCarFieldMap from './VikRentCarFieldMap'
import {
  fieldsByAction,
  modules,
  needsCar,
  needsRentalStatus,
  notesByAction,
  rentalStatusOptions,
  utilitiesByAction
} from './staticData'

export default function VikRentCarIntegLayout({
  formFields,
  vikRentCarConf,
  setVikRentCarConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi
  const mainAction = vikRentCarConf?.mainAction

  const fetchListsFor = (action, conf) => {
    if (needsCar.includes(action) && !conf?.allCars) {
      refreshVikRentCarCars(setVikRentCarConf, setIsLoading)
    }
  }

  useEffect(() => {
    fetchListsFor(mainAction, vikRentCarConf)
  }, [])

  const handleMainAction = value => {
    setVikRentCarConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.vikRentCarFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.vikRentCarFields)
        draftConf.utilities = {}
        requiredSelectKeys.forEach(key => delete draftConf[key])
      })
    )

    fetchListsFor(value, vikRentCarConf)
  }

  const setConfValue = (key, value) => {
    setVikRentCarConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const renderSelect = ({ label, confKey, options, refresh, refreshTip }) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          key={`${confKey}-${options.length}`}
          title={confKey}
          defaultValue={vikRentCarConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={options}
          onChange={val => setConfValue(confKey, val)}
          singleSelect
          closeOnSelect
        />
        {refresh && (
          <button
            onClick={() => refresh(setVikRentCarConf, setIsLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${refreshTip}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        )}
      </div>
    </>
  )

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
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: !checkIsPro(isPro, action.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {needsCar.includes(mainAction) &&
        renderSelect({
          label: __('Car:', 'bit-integrations'),
          confKey: 'selectedCar',
          options: vikRentCarConf?.allCars || [],
          refresh: refreshVikRentCarCars,
          refreshTip: __('Refresh Cars', 'bit-integrations')
        })}

      {needsRentalStatus.includes(mainAction) &&
        renderSelect({
          label: __('Rental Status:', 'bit-integrations'),
          confKey: 'selectedRentalStatus',
          options: rentalStatusOptions
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

      {mainAction && vikRentCarConf.vikRentCarFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          {(notesByAction[mainAction] || []).map(note => (
            <p key={note} className="mt-2 mb-1">
              {note}
            </p>
          ))}
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('VikRentCar Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {vikRentCarConf?.field_map?.map((itm, i) => (
            <VikRentCarFieldMap
              key={`vik-rent-car-m-${i + 9}`}
              i={i}
              field={itm}
              vikRentCarConf={vikRentCarConf}
              formFields={formFields}
              setVikRentCarConf={setVikRentCarConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(vikRentCarConf.field_map.length, vikRentCarConf, setVikRentCarConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {mainAction && utilitiesByAction[mainAction] && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <VikRentCarActions vikRentCarConf={vikRentCarConf} setVikRentCarConf={setVikRentCarConf} />
        </div>
      )}
    </>
  )
}
