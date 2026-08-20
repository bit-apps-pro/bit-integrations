// eslint-disable-next-line import/no-extraneous-dependencies
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SendinBlueAuthorization from './SendinBlueAuthorization'
import { checkMappedFields } from './SendinBlueCommonFunc'
import SendinBlueIntegLayout from './SendinBlueIntegLayout'

function SendinBlue({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [error, setError] = useState({ templateId: '', RedirectionUrl: '' })
  const [sendinBlueConf, setSendinBlueConf] = useState({
    name: 'Brevo(Sendinblue)',
    type: 'Brevo(Sendinblue)',
    lists: [],
    api_key: '',
    field_map: [{ formField: '', sendinBlueField: '' }],
    actions: {}
  })
  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (val === 3) {
      if (sendinBlueConf.templateId === '' || sendinBlueConf.redirectionUrl === '') {
        setError({
          templateId: !sendinBlueConf.templateId
            ? __("Template name can't be empty", 'bit-integrations')
            : '',
          redirectionUrl: !sendinBlueConf.redirectionUrl
            ? __("Redirection url name can't be empty", 'bit-integrations')
            : ''
        })
        return
      }
      if (!checkMappedFields(sendinBlueConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }
      if (sendinBlueConf.name !== '' && sendinBlueConf.field_map.length > 0) {
        setstep(3)
      }
    }
  }
  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <SendinBlueAuthorization
        formID={formID}
        sendinBlueConf={sendinBlueConf}
        setSendinBlueConf={setSendinBlueConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />
      <div className="btcd-stp-page" style={{ width: step === 2 && 900, height: step === 2 && 'auto' }}>
        <SendinBlueIntegLayout
          formID={formID}
          formFields={formFields}
          sendinBlueConf={sendinBlueConf}
          setSendinBlueConf={setSendinBlueConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
          error={error}
          setError={setError}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={sendinBlueConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, sendinBlueConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={sendinBlueConf}
        setDataConf={setSendinBlueConf}
        formFields={formFields}
      />
    </div>
  )
}

export default SendinBlue
