import { create } from 'mutative'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'

const bookingCalendarUtilities = [
  {
    key: 'is_send_emails',
    title: __('Send Emails', 'bit-integrations'),
    subTitle: __(
      'Send Booking Calendar email notifications after the booking is saved.',
      'bit-integrations'
    )
  },
  {
    key: 'is_show_payment_form',
    title: __('Show Payment Form', 'bit-integrations'),
    subTitle: __('Show Booking Calendar payment form after the booking is created.', 'bit-integrations')
  },
  {
    key: 'is_approve_booking',
    title: __('Approve Booking', 'bit-integrations'),
    subTitle: __('Approve the booking immediately after it is saved.', 'bit-integrations')
  },
  {
    key: 'save_booking_even_if_unavailable',
    title: __('Save if Unavailable', 'bit-integrations'),
    subTitle: __('Save the booking even when the selected date is unavailable.', 'bit-integrations')
  },
  {
    key: 'is_use_booking_recurrent_time',
    title: __('Use Recurrent Time', 'bit-integrations'),
    subTitle: __('Use Booking Calendar recurrent time while saving booking dates.', 'bit-integrations')
  }
]

export default function BookingCalendarActions({ bookingCalendarConf, setBookingCalendarConf }) {
  const actionHandler = (e, key) => {
    setBookingCalendarConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.utilities = { ...(draftConf.utilities || {}) }

        if (e.target.checked) {
          draftConf.utilities[key] = true
        } else {
          delete draftConf.utilities[key]
        }
      })
    )
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      {bookingCalendarUtilities.map(action => (
        <TableCheckBox
          key={action.key}
          checked={[true, 1, '1', 'true'].includes(bookingCalendarConf?.utilities?.[action.key])}
          onChange={e => actionHandler(e, action.key)}
          className="wdt-200 mt-4 mr-2"
          value={action.key}
          title={action.title}
          subTitle={action.subTitle}
        />
      ))}
    </div>
  )
}
