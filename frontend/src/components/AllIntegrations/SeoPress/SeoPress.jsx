import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SeoPressAuthorization from './SeoPressAuthorization'
import { checkMappedFields } from './SeoPressCommonFunc'
import SeoPressIntegLayout from './SeoPressIntegLayout'

export default function SeoPress({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [seoPressConf, setSeoPressConf] = useState({
    name: 'SEOPress',
    type: 'SeoPress',
    field_map: [{ formField: '', seoPressField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val !== 3) {
      setStep(val)
    }

    if (!checkMappedFields(seoPressConf)) {
      setSnackbar({
        show: true,
        msg: __('Please map all required fields to continue.', 'bit-integrations')
      })
      return
    }

    if (seoPressConf.name !== '' && seoPressConf.field_map.length > 0) {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">{/* <Steps step={3} active={step} /> */}</div>

      {/* STEP 1 */}
      <SeoPressAuthorization
        formID={formID}
        seoPressConf={seoPressConf}
        setSeoPressConf={setSeoPressConf}
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
        <SeoPressIntegLayout
          formID={formID}
          formFields={formFields}
          seoPressConf={seoPressConf}
          setSeoPressConf={setSeoPressConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
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
          saveIntegConfig(flow, setFlow, allIntegURL, seoPressConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={seoPressConf}
        setDataConf={setSeoPressConf}
        formFields={formFields}
      />
    </div>
  )
}
