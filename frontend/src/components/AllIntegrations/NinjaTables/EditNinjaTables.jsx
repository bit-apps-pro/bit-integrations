import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import EditFormInteg from '../EditFormInteg'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { checkMappedFields, handleInput } from './NinjaTablesCommonFunc'
import NinjaTablesIntegLayout from './NinjaTablesIntegLayout'

export default function EditNinjaTables({ allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()

  const [ninjaTablesConf, setNinjaTablesConf] = useRecoilState($actionConf)
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
          onChange={e => handleInput(e, ninjaTablesConf, setNinjaTablesConf)}
          name="name"
          value={ninjaTablesConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <NinjaTablesIntegLayout
        formID={formID}
        formFields={formFields}
        ninjaTablesConf={ninjaTablesConf}
        setNinjaTablesConf={setNinjaTablesConf}
        setSnackbar={setSnackbar}
        setIsLoading={setIsLoading}
        isLoading={isLoading}
      />

      <IntegrationStepThree
        edit
        saveConfig={() =>
          saveActionConf({
            flow,
            allIntegURL,
            conf: ninjaTablesConf,
            navigate,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!ninjaTablesConf?.mainAction || !checkMappedFields(ninjaTablesConf)}
        isLoading={isLoading}
        dataConf={ninjaTablesConf}
        setDataConf={setNinjaTablesConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}
