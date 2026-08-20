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
import { handleInput, checkMappedFields } from './MailMintCommonFunc'
import MailMintAuthorization from './MailMintAuthorization'
import MailMintIntegLayout from './MailMintIntegLayout'

function MailMint({ formFields, setFlow, flow, allIntegURL, isInfo, edit }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const allActions = [{ key: '1', label: __('Add contact', 'bit-integrations') }]

  const mailMintContactFields = [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false }
  ]

  const [mailMintConf, setMailMintConf] = useState({
    name: 'Mail Mint',
    type: 'Mail Mint',
    mainAction: '',
    field_map: [{ formField: '', mailMintFormField: '' }],
    allActions,
    mailMintContactFields,
    actions: {}
  })
  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (mailMintConf.mainAction !== '') {
      setStep(3)
    }
  }
  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <MailMintAuthorization
        formID={formID}
        mailMintConf={mailMintConf}
        setMailMintConf={setMailMintConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <MailMintIntegLayout
          formFields={formFields}
          handleInput={e =>
            handleInput(e, mailMintConf, setMailMintConf, setIsLoading, setSnackbar, formID)
          }
          mailMintConf={mailMintConf}
          setMailMintConf={setMailMintConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
          allIntegURL={allIntegURL}
          isInfo={isInfo}
          edit={edit}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={isLoading}
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
            conf: mailMintConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={mailMintConf}
        setDataConf={setMailMintConf}
        formFields={formFields}
      />
    </div>
  )
}

export default MailMint
