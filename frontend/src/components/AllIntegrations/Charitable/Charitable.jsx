import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import CharitableAuthorization from './CharitableAuthorization'
import { checkMappedFields } from './CharitableCommonFunc'
import CharitableIntegLayout from './CharitableIntegLayout'
import { needsCampaign, needsDonationStatus } from './staticData'

export default function Charitable({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [charitableConf, setCharitableConf] = useState({
    name: 'Charitable',
    type: 'Charitable',
    field_map: [{ formField: '', charitableField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (needsCampaign.includes(charitableConf.mainAction) && !charitableConf?.selectedCampaign) {
        setSnackbar({
          show: true,
          msg: __('Please select a campaign to continue.', 'bit-integrations')
        })
        return
      }

      if (
        needsDonationStatus.includes(charitableConf.mainAction) &&
        !charitableConf?.selectedDonationStatus
      ) {
        setSnackbar({
          show: true,
          msg: __('Please select a donation status to continue.', 'bit-integrations')
        })
        return
      }

      if (!checkMappedFields(charitableConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (charitableConf.name !== '' && charitableConf.field_map.length > 0) {
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

      <CharitableAuthorization
        formID={formID}
        charitableConf={charitableConf}
        setCharitableConf={setCharitableConf}
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
        <CharitableIntegLayout
          formID={formID}
          formFields={formFields}
          charitableConf={charitableConf}
          setCharitableConf={setCharitableConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={charitableConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, charitableConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={charitableConf}
        setDataConf={setCharitableConf}
        formFields={formFields}
      />
    </div>
  )
}
