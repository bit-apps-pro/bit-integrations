import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { checkMappedFields, handleInput } from './GiveWpCommonFunc'
import GiveWpIntegLayout from './GiveWpIntegLayout'
import GiveWpAuthorization from './GiveWpAuthorization'

function GiveWp({ formFields, setFlow, flow, allIntegURL, isInfo, edit }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const allActions = [{ key: '1', label: __('Create a donar', 'bit-integrations') }]

  const giveWpFields = [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'name', label: __('Name', 'bit-integrations'), required: false },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'purchase_value', label: __('Purchase Value', 'bit-integrations'), required: false },
    { key: 'purchase_count', label: __('Purchase Count', 'bit-integrations'), required: false }
  ]

  const [giveWpConf, setGiveWpConf] = useState({
    name: 'GiveWp',
    type: 'GiveWp',
    mainAction: '',
    field_map: [{ formField: '', giveWpFormField: '' }],
    allActions,
    giveWpFields,
    actions: {}
  })
  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedFields(giveWpConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }
    if (giveWpConf.mainAction !== '') {
      setStep(3)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <GiveWpAuthorization
        formID={formID}
        giveWpConf={giveWpConf}
        setGiveWpConf={setGiveWpConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <GiveWpIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, giveWpConf, setGiveWpConf, setIsLoading, setSnackbar, formID)}
          giveWpConf={giveWpConf}
          setGiveWpConf={setGiveWpConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
          allIntegURL={allIntegURL}
          isInfo={isInfo}
          edit={edit}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={!giveWpConf.mainAction || isLoading}
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
            conf: giveWpConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={giveWpConf}
        setDataConf={setGiveWpConf}
        formFields={formFields}
      />
    </div>
  )
}

export default GiveWp
