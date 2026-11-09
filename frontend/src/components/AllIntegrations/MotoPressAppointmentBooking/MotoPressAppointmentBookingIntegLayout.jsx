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
import MotoPressAppointmentBookingActions from './MotoPressAppointmentBookingActions'
import {
  generateMappedField,
  getActionFields,
  refreshMotoPressAppointmentBookingCurrencies,
  refreshMotoPressAppointmentBookingEmployees,
  refreshMotoPressAppointmentBookingGateways,
  refreshMotoPressAppointmentBookingLocations,
  refreshMotoPressAppointmentBookingServices,
  refreshMotoPressAppointmentBookingUsers
} from './MotoPressAppointmentBookingCommonFunc'
import MotoPressAppointmentBookingFieldMap from './MotoPressAppointmentBookingFieldMap'
import {
  actionNotes,
  BOOKING_STATUS_OPTIONS,
  bookingStatusActions,
  COUPON_STATUS_OPTIONS,
  COUPON_TYPE_OPTIONS,
  couponActions,
  fieldsByAction,
  hasUtilities,
  modules,
  PAYMENT_STATUS_OPTIONS,
  paymentStatusActions,
  scheduleActions,
  userActions
} from './staticData'

const SELECTED_KEYS = [
  'selectedService',
  'selectedEmployee',
  'selectedLocation',
  'selectedStatus',
  'selectedGateway',
  'selectedCurrency',
  'selectedUser',
  'selectedServices',
  'selectedCouponType',
  'selectedCouponStatus'
]

