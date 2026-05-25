import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import ZoomWebinarAuthorization from './ZoomWebinarAuthorization'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { handleInput, checkMappedFields } from './ZoomCommonFunc'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import ZoomWebinarIntegLayout from './ZoomWebinarIntegLayout'

function ZoomWebinar({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const zoomWebinarFields = [
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: true },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: true },
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'job_title', label: __('Job Title', 'bit-integrations'), required: false },
    { key: 'zip', label: __('Zip', 'bit-integrations'), required: false }
  ]
  const [zoomWebinarConf, setZoomWebinarConf] = useState({
    name: 'Zoom Webinar',
    type: 'Zoom Webinar',
    clientId: '',
    clientSecret: '',
    zoomId: '',
    field_map: [{ formField: '', zoomField: '' }],
    zoomWebinarFields,
    allActions: [
      { value: 'Create Attendee', key: 1 },
      { value: 'Delete Attendee', key: 2 },
      { value: 'Create User', key: 3 },
      { value: 'Delete User', key: 4 }
    ],
    selectedActions: null,
    actions: {}
  })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (!checkMappedFields(zoomWebinarConf)) {
      setSnackbar({ show: true, msg: __('Please map fields to continue.', 'bit-integrations') })
      return
    }
    if (zoomWebinarConf.field_map.length > 0) {
      setStep(3)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center w-9 mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <ZoomWebinarAuthorization
        zoomWebinarConf={zoomWebinarConf}
        setZoomWebinarConf={setZoomWebinarConf}
        step={step}
        setStep={setStep}
      />
      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ width: step === 2 && 900, height: step === 2 && `${100}%` }}>
        <ZoomWebinarIntegLayout
          formID={formID}
          formFields={formFields}
          handleInput={e =>
            handleInput(e, zoomWebinarConf, setZoomWebinarConf, formID, setIsLoading, setSnackbar)
          }
          zoomWebinarConf={zoomWebinarConf}
          setZoomWebinarConf={setZoomWebinarConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={
            zoomWebinarConf.field_map.length < 2 ||
            isLoading ||
            !zoomWebinarConf.id ||
            !checkMappedFields(zoomWebinarConf) ||
            zoomWebinarConf.selectedActions == null
          }
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
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            navigate,
            conf: zoomWebinarConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={zoomWebinarConf}
        setDataConf={setZoomWebinarConf}
        formFields={formFields}
      />
    </div>
  )
}

export default ZoomWebinar
