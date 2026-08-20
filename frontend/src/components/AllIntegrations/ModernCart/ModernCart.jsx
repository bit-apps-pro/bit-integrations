import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import ModernCartAuthorization from './ModernCartAuthorization'
import { checkMappedFields } from './ModernCartCommonFunc'
import ModernCartIntegLayout from './ModernCartIntegLayout'

export default function ModernCart({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [modernCartConf, setModernCartConf] = useState({
    name: 'Modern Cart',
    type: 'ModernCart',
    field_map: [],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!checkMappedFields(modernCartConf)) {
        setSnackbar({
          show: true,
          msg: __('Please configure all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (modernCartConf.name !== '') {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2"></div>

      <ModernCartAuthorization
        modernCartConf={modernCartConf}
        setModernCartConf={setModernCartConf}
        step={step}
        nextPage={nextPage}
      />

      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <ModernCartIntegLayout
          formID={formID}
          formFields={formFields}
          modernCartConf={modernCartConf}
          setModernCartConf={setModernCartConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={!modernCartConf.mainAction}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, modernCartConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={modernCartConf}
        setDataConf={setModernCartConf}
        formFields={formFields}
      />
    </div>
  )
}
