import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import OneDriveAuthorization from './OneDriveAuthorization'
// import { handleInput } from './OneDriveCommonFunc'
import OneDriveIntegLayout from './OneDriveIntegLayout'

function OneDrive({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { flowID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [oneDriveConf, setOneDriveConf] = useState({
    name: 'OneDrive',
    type: 'OneDrive',
    clientId: '',
    clientSecret: '',
    field_map: [{ formField: '', OneDriveFormField: '' }],
    folder: '',
    folderMap: [],
    foldersList: [],
    actions: {}
  })

  const saveConfig = () => {
    saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: oneDriveConf,
      navigate,
      setIsLoading,
      setSnackbar
    })
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <OneDriveAuthorization
        oneDriveConf={oneDriveConf}
        setOneDriveConf={setOneDriveConf}
        step={step}
        setStep={setStep}
      />

      <div
        className="btcd-stp-page"
        style={{
          ...(step === 2 && {
            width: 900,
            height: 'auto',
            overflow: 'visible'
          })
        }}>
        <OneDriveIntegLayout
          flowID={flowID}
          formFields={formFields}
          oneDriveConf={oneDriveConf}
          setOneDriveConf={setOneDriveConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => setStep(3)}
          disabled={!oneDriveConf.actions.attachments || !oneDriveConf.folder}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>
      <IntegrationStepThree step={step} saveConfig={() => saveConfig()} isLoading={isLoading} />
    </div>
  )
}

export default OneDrive
