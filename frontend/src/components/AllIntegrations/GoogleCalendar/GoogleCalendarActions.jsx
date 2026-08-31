/* eslint-disable no-param-reassign */
import { useState } from 'react'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import Modal from '../../Utilities/Modal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import TitleModal from '../../Utilities/TitleModal'
import GoogleCalendarReminderFieldMap from './GoogleCalendarReminderFieldMap'
import { addReminderFieldMap } from './IntegrationHelpers'

export default function GoogleCalendarActions({ googleCalendarConf, setGoogleCalendarConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })
  const actionHandler = (e, type) => {
    const newConf = { ...googleCalendarConf }
    if (e.target.checked) {
      newConf.actions[type] = true

      if (type === 'richTextDesc') {
        const restFieldMap = (newConf.field_map || []).filter(
          fld => fld?.googleCalendarFormField !== 'description'
        )
        newConf.field_map = restFieldMap.length
          ? restFieldMap
          : [{ formField: '', googleCalendarFormField: '' }]
      }

      if (type === 'reminders') {
        setActionMdl({ show: 'reminders' })
      }
      if (type === 'allDayEvent' && newConf.actions.skipIfSlotNotEmpty === true) {
        newConf.actions.allDayEvent = false
        toast.error(
          __('"skip if slot not free" can\'t be selected for this action.', 'bit-integrations')
        )
      }
      if (type === 'skipIfSlotNotEmpty' && newConf.actions.allDayEvent === true) {
        newConf.actions.skipIfSlotNotEmpty = false
        toast.error(
          __(
            'Slot checking only work for event with dateTime, please unselect "all day event".',
            'bit-integrations'
          )
        )
      }
    } else {
      delete newConf.actions[type]
    }
    setGoogleCalendarConf({ ...newConf })
  }

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const openReminderMdl = () => {
    setActionMdl({ show: 'reminders' })
  }

  return (
    <div className="pos-rel d-flx w-10">
      <TableCheckBox
        checked={googleCalendarConf.actions?.allDayEvent || false}
        onChange={e => actionHandler(e, 'allDayEvent')}
        className={`wdt-200 mt-4 mr-2 ${
          googleCalendarConf.actions?.skipIfSlotNotEmpty ? 'input-disable' : ''
        }`}
        value="allDayEvent"
        title={__('All Day Event', 'bit-integrations')}
        subTitle={__('If checked, Events will create without time', 'bit-integrations')}
      />

      <TableCheckBox
        checked={googleCalendarConf.actions?.skipIfSlotNotEmpty || false}
        onChange={e => actionHandler(e, 'skipIfSlotNotEmpty')}
        className={`wdt-200 mt-4 mr-2 ${googleCalendarConf.actions?.allDayEvent ? 'input-disable' : ''}`}
        value="skipIfSlotNotEmpty"
        title={__('Skip If Slot Not Free', 'bit-integrations')}
        subTitle={__('If checked, Event create will skip if slot not free', 'bit-integrations')}
      />

      <TableCheckBox
        checked={googleCalendarConf.actions?.richTextDesc || false}
        onChange={e => actionHandler(e, 'richTextDesc')}
        className="wdt-200 mt-4 mr-2"
        value="richTextDesc"
        title={__('Rich Text Description', 'bit-integrations')}
        subTitle={__(
          'Write formatted description with the editor instead of mapping a plain text field. Description is removed from Field Map.',
          'bit-integrations'
        )}
      />

      <TitleModal action={openReminderMdl}>
        <TableCheckBox
          checked={googleCalendarConf.actions?.reminders || false}
          onChange={e => actionHandler(e, 'reminders')}
          className="wdt-200 mt-4 mr-2"
          value="reminders"
          title={__('Set Reminders', 'bit-integrations')}
        />
      </TitleModal>
      <Modal
        md
        show={actionMdl.show === 'reminders'}
        setModal={clsActionMdl}
        title={__('Set Reminders', 'bit-integrations')}>
        <div className="flx flx-around mt-4 mb-2" style={{ marginRight: 40 }}>
          <div className="txt-dp">
            <b>{__('Notification Type', 'bit-integrations')}</b>
          </div>
          <div className="txt-dp">
            <b>{__('Minutes', 'bit-integrations')}</b>
          </div>
        </div>
        {googleCalendarConf.reminder_field_map &&
          googleCalendarConf.reminder_field_map.map((reminderItem, rIndex) => (
            <GoogleCalendarReminderFieldMap
              key={`r-fm-${rIndex + 9}`}
              rIndex={rIndex}
              reminderField={reminderItem}
              googleCalendarConf={googleCalendarConf}
              setGoogleCalendarConf={setGoogleCalendarConf}
            />
          ))}
        <div className="txt-center mt-2" style={{ marginRight: 28 }}>
          <button
            onClick={() =>
              addReminderFieldMap(
                googleCalendarConf.reminder_field_map.length,
                googleCalendarConf,
                setGoogleCalendarConf,
                false
              )
            }
            className="icn-btn sh-sm"
            type="button">
            +
          </button>
        </div>
      </Modal>
    </div>
  )
}
