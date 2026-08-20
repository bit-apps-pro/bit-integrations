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
import MailBlusterAuthorization from './MailBlusterAuthorization'
import { checkMappedFields, handleInput } from './MailBlusterCommonFunc'
import MailBlusterIntegLayout from './MailBlusterIntegLayout'

function MailBluster({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false,
    customFields: false
  })

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const staticFields = [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'firstName', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'lastName', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'timezone', label: __('Timezone', 'bit-integrations'), required: false },
    { key: 'ipAddress', label: __('IP Address', 'bit-integrations'), required: false }
  ]

  const [mailBlusterConf, setMailBlusterConf] = useState({
    name: 'MailBluster',
    type: 'MailBluster',
    auth_token: '',
    field_map: [{ formField: '', mailBlusterFormField: '' }],
    staticFields,
    subscribed: '',
    customFields: [],
    selectedTags: [],
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      mailBlusterConf,
      navigate,
      '',
      '',
      setIsLoading
    )
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

    if (!checkMappedFields(mailBlusterConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    mailBlusterConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <MailBlusterAuthorization
        mailBlusterConf={mailBlusterConf}
        setMailBlusterConf={setMailBlusterConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <MailBlusterIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, mailBlusterConf, setMailBlusterConf, setLoading, setSnackbar)}
          mailBlusterConf={mailBlusterConf}
          setMailBlusterConf={setMailBlusterConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {mailBlusterConf?.subscribed && (
          <button
            onClick={() => nextPage(3)}
            disabled={!mailBlusterConf?.subscribed}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {mailBlusterConf?.subscribed && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={mailBlusterConf}
          setDataConf={setMailBlusterConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default MailBluster
