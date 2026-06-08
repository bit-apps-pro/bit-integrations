/* eslint-disable no-param-reassign */
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import EditFormInteg from '../EditFormInteg'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import EditWebhookInteg from '../EditWebhookInteg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import CustomActionStepTwo from './CustomActionStepTwo'
import CustomFuncEditor from './CustomFuncEditor'
import { checkFunctionValidity } from './CustomFunctionHelper'
import LoaderSm from '../../Loaders/LoaderSm'
import TutorialLink from '../../Utilities/TutorialLink'
function EditCustomAction({ allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()

  const [customActionConf, setCustomActionConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [loading, setLoading] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })
  const [step, setStep] = useState(1)

  const handleChange = e => {
    const newConf = { ...customActionConf }
    if (e !== '') {
      newConf.value = e
    }
    setCustomActionConf({ ...newConf })
  }

  useEffect(() => {
    const newConf = { ...customActionConf }
    delete newConf.isValid
    setCustomActionConf({ ...newConf })
  }, [customActionConf?.value])

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <div className="mt-3">
        <div
          className="btcd-stp-page"
          style={{ ...(step === 1 && { width: '91%', height: 'auto', overflow: 'visible' }) }}>
          <TutorialLink linkKey="customAction" />
          <h1>custom action</h1>
          <CustomFuncEditor
            customActionConf={customActionConf}
            setCustomActionConf={setCustomActionConf}
            formFields={formFields}
          />
          <button
            onClick={() =>
              checkFunctionValidity(customActionConf, setCustomActionConf, loading, setLoading)
            }
            disabled={!customActionConf.value || loading?.validate}
            className="btn f-left btcd-btn-lg purple sh-sm flx mt-5"
            type="button">
            {customActionConf?.isValid && !loading?.validate
              ? __('Validated ✔', 'bit-integrations')
              : __('Validated', 'bit-integrations')}
            {loading?.validate && <LoaderSm size="20" clr="#022217" className="ml-2" />}
          </button>
        </div>
      </div>

      <CustomActionStepTwo
        edit
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            conf: customActionConf,
            navigate,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        disabled={!customActionConf.isValid}
      />
      <br />
    </div>
  )
}

export default EditCustomAction
