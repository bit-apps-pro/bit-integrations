import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import CartReboundAuthorization from './CartReboundAuthorization'
import { getConfError } from './CartReboundCommonFunc'
import CartReboundIntegLayout from './CartReboundIntegLayout'

export default function CartRebound({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [cartReboundConf, setCartReboundConf] = useState({
    name: 'Cart Rebound',
    type: 'CartRebound',
    field_map: [{ formField: '', cartReboundField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      const confError = getConfError(cartReboundConf)

      if (confError) {
        setSnackbar({ show: true, msg: confError })
        return
      }

      if (cartReboundConf.name !== '' && cartReboundConf.field_map.length > 0) {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2" />

      <CartReboundAuthorization
        formID={formID}
        cartReboundConf={cartReboundConf}
        setCartReboundConf={setCartReboundConf}
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
        <CartReboundIntegLayout
          formID={formID}
          formFields={formFields}
          cartReboundConf={cartReboundConf}
          setCartReboundConf={setCartReboundConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={cartReboundConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, cartReboundConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={cartReboundConf}
        setDataConf={setCartReboundConf}
        formFields={formFields}
      />
    </div>
  )
}
