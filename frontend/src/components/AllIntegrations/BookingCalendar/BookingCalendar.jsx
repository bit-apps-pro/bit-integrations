import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import BookingCalendarAuthorization from './BookingCalendarAuthorization'
import { getBookingCalendarValidationMsg } from './BookingCalendarCommonFunc'
import BookingCalendarIntegLayout from './BookingCalendarIntegLayout'

export default function BookingCalendar({ formFields, setFlow, flow, allIntegURL, isInfo }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState({})
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [bookingCalendarConf, setBookingCalendarConf] = useState({
    name: 'Booking Calendar',
    type: 'BookingCalendar',
    field_map: [{ formField: '', bookingCalendarField: '' }],
    actions: {},
    utilities: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      const validationMsg = getBookingCalendarValidationMsg(bookingCalendarConf)

      if (validationMsg) {
        setSnackbar({ show: true, msg: validationMsg })
        return
      }

      if (bookingCalendarConf.name !== '' && bookingCalendarConf.field_map.length > 0) {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2"></div>

      <BookingCalendarAuthorization
        bookingCalendarConf={bookingCalendarConf}
        setBookingCalendarConf={setBookingCalendarConf}
        step={step}
        nextPage={nextPage}
        isInfo={isInfo}
      />

      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <BookingCalendarIntegLayout
          formID={formID}
          formFields={formFields}
          bookingCalendarConf={bookingCalendarConf}
          setBookingCalendarConf={setBookingCalendarConf}
          setDataLoading={setDataLoading}
          dataLoading={dataLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={bookingCalendarConf.field_map.length < 1}
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
            bookingCalendarConf,
            navigate,
            '',
            '',
            setIsLoading
          )
        }
        isLoading={isLoading}
        dataConf={bookingCalendarConf}
        setDataConf={setBookingCalendarConf}
        formFields={formFields}
      />
    </div>
  )
}
