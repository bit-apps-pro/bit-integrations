import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  generateMappedField,
  refreshWebbaBookings,
  refreshWebbaCategories,
  refreshWebbaCoupons,
  refreshWebbaLocations,
  refreshWebbaServices,
  refreshWebbaStaff,
  refreshWebbaStatuses
} from './WebbaBookingCommonFunc'
import WebbaBookingFieldMap from './WebbaBookingFieldMap'
import {
  BookingFields,
  CancelFields,
  CategoryFields,
  CouponFields,
  CouponUpdateFields,
  LocationFields,
  modules,
  PaidFields,
  ServiceFields,
  ServiceUpdateFields,
  StaffFields
} from './staticData'

const FIELD_MAP = {
  create_booking: BookingFields,
  update_booking_status: [],
  approve_booking: [],
  cancel_booking: CancelFields,
  delete_booking: [],
  set_booking_as_paid: PaidFields,
  create_coupon: CouponFields,
  update_coupon: CouponUpdateFields,
  create_service: ServiceFields,
  update_service: ServiceUpdateFields,
  create_service_category: CategoryFields,
  create_staff_member: StaffFields,
  create_location: LocationFields
}

export default function WebbaBookingIntegLayout({
  formFields,
  webbaBookingConf,
  setWebbaBookingConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setConfValue = (key, value) => {
    setWebbaBookingConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const handleMainAction = value => {
    setWebbaBookingConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.webbaBookingFields = FIELD_MAP[value] || []
        draftConf.field_map = generateMappedField(draftConf.webbaBookingFields)
      })
    )

    if (['create_booking', 'update_service'].includes(value)) {
      refreshWebbaServices(setWebbaBookingConf, setIsLoading)
    }
    if (value === 'create_booking') {
      refreshWebbaStaff(setWebbaBookingConf, setIsLoading)
      refreshWebbaLocations(setWebbaBookingConf, setIsLoading)
    }
    if (['create_booking', 'create_service', 'update_service'].includes(value)) {
      refreshWebbaCategories(setWebbaBookingConf, setIsLoading)
    }
    if (
      [
        'update_booking_status',
        'approve_booking',
        'cancel_booking',
        'delete_booking',
        'set_booking_as_paid'
      ].includes(value)
    ) {
      refreshWebbaBookings(setWebbaBookingConf, setIsLoading)
    }
    if (value === 'update_booking_status') {
      refreshWebbaStatuses(setWebbaBookingConf, setIsLoading)
    }
    if (value === 'update_coupon') {
      refreshWebbaCoupons(setWebbaBookingConf, setIsLoading)
    }
  }

  const recordSelect = (label, confKey, optionSource, onRefresh, single = true) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={confKey}
          defaultValue={webbaBookingConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={(webbaBookingConf?.[optionSource] ?? []).map(opt => ({
            label: opt.label,
            value: opt.value.toString()
          }))}
          onChange={val => setConfValue(confKey, val)}
          singleSelect={single}
          closeOnSelect={single}
        />
        <button
          onClick={() => onRefresh(setWebbaBookingConf, setIsLoading)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
          type="button"
          disabled={isLoading}>
          &#x21BB;
        </button>
      </div>
    </>
  )

  const action = webbaBookingConf?.mainAction
  const bookingPicker = ['approve_booking', 'cancel_booking', 'delete_booking', 'set_booking_as_paid']

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={webbaBookingConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(act => ({
            label: checkIsPro(isPro, act.is_pro) ? act.label : getProLabel(act.label),
            value: act.name,
            disabled: !checkIsPro(isPro, act.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {action === 'create_booking' &&
        recordSelect(
          __('Service:', 'bit-integrations'),
          'selectedService',
          'allServices',
          refreshWebbaServices
        )}
      {action === 'create_booking' &&
        recordSelect(
          __('Staff Member:', 'bit-integrations'),
          'selectedStaff',
          'allStaff',
          refreshWebbaStaff
        )}
      {['create_booking', 'create_service', 'update_service'].includes(action) &&
        recordSelect(
          __('Service Category:', 'bit-integrations'),
          'selectedCategory',
          'allCategories',
          refreshWebbaCategories
        )}
      {action === 'create_booking' &&
        recordSelect(
          __('Location:', 'bit-integrations'),
          'selectedLocation',
          'allLocations',
          refreshWebbaLocations
        )}

      {action === 'update_service' &&
        recordSelect(
          __('Service:', 'bit-integrations'),
          'selectedService',
          'allServices',
          refreshWebbaServices
        )}

      {(action === 'update_booking_status' || bookingPicker.includes(action)) &&
        recordSelect(
          __('Booking:', 'bit-integrations'),
          'selectedBooking',
          'allBookings',
          refreshWebbaBookings
        )}

      {action === 'update_booking_status' &&
        recordSelect(
          __('Status:', 'bit-integrations'),
          'selectedStatus',
          'allStatuses',
          refreshWebbaStatuses
        )}

      {action === 'update_coupon' &&
        recordSelect(
          __('Coupon:', 'bit-integrations'),
          'selectedCoupon',
          'allCoupons',
          refreshWebbaCoupons
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

      {action && webbaBookingConf?.webbaBookingFields?.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Webba Booking Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {webbaBookingConf?.field_map?.map((itm, i) => (
            <WebbaBookingFieldMap
              key={`webba-m-${i + 9}`}
              i={i}
              field={itm}
              webbaBookingConf={webbaBookingConf}
              formFields={formFields}
              setWebbaBookingConf={setWebbaBookingConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(webbaBookingConf.field_map.length, webbaBookingConf, setWebbaBookingConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}
    </>
  )
}
