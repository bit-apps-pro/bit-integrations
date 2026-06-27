import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import WebbaBookingAuthorization from './WebbaBookingAuthorization'
import { checkMappedFields } from './WebbaBookingCommonFunc'
import WebbaBookingIntegLayout from './WebbaBookingIntegLayout'

const requiredPicker = {
  create_booking: {
    key: 'selectedService',
    msg: __('Please select a service to continue.', 'bit-integrations')
  },
  update_booking_status: {
    key: 'selectedBooking',
    msg: __('Please select a booking to continue.', 'bit-integrations')
  },
  approve_booking: {
    key: 'selectedBooking',
    msg: __('Please select a booking to continue.', 'bit-integrations')
  },
  cancel_booking: {
    key: 'selectedBooking',
    msg: __('Please select a booking to continue.', 'bit-integrations')
  },
  delete_booking: {
    key: 'selectedBooking',
    msg: __('Please select a booking to continue.', 'bit-integrations')
  },
  set_booking_as_paid: {
    key: 'selectedBooking',
    msg: __('Please select a booking to continue.', 'bit-integrations')
  },
  update_coupon: {
    key: 'selectedCoupon',
    msg: __('Please select a coupon to continue.', 'bit-integrations')
  },
  update_service: {
    key: 'selectedService',
    msg: __('Please select a service to continue.', 'bit-integrations')
  }
}

export default function WebbaBooking({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [webbaBookingConf, setWebbaBookingConf] = useState({
    name: 'Webba Booking',
    type: 'WebbaBooking',
    field_map: [{ formField: '', webbaBookingField: '' }],
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
      if (!webbaBookingConf.mainAction) {
        setSnackbar({ show: true, msg: __('Please select an action to continue.', 'bit-integrations') })
        return
      }

      const picker = requiredPicker[webbaBookingConf.mainAction]
      if (picker && !webbaBookingConf[picker.key]) {
        setSnackbar({ show: true, msg: picker.msg })
        return
      }

      if (webbaBookingConf.mainAction === 'update_booking_status' && !webbaBookingConf.selectedStatus) {
        setSnackbar({ show: true, msg: __('Please select a status to continue.', 'bit-integrations') })
        return
      }

      if (!checkMappedFields(webbaBookingConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (webbaBookingConf.name !== '' && webbaBookingConf.field_map.length > 0) {
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

      {/* STEP 1 */}
      <WebbaBookingAuthorization
        formID={formID}
        webbaBookingConf={webbaBookingConf}
        setWebbaBookingConf={setWebbaBookingConf}
        step={step}
        nextPage={nextPage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <WebbaBookingIntegLayout
          formID={formID}
          formFields={formFields}
          webbaBookingConf={webbaBookingConf}
          setWebbaBookingConf={setWebbaBookingConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={webbaBookingConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      {/* STEP 3 */}
      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, webbaBookingConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={webbaBookingConf}
        setDataConf={setWebbaBookingConf}
        formFields={formFields}
      />
    </div>
  )
}
