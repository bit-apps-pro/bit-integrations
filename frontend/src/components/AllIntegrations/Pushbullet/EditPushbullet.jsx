import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields, handleInput } from './PushbulletCommonFunc'
import PushbulletIntegLayout from './PushbulletIntegLayout'

function EditPushbullet({ allIntegURL }) {
  const navigate = useNavigate()
  const [flow] = useRecoilState($newFlow)
  const [pushbulletConf, setPushbulletConf] = useRecoilState($actionConf)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const saveConfig = () => {
    if (!checkMappedFields(pushbulletConf)) {
      setSnackbar({
        show: true,
        msg: __('Please fill the required options and fields', 'bit-integrations')
      })

      return
    }
    saveActionConf({
      allIntegURL,
      conf: pushbulletConf,
      edit: 1,
      flow,
      navigate,
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
          onChange={e => handleInput(e, pushbulletConf, setPushbulletConf)}
          name="name"
          value={pushbulletConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <PushbulletIntegLayout
        formFields={formField}
        pushbulletConf={pushbulletConf}
        setPushbulletConf={setPushbulletConf}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        disabled={!checkMappedFields(pushbulletConf)}
        isLoading={isLoading}
        dataConf={pushbulletConf}
        setDataConf={setPushbulletConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditPushbullet
