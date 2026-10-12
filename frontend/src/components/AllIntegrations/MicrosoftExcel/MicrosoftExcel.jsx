import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import MicrosoftExcelAuthorization from './MicrosoftExcelAuthorization'
import { checkMappedFields } from './MicrosoftExcelCommonFunc'
import MicrosoftExcelIntegLayout from './MicrosoftExcelIntegLayout'
import 'react-multiple-select-dropdown-lite/dist/index.css'

function MicrosoftExcel({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [microsoftExcelConf, setMicrosoftExcelConf] = useState({
    field_map: [{ formField: '', microsoftExcelField: '' }],
    name: 'Microsoft Excel',
    type: 'MicrosoftExcel',
    utilities: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      microsoftExcelConf,
      navigate,
      '',
      '',
      setIsLoading
    )
    resp.then(res => {
      if (res.success) {
        toast.success(res.data?.msg)
        navigate(allIntegURL)
      } else {
        toast.error(res.data || res)
      }
    })
  }

  const nextPage = pageNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedFields(microsoftExcelConf)) {
      toast.error(
        __('Please select an action and fill the required options and fields', 'bit-integrations')
      )

      return
    }
    setstep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <MicrosoftExcelAuthorization
        microsoftExcelConf={microsoftExcelConf}
        setMicrosoftExcelConf={setMicrosoftExcelConf}
        step={step}
        setstep={setstep}
      />

      <div
        className="btcd-stp-page"
        style={{
          ...(step === 2 && { height: 'auto', minHeight: 500, overflow: 'visible', width: 900 })
        }}>
        {step === 2 && (
          <MicrosoftExcelIntegLayout
            formFields={formFields}
            microsoftExcelConf={microsoftExcelConf}
            setMicrosoftExcelConf={setMicrosoftExcelConf}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}

        <button
          onClick={() => nextPage(3)}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={microsoftExcelConf}
        setDataConf={setMicrosoftExcelConf}
        formFields={formFields}
      />
    </div>
  )
}

export default MicrosoftExcel