export default function MotoPressAppointmentBookingIntegLayout({
  formFields,
  motoPressAppointmentBookingConf,
  setMotoPressAppointmentBookingConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const loadOptionLists = action => {
    const loaders = []

    if (action === 'create_booking' || couponActions.includes(action)) {
      loaders.push(refreshMotoPressAppointmentBookingServices)
    }

    if (scheduleActions.includes(action)) {
      loaders.push(
        refreshMotoPressAppointmentBookingEmployees,
        refreshMotoPressAppointmentBookingLocations
      )
    }

    if (action === 'create_payment') {
      loaders.push(
        refreshMotoPressAppointmentBookingGateways,
        refreshMotoPressAppointmentBookingCurrencies
      )
    }

    if (userActions.includes(action)) {
      loaders.push(refreshMotoPressAppointmentBookingUsers)
    }

    if (loaders.length > 0) {
      setIsLoading(true)
      Promise.all(loaders.map(load => load(setMotoPressAppointmentBookingConf, null, false))).finally(
        () => setIsLoading(false)
      )
    }
  }

  useEffect(() => {
    if (motoPressAppointmentBookingConf?.mainAction) {
      loadOptionLists(motoPressAppointmentBookingConf.mainAction)
    }
  }, [])

  const handleMainAction = value => {
    setMotoPressAppointmentBookingConf(prevConf =>
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
    setMotoPressAppointmentBookingConf(prevConf =>
      create(prevConf, draftConf => {
        if (value === '' || value === null || value === undefined) {
          delete draftConf[key]
        } else {
          draftConf[key] = value
        }
      })
    )
  }

  const toOptions = items =>
    (items || []).map(item => ({ label: item.label, value: item.value?.toString() }))

  const { mainAction } = motoPressAppointmentBookingConf || {}
  const actionFields = getActionFields(motoPressAppointmentBookingConf)
  const hasOptionalFields = actionFields.some(field => !field.required)
  const optionalLabel = label => `${label} ${__('(optional)', 'bit-integrations')}:`
  const requiredLabel = label => `${label}:`

  const selectRow = ({ confKey, label, options, required, refresh, refreshLabel, multi, note }) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{required ? requiredLabel(label) : optionalLabel(label)}</b>
        <MultiSelect
          key={`${confKey}-${options.length}`}
          title={confKey}
          defaultValue={motoPressAppointmentBookingConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={options}
          onChange={val => setConfValue(confKey, val)}
          singleSelect={!multi}
          closeOnSelect={!multi}
        />
        {refresh && (
          <button
            onClick={() => refresh(setMotoPressAppointmentBookingConf, setIsLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${refreshLabel}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        )}
      </div>
      {note && (
        <>
          <br />
          <Note note={note} />
        </>
      )}
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

      {mainAction === 'create_booking' &&
        selectRow({
          confKey: 'selectedService',
          label: __('Service', 'bit-integrations'),
          options: toOptions(motoPressAppointmentBookingConf?.allServices),
          required: true,
          refresh: refreshMotoPressAppointmentBookingServices,
          refreshLabel: __('Refresh Services', 'bit-integrations')
        })}

      {scheduleActions.includes(mainAction) && (
        <>
          {selectRow({
            confKey: 'selectedEmployee',
            label: __('Employee', 'bit-integrations'),
            options: toOptions(motoPressAppointmentBookingConf?.allEmployees),
            required: false,
            refresh: refreshMotoPressAppointmentBookingEmployees,
            refreshLabel: __('Refresh Employees', 'bit-integrations')
          })}
          {selectRow({
            confKey: 'selectedLocation',
            label: __('Location', 'bit-integrations'),
            options: toOptions(motoPressAppointmentBookingConf?.allLocations),
            required: false,
            refresh: refreshMotoPressAppointmentBookingLocations,
            refreshLabel: __('Refresh Locations', 'bit-integrations')
          })}
        </>
      )}

      {bookingStatusActions.includes(mainAction) &&
        selectRow({
          confKey: 'selectedStatus',
          label: __('Status', 'bit-integrations'),
          options: BOOKING_STATUS_OPTIONS,
          required: mainAction === 'change_booking_status',
          note:
            mainAction === 'create_booking' &&
            __(
              'Leave Status empty to use the status from the plugin confirmation settings.',
              'bit-integrations'
            )
        })}

      {paymentStatusActions.includes(mainAction) &&
        selectRow({
          confKey: 'selectedStatus',
          label: __('Status', 'bit-integrations'),
          options: PAYMENT_STATUS_OPTIONS,
          required: mainAction === 'change_payment_status'
        })}

      {mainAction === 'create_payment' && (
        <>
          {selectRow({
            confKey: 'selectedGateway',
            label: __('Payment Gateway', 'bit-integrations'),
            options: toOptions(motoPressAppointmentBookingConf?.allGateways),
            required: false,
            refresh: refreshMotoPressAppointmentBookingGateways,
            refreshLabel: __('Refresh Payment Gateways', 'bit-integrations')
          })}
          {selectRow({
            confKey: 'selectedCurrency',
            label: __('Currency', 'bit-integrations'),
            options: toOptions(motoPressAppointmentBookingConf?.allCurrencies),
            required: false,
            refresh: refreshMotoPressAppointmentBookingCurrencies,
            refreshLabel: __('Refresh Currencies', 'bit-integrations')
          })}
        </>
      )}

      {userActions.includes(mainAction) &&
        selectRow({
          confKey: 'selectedUser',
          label: __('WordPress User', 'bit-integrations'),
          options: toOptions(motoPressAppointmentBookingConf?.allUsers),
          required: false,
          refresh: refreshMotoPressAppointmentBookingUsers,
          refreshLabel: __('Refresh Users', 'bit-integrations')
        })}

      {couponActions.includes(mainAction) && (
        <>
          {selectRow({
            confKey: 'selectedCouponType',
            label: __('Discount Type', 'bit-integrations'),
            options: COUPON_TYPE_OPTIONS,
            required: false,
            note:
              mainAction === 'create_coupon' &&
              __('Leave Discount Type empty to use a fixed discount.', 'bit-integrations')
          })}
          {selectRow({
            confKey: 'selectedServices',
            label: __('Services', 'bit-integrations'),
            options: toOptions(motoPressAppointmentBookingConf?.allServices),
            required: false,
            refresh: refreshMotoPressAppointmentBookingServices,
            refreshLabel: __('Refresh Services', 'bit-integrations'),
            multi: true,
            note:
              mainAction === 'create_coupon' &&
              __('Leave Services empty to use the coupon for all services.', 'bit-integrations')
          })}
        </>
      )}

      {mainAction === 'update_coupon' &&
        selectRow({
          confKey: 'selectedCouponStatus',
          label: __('Status', 'bit-integrations'),
          options: COUPON_STATUS_OPTIONS,
          required: false
        })}

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
              <b>{__('MotoPress Appointment Booking Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {motoPressAppointmentBookingConf?.field_map?.map((itm, i) => (
            <MotoPressAppointmentBookingFieldMap
              key={`motopress-appointment-booking-m-${i + 9}`}
              i={i}
              field={itm}
              motoPressAppointmentBookingConf={motoPressAppointmentBookingConf}
              formFields={formFields}
              setMotoPressAppointmentBookingConf={setMotoPressAppointmentBookingConf}
            />
          ))}
          {hasOptionalFields && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(
                    motoPressAppointmentBookingConf.field_map.length,
                    motoPressAppointmentBookingConf,
                    setMotoPressAppointmentBookingConf
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

      {mainAction && hasUtilities.includes(mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <MotoPressAppointmentBookingActions
            motoPressAppointmentBookingConf={motoPressAppointmentBookingConf}
            setMotoPressAppointmentBookingConf={setMotoPressAppointmentBookingConf}
          />
        </div>
      )}
    </>
  )
}
