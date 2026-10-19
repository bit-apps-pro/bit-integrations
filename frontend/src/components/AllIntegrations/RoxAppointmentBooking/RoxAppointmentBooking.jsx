import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { checkMappedFields, checkRequiredSelect } from './RoxAppointmentBookingCommonFunc'
import { requiredEitherFields } from './staticData'
import RoxAppointmentBookingAuthorization from './RoxAppointmentBookingAuthorization'
import RoxAppointmentBookingIntegLayout from './RoxAppointmentBookingIntegLayout'

export default function RoxAppointmentBooking({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [roxAppointmentBookingConf, setRoxAppointmentBookingConf] = useState({
    name: 'Rox Appointment Booking',
    type: 'RoxAppointmentBooking',
    field_map: [{ formField: '', roxAppointmentBookingField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      const missingSelect = checkRequiredSelect(roxAppointmentBookingConf, requiredEitherFields)

      if (missingSelect) {
        setSnackbar({ show: true, msg: missingSelect })
        return
      }

      if (!checkMappedFields(roxAppointmentBookingConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (roxAppointmentBookingConf.name !== '' && roxAppointmentBookingConf.field_map.length > 0) {
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

      <RoxAppointmentBookingAuthorization
        formID={formID}
        roxAppointmentBookingConf={roxAppointmentBookingConf}
        setRoxAppointmentBookingConf={setRoxAppointmentBookingConf}
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
        <RoxAppointmentBookingIntegLayout
          formID={formID}
          formFields={formFields}
          roxAppointmentBookingConf={roxAppointmentBookingConf}
          setRoxAppointmentBookingConf={setRoxAppointmentBookingConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={roxAppointmentBookingConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(
            flow,
            setFlow,
            allIntegURL,
            roxAppointmentBookingConf,
            navigate,
            '',
            '',
            setIsLoading
          )
        }
        isLoading={isLoading}
        dataConf={roxAppointmentBookingConf}
        setDataConf={setRoxAppointmentBookingConf}
        formFields={formFields}
      />
    </div>
  )
}
