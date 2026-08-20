/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { checkMappedFields, handleInput } from './PropovoiceCrmCommonFunc'
import BackIcn from '../../../Icons/BackIcn'
import PropovoiceCrmAuthorization from './PropovoiceCrmAuthorization'
import PropovoiceCrmIntegLayout from './PropovoiceCrmIntegLayout'

function PropovoiceCrm({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const leadFields = [
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: true },
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'mobile', label: __('Mobile', 'bit-integrations'), required: false },
    { key: 'org_name', label: __('Organization Name', 'bit-integrations'), required: false },
    { key: 'person_id', label: __('Person Id', 'bit-integrations'), required: false },
    { key: 'org_id', label: __('Organization Id', 'bit-integrations'), required: false },
    { key: 'budget', label: __('Budget', 'bit-integrations'), required: false },
    { key: 'currency', label: __('Currency', 'bit-integrations'), required: false },
    { key: 'note', label: __('Note', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'region', label: __('State / Province / Region', 'bit-integrations'), required: false },
    { key: 'address', label: __('Address', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'zip', label: __('ZIP Code', 'bit-integrations'), required: false },
    { key: 'desc', label: __('Description', 'bit-integrations'), required: false },
    { key: 'img', label: __('Contact Image', 'bit-integrations'), required: false }
  ]

  const allActions = [{ key: '1', label: __('Create lead', 'bit-integrations') }]

  const [propovoiceCrmConf, setPropovoiceCrmConf] = useState({
    name: 'Propovoice CRM',
    type: 'Propovoice CRM',
    mainAction: '',
    field_map: [{ formField: '', propovoiceCrmFormField: '' }],
    leadFields,
    allActions,
    actions: {}
  })
  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setStep(3)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <PropovoiceCrmAuthorization
        formID={formID}
        propovoiceCrmConf={propovoiceCrmConf}
        setPropovoiceCrmConf={setPropovoiceCrmConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
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
        <PropovoiceCrmIntegLayout
          formFields={formFields}
          handleInput={e =>
            handleInput(e, propovoiceCrmConf, setPropovoiceCrmConf, setIsLoading, setSnackbar)
          }
          propovoiceCrmConf={propovoiceCrmConf}
          setPropovoiceCrmConf={setPropovoiceCrmConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={!checkMappedFields(propovoiceCrmConf)}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            conf: propovoiceCrmConf,
            navigate,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={propovoiceCrmConf}
        setDataConf={setPropovoiceCrmConf}
        formFields={formFields}
      />
    </div>
  )
}

export default PropovoiceCrm
