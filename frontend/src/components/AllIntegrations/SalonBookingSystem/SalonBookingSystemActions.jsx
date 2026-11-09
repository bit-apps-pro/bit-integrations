import { create } from 'mutative'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { SERVICE_FLAGS, statusActions } from './staticData'

export default function SalonBookingSystemActions({
  salonBookingSystemConf,
  setSalonBookingSystemConf
}) {
  const toggleCheckbox = name => {
    setSalonBookingSystemConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }

        if (draftConf.utilities[name] === 'true') {
          delete draftConf.utilities[name]
        } else {
          draftConf.utilities[name] = 'true'
        }
      })
    )
  }

  const { mainAction, utilities } = salonBookingSystemConf

  const checkBox = (name, title, subTitle) => (
    <TableCheckBox
      key={name}
      checked={utilities?.[name] === 'true'}
      onChange={() => toggleCheckbox(name)}
      className="wdt-200 mt-4 mr-2"
      value={name}
      title={title}
      subTitle={subTitle}
    />
  )

  return (
    <div className="pos-rel d-flx flx-wrp">
      {mainAction === 'create_booking' && (
        <>
          {checkBox(
            'check_availability',
            __('Check Availability', 'bit-integrations'),
            __('Do not book the time when the salon is not available', 'bit-integrations')
          )}
          {checkBox(
            'create_customer',
            __('Create Customer Account', 'bit-integrations'),
            __('Create a customer account from the email when no account exists', 'bit-integrations')
          )}
        </>
      )}

      {statusActions.includes(mainAction) &&
        checkBox(
          'send_notifications',
          __('Send Notifications', 'bit-integrations'),
          __('Send the Salon Booking System emails and messages for this booking', 'bit-integrations')
        )}

      {mainAction === 'create_customer' &&
        checkBox(
          'send_welcome_email',
          __('Send Welcome Email', 'bit-integrations'),
          __('Email the login details to the new customer', 'bit-integrations')
        )}

      {mainAction === 'delete_customer' &&
        checkBox(
          'delete_bookings',
          __('Delete Bookings', 'bit-integrations'),
          __('Also delete all bookings of the customer', 'bit-integrations')
        )}

      {mainAction === 'create_service' &&
        SERVICE_FLAGS.map(flag => checkBox(flag.key, flag.label, flag.subTitle))}
    </div>
  )
}
