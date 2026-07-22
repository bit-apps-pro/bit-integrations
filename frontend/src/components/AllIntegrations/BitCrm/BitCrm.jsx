import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __, sprintf } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import BitCrmAuthorization from './BitCrmAuthorization'
import { checkMappedFields, missingRequiredSelect } from './BitCrmCommonFunc'
import BitCrmIntegLayout from './BitCrmIntegLayout'

export default function BitCrm({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [bitCrmConf, setBitCrmConf] = useState({
    name: 'Bit CRM',
    type: 'BitCrm',
    field_map: [{ formField: '', bitCrmField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!bitCrmConf.mainAction) {
        setSnackbar({ show: true, msg: __('Please select an action to continue.', 'bit-integrations') })
        return
      }

      if (!checkMappedFields(bitCrmConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      const missing = missingRequiredSelect(bitCrmConf)
      if (missing) {
        setSnackbar({
          show: true,
          // translators: %s: required field label
          msg: sprintf(__('%s is required.', 'bit-integrations'), missing)
        })
        return
      }

      if (bitCrmConf.name !== '' && bitCrmConf.field_map.length > 0) {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2" />

      <BitCrmAuthorization
        formID={formID}
        bitCrmConf={bitCrmConf}
        setBitCrmConf={setBitCrmConf}
        step={step}
        nextPage={nextPage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <BitCrmIntegLayout
          formID={formID}
          formFields={formFields}
          bitCrmConf={bitCrmConf}
          setBitCrmConf={setBitCrmConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={bitCrmConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, bitCrmConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={bitCrmConf}
        setDataConf={setBitCrmConf}
        formFields={formFields}
      />
    </div>
  )
}
