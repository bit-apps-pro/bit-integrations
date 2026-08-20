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
import ZendeskAuthorization from './ZendeskAuthorization'
import { checkMappedFields, handleInput } from './ZendeskCommonFunc'
import ZendeskIntegLayout from './ZendeskIntegLayout'

function Zendesk({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const organizationFields = [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'mobile', label: __('Mobile', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'line1', label: __('Street', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'postal_code', label: __('Postal Code', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'fax', label: __('Fax', 'bit-integrations'), required: false },
    { key: 'facebook', label: __('Facebook', 'bit-integrations'), required: false },
    { key: 'skype', label: __('Skype', 'bit-integrations'), required: false },
    { key: 'linkedin', label: __('LinkedIn', 'bit-integrations'), required: false },
    { key: 'twitter', label: __('Twitter', 'bit-integrations'), required: false }
  ]

  const contactFields = [
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: true },
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'mobile', label: __('Mobile', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'line1', label: __('Street', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'postal_code', label: __('Postal Code', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'fax', label: __('Fax', 'bit-integrations'), required: false },
    { key: 'facebook', label: __('Facebook', 'bit-integrations'), required: false },
    { key: 'skype', label: __('Skype', 'bit-integrations'), required: false },
    { key: 'linkedin', label: __('LinkedIn', 'bit-integrations'), required: false },
    { key: 'twitter', label: __('Twitter', 'bit-integrations'), required: false }
  ]

  const leadFields = [
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: true },
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'mobile', label: __('Mobile', 'bit-integrations'), required: false },
    { key: 'fax', label: __('Fax', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'line1', label: __('Street', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'postal_code', label: __('Postal Code', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'facebook', label: __('Facebook', 'bit-integrations'), required: false },
    { key: 'skype', label: __('Skype', 'bit-integrations'), required: false },
    { key: 'linkedin', label: __('LinkedIn', 'bit-integrations'), required: false },
    { key: 'twitter', label: __('Twitter', 'bit-integrations'), required: false }
  ]

  const dealFields = [
    { key: 'name', label: __('Deal Name', 'bit-integrations'), required: true },
    { key: 'value', label: __('Value', 'bit-integrations'), required: false },
    {
      key: 'estimated_close_date',
      label: __('Estimated Close Date', 'bit-integrations'),
      required: false
    },
    { key: 'added_at', label: __('Added On', 'bit-integrations'), required: false },
    {
      key: 'last_stage_change_at',
      label: __('Last Moved Stage On', 'bit-integrations'),
      required: false
    }
  ]

  const [zendeskConf, setZendeskConf] = useState({
    name: 'Zendesk',
    type: 'Zendesk',
    api_key: '',
    field_map: [{ formField: '', zendeskFormField: '' }],
    actionName: '',
    organizationFields,
    contactFields,
    leadFields,
    dealFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, zendeskConf, navigate, '', '', setIsLoading)
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

    if (!checkMappedFields(zendeskConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (zendeskConf.actionName === 'deal' && !zendeskConf.selectedCRMContact) {
      toast.error(__('Please select a contact', 'bit-integrations'))
      return
    }

    zendeskConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <ZendeskAuthorization
        zendeskConf={zendeskConf}
        setZendeskConf={setZendeskConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <ZendeskIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, zendeskConf, setZendeskConf, setLoading, setSnackbar)}
          zendeskConf={zendeskConf}
          setZendeskConf={setZendeskConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {zendeskConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(zendeskConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {zendeskConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={zendeskConf}
          setDataConf={setZendeskConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Zendesk
