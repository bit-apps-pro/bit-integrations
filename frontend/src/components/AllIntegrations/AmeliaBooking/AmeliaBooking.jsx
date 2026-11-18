import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import AmeliaBookingAuthorization from './AmeliaBookingAuthorization'
import { checkMappedFields, requiredSelectMissing } from './AmeliaBookingCommonFunc'
import AmeliaBookingIntegLayout from './AmeliaBookingIntegLayout'

export default function AmeliaBooking({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [ameliaBookingConf, setAmeliaBookingConf] = useState({
    name: 'Amelia Booking',
    type: 'AmeliaBooking',
    field_map: [{ formField: '', ameliaBookingField: '' }],
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      const missing = requiredSelectMissing(ameliaBookingConf)

      if (missing) {
        setSnackbar({ show: true, msg: missing })
        return
      }

      if (!checkMappedFields(ameliaBookingConf)) {
        setSnackbar({
          show: true,
          msg: __('Map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (ameliaBookingConf.name !== '' && ameliaBookingConf.field_map.length > 0) {
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

      <AmeliaBookingAuthorization
        ameliaBookingConf={ameliaBookingConf}
        setAmeliaBookingConf={setAmeliaBookingConf}
        step={step}
        nextPage={nextPage}
      />

      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <AmeliaBookingIntegLayout
          formFields={formFields}
          ameliaBookingConf={ameliaBookingConf}
          setAmeliaBookingConf={setAmeliaBookingConf}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={ameliaBookingConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, ameliaBookingConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={ameliaBookingConf}
        setDataConf={setAmeliaBookingConf}
        formFields={formFields}
      />
    </div>
  )
}
