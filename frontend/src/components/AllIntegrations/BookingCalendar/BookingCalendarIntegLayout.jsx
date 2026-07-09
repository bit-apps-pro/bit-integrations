import { create } from 'mutative'
import { useEffect } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import BookingCalendarActions from './BookingCalendarActions'
import {
  generateMappedField,
  refreshBookingCalendarBookings,
  refreshBookingCalendarResources
} from './BookingCalendarCommonFunc'
import BookingCalendarFieldMap from './BookingCalendarFieldMap'
import { BookingCalendarStaticData, modules } from './staticData'

export default function BookingCalendarIntegLayout({
  formFields,
  bookingCalendarConf,
  setBookingCalendarConf,
  dataLoading,
  setDataLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setBookingCalendarConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.bookingCalendarFields = BookingCalendarStaticData[value] || []
        draftConf.field_map = generateMappedField(draftConf.bookingCalendarFields)
        draftConf.bookingId = ''
        draftConf.resourceId = ''
        draftConf.utilities = {}
      })
    )

    if (value === 'update_booking') {
      refreshBookingCalendarBookings(setBookingCalendarConf, setDataLoading)
    }

    if (['create_booking', 'update_booking'].includes(value)) {
      refreshBookingCalendarResources(setBookingCalendarConf, setDataLoading)
    }
  }

  useEffect(() => {
    const action = bookingCalendarConf?.mainAction
    if (!action) return

    if (action === 'update_booking' && !bookingCalendarConf?.allBookings) {
      refreshBookingCalendarBookings(setBookingCalendarConf, setDataLoading)
    }

    if (['create_booking', 'update_booking'].includes(action) && !bookingCalendarConf?.allResources) {
      refreshBookingCalendarResources(setBookingCalendarConf, setDataLoading)
    }
  }, [bookingCalendarConf?.mainAction])

  const setField = (key, val) =>
    setBookingCalendarConf(prev =>
      create(prev, draft => {
        draft[key] = val
      })
    )

  const isLoadingAny = dataLoading?.bookings || dataLoading?.resources

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={bookingCalendarConf?.mainAction ?? null}
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

      {bookingCalendarConf?.mainAction === 'update_booking' && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">
              {__('Booking:', 'bit-integrations')}
              <span style={{ color: 'red' }}> *</span>
            </b>
            <MultiSelect
              defaultValue={bookingCalendarConf?.bookingId ?? null}
              className={`btcd-paper-drpdwn w-5${!bookingCalendarConf?.bookingId ? ' btcd-paper-inp-err' : ''}`}
              options={bookingCalendarConf?.allBookings || []}
              onChange={val => setField('bookingId', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshBookingCalendarBookings(setBookingCalendarConf, setDataLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Bookings', 'bit-integrations')}'` }}
              type="button"
              disabled={dataLoading?.bookings}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {['create_booking', 'update_booking'].includes(bookingCalendarConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Booking Resource:', 'bit-integrations')}</b>
            <MultiSelect
              defaultValue={bookingCalendarConf?.resourceId ?? null}
              className="btcd-paper-drpdwn w-5"
              options={bookingCalendarConf?.allResources || []}
              onChange={val => setField('resourceId', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshBookingCalendarResources(setBookingCalendarConf, setDataLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Resources', 'bit-integrations')}'` }}
              type="button"
              disabled={dataLoading?.resources}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {isLoadingAny && (
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

      {bookingCalendarConf?.mainAction && bookingCalendarConf?.bookingCalendarFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Booking Calendar Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {bookingCalendarConf?.field_map?.map((itm, i) => (
            <BookingCalendarFieldMap
              key={`booking-calendar-m-${i + 9}`}
              i={i}
              field={itm}
              bookingCalendarConf={bookingCalendarConf}
              formFields={formFields}
              setBookingCalendarConf={setBookingCalendarConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(
                  bookingCalendarConf.field_map.length,
                  bookingCalendarConf,
                  setBookingCalendarConf
                )
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>

          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <BookingCalendarActions
            bookingCalendarConf={bookingCalendarConf}
            setBookingCalendarConf={setBookingCalendarConf}
          />
        </div>
      )}
    </>
  )
}
