import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields, handleInput } from './FollowUpBossCommonFunc'
import FollowUpBossIntegLayout from './FollowUpBossIntegLayout'

function EditFollowUpBoss({ allIntegURL }) {
  const navigate = useNavigate()
  const [flow] = useRecoilState($newFlow)
  const [followUpBossConf, setFollowUpBossConf] = useRecoilState($actionConf)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const saveConfig = () => {
    if (!checkMappedFields(followUpBossConf)) {
      setSnackbar({
        show: true,
        msg: __('Fill in the required options and fields.', 'bit-integrations')
      })

      return
    }
    saveActionConf({
      allIntegURL,
      conf: followUpBossConf,
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
          onChange={e => handleInput(e, followUpBossConf, setFollowUpBossConf)}
          name="name"
          value={followUpBossConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <FollowUpBossIntegLayout
        formFields={formField}
        followUpBossConf={followUpBossConf}
        setFollowUpBossConf={setFollowUpBossConf}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        isLoading={isLoading}
        dataConf={followUpBossConf}
        setDataConf={setFollowUpBossConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditFollowUpBoss
