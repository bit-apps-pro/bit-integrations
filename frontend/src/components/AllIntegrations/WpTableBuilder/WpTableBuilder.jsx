import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import WpTableBuilderAuthorization from './WpTableBuilderAuthorization'
import { checkMappedFields } from './WpTableBuilderCommonFunc'
import WpTableBuilderIntegLayout from './WpTableBuilderIntegLayout'

export default function WpTableBuilder({ formFields, setFlow, flow, allIntegURL, isInfo }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [wpTableBuilderConf, setWpTableBuilderConf] = useState({
    name: 'WpTableBuilder',
    type: 'WpTableBuilder',
    field_map: [{ formField: '', wpTableBuilderField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      // Guarded because this fires 300ms later — navigating away in that window
      // unmounts the wrapper and the stray timer would throw on a null deref.
      const settingsWrp = document.getElementById('btcd-settings-wrp')

      if (settingsWrp) {
        settingsWrp.scrollTop = 0
      }
    }, 300)

    if (val === 3) {
      if (!checkMappedFields(wpTableBuilderConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (wpTableBuilderConf.name !== '' && wpTableBuilderConf.field_map.length > 0) {
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
      <WpTableBuilderAuthorization
        wpTableBuilderConf={wpTableBuilderConf}
        setWpTableBuilderConf={setWpTableBuilderConf}
        step={step}
        nextPage={nextPage}
        isInfo={isInfo}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <WpTableBuilderIntegLayout
          formID={formID}
          formFields={formFields}
          wpTableBuilderConf={wpTableBuilderConf}
          setWpTableBuilderConf={setWpTableBuilderConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={wpTableBuilderConf.field_map.length < 1}
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
          saveIntegConfig(flow, setFlow, allIntegURL, wpTableBuilderConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={wpTableBuilderConf}
        setDataConf={setWpTableBuilderConf}
        formFields={formFields}
      />
    </div>
  )
}
