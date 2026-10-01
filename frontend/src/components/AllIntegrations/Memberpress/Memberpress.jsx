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
import { handleInput, checkMappedFields } from './MemberpressCommonFunc'
import MemberpressAuthorization from './MemberpressAuthorization'
import MemberpressIntegLayout from './MemberpressIntegLayout'

function Memberpress({ formFields, setFlow, flow, allIntegURL, isInfo, edit }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const allActions = [
    { key: '1', label: __('Add the user to a membership', 'bit-integrations') },
    { key: '2', label: __('Remove the user from a membership', 'bit-integrations') }
  ]

  const memberpressFields = [
    { key: 'sub_total', label: __('Sub Total', 'bit-integrations'), required: false },
    { key: 'tax_amount', label: __('Tax Amount', 'bit-integrations'), required: false },
    { key: 'taxrate', label: __('Tax Rate', 'bit-integrations'), required: false },
    { key: 'expiration_date', label: __('Expiration Date', 'bit-integrations'), required: false }
  ]

  const [memberpressConf, setMemberpressConf] = useState({
    name: 'Memberpress',
    type: 'Memberpress',
    mainAction: '',
    field_map: [{ formField: '', memberpressFormField: '' }],
    allActions,
    memberpressFields,
    actions: {}
  })
  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (memberpressConf.mainAction !== '') {
      setStep(3)
    }
  }

  function isDisabled() {
    switch (memberpressConf.mainAction) {
      case '1':
        return (
          memberpressConf.statusId === undefined ||
          memberpressConf.gatewayId === undefined ||
          memberpressConf.selectedMembership === undefined
        )
      default:
        return false
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <MemberpressAuthorization
        formID={formID}
        memberpressConf={memberpressConf}
        setMemberpressConf={setMemberpressConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <MemberpressIntegLayout
          formFields={formFields}
          handleInput={e =>
            handleInput(e, memberpressConf, setMemberpressConf, setIsLoading, setSnackbar, formID)
          }
          memberpressConf={memberpressConf}
          setMemberpressConf={setMemberpressConf}
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
            !memberpressConf.mainAction ||
            isLoading ||
            isDisabled() ||
            isUserSourceIncomplete(memberpressConf)
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
            conf: memberpressConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={memberpressConf}
        setDataConf={setMemberpressConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Memberpress
