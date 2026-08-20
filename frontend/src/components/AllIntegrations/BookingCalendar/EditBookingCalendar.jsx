import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields, handleInput } from './BookingCalendarCommonFunc'
import BookingCalendarIntegLayout from './BookingCalendarIntegLayout'

export default function EditBookingCalendar({ allIntegURL }) {
  const navigate = useNavigate()
  const { id, formID } = useParams()
  const [bookingCalendarConf, setBookingCalendarConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState({})
  const [snack, setSnackbar] = useState({ show: false })

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, bookingCalendarConf, setBookingCalendarConf)}
          name="name"
          value={bookingCalendarConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <BookingCalendarIntegLayout
        formID={formID}
        formFields={formFields}
        bookingCalendarConf={bookingCalendarConf}
        setBookingCalendarConf={setBookingCalendarConf}
        setDataLoading={setDataLoading}
        dataLoading={dataLoading}
      />

      <IntegrationStepThree
        edit
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            conf: bookingCalendarConf,
            navigate,
            id,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!checkMappedFields(bookingCalendarConf)}
        isLoading={isLoading}
        dataConf={bookingCalendarConf}
        setDataConf={setBookingCalendarConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}
