import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SalonBookingSystemAuthorization from './SalonBookingSystemAuthorization'
import { getConfError } from './SalonBookingSystemCommonFunc'
import SalonBookingSystemIntegLayout from './SalonBookingSystemIntegLayout'

export default function SalonBookingSystem({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [salonBookingSystemConf, setSalonBookingSystemConf] = useState({
    name: 'Salon Booking System',
    type: 'SalonBookingSystem',
    field_map: [{ formField: '', salonBookingSystemField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      const confError = getConfError(salonBookingSystemConf)

      if (confError) {
        setSnackbar({ show: true, msg: confError })
        return
      }

      if (salonBookingSystemConf.name !== '' && salonBookingSystemConf.field_map.length > 0) {
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

      <SalonBookingSystemAuthorization
        formID={formID}
        salonBookingSystemConf={salonBookingSystemConf}
        setSalonBookingSystemConf={setSalonBookingSystemConf}
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
        <SalonBookingSystemIntegLayout
          formID={formID}
          formFields={formFields}
          salonBookingSystemConf={salonBookingSystemConf}
          setSalonBookingSystemConf={setSalonBookingSystemConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={salonBookingSystemConf.field_map.length < 1}
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
            salonBookingSystemConf,
            navigate,
            '',
            '',
            setIsLoading
          )
        }
        isLoading={isLoading}
        dataConf={salonBookingSystemConf}
        setDataConf={setSalonBookingSystemConf}
        formFields={formFields}
      />
    </div>
  )
}
