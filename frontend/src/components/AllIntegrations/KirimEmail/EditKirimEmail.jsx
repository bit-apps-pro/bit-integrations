/* eslint-disable no-param-reassign */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import EditFormInteg from '../EditFormInteg'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import EditWebhookInteg from '../EditWebhookInteg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import KirimEmailIntegLayout from './KirimEmailIntegLayout'
import { checkMappedFields, handleInput } from './KirimEmailCommonFunc'

function EditKirimEmail({ allIntegURL }) {
  const navigate = useNavigate()

  const [kirimEmailConf, setKirimEmailConf] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })
  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, kirimEmailConf, setKirimEmailConf)}
          name="name"
          value={kirimEmailConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <KirimEmailIntegLayout
        formFields={formFields}
        kirimEmailConf={kirimEmailConf}
        setKirimEmailConf={setKirimEmailConf}
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
            conf: kirimEmailConf,
            navigate,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={
          !checkMappedFields(kirimEmailConf?.field_map) ||
          kirimEmailConf.mainAction === '' ||
          isLoading ||
          (kirimEmailConf.mainAction === '1' &&
            (kirimEmailConf.listId === '' || kirimEmailConf.listId === undefined))
        }
        isLoading={isLoading}
        dataConf={kirimEmailConf}
        setDataConf={setKirimEmailConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}

export default EditKirimEmail
