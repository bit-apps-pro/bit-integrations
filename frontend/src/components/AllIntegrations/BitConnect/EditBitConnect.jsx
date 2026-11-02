import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields, checkRequiredSelect, handleInput } from './BitConnectCommonFunc'
import BitConnectIntegLayout from './BitConnectIntegLayout'

export default function EditBitConnect({ allIntegURL }) {
  const navigate = useNavigate()
  const { id, formID } = useParams()

  const [bitConnectConf, setBitConnectConf] = useRecoilState($actionConf)
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
          onChange={e => handleInput(e, bitConnectConf, setBitConnectConf)}
          name="name"
          value={bitConnectConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <BitConnectIntegLayout
        formID={formID}
        formFields={formFields}
        bitConnectConf={bitConnectConf}
        setBitConnectConf={setBitConnectConf}
        setSnackbar={setSnackbar}
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
            conf: bitConnectConf,
            navigate,
            id,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!checkMappedFields(bitConnectConf) || !!checkRequiredSelect(bitConnectConf)}
        isLoading={isLoading}
        dataConf={bitConnectConf}
        setDataConf={setBitConnectConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}
