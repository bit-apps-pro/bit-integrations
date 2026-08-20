// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '../../../Utils/i18nwrap'
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SendPulseAuthorization from './SendPulseAuthorization'
import { checkMappedFields } from './SendPulseCommonFunc'
import SendPulseIntegLayout from './SendPulseIntegLayout'

function SendPulse({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [sendPulseConf, setSendPulseConf] = useState({
    name: 'SendPulse',
    type: 'SendPulse',
    client_id: '',
    client_secret: '',
    field_map: [{ formField: '', sendPulseField: '' }],
    actions: {}
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (val === 3) {
      if (!checkMappedFields(sendPulseConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }
      if (!sendPulseConf?.listId) {
        setSnackbar({ show: true, msg: __('Please select list to continue.', 'bit-integrations') })
        return
      }
      if (sendPulseConf.name !== '' && sendPulseConf.field_map.length > 0) {
        setstep(3)
      }
    }
  }
  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <SendPulseAuthorization
        formID={formID}
        sendPulseConf={sendPulseConf}
        setSendPulseConf={setSendPulseConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />
      <div className="btcd-stp-page" style={{ width: step === 2 && 900, height: step === 2 && 'auto' }}>
        <SendPulseIntegLayout
          formID={formID}
          formFields={formFields}
          sendPulseConf={sendPulseConf}
          setSendPulseConf={setSendPulseConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={!sendPulseConf?.listId || sendPulseConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, sendPulseConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={sendPulseConf}
        setDataConf={setSendPulseConf}
        formFields={formFields}
      />
    </div>
  )
}

export default SendPulse
