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
import SendGridAuthorization from './SendGridAuthorization'
import { checkMappedFields } from './SendGridCommonFunc'
import SendGridIntegLayout from './SendGridIntegLayout'

function SendGrid({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false,
    customFields: false,
    lists: false
  })

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const staticFields = [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'alternate_emails', label: __('Alternate Emails', 'bit-integrations'), required: false },
    { key: 'address_line_1', label: __('Address Line 1', 'bit-integrations'), required: false },
    { key: 'address_line_2', label: __('Address Line 2', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    {
      key: 'state_province_region',
      label: __('State Province Region', 'bit-integrations'),
      required: false
    },
    { key: 'postal_code', label: __('Postal Code', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'phone_number', label: __('Phone Number', 'bit-integrations'), required: false },
    { key: 'whatsapp', label: __('Whatsapp', 'bit-integrations'), required: false },
    { key: 'line', label: __('Line', 'bit-integrations'), required: false },
    { key: 'facebook', label: __('Facebook', 'bit-integrations'), required: false },
    { key: 'unique_name', label: __('Unique Name', 'bit-integrations'), required: false }
  ]

  const [sendGridConf, setSendGridConf] = useState({
    name: 'SendGrid',
    type: 'SendGrid',
    apiKey: '',
    field_map: [{ formField: '', sendGridFormField: '' }],
    staticFields,
    lists: [],
    customFields: [],
    selectedLists: '',
    groups: [],
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      sendGridConf,
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

    if (!checkMappedFields(sendGridConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    sendGridConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <SendGridAuthorization
        sendGridConf={sendGridConf}
        setSendGridConf={setSendGridConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <SendGridIntegLayout
          formFields={formFields}
          sendGridConf={sendGridConf}
          setSendGridConf={setSendGridConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={!checkMappedFields(sendGridConf)}
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
        dataConf={sendGridConf}
        setDataConf={setSendGridConf}
        formFields={formFields}
      />
    </div>
  )
}

export default SendGrid
