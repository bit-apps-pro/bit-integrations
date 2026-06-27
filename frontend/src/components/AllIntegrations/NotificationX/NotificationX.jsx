import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import NotificationXAuthorization from './NotificationXAuthorization'
import { checkMappedFields } from './NotificationXCommonFunc'
import NotificationXIntegLayout from './NotificationXIntegLayout'
import { NOTIFICATION_SELECTION_ACTIONS } from './staticData'

export default function NotificationX({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [notificationXConf, setNotificationXConf] = useState({
    name: 'NotificationX',
    type: 'NotificationX',
    field_map: [{ formField: '', notificationXField: '' }],
    entry_map: [],
    actions: {},
    mainAction: '',
    selected_notification_id: '',
    notifications: []
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (
        NOTIFICATION_SELECTION_ACTIONS.includes(notificationXConf?.mainAction) &&
        !notificationXConf?.selected_notification_id
      ) {
        setSnackbar({
          show: true,
          msg: __('Please select a notification to continue.', 'bit-integrations')
        })
        return
      }

      if (!checkMappedFields(notificationXConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (notificationXConf.name !== '') {
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
      <NotificationXAuthorization
        formID={formID}
        notificationXConf={notificationXConf}
        setNotificationXConf={setNotificationXConf}
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
          minHeight: step === 2 && `${500}px`
        }}>
        <NotificationXIntegLayout
          formID={formID}
          formFields={formFields}
          notificationXConf={notificationXConf}
          setNotificationXConf={setNotificationXConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={!notificationXConf.mainAction}
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
          saveIntegConfig(flow, setFlow, allIntegURL, notificationXConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
      />
    </div>
  )
}
