import { create } from 'mutative'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { appointmentFormActions } from './staticData'

export default function EasyAppointmentsActions({ easyAppointmentsConf, setEasyAppointmentsConf }) {
  const toggleCheckbox = name => {
    setEasyAppointmentsConf(prevConf =>
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

  const { mainAction, utilities } = easyAppointmentsConf

  return (
    <div className="pos-rel d-flx flx-wrp">
      {appointmentFormActions.includes(mainAction) && (
        <TableCheckBox
          checked={utilities?.skip_availability_check === 'true'}
          onChange={() => toggleCheckbox('skip_availability_check')}
          className="wdt-200 mt-4 mr-2"
          value="skip_availability_check"
          title={__('Skip Availability Check', 'bit-integrations')}
          subTitle={__('Book the time even when the employee has no free slot', 'bit-integrations')}
        />
      )}

      <TableCheckBox
        checked={utilities?.send_notifications === 'true'}
        onChange={() => toggleCheckbox('send_notifications')}
        className="wdt-200 mt-4 mr-2"
        value="send_notifications"
        title={__('Send Notifications', 'bit-integrations')}
        subTitle={__('Send the Easy Appointments emails for this appointment', 'bit-integrations')}
      />
    </div>
  )
}
