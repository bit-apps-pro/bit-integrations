import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
// import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
// import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import WhatsAppAuthorization from './WhatsAppAuthorization'
import { generateMappedField, checkDisabledButton } from './WhatsAppCommonFunc'
import WhatsAppIntegLayout from './WhatsAppIntegLayout'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'

function WhatsApp({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi
  const whatsAppFields = [{ key: 'phone', label: "Recipient's Phone", required: true }]
  const messageTypes = [
    { name: 'template', label: __('Template Message', 'bit-integrations'), is_pro: false },
    { name: 'text', label: __('Text Message', 'bit-integrations'), is_pro: true },
    { name: 'contact', label: __('Contact Message', 'bit-integrations'), is_pro: true },
    { name: 'media', label: __('Media Message', 'bit-integrations'), is_pro: true }
  ]
  const mediaTypes = [
    'image/jpeg',
    'image/png',
    'text/plain',
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'audio/aac',
    'audio/mp4',
    'audio/mpeg',
    'audio/amr',
    'audio/ogg',
    'audio/opus',
    'video/mp4',
    'video/3gp',
    'image/webp'
  ]

  const [whatsAppConf, setWhatsAppConf] = useState({
    name: 'WhatsApp',
    type: 'WhatsApp',
    numberID: '',
    businessAccountID: '',
    messageTypes,
    mediaTypes,
    messageType: '',
    body: '',
    templateName: '',
    token: '',
    field_map: generateMappedField(whatsAppFields),
    whatsAppFields,
    address_field: [],
    actions: {},
    allTemplates: []
  })

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (checkDisabledButton(whatsAppConf)) {
      setSnackbar({ show: true, msg: __('Please map fields to continue.', 'bit-integrations') })
      return
    }
    setstep(3)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <WhatsAppAuthorization
        whatsAppConf={whatsAppConf}
        setWhatsAppConf={setWhatsAppConf}
        step={step}
        setstep={setstep}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <WhatsAppIntegLayout
          formFields={formFields}
          whatsAppConf={whatsAppConf}
          setWhatsAppConf={setWhatsAppConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={checkDisabledButton(whatsAppConf)}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>
      {/* STEP 3 */}
      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            navigate,
            conf: whatsAppConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={whatsAppConf}
        setDataConf={setWhatsAppConf}
        formFields={formFields}
      />
    </div>
  )
}

export default WhatsApp
