import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import UltimateAffiliateProAuthorization from './UltimateAffiliateProAuthorization'
import { checkMappedFields } from './UltimateAffiliateProCommonFunc'
import UltimateAffiliateProIntegLayout from './UltimateAffiliateProIntegLayout'

export default function UltimateAffiliatePro({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [ultimateAffiliateProConf, setUltimateAffiliateProConf] = useState({
    name: 'Ultimate Affiliate Pro',
    type: 'Ultimate Affiliate Pro',
    field_map: [{ formField: '', ultimateAffiliateProField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!ultimateAffiliateProConf.mainAction) {
        setSnackbar({
          show: true,
          msg: __('Please select an action to continue.', 'bit-integrations')
        })
        return
      }

      if (!checkMappedFields(ultimateAffiliateProConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (ultimateAffiliateProConf.name !== '' && ultimateAffiliateProConf.field_map.length > 0) {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <UltimateAffiliateProAuthorization
        ultimateAffiliateProConf={ultimateAffiliateProConf}
        setUltimateAffiliateProConf={setUltimateAffiliateProConf}
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
        <UltimateAffiliateProIntegLayout
          formFields={formFields}
          ultimateAffiliateProConf={ultimateAffiliateProConf}
          setUltimateAffiliateProConf={setUltimateAffiliateProConf}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={!ultimateAffiliateProConf.mainAction}
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
            ultimateAffiliateProConf,
            navigate,
            '',
            '',
            setIsLoading
          )
        }
        isLoading={isLoading}
        dataConf={ultimateAffiliateProConf}
        setDataConf={setUltimateAffiliateProConf}
        formFields={formFields}
      />
    </div>
  )
}
