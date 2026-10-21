import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import MailerooAuthorization from './MailerooAuthorization'
import { checkMappedFields } from './MailerooCommonFunc'
import MailerooIntegLayout from './MailerooIntegLayout'
import 'react-multiple-select-dropdown-lite/dist/index.css'

function Maileroo({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [mailerooConf, setMailerooConf] = useState({
    field_map: [],
    name: 'Maileroo',
    type: 'Maileroo',
    utilities: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      mailerooConf,
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

    if (!checkMappedFields(mailerooConf)) {
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

      <MailerooAuthorization
        mailerooConf={mailerooConf}
        setMailerooConf={setMailerooConf}
        step={step}
        setstep={setstep}
      />

      <div
        className="btcd-stp-page"
        style={{
          ...(step === 2 && { height: 'auto', minHeight: 500, overflow: 'visible', width: 900 })
        }}>
        {step === 2 && (
          <MailerooIntegLayout
            formFields={formFields}
            mailerooConf={mailerooConf}
            setMailerooConf={setMailerooConf}
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
        dataConf={mailerooConf}
        setDataConf={setMailerooConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Maileroo
