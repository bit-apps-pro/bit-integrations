import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { getConfError, handleInput } from './CartReboundCommonFunc'
import CartReboundIntegLayout from './CartReboundIntegLayout'

export default function EditCartRebound({ allIntegURL }) {
  const navigate = useNavigate()
  const { id, formID } = useParams()

  const [cartReboundConf, setCartReboundConf] = useRecoilState($actionConf)
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
          onChange={e => handleInput(e, cartReboundConf, setCartReboundConf)}
          name="name"
          value={cartReboundConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <CartReboundIntegLayout
        formID={formID}
        formFields={formFields}
        cartReboundConf={cartReboundConf}
        setCartReboundConf={setCartReboundConf}
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
            conf: cartReboundConf,
            navigate,
            id,
            edit: 1,
            setIsLoading,
            setSnackbar
          })
        }
        disabled={!!getConfError(cartReboundConf)}
        isLoading={isLoading}
        dataConf={cartReboundConf}
        setDataConf={setCartReboundConf}
        formFields={formFields}
      />
      <br />
    </div>
  )
}
