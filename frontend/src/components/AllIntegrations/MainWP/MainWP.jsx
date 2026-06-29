import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import MainWPAuthorization from './MainWPAuthorization'
import { checkMappedFields } from './MainWPCommonFunc'
import MainWPIntegLayout from './MainWPIntegLayout'

export default function MainWP({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [mainWPConf, setMainWPConf] = useState({
    name: 'MainWP',
    type: 'MainWP',
    field_map: [],
    actions: {},
    mainAction: '',
    mainWPFields: [],
    selectedSite: '',
    allSites: [],
    utilities: {}
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!checkMappedFields(mainWPConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (mainWPConf.name !== '') {
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
      <MainWPAuthorization
        formID={formID}
        mainWPConf={mainWPConf}
        setMainWPConf={setMainWPConf}
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
        <MainWPIntegLayout
          formID={formID}
          formFields={formFields}
          mainWPConf={mainWPConf}
          setMainWPConf={setMainWPConf}
          setSnackbar={setSnackbar}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={!checkMappedFields(mainWPConf)}
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
          saveIntegConfig(flow, setFlow, allIntegURL, mainWPConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={mainWPConf}
        setDataConf={setMainWPConf}
        formFields={formFields}
      />
    </div>
  )
}
