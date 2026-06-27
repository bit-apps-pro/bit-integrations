import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import WCAffiliateAuthorization from './WCAffiliateAuthorization'
import { validateRequiredFields } from './WCAffiliateCommonFunc'
import WCAffiliateIntegLayout from './WCAffiliateIntegLayout'

export default function WCAffiliate({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [wcAffiliateConf, setWCAffiliateConf] = useState({
    name: 'WC Affiliate',
    type: 'WC Affiliate',
    field_map: [{ formField: '', wcAffiliateField: '' }],
    actions: {},
    fixedFieldValues: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      const validation = validateRequiredFields(wcAffiliateConf)
      if (!validation.isValid) {
        setSnackbar({
          show: true,
          msg: validation.message
        })
        return
      }

      if (wcAffiliateConf.name !== '' && wcAffiliateConf.field_map.length > 0) {
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

      <WCAffiliateAuthorization
        formID={formID}
        wcAffiliateConf={wcAffiliateConf}
        setWCAffiliateConf={setWCAffiliateConf}
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
          minHeight: step === 2 && `${500}px`
        }}>
        <WCAffiliateIntegLayout
          formID={formID}
          formFields={formFields}
          wcAffiliateConf={wcAffiliateConf}
          setWCAffiliateConf={setWCAffiliateConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={wcAffiliateConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() => {
          const validation = validateRequiredFields(wcAffiliateConf)
          if (!validation.isValid) {
            setSnackbar({
              show: true,
              msg: validation.message
            })
            return
          }

          saveIntegConfig(flow, setFlow, allIntegURL, wcAffiliateConf, navigate, '', '', setIsLoading)
        }}
        isLoading={isLoading}
        dataConf={wcAffiliateConf}
        setDataConf={setWCAffiliateConf}
        formFields={formFields}
      />
    </div>
  )
}
