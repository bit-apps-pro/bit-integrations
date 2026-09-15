/* eslint-disable no-param-reassign */
import { useState } from 'react'
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
import { isUserSourceIncomplete } from '../IntegrationHelpers/userSource'
import MemberpressIntegLayout from './MemberpressIntegLayout'
import { handleInput } from './MemberpressCommonFunc'

function EditMemberpress({ allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()

  const [memberpressConf, setMemberpressConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })

  function isDisabled() {
    switch (memberpressConf.mainAction) {
      case '1':
        return (
          memberpressConf.statusId === undefined ||
          memberpressConf.gatewayId === undefined ||
          memberpressConf.selectedMembership === undefined
        )
      default:
        return false
    }
  }

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, memberpressConf, setMemberpressConf)}
          name="name"
          value={memberpressConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <MemberpressIntegLayout
        formID={formID}
        formFields={formFields}
        handleInput={e => handleInput(e, memberpressConf, setMemberpressConf, setIsLoading, setSnackbar)}
        memberpressConf={memberpressConf}
        setMemberpressConf={setMemberpressConf}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={() =>
          saveActionConf({
            flow,
            allIntegURL,
            conf: memberpressConf,
            navigate,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={
          !memberpressConf.mainAction ||
          isLoading ||
          isDisabled() ||
          isUserSourceIncomplete(memberpressConf)
        }
        isLoading={isLoading}
        dataConf={memberpressConf}
        setDataConf={setMemberpressConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

export default EditMemberpress
