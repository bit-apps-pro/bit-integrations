import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import WordPressAuthorization from './WordPressAuthorization'
import { checkMappedFields } from './WordPressCommonFunc'
import WordPressIntegLayout from './WordPressIntegLayout'

export default function WordPress({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [wordPressConf, setWordPressConf] = useState({
    name: 'WordPress',
    type: 'WordPress',
    field_map: [{ formField: '', wordPressField: '' }],
    wordPressFields: [],
    mainAction: '',
    actions: {}
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!wordPressConf.mainAction) {
        setSnackbar({ show: true, msg: __('Please select an action to continue.', 'bit-integrations') })
        return
      }
      if (!checkMappedFields(wordPressConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }
    }
    setStep(val)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2" />

      {/* STEP 1 */}
      <WordPressAuthorization
        wordPressConf={wordPressConf}
        setWordPressConf={setWordPressConf}
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
        <WordPressIntegLayout
          formID={formID}
          formFields={formFields}
          wordPressConf={wordPressConf}
          setWordPressConf={setWordPressConf}
          isLoading={isLoading}
        />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={isLoading || !wordPressConf.mainAction || wordPressConf.field_map.length < 1}
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
          saveIntegConfig(flow, setFlow, allIntegURL, wordPressConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
      />
    </div>
  )
}
