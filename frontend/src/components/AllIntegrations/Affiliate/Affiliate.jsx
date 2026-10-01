import { useEffect, useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { useRecoilValue } from 'recoil'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { isUserSourceIncomplete } from '../IntegrationHelpers/userSource'
import { handleInput, checkMappedFields } from './AffiliateCommonFunc'
import { $appConfigState } from '../../../GlobalStates'
import AffiliateAuthorization from './AffiliateAuthorization'
import AffiliateIntegLayout from './AffiliateIntegLayout'

function Affiliate({ formFields, setFlow, flow, allIntegURL, isInfo, edit }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const btcbi = useRecoilValue($appConfigState)
  const { siteURL } = btcbi

  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const allActions = [
    { key: '1', label: __('Create a referral for specific affiliate Id', 'bit-integrations') },
    { key: '2', label: __('Create a referral for the user', 'bit-integrations') }
  ]

  const allStatus = [
    { key: '1', label: __('Paid', 'bit-integrations') },
    { key: '2', label: __('Unpaid', 'bit-integrations') },
    { key: '3', label: __('Pending', 'bit-integrations') },
    { key: '4', label: __('Reject', 'bit-integrations') }
  ]

  const allReferralType = [
    { key: '1', label: __('Sale', 'bit-integrations') },
    { key: '2', label: __('Opt-in', 'bit-integrations') },
    { key: '3', label: __('Lead', 'bit-integrations') }
  ]

  const createAffiliateFields = [
    { key: 'amount', label: __('Amount', 'bit-integrations'), required: true },
    { key: 'description', label: __('Description', 'bit-integrations'), required: true },
    { key: 'reference', label: __('Reference', 'bit-integrations'), required: false },
    { key: 'context', label: __('Context', 'bit-integrations'), required: false }
  ]
  const [affiliateConf, setAffiliateConf] = useState({
    name: 'Affiliate',
    type: 'Affiliate',
    mainAction: '',
    affiliate_id: '',
    referralId: '',
    statusId: '',
    field_map: [{ formField: '', affiliateFormField: '' }],
    allReferralType,
    allStatus,
    allActions,
    createAffiliateFields,
    actions: {}
  })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (!checkMappedFields(affiliateConf)) {
      setSnackbar({ show: true, msg: __('Please map fields to continue.', 'bit-integrations') })
      return
    }
    if (affiliateConf.mainAction !== '') {
      setStep(3)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <AffiliateAuthorization
        formID={formID}
        affiliateConf={affiliateConf}
        setAffiliateConf={setAffiliateConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <AffiliateIntegLayout
          formFields={formFields}
          handleInput={e =>
            handleInput(e, affiliateConf, setAffiliateConf, setIsLoading, setSnackbar, formID)
          }
          affiliateConf={affiliateConf}
          setAffiliateConf={setAffiliateConf}
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
            !affiliateConf.statusId ||
            !affiliateConf.referralId ||
            isLoading ||
            isUserSourceIncomplete(affiliateConf)
          }
          className="btn f-right btcd-btn-lg purple sh-sm flx"
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
            conf: affiliateConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={affiliateConf}
        setDataConf={setAffiliateConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Affiliate
