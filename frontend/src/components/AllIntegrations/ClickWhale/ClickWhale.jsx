import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import ClickWhaleAuthorization from './ClickWhaleAuthorization'
import { checkMappedFields } from './ClickWhaleCommonFunc'
import ClickWhaleIntegLayout from './ClickWhaleIntegLayout'

export default function ClickWhale({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [clickWhaleConf, setClickWhaleConf] = useState({
    name: 'ClickWhale',
    type: 'ClickWhale',
    field_map: [{ formField: '', clickWhaleField: '' }],
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
      if (!checkMappedFields(clickWhaleConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (clickWhaleConf.name !== '' && clickWhaleConf.field_map.length > 0) {
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

      <ClickWhaleAuthorization
        clickWhaleConf={clickWhaleConf}
        setClickWhaleConf={setClickWhaleConf}
        step={step}
        nextPage={nextPage}
      />

      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <ClickWhaleIntegLayout
          formID={formID}
          formFields={formFields}
          clickWhaleConf={clickWhaleConf}
          setClickWhaleConf={setClickWhaleConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={clickWhaleConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, clickWhaleConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={clickWhaleConf}
        setDataConf={setClickWhaleConf}
        formFields={formFields}
      />
    </div>
  )
}
