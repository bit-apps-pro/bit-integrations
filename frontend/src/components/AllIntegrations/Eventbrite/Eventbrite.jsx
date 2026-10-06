import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import EventbriteAuthorization from './EventbriteAuthorization'
import { checkMappedFields } from './EventbriteCommonFunc'
import EventbriteIntegLayout from './EventbriteIntegLayout'
import 'react-multiple-select-dropdown-lite/dist/index.css'

function Eventbrite({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [eventbriteConf, setEventbriteConf] = useState({
    field_map: [{ eventbriteField: '', formField: '' }],
    name: 'Eventbrite',
    type: 'Eventbrite',
    utilities: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      eventbriteConf,
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

    if (!checkMappedFields(eventbriteConf)) {
      toast.error(
        __('Please select an action and fill the required options and fields', 'bit-integrations')
      )

      return
    }
    setstep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <EventbriteAuthorization
        eventbriteConf={eventbriteConf}
        setEventbriteConf={setEventbriteConf}
        step={step}
        setstep={setstep}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { height: 'auto', minHeight: 500, overflow: 'visible', width: 900 }) }}>
        {step === 2 && (
          <EventbriteIntegLayout
            formFields={formFields}
            eventbriteConf={eventbriteConf}
            setEventbriteConf={setEventbriteConf}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        <button
          onClick={() => nextPage(3)}
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
        dataConf={eventbriteConf}
        setDataConf={setEventbriteConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Eventbrite
