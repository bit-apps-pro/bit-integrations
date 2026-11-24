import { create } from 'mutative'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'

export default function MotoPressAppointmentBookingActions({
  motoPressAppointmentBookingConf,
  setMotoPressAppointmentBookingConf
}) {
  const toggleCheckbox = name => {
    setMotoPressAppointmentBookingConf(prevConf =>
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

  const { utilities } = motoPressAppointmentBookingConf

  return (
    <div className="pos-rel d-flx flx-wrp">
      <TableCheckBox
        checked={utilities?.skip_emails === 'true'}
        onChange={() => toggleCheckbox('skip_emails')}
        className="wdt-200 mt-4 mr-2"
        value="skip_emails"
        title={__('Do Not Send Emails', 'bit-integrations')}
        subTitle={__(
          'Do not send the MotoPress Appointment Booking emails for this booking',
          'bit-integrations'
        )}
      />
    </div>
  )
}
