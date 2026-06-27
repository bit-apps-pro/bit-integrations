import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import MoreConvertWishlistAuthorization from './MoreConvertWishlistAuthorization'
import { checkMappedFields } from './MoreConvertWishlistCommonFunc'
import MoreConvertWishlistIntegLayout from './MoreConvertWishlistIntegLayout'

export default function MoreConvertWishlist({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [moreConvertWishlistConf, setMoreConvertWishlistConf] = useState({
    name: 'MoreConvert Wishlist',
    type: 'MoreConvert Wishlist',
    field_map: [{ formField: '', moreConvertWishlistField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!checkMappedFields(moreConvertWishlistConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (moreConvertWishlistConf.name !== '' && moreConvertWishlistConf.field_map.length > 0) {
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

      {/* STEP 1 */}
      <MoreConvertWishlistAuthorization
        formID={formID}
        moreConvertWishlistConf={moreConvertWishlistConf}
        setMoreConvertWishlistConf={setMoreConvertWishlistConf}
        step={step}
        nextPage={nextPage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <MoreConvertWishlistIntegLayout
          formFields={formFields}
          moreConvertWishlistConf={moreConvertWishlistConf}
          setMoreConvertWishlistConf={setMoreConvertWishlistConf}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={moreConvertWishlistConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      {/* STEP 3 */}
      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(
            flow,
            setFlow,
            allIntegURL,
            moreConvertWishlistConf,
            navigate,
            '',
            '',
            setIsLoading
          )
        }
        isLoading={isLoading}
        dataConf={moreConvertWishlistConf}
        setDataConf={setMoreConvertWishlistConf}
        formFields={formFields}
      />
    </div>
  )
}
