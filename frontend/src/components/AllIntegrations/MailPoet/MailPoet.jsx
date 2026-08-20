import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import MailPoetAuthorization from './MailPoetAuthorization'
import { checkMappedFields, refreshNewsLetter } from './MailPoetCommonFunc'
import MailPoetIntegLayout from './MailPoetIntegLayout'

export default function MailPoet({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [mailPoetConf, setMailPoetConf] = useState({
    name: 'Mail Poet',
    type: 'Mail Poet',
    field_map: [{ formField: '', mailPoetField: '' }],
    actions: {}
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (val === 3) {
      if (!checkMappedFields(mailPoetConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }
      if (mailPoetConf.name !== '' && mailPoetConf.field_map.length > 0) {
        setStep(val)
      }
    } else {
      setStep(val)
      if (val === 2 && mailPoetConf.name) {
        refreshNewsLetter(formID, mailPoetConf, setMailPoetConf, setIsLoading, setSnackbar)
      }
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2"></div>

      <MailPoetAuthorization
        formID={formID}
        mailPoetConf={mailPoetConf}
        setMailPoetConf={setMailPoetConf}
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
        <MailPoetIntegLayout
          formID={formID}
          formFields={formFields}
          mailPoetConf={mailPoetConf}
          setMailPoetConf={setMailPoetConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={mailPoetConf.lists === '' || mailPoetConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, mailPoetConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={mailPoetConf}
        setDataConf={setMailPoetConf}
        formFields={formFields}
      />
    </div>
  )
}
