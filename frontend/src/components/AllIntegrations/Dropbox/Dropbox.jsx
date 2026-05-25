/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import DropboxAuthorization from './DropboxAuthorization'
import DropboxIntegLayout from './DropboxIntegLayout'

function Dropbox({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { flowID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [dropboxConf, setDropboxConf] = useState({
    name: 'Dropbox',
    type: 'Dropbox',
    clientId: '',
    clientSecret: '',
    field_map: [{ formField: '', dropboxFormField: '' }],
    foldersList: [],
    actions: {}
  })

  const saveConfig = () => {
    saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: dropboxConf,
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
      <DropboxAuthorization
        dropboxConf={dropboxConf}
        setDropboxConf={setDropboxConf}
        step={step}
        setStep={setStep}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{
          ...(step === 2 && {
            width: 900,
            height: 'auto',
            overflow: 'visible'
          })
        }}>
        <DropboxIntegLayout
          flowID={flowID}
          formFields={formFields}
          dropboxConf={dropboxConf}
          setDropboxConf={setDropboxConf}
        />

        <button
          onClick={() => setStep(3)}
          disabled={dropboxConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      {/* STEP 3 */}
      <IntegrationStepThree step={step} saveConfig={() => saveConfig()} isLoading={isLoading} />
    </div>
  )
}

export default Dropbox
