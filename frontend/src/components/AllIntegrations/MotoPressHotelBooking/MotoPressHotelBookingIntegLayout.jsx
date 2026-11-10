import { useEffect } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import MotoPressHotelBookingActions from './MotoPressHotelBookingActions'
import {
  generateMappedField,
  getActionFields,
  refreshMotoPressHotelBookingAccommodations,
  refreshMotoPressHotelBookingAccommodationTypes,
  refreshMotoPressHotelBookingCountries,
  refreshMotoPressHotelBookingGateways,
  refreshMotoPressHotelBookingNoteAuthors,
  refreshMotoPressHotelBookingRates
} from './MotoPressHotelBookingCommonFunc'
import MotoPressHotelBookingFieldMap from './MotoPressHotelBookingFieldMap'
import {
  accommodationActions,
  accommodationTypeActions,
  actionNotes,
  COUPON_TYPE_OPTIONS,
  countryActions,
  fieldsByAction,
  modules,
  requiredAccommodationTypeActions,
  requiredStatusActions,
  STATUS_OPTIONS_BY_ACTION,
  UTILITIES_BY_ACTION
} from './staticData'

const SELECTED_KEYS = [
  'selectedAccommodationType',
  'selectedAccommodation',
  'selectedRate',
  'selectedCountry',
  'selectedStatus',
  'selectedGateway',
  'selectedAuthor',
  'selectedDiscountType',
  'selectedAccommodationTypes'
]

