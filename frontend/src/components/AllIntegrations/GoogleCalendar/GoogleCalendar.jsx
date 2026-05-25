/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import GoogleCalendarAuthorization from './GoogleCalendarAuthorization'
import { checkMappedFields } from './GoogleCalendarCommonFunc'
import GoogleCalendarIntegLayout from './GoogleCalendarIntegLayout'

function GoogleCalendar({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { flowID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const defaultCalendarFields = [
    { key: 'start', label: __('Start Date Time', 'bit-integrations'), required: true },
    { key: 'end', label: __('End Date Time', 'bit-integrations'), required: true },
    { key: 'summary', label: __('Title', 'bit-integrations'), required: false },
    { key: 'location', label: __('Location', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false }
  ]

  const [googleCalendarConf, setGoogleCalendarConf] = useState({
    name: 'Google Calendar',
    type: 'Google Calendar',
    clientId: '',
    clientSecret: '',
    field_map: [{ formField: '', googleCalendarFormField: '' }],
    reminder_field_map: [{ method: 'popup', minutes: '30' }],
    default: defaultCalendarFields,
    calendarLists: [],
    actions: {}
  })

  const saveConfig = () => {
    saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: googleCalendarConf,
      navigate,
      setIsLoading,
      setSnackbar
    })
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <GoogleCalendarAuthorization
        flowID={flowID}
        googleCalendarConf={googleCalendarConf}
        setGoogleCalendarConf={setGoogleCalendarConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <GoogleCalendarIntegLayout
          flowID={flowID}
          formFields={formFields}
          googleCalendarConf={googleCalendarConf}
          setGoogleCalendarConf={setGoogleCalendarConf}
        />
      </div>

      {/* STEP 3 */}
      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={googleCalendarConf}
        setDataConf={setGoogleCalendarConf}
        formFields={formFields}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <button
          onClick={() => setStep(3)}
          disabled={
            !googleCalendarConf?.calendarId ||
            !googleCalendarConf?.timeZone ||
            !checkMappedFields(googleCalendarConf?.field_map)
          }
          className="btn ml-auto btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>
    </div>
  )
}

export default GoogleCalendar
