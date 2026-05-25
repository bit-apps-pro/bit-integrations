/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SlackAuthorization from './SlackAuthorization'
import SlackIntegLayout from './SlackIntegLayout'
import BackIcn from '../../../Icons/BackIcn'

function Slack({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [slackConf, setSlackConf] = useState({
    name: 'Slack',
    type: 'Slack',
    parse_mode: 'HTML',
    field_map: [{ formField: '', slackFormField: '' }],
    channel_id: '',
    channels: [],
    body: '',
    actions: {}
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (val === 3) {
      if (slackConf.name !== '' && slackConf.channel_id) {
        setstep(val)
      }
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <SlackAuthorization
        slackConf={slackConf}
        setSlackConf={setSlackConf}
        step={step}
        setstep={setstep}
        setIsLoading={setIsLoading}
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
        <SlackIntegLayout
          formFields={formFields}
          slackConf={slackConf}
          setSlackConf={setSlackConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={slackConf.channel_id === ''}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
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
            conf: slackConf,
            navigate,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={slackConf}
        setDataConf={setSlackConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Slack
