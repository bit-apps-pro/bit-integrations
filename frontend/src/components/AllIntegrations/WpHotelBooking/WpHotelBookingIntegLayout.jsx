import { useEffect } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import WpHotelBookingActions from './WpHotelBookingActions'
import {
  generateMappedField,
  refreshWpHotelBookingCoupons,
  refreshWpHotelBookingExtras,
  refreshWpHotelBookingRooms
} from './WpHotelBookingCommonFunc'
import WpHotelBookingFieldMap from './WpHotelBookingFieldMap'
import {
  bookingStatusOptions,
  dateFieldActions,
  discountTypeOptions,
  fieldsByAction,
  modules,
  needsBookingStatus,
  needsCoupon,
  needsDiscountType,
  needsExtras,
  needsRoom,
  utilitiesByAction
} from './staticData'

export default function WpHotelBookingIntegLayout({
  formFields,
  wpHotelBookingConf,
  setWpHotelBookingConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi
  const mainAction = wpHotelBookingConf?.mainAction

  useEffect(() => {
    if (needsRoom.includes(mainAction) && !wpHotelBookingConf?.allRooms) {
      refreshWpHotelBookingRooms(setWpHotelBookingConf, setIsLoading)
    }

    if (needsCoupon.includes(mainAction) && !wpHotelBookingConf?.allCoupons) {
      refreshWpHotelBookingCoupons(setWpHotelBookingConf, setIsLoading)
    }

    if (needsExtras.includes(mainAction) && !wpHotelBookingConf?.allExtras) {
      refreshWpHotelBookingExtras(setWpHotelBookingConf, setIsLoading)
    }
  }, [])

  const handleMainAction = value => {
    setWpHotelBookingConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.wpHotelBookingFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.wpHotelBookingFields)
        draftConf.utilities = {}
      })
    )

    if (needsRoom.includes(value)) {
      refreshWpHotelBookingRooms(setWpHotelBookingConf, setIsLoading)
    }

    if (needsCoupon.includes(value)) {
      refreshWpHotelBookingCoupons(setWpHotelBookingConf, setIsLoading)
    }

    if (needsExtras.includes(value)) {
      refreshWpHotelBookingExtras(setWpHotelBookingConf, setIsLoading)
    }
  }

  const setConfValue = (key, value) => {
    setWpHotelBookingConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const renderSelect = ({ label, confKey, options, refresh, refreshTip, multiple = false }) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          key={`${confKey}-${options.length}`}
          title={confKey}
          defaultValue={wpHotelBookingConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={options}
          onChange={val => setConfValue(confKey, val)}
          singleSelect={!multiple}
          closeOnSelect={!multiple}
        />
        {refresh && (
          <button
            onClick={() => refresh(setWpHotelBookingConf, setIsLoading)}
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

      {needsRoom.includes(mainAction) &&
        renderSelect({
          label: __('Room:', 'bit-integrations'),
          confKey: 'selectedRoom',
          options: wpHotelBookingConf?.allRooms || [],
          refresh: refreshWpHotelBookingRooms,
          refreshTip: __('Refresh Rooms', 'bit-integrations')
        })}

      {needsBookingStatus.includes(mainAction) &&
        renderSelect({
          label: __('Booking Status:', 'bit-integrations'),
          confKey: 'selectedBookingStatus',
          options: bookingStatusOptions
        })}

      {needsDiscountType.includes(mainAction) &&
        renderSelect({
          label: __('Discount Type:', 'bit-integrations'),
          confKey: 'selectedDiscountType',
          options: discountTypeOptions
        })}

      {needsCoupon.includes(mainAction) &&
        renderSelect({
          label: __('Coupon:', 'bit-integrations'),
          confKey: 'selectedCoupon',
          options: wpHotelBookingConf?.allCoupons || [],
          refresh: refreshWpHotelBookingCoupons,
          refreshTip: __('Refresh Coupons', 'bit-integrations')
        })}

      {needsExtras.includes(mainAction) &&
        renderSelect({
          label: __('Extras:', 'bit-integrations'),
          confKey: 'selectedExtras',
          options: wpHotelBookingConf?.allExtras || [],
          refresh: refreshWpHotelBookingExtras,
          refreshTip: __('Refresh Extras', 'bit-integrations'),
          multiple: true
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

      {mainAction && wpHotelBookingConf.wpHotelBookingFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          {dateFieldActions.includes(mainAction) && (
            <p className="mt-2 mb-1">
              {__('Enter dates in the YYYY-MM-DD format, for example 2026-12-31.', 'bit-integrations')}
            </p>
          )}
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('WP Hotel Booking Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {wpHotelBookingConf?.field_map?.map((itm, i) => (
            <WpHotelBookingFieldMap
              key={`wp-hotel-booking-m-${i + 9}`}
              i={i}
              field={itm}
              wpHotelBookingConf={wpHotelBookingConf}
              formFields={formFields}
              setWpHotelBookingConf={setWpHotelBookingConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(
                  wpHotelBookingConf.field_map.length,
                  wpHotelBookingConf,
                  setWpHotelBookingConf
                )
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
          <WpHotelBookingActions
            wpHotelBookingConf={wpHotelBookingConf}
            setWpHotelBookingConf={setWpHotelBookingConf}
          />
        </div>
      )}
    </>
  )
}
