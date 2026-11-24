import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields, getMissingSelectMessage, handleInput } from './VikRentCarCommonFunc'
import VikRentCarIntegLayout from './VikRentCarIntegLayout'

export default function EditVikRentCar({ allIntegURL }) {
  const navigate = useNavigate()
  const { id } = useParams()

  const [vikRentCarConf, setVikRentCarConf] = useRecoilState($actionConf)
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
          onChange={e => handleInput(e, setVikRentCarConf)}
          name="name"
          value={vikRentCarConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <VikRentCarIntegLayout
        formFields={formFields}
        vikRentCarConf={vikRentCarConf}
        setVikRentCarConf={setVikRentCarConf}
        setIsLoading={setIsLoading}
        isLoading={isLoading}
      />

      <IntegrationStepThree
        edit
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            conf: vikRentCarConf,
            navigate,
            id,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!checkMappedFields(vikRentCarConf) || !!getMissingSelectMessage(vikRentCarConf)}
        isLoading={isLoading}
        dataConf={vikRentCarConf}
        setDataConf={setVikRentCarConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}
