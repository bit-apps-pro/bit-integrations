/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import { checkMappedFields, handleInput } from './TwilioCommonFunc'
import TwilioAuthorization from './TwilioAuthorization'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import TwilioIntegLayout from './TwilioIntegLayout'

function Twilio({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const twilioFields = [
    { key: 'To', label: __('To', 'bit-integrations'), required: true },
    { key: 'Body', label: __('Message Body', 'bit-integrations'), required: true }
  ]

  const [twilioConf, setTwilioConf] = useState({
    name: 'Twilio',
    type: 'Twilio',
    sid: '',
    token: '',
    body: '',
    to: '',
    from_num: '',
    field_map: [
      { formField: '', twilioField: 'To' },
      { formField: '', twilioField: 'Body' }
    ],
    twilioFields
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, twilioConf, navigate, '', '', setIsLoading)
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
    if (twilioConf.to === '' && twilioConf.body === '') {
      toast.error('Please select To and Body field , it is required')
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

      {/* STEP 1 */}

      <TwilioAuthorization
        twilioConf={twilioConf}
        setTwilioConf={setTwilioConf}
        step={step}
        setstep={setstep}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{
          ...(step === 2 && {
            width: 900,
            height: 'auto',
            overflow: 'visible'
          })
        }}>
        <TwilioIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, twilioConf, setTwilioConf, setIsLoading, setSnackbar)}
          twilioConf={twilioConf}
          setTwilioConf={setTwilioConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      {/* STEP 3 */}
      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={twilioConf}
        setDataConf={setTwilioConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Twilio
