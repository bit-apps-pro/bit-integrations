/* eslint-disable no-param-reassign */

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import EditFormInteg from '../EditFormInteg'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import EditWebhookInteg from '../EditWebhookInteg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { getConfigError, handleInput } from './SendyCommonFunc'
import SendyIntegLayout from './SendyIntegLayout'

function EditSendy({ allIntegURL }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [flow, setFlow] = useRecoilState($newFlow)
  const [sendyConf, setSendyConf] = useRecoilState($actionConf)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const saveConfig = () => {
    const configError = getConfigError(sendyConf)
    if (configError) {
      setSnackbar({ show: true, msg: configError })
      return
    }
    saveActionConf({
      flow,
      allIntegURL,
      conf: sendyConf,
      navigate,
      edit: 1,
      setIsLoading,
      setSnackbar
    })
  }

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, sendyConf, setSendyConf)}
          name="name"
          value={sendyConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <SendyIntegLayout
        formID={flow.triggered_entity_id}
        formFields={formField}
        handleInput={e => handleInput(e, sendyConf, setSendyConf, setIsLoading, setSnackbar)}
        sendyConf={sendyConf}
        setSendyConf={setSendyConf}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        disabled={sendyConf.field_map.length < 1}
        isLoading={isLoading}
        dataConf={sendyConf}
        setDataConf={setSendyConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditSendy
