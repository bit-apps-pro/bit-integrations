import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import FormyChatAuthorization from './FormyChatAuthorization'
import { checkMappedFields } from './FormyChatCommonFunc'
import FormyChatIntegLayout from './FormyChatIntegLayout'

export default function FormyChat({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [formyChatConf, setFormyChatConf] = useState({
    name: 'FormyChat',
    type: 'FormyChat',
    widgetId: '',
    mainAction: '',
    field_map: [{ formField: '', formyChatField: '' }],
    actions: {},
    allWidgets: [],
    allFields: [],
    meta_map: [{ formField: '', metaKey: '' }],
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!checkMappedFields(formyChatConf)) {
        setSnackbar({ show: true, msg: __('Please map all required fields to continue.', 'bit-integrations') })
        return
      }
      if (formyChatConf.name !== '' && formyChatConf.field_map.length > 0) {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      {/* STEP 1 */}
      <FormyChatAuthorization
        formID={formID}
        formyChatConf={formyChatConf}
        setFormyChatConf={setFormyChatConf}
        step={step}
        nextPage={nextPage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ width: step === 2 && 900, height: step === 2 && 'auto', minHeight: step === 2 && '500px' }}>
        <FormyChatIntegLayout
          formID={formID}
          formFields={formFields}
          formyChatConf={formyChatConf}
          setFormyChatConf={setFormyChatConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br /><br /><br />
        <button
          onClick={() => nextPage(3)}
          disabled={formyChatConf.field_map.length < 1}
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
          saveIntegConfig(flow, setFlow, allIntegURL, formyChatConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
      />
    </div>
  )
}
