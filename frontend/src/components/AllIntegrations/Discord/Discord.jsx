/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import DiscordAuthorization from './DiscordAuthorization'
import { handleInput } from './DiscordCommonFunc'
import DiscordIntegLayout from './DiscordIntegLayout'
import BackIcn from '../../../Icons/BackIcn'

function Discord({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [discordConf, setDiscordConf] = useState({
    name: 'Discord',
    type: 'Discord',
    accessToken: '',
    parse_mode: 'HTML',
    field_map: [{ formField: '', discordFormField: '' }],
    server_id: '',
    channel_id: '',
    body: '',
    actions: {}
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (val === 3) {
      if (discordConf.name !== '' && discordConf.selectedChannel && discordConf.selectedServer) {
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
      <DiscordAuthorization
        discordConf={discordConf}
        setDiscordConf={setDiscordConf}
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
        <DiscordIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, discordConf, setDiscordConf, setIsLoading, setSnackbar)}
          discordConf={discordConf}
          setDiscordConf={setDiscordConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={discordConf.selectedChannel === '' || discordConf.selectedServer === ''}
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
            conf: discordConf,
            navigate,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={discordConf}
        setDataConf={setDiscordConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Discord
