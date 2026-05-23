import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField } from './BookingPressCommonFunc'
import BookingPressFieldMap from './BookingPressFieldMap'
import {
  appointmentIdField,
  createCustomerFields,
  deleteCustomerFields,
  modules,
  updateAppointmentStatusFields,
  updateCustomerFields
} from './staticData'

export default function BookingPressIntegLayout({
  formFields,
  bookingPressConf,
  setBookingPressConf,
  setSnackbar,
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setBookingPressConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        switch (value) {
          case 'cancel_appointment':
            draftConf.bookingPressFields = appointmentIdField
            break
          case 'update_appointment_status':
            draftConf.bookingPressFields = updateAppointmentStatusFields
            break
          case 'create_customer':
            draftConf.bookingPressFields = createCustomerFields
            break
          case 'update_customer':
            draftConf.bookingPressFields = updateCustomerFields
            break
          case 'delete_appointment':
            draftConf.bookingPressFields = appointmentIdField
            break
          case 'delete_customer':
            draftConf.bookingPressFields = deleteCustomerFields
            break
          default:
            draftConf.bookingPressFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.bookingPressFields)
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
          defaultValue={bookingPressConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: !checkIsPro(isPro, action.is_pro),
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {bookingPressConf?.mainAction && bookingPressConf.bookingPressFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('BookingPress Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {bookingPressConf?.field_map?.map((itm, i) => (
            <BookingPressFieldMap
              key={`bp-m-${i + 9}`}
              i={i}
              field={itm}
              bookingPressConf={bookingPressConf}
              formFields={formFields}
              setBookingPressConf={setBookingPressConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(bookingPressConf.field_map.length, bookingPressConf, setBookingPressConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {bookingPressConf?.mainAction === 'update_appointment_status' && (
        <>
          <br />
          <Note
            note={__(
              'When mapping the Status field, use these values: Approved = 1, Pending = 2, Cancelled = 3, Rejected = 4.',
              'bit-integrations'
            )}
          />
        </>
      )}
    </>
  )
}
