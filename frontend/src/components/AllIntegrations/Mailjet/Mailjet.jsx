/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import MailjetAuthorization from './MailjetAuthorization'
import { checkMappedFields } from './MailjetCommonFunc'
import MailjetIntegLayout from './MailjetIntegLayout'

function Mailjet({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false,
    customFields: false,
    lists: false
  })

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const staticFields = [{ key: 'Email', label: __('Email', 'bit-integrations'), required: true }]

  const [mailjetConf, setMailjetConf] = useState({
    name: 'Mailjet',
    type: 'Mailjet',
    apiKey: '',
    secretKey: '',
    field_map: [{ formField: '', mailjetFormField: '' }],
    staticFields,
    lists: [],
    customFields: [],
    selectedLists: '',
    groups: [],
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, mailjetConf, navigate, '', '', setIsLoading)
    resp.then(res => {
      if (res.success) {
        toast.success(res.data?.msg)
        navigate(allIntegURL)
      } else {
        toast.error(res.data || res)
      }
    })
  }

  const nextPage = pageNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedFields(mailjetConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    mailjetConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <MailjetAuthorization
        mailjetConf={mailjetConf}
        setMailjetConf={setMailjetConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <MailjetIntegLayout
          formFields={formFields}
          mailjetConf={mailjetConf}
          setMailjetConf={setMailjetConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={!mailjetConf?.selectedLists}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={mailjetConf}
        setDataConf={setMailjetConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Mailjet