export default function MotoPressHotelBookingIntegLayout({
  formFields,
  motoPressHotelBookingConf,
  setMotoPressHotelBookingConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const loadTypeLists = accommodationTypeId => {
    const payload = { accommodationTypeId: accommodationTypeId || 0 }
    const loaders = [
      refreshMotoPressHotelBookingAccommodations(setMotoPressHotelBookingConf, null, false, payload)
    ]

    if (motoPressHotelBookingConf?.mainAction === 'create_booking') {
      loaders.push(refreshMotoPressHotelBookingRates(setMotoPressHotelBookingConf, null, false, payload))
    }

    return Promise.all(loaders)
  }

  const loadOptionLists = (action, accommodationTypeId) => {
    const loaders = []

    if (accommodationTypeActions.includes(action) || action === 'create_coupon') {
      loaders.push(refreshMotoPressHotelBookingAccommodationTypes)
    }

    if (countryActions.includes(action)) {
      loaders.push(refreshMotoPressHotelBookingCountries)
    }

    if (action === 'create_payment') {
      loaders.push(refreshMotoPressHotelBookingGateways)
    }

    if (action === 'add_booking_note') {
      loaders.push(refreshMotoPressHotelBookingNoteAuthors)
    }

    if (accommodationActions.includes(action)) {
      const payload = { accommodationTypeId: accommodationTypeId || 0 }
      loaders.push((setConf, setLoading, notify) =>
        refreshMotoPressHotelBookingAccommodations(setConf, setLoading, notify, payload)
      )

      if (action === 'create_booking') {
        loaders.push((setConf, setLoading, notify) =>
          refreshMotoPressHotelBookingRates(setConf, setLoading, notify, payload)
        )
      }
    }

    if (loaders.length > 0) {
      setIsLoading(true)
      Promise.all(loaders.map(load => load(setMotoPressHotelBookingConf, null, false))).finally(() =>
        setIsLoading(false)
      )
    }
  }

  useEffect(() => {
    if (motoPressHotelBookingConf?.mainAction) {
      loadOptionLists(
        motoPressHotelBookingConf.mainAction,
        motoPressHotelBookingConf.selectedAccommodationType
      )
    }
  }, [])

  const handleMainAction = value => {
    setMotoPressHotelBookingConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.field_map = generateMappedField(fieldsByAction[value] || [])
        draftConf.utilities = {}
        SELECTED_KEYS.forEach(key => delete draftConf[key])
      })
    )

    loadOptionLists(value)
  }

  const setConfValue = (key, value) => {
    setMotoPressHotelBookingConf(prevConf =>
      create(prevConf, draftConf => {
        if (value === '' || value === null || value === undefined) {
          delete draftConf[key]
        } else {
          draftConf[key] = value
        }

        if (key === 'selectedAccommodationType') {
          delete draftConf.selectedAccommodation
          delete draftConf.selectedRate
          draftConf.allAccommodations = []
          draftConf.allRates = []
        }
      })
    )

    if (key === 'selectedAccommodationType' && accommodationActions.includes(mainAction)) {
      setIsLoading(true)
      loadTypeLists(value).finally(() => setIsLoading(false))
    }
  }

  const toOptions = items =>
    (items || []).map(item => ({ label: item.label, value: item.value?.toString() }))

  const { mainAction } = motoPressHotelBookingConf || {}
  const actionFields = getActionFields(motoPressHotelBookingConf)
  const hasOptionalFields = actionFields.some(field => !field.required)
  const optionalLabel = label => `${label} ${__('(optional)', 'bit-integrations')}:`
  const requiredLabel = label => `${label}:`

  const selectRow = ({ confKey, label, options, required, refresh, refreshLabel, multi }) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{required ? requiredLabel(label) : optionalLabel(label)}</b>
        <MultiSelect
          key={`${confKey}-${options.length}`}
          title={confKey}
          defaultValue={motoPressHotelBookingConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={options}
          onChange={val => setConfValue(confKey, val)}
          singleSelect={!multi}
          closeOnSelect={!multi}
        />
        {refresh && (
          <button
            onClick={refresh}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${refreshLabel}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        )}
      </div>
    </>
  )

  const refreshTypes = () =>
    refreshMotoPressHotelBookingAccommodationTypes(setMotoPressHotelBookingConf, setIsLoading)

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

      {accommodationTypeActions.includes(mainAction) &&
        selectRow({
          confKey: 'selectedAccommodationType',
          label: __('Accommodation Type', 'bit-integrations'),
          options: toOptions(motoPressHotelBookingConf?.allAccommodationTypes),
          required: requiredAccommodationTypeActions.includes(mainAction),
          refresh: refreshTypes,
          refreshLabel: __('Refresh Accommodation Types', 'bit-integrations')
        })}

      {accommodationActions.includes(mainAction) &&
        selectRow({
          confKey: 'selectedAccommodation',
          label: __('Accommodation', 'bit-integrations'),
          options: toOptions(motoPressHotelBookingConf?.allAccommodations),
          required: false,
          refresh: () => {
            setIsLoading(true)
            loadTypeLists(motoPressHotelBookingConf?.selectedAccommodationType).finally(() =>
              setIsLoading(false)
            )
          },
          refreshLabel: __('Refresh Accommodations', 'bit-integrations')
        })}

      {mainAction === 'create_booking' &&
        selectRow({
          confKey: 'selectedRate',
          label: __('Rate', 'bit-integrations'),
          options: toOptions(motoPressHotelBookingConf?.allRates),
          required: false
        })}

      {countryActions.includes(mainAction) &&
        selectRow({
          confKey: 'selectedCountry',
          label: __('Country', 'bit-integrations'),
          options: toOptions(motoPressHotelBookingConf?.allCountries),
          required: false,
          refresh: () =>
            refreshMotoPressHotelBookingCountries(setMotoPressHotelBookingConf, setIsLoading),
          refreshLabel: __('Refresh Countries', 'bit-integrations')
        })}

      {STATUS_OPTIONS_BY_ACTION[mainAction] &&
        selectRow({
          confKey: 'selectedStatus',
          label: __('Status', 'bit-integrations'),
          options: STATUS_OPTIONS_BY_ACTION[mainAction],
          required: requiredStatusActions.includes(mainAction)
        })}

      {mainAction === 'create_payment' &&
        selectRow({
          confKey: 'selectedGateway',
          label: __('Payment Gateway', 'bit-integrations'),
          options: toOptions(motoPressHotelBookingConf?.allGateways),
          required: false,
          refresh: () =>
            refreshMotoPressHotelBookingGateways(setMotoPressHotelBookingConf, setIsLoading),
          refreshLabel: __('Refresh Payment Gateways', 'bit-integrations')
        })}

      {mainAction === 'add_booking_note' &&
        selectRow({
          confKey: 'selectedAuthor',
          label: __('Author', 'bit-integrations'),
          options: toOptions(motoPressHotelBookingConf?.allNoteAuthors),
          required: false,
          refresh: () =>
            refreshMotoPressHotelBookingNoteAuthors(setMotoPressHotelBookingConf, setIsLoading),
          refreshLabel: __('Refresh Authors', 'bit-integrations')
        })}

      {mainAction === 'create_coupon' && (
        <>
          {selectRow({
            confKey: 'selectedDiscountType',
            label: __('Discount Type', 'bit-integrations'),
            options: COUPON_TYPE_OPTIONS,
            required: false
          })}
          {selectRow({
            confKey: 'selectedAccommodationTypes',
            label: __('Accommodation Types', 'bit-integrations'),
            options: toOptions(motoPressHotelBookingConf?.allAccommodationTypes),
            required: false,
            refresh: refreshTypes,
            refreshLabel: __('Refresh Accommodation Types', 'bit-integrations'),
            multi: true
          })}
        </>
      )}

      {actionNotes[mainAction] && (
        <>
          <br />
          <Note note={actionNotes[mainAction]} />
        </>
      )}

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

      {mainAction && actionFields.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('MotoPress Hotel Booking Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {motoPressHotelBookingConf?.field_map?.map((itm, i) => (
            <MotoPressHotelBookingFieldMap
              key={`motopress-hotel-booking-m-${i + 9}`}
              i={i}
              field={itm}
              motoPressHotelBookingConf={motoPressHotelBookingConf}
              formFields={formFields}
              setMotoPressHotelBookingConf={setMotoPressHotelBookingConf}
            />
          ))}
          {hasOptionalFields && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(
                    motoPressHotelBookingConf.field_map.length,
                    motoPressHotelBookingConf,
                    setMotoPressHotelBookingConf
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

      {UTILITIES_BY_ACTION[mainAction] && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <MotoPressHotelBookingActions
            motoPressHotelBookingConf={motoPressHotelBookingConf}
            setMotoPressHotelBookingConf={setMotoPressHotelBookingConf}
          />
        </div>
      )}
    </>
  )
}
