/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import toast from 'react-hot-toast'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import { checkMappedFields, handleInput } from './SalesforceCommonFunc'
import SelesforceIntegLayout from './SalesforceIntegLayout'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SalesforceAuthorization from './SalesforceAuthorization'

function Salesforce({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const action_modules = [
    { label: __('Create Contact', 'bit-integrations'), value: 'contact-create' },
    { label: __('Create lead', 'bit-integrations'), value: 'lead-create' },
    { label: __('Create Account', 'bit-integrations'), value: 'account-create' },
    { label: __('Create Campaign', 'bit-integrations'), value: 'campaign-create' },
    { label: __('Add campaign member', 'bit-integrations'), value: 'add-campaign-member' },
    { label: __('Create Task', 'bit-integrations'), value: 'task-create' },
    { label: __('Oportunity Create', 'bit-integrations'), value: 'opportunity-create' },
    { label: __('Event Create', 'bit-integrations'), value: 'event-create' },
    { label: __('Create Case', 'bit-integrations'), value: 'case-create' }
  ]

  const [salesforceConf, setSalesforceConf] = useState({
    name: 'Salesforce',
    type: 'Salesforce',
    clientId: '',
    clientSecret: '',
    field_map: [],
    selesforceActionModules: action_modules,
    action_modules,
    actions: {}
  })

  const checkedActionFieldsMapType = [
    'contact-create',
    'lead-create',
    'account-create',
    'campaign-create',
    'opportunity-create',
    'event-create',
    'case-create'
  ].includes(salesforceConf?.actionName)

  const nextPage = val => {
    if (checkedActionFieldsMapType && !checkMappedFields(salesforceConf)) {
      toast.error('Please map mandatory fields !')
      return
    }

    setStep(val)
  }
  const isDisabled = () => {
    if (salesforceConf?.actionName === 'opportunity-create') {
      return !salesforceConf.actions?.opportunityStageId
    }
    if (salesforceConf?.actionName === 'event-create') {
      return !salesforceConf.actions?.eventSubjectId
    }
    if (salesforceConf?.actionName === 'add-campaign-member') {
      return !salesforceConf.campaignId
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <SalesforceAuthorization
        formID={formID}
        salesforceConf={salesforceConf}
        setSalesforceConf={setSalesforceConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div className="btcd-stp-page" style={{ width: step === 2 && 900, height: step === 2 && 'auto' }}>
        <SelesforceIntegLayout
          formID={formID}
          formFields={formFields}
          handleInput={e =>
            handleInput(e, salesforceConf, setSalesforceConf, formID, setIsLoading, setSnackbar)
          }
          salesforceConf={salesforceConf}
          setSalesforceConf={setSalesforceConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={isDisabled() || isLoading}
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
            conf: salesforceConf,
            setIsLoading,
            setSnackbar
          })
        }
      />
    </div>
  )
}

export default Salesforce
