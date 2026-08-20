import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import TelegramAuthorization from './TelegramAuthorization'
import TelegramIntegLayout from './TelegramIntegLayout'

export default function Telegram({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [telegramConf, setTelegramConf] = useState({
    name: 'Telegram',
    type: 'Telegram',
    parse_mode: 'HTML',
    bot_api_key: '',
    chat_id: '',
    body: '',
    actions: {}
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (val === 3) {
      if (telegramConf.name !== '' && telegramConf.chat_id) {
        setStep(val)
      }
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <TelegramAuthorization
        formID={formID}
        telegramConf={telegramConf}
        setTelegramConf={setTelegramConf}
        step={step}
        setstep={setStep}
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
        <TelegramIntegLayout
          formID={formID}
          formFields={formFields}
          telegramConf={telegramConf}
          setTelegramConf={setTelegramConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={telegramConf.chat_id === ''}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, telegramConf, navigate, 0, false, setIsLoading)
        }
        isLoading={isLoading}
        dataConf={telegramConf}
        setDataConf={setTelegramConf}
        formFields={formFields}
      />
    </div>
  )
}
