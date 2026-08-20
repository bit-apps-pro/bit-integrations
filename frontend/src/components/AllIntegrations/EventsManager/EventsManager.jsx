import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import EventsManagerAuthorization from './EventsManagerAuthorization'
import { checkMappedFields } from './EventsManagerCommonFunc'
import EventsManagerIntegLayout from './EventsManagerIntegLayout'

export default function EventsManager({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [eventsManagerConf, setEventsManagerConf] = useState({
    name: 'EventsManager',
    type: 'EventsManager',
    field_map: [{ formField: '', eventsManagerField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      const settingsWrp = document.getElementById('btcd-settings-wrp')

      if (settingsWrp) {
        settingsWrp.scrollTop = 0
      }
    }, 300)

    if (val === 3) {
      if (!checkMappedFields(eventsManagerConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (eventsManagerConf.name !== '' && eventsManagerConf.field_map.length > 0) {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2" />

      <EventsManagerAuthorization
        formID={formID}
        eventsManagerConf={eventsManagerConf}
        setEventsManagerConf={setEventsManagerConf}
        step={step}
        nextPage={nextPage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <EventsManagerIntegLayout
          formFields={formFields}
          eventsManagerConf={eventsManagerConf}
          setEventsManagerConf={setEventsManagerConf}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={eventsManagerConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, eventsManagerConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={eventsManagerConf}
        setDataConf={setEventsManagerConf}
        formFields={formFields}
      />
    </div>
  )
}
