/* eslint-disable no-param-reassign */

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import TheEventsCalendarIntegLayout from './TheEventsCalendarIntegLayout'
import toast from 'react-hot-toast'
import { checkMappedFields, handleInput } from './theEventsCalendarCommonFunctions'
import { TASK_LIST_VALUES } from './theEventsCalendarConstants'

function EditTheEventsCalendar({ allIntegURL }) {
  const navigate = useNavigate()
  const [flow, setFlow] = useRecoilState($newFlow)
  const [theEventsCalendarConf, setTheEventsCalendarConf] = useRecoilState($actionConf)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false,
    events: false
  })
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const saveConfig = () => {
    if (!theEventsCalendarConf.selectedTask) {
      toast.error(__('Please select a task!', 'bit-integrations'))
      return
    }

    if (
      theEventsCalendarConf.selectedTask === TASK_LIST_VALUES.NEW_ATTENDEE &&
      !theEventsCalendarConf.selectedEvent
    ) {
      toast.error(__('Please select a event!', 'bit-integrations'))
      return
    }

    if (!checkMappedFields(theEventsCalendarConf)) {
      toast.error(__('Please map mandatory fields!', 'bit-integrations'))
      return
    }

    saveActionConf({
      flow,
      allIntegURL,
      conf: theEventsCalendarConf,
      navigate,
      edit: 1,
      setLoading,
      setSnackbar
    })
  }

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, theEventsCalendarConf, setTheEventsCalendarConf)}
          name="name"
          defaultValue={theEventsCalendarConf.name || ''}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <TheEventsCalendarIntegLayout
        formID={flow.triggered_entity_id}
        formFields={formField}
        handleInput={e =>
          handleInput(e, theEventsCalendarConf, setTheEventsCalendarConf, setLoading, setSnackbar)
        }
        theEventsCalendarConf={theEventsCalendarConf}
        setTheEventsCalendarConf={setTheEventsCalendarConf}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        isLoading={isLoading}
        dataConf={theEventsCalendarConf}
        setDataConf={setTheEventsCalendarConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditTheEventsCalendar
