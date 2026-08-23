import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields, handleInput } from './CartAbandonmentRecoveryCommonFunc'
import CartAbandonmentRecoveryIntegLayout from './CartAbandonmentRecoveryIntegLayout'

export default function EditCartAbandonmentRecovery({ allIntegURL }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [cartAbandonmentRecoveryConf, setCartAbandonmentRecoveryConf] = useRecoilState($actionConf)
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
          onChange={e => handleInput(e, cartAbandonmentRecoveryConf, setCartAbandonmentRecoveryConf)}
          name="name"
          value={cartAbandonmentRecoveryConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <CartAbandonmentRecoveryIntegLayout
        formFields={formFields}
        cartAbandonmentRecoveryConf={cartAbandonmentRecoveryConf}
        setCartAbandonmentRecoveryConf={setCartAbandonmentRecoveryConf}
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
            conf: cartAbandonmentRecoveryConf,
            navigate,
            id,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!checkMappedFields(cartAbandonmentRecoveryConf)}
        isLoading={isLoading}
        dataConf={cartAbandonmentRecoveryConf}
        setDataConf={setCartAbandonmentRecoveryConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}
