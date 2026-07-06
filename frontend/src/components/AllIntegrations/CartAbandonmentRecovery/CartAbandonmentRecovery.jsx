import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import CartAbandonmentRecoveryAuthorization from './CartAbandonmentRecoveryAuthorization'
import { checkMappedFields } from './CartAbandonmentRecoveryCommonFunc'
import CartAbandonmentRecoveryIntegLayout from './CartAbandonmentRecoveryIntegLayout'

export default function CartAbandonmentRecovery({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [cartAbandonmentRecoveryConf, setCartAbandonmentRecoveryConf] = useState({
    name: 'Cart Abandonment Recovery',
    type: 'Cart Abandonment Recovery',
    field_map: [],
    actions: {},
    mainAction: '',
    sessionIdSource: 'select',
    sessionId: '',
    orderStatus: '',
    abandonedCarts: []
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3 && !checkMappedFields(cartAbandonmentRecoveryConf)) {
      setSnackbar({
        show: true,
        msg: __('Please configure all required fields to continue.', 'bit-integrations')
      })
      return
    }

    if (cartAbandonmentRecoveryConf.name !== '') {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <CartAbandonmentRecoveryAuthorization
        cartAbandonmentRecoveryConf={cartAbandonmentRecoveryConf}
        setCartAbandonmentRecoveryConf={setCartAbandonmentRecoveryConf}
        step={step}
        nextPage={nextPage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <CartAbandonmentRecoveryIntegLayout
          formFields={formFields}
          cartAbandonmentRecoveryConf={cartAbandonmentRecoveryConf}
          setCartAbandonmentRecoveryConf={setCartAbandonmentRecoveryConf}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={!cartAbandonmentRecoveryConf.mainAction}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(
            flow,
            setFlow,
            allIntegURL,
            cartAbandonmentRecoveryConf,
            navigate,
            '',
            '',
            setIsLoading
          )
        }
        isLoading={isLoading}
        dataConf={cartAbandonmentRecoveryConf}
        setDataConf={setCartAbandonmentRecoveryConf}
        formFields={formFields}
      />
    </div>
  )
}
