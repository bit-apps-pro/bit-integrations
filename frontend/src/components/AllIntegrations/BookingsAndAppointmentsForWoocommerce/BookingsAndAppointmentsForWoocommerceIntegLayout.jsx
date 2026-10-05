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
  refreshAssets,
  refreshCustomers,
  refreshProducts
} from './BookingsAndAppointmentsForWoocommerceCommonFunc'
import BookingsAndAppointmentsForWoocommerceFieldMap from './BookingsAndAppointmentsForWoocommerceFieldMap'
import {
  BookingAssetFields,
  BookingIdField,
  BookingNotesFields,
  BookingParticipantsFields,
  BookingPaymentEmailFields,
  BookingStatusFields,
  BookingUpdatedEmailFields,
  CreateBookingFields,
  modules,
  needsAsset,
  needsCustomer,
  needsNotifyMode,
  needsProduct,
  needsStatus,
  notifyModeOptions,
  RescheduleBookingFields,
  statusOptions
} from './staticData'

export default function BookingsAndAppointmentsForWoocommerceIntegLayout({
  formID,
  formFields,
  bookingsAndAppointmentsForWoocommerceConf,
  setBookingsAndAppointmentsForWoocommerceConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const conf = bookingsAndAppointmentsForWoocommerceConf
  const setConf = setBookingsAndAppointmentsForWoocommerceConf

  const handleMainAction = value => {
    setConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        switch (value) {
          case 'create_booking':
            draftConf.bookingsAndAppointmentsForWoocommerceFields = CreateBookingFields
            break
          case 'update_booking_status':
            draftConf.bookingsAndAppointmentsForWoocommerceFields = BookingStatusFields
            break
          case 'confirm_booking':
          case 'cancel_booking':
          case 'delete_booking':
          case 'send_booking_confirmation_email':
          case 'send_booking_cancelled_email':
          case 'send_booking_requires_confirmation_email':
            draftConf.bookingsAndAppointmentsForWoocommerceFields = BookingIdField
            break
          case 'reschedule_booking':
            draftConf.bookingsAndAppointmentsForWoocommerceFields = RescheduleBookingFields
            break
          case 'update_booking_notes':
            draftConf.bookingsAndAppointmentsForWoocommerceFields = BookingNotesFields
            break
          case 'update_booking_asset':
            draftConf.bookingsAndAppointmentsForWoocommerceFields = BookingAssetFields
            break
          case 'update_booking_participants':
            draftConf.bookingsAndAppointmentsForWoocommerceFields = BookingParticipantsFields
            break
          case 'send_booking_updated_email':
            draftConf.bookingsAndAppointmentsForWoocommerceFields = BookingUpdatedEmailFields
            break
          case 'send_booking_payment_email':
            draftConf.bookingsAndAppointmentsForWoocommerceFields = BookingPaymentEmailFields
            break
          default:
            draftConf.bookingsAndAppointmentsForWoocommerceFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.bookingsAndAppointmentsForWoocommerceFields)
      })
    )

    if (needsProduct.includes(value)) {
      refreshProducts(setConf, setIsLoading)
    }
    if (needsCustomer.includes(value)) {
      refreshCustomers(setConf, setIsLoading)
    }
    if (needsAsset.includes(value)) {
      refreshAssets(setConf, setIsLoading)
    }
  }

  const setField = (key, val) =>
    setConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = val
      })
    )

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={conf?.mainAction ?? null}
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

      {needsProduct.includes(conf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Bookable Product:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedProduct"
              defaultValue={conf?.selectedProduct ?? null}
              className="btcd-paper-drpdwn w-5"
              options={
                conf?.allProducts &&
                Array.isArray(conf.allProducts) &&
                conf.allProducts.map(product => ({
                  label: product.title,
                  value: product.id?.toString()
                }))
              }
              onChange={val => setField('selectedProduct', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshProducts(setConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Products', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {needsCustomer.includes(conf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Customer (optional):', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedCustomer"
              defaultValue={conf?.selectedCustomer ?? null}
              className="btcd-paper-drpdwn w-5"
              options={
                conf?.allCustomers &&
                Array.isArray(conf.allCustomers) &&
                conf.allCustomers.map(customer => ({
                  label: customer.title,
                  value: customer.id?.toString()
                }))
              }
              onChange={val => setField('selectedCustomer', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshCustomers(setConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Customers', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {needsAsset.includes(conf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">
              {conf?.mainAction === 'update_booking_asset'
                ? __('Asset:', 'bit-integrations')
                : __('Asset (optional):', 'bit-integrations')}
            </b>
            <MultiSelect
              title="selectedAsset"
              defaultValue={conf?.selectedAsset ?? null}
              className="btcd-paper-drpdwn w-5"
              options={
                conf?.allAssets &&
                Array.isArray(conf.allAssets) &&
                conf.allAssets.map(asset => ({
                  label: asset.title,
                  value: asset.id?.toString()
                }))
              }
              onChange={val => setField('selectedAsset', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshAssets(setConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Assets', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {needsStatus.includes(conf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('New Status:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedStatus"
              defaultValue={conf?.selectedStatus ?? null}
              className="btcd-paper-drpdwn w-5"
              options={statusOptions}
              onChange={val => setField('selectedStatus', val)}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {needsNotifyMode.includes(conf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Notify Mode:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedNotifyMode"
              defaultValue={conf?.selectedNotifyMode ?? null}
              className="btcd-paper-drpdwn w-5"
              options={notifyModeOptions}
              onChange={val => setField('selectedNotifyMode', val)}
              singleSelect
              closeOnSelect
            />
          </div>
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

      {conf?.mainAction && conf.bookingsAndAppointmentsForWoocommerceFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Booking Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {conf?.field_map?.map((itm, i) => (
            <BookingsAndAppointmentsForWoocommerceFieldMap
              key={`bfw-fm-${i + 9}`}
              i={i}
              field={itm}
              bookingsAndAppointmentsForWoocommerceConf={conf}
              formFields={formFields}
              setBookingsAndAppointmentsForWoocommerceConf={setConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(conf.field_map.length, conf, setConf)}
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
