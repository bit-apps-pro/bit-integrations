import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import HefflCRMAuthorization from './HefflCRMAuthorization'
import { checkMappedFields } from './HefflCRMCommonFunc'
import HefflCRMIntegLayout from './HefflCRMIntegLayout'

export default function HefflCRM({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [hefflCRMConf, setHefflCRMConf] = useState({
    name: 'Heffl CRM',
    type: 'Heffl CRM',
    api_key: '',
    field_map: [{ formField: '', hefflCRMField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!checkMappedFields(hefflCRMConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (hefflCRMConf.name !== '' && hefflCRMConf.field_map.length > 0) {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <HefflCRMAuthorization
        formID={formID}
        hefflCRMConf={hefflCRMConf}
        setHefflCRMConf={setHefflCRMConf}
        step={step}
        setStep={setStep}
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
        <HefflCRMIntegLayout
          formID={formID}
          formFields={formFields}
          hefflCRMConf={hefflCRMConf}
          setHefflCRMConf={setHefflCRMConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={hefflCRMConf.field_map.length < 1}
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
          saveIntegConfig(flow, setFlow, allIntegURL, hefflCRMConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={hefflCRMConf}
        setDataConf={setHefflCRMConf}
        formFields={formFields}
      />
    </div>
  )
}
