/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { checkMappedFields } from './theEventsCalendarCommonFunctions'
import TheEventsCalendarIntegLayout from './TheEventsCalendarIntegLayout'
import TheEventsCalendarAuthorization from './TheEventsCalendarAuthorization'
import { TASK_LIST_VALUES } from './theEventsCalendarConstants'

function TheEventsCalendar({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false,
    events: false
  })

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [theEventsCalendarConf, setTheEventsCalendarConf] = useState({
    name: 'The Events Calendar',
    type: 'The Events Calendar',
    field_map: [],
    staticFields: [],
    selectedTask: '',
    events: [],
    selectedEvent: '',
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      theEventsCalendarConf,
      navigate,
      '',
      '',
      setIsLoading
    )
    resp.then(res => {
      if (res.success) {
        toast.success(res.data?.msg)
        navigate(allIntegURL)
      } else {
        toast.error(res.data || res)
      }
    })
  }

  const nextPage = pageNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

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

    theEventsCalendarConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <TheEventsCalendarAuthorization
        theEventsCalendarConf={theEventsCalendarConf}
        setTheEventsCalendarConf={setTheEventsCalendarConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <TheEventsCalendarIntegLayout
          formFields={formFields}
          theEventsCalendarConf={theEventsCalendarConf}
          setTheEventsCalendarConf={setTheEventsCalendarConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={!checkMappedFields(theEventsCalendarConf)}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={theEventsCalendarConf}
        setDataConf={setTheEventsCalendarConf}
        formFields={formFields}
      />
    </div>
  )
}

export default TheEventsCalendar
