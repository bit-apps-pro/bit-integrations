import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import WishlistMemberAuthorization from './WishlistMemberAuthorization'
import { checkValidation } from './WishlistMemberCommonFunc'
import WishlistMemberIntegLayout from './WishlistMemberIntegLayout'

export default function WishlistMember({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [wishlistMemberConf, setWishlistMemberConf] = useState({
    name: 'Wishlist Member',
    type: 'Wishlist Member',
    field_map: [{ formField: '', wishlistMemberField: '' }],
    wishlistFields: [],
    action: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3 && checkValidation(wishlistMemberConf)) {
      setSnackbar({
        show: true,
        msg: __('Please map all required fields to continue.', 'bit-integrations')
      })

      return
    }

    setStep(val)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <WishlistMemberAuthorization
        wishlistMemberConf={wishlistMemberConf}
        setWishlistMemberConf={setWishlistMemberConf}
        step={step}
        nextPage={nextPage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{
          ...(step === 2 && { width: 900, minHeight: '600px', height: 'auto', overflow: 'visible' })
        }}>
        <WishlistMemberIntegLayout
          formFields={formFields}
          wishlistMemberConf={wishlistMemberConf}
          setWishlistMemberConf={setWishlistMemberConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={checkValidation(wishlistMemberConf)}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, wishlistMemberConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={wishlistMemberConf}
        setDataConf={setWishlistMemberConf}
        formFields={formFields}
      />
    </div>
  )
}
