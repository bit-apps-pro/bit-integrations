import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { handleInput } from './PaidMembershipProCommonFunc'
import PaidMembershipProAuthorization from './PaidMembershipProAuthorization'
import PaidMembershipProIntegLayout from './PaidMembershipProIntegLayout'

function PaidMembershipPro({ formFields, setFlow, flow, allIntegURL, isInfo, edit }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const allActions = [
    { key: '1', label: __('Add the user to a membership', 'bit-integrations') },
    { key: '2', label: __('Remove the user from a membership', 'bit-integrations') }
  ]

  const [paidMembershipProConf, setPaidMembershipProConf] = useState({
    name: 'Paid Membership Pro',
    type: 'PaidMembershipPro',
    mainAction: '',
    field_map: [{ formField: '', paidmembershipproFormField: '' }],
    allActions,
    actions: {}
  })
  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (paidMembershipProConf.mainAction !== '') {
      setStep(3)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <PaidMembershipProAuthorization
        formID={formID}
        paidMembershipProConf={paidMembershipProConf}
        setPaidMembershipProConf={setPaidMembershipProConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, minHeight: '350px', overflow: 'visible' }) }}>
        <PaidMembershipProIntegLayout
          formFields={formFields}
          handleInput={e =>
            handleInput(
              e,
              paidMembershipProConf,
              setPaidMembershipProConf,
              setIsLoading,
              setSnackbar,
              formID
            )
          }
          paidMembershipProConf={paidMembershipProConf}
          setPaidMembershipProConf={setPaidMembershipProConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
          allIntegURL={allIntegURL}
          isInfo={isInfo}
          edit={edit}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={
            !paidMembershipProConf.mainAction ||
            isLoading ||
            paidMembershipProConf.selectedMembership === undefined
          }
          className="btn f-left btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            navigate,
            conf: paidMembershipProConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={paidMembershipProConf}
        setDataConf={setPaidMembershipProConf}
        formFields={formFields}
      />
    </div>
  )
}

export default PaidMembershipPro
