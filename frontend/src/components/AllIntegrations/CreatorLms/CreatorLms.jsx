import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import CreatorLmsAuthorization from './CreatorLmsAuthorization'
import { checkMappedFields } from './CreatorLmsCommonFunc'
import CreatorLmsIntegLayout from './CreatorLmsIntegLayout'

export default function CreatorLms({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [creatorLmsConf, setCreatorLmsConf] = useState({
    name: 'Creator LMS',
    type: 'CreatorLms',
    field_map: [{ formField: '', creatorLmsField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!checkMappedFields(creatorLmsConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (creatorLmsConf.name !== '' && creatorLmsConf.field_map.length > 0) {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">{/* <Steps step={3} active={step} /> */}</div>

      {/* STEP 1 */}
      <CreatorLmsAuthorization
        formID={formID}
        creatorLmsConf={creatorLmsConf}
        setCreatorLmsConf={setCreatorLmsConf}
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
          minHeight: step === 2 && `${500}px`
        }}>
        <CreatorLmsIntegLayout
          formID={formID}
          formFields={formFields}
          creatorLmsConf={creatorLmsConf}
          setCreatorLmsConf={setCreatorLmsConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={!checkMappedFields(creatorLmsConf)}
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
          saveIntegConfig(flow, setFlow, allIntegURL, creatorLmsConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={creatorLmsConf}
        setDataConf={setCreatorLmsConf}
        formFields={formFields}
      />
    </div>
  )
}
