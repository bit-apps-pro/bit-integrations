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
import MoxieCRMAuthorization from './MoxieCRMAuthorization'
import { checkMappedFields, handleInput } from './MoxieCRMCommonFunc'
import MoxieCRMIntegLayout from './MoxieCRMIntegLayout'

function MoxieCRM({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const clientFields = [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'address1', label: __('Address1', 'bit-integrations'), required: false },
    { key: 'address2', label: __('Address2', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'locality', label: __('Locality', 'bit-integrations'), required: false },
    { key: 'postal', label: __('Postal', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'leadSource', label: __('Lead Source', 'bit-integrations'), required: false },
    { key: 'hourlyAmount', label: __('Hourly Amount', 'bit-integrations'), required: false },
    { key: 'currency', label: __('Currency', 'bit-integrations'), required: false },
    { key: 'notes', label: __('Notes', 'bit-integrations'), required: false },
    { key: 'firstName', label: __('Contact First Name', 'bit-integrations'), required: false },
    { key: 'lastName', label: __('Contact Last Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Contact Email', 'bit-integrations'), required: false }
  ]

  const contactFields = [
    { key: 'email', label: __('Email Address', 'bit-integrations'), required: true },
    { key: 'first', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'notes', label: __('Notes', 'bit-integrations'), required: false }
  ]

  const opportunityFields = [
    { key: 'name', label: __('Opportunity Name', 'bit-integrations'), required: true },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'value', label: __('Value', 'bit-integrations'), required: false },
    { key: 'firstName', label: __('Lead First Name', 'bit-integrations'), required: false },
    { key: 'lastName', label: __('Lead Last Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Lead Email', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Lead Phone', 'bit-integrations'), required: false },
    { key: 'role', label: __('Lead Role', 'bit-integrations'), required: false },
    { key: 'businessName', label: __('Lead Business Name', 'bit-integrations'), required: false },
    { key: 'website', label: __('Lead Website', 'bit-integrations'), required: false },
    { key: 'address1', label: __('Lead Address 1', 'bit-integrations'), required: false },
    { key: 'address2', label: __('Lead Address 2', 'bit-integrations'), required: false },
    { key: 'city', label: __('Lead City', 'bit-integrations'), required: false },
    { key: 'locality', label: __('Lead Locality', 'bit-integrations'), required: false },
    { key: 'postal', label: __('Lead Postal', 'bit-integrations'), required: false },
    { key: 'country', label: __('Lead Country', 'bit-integrations'), required: false },
    { key: 'sourceUrl', label: __('Lead Source Url', 'bit-integrations'), required: false },
    { key: 'leadSource', label: __('Lead Source', 'bit-integrations'), required: false }
  ]

  const [moxiecrmConf, setMoxieCRMConf] = useState({
    name: 'MoxieCRM',
    type: 'MoxieCRM',
    api_key: '',
    api_url: '',
    field_map: [{ formField: '', moxiecrmFormField: '' }],
    actionName: '',
    clientFields,
    contactFields,
    opportunityFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      moxiecrmConf,
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

    if (!checkMappedFields(moxiecrmConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    moxiecrmConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <MoxieCRMAuthorization
        moxiecrmConf={moxiecrmConf}
        setMoxieCRMConf={setMoxieCRMConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <MoxieCRMIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, moxiecrmConf, setMoxieCRMConf, setLoading, setSnackbar)}
          moxiecrmConf={moxiecrmConf}
          setMoxieCRMConf={setMoxieCRMConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {moxiecrmConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(moxiecrmConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {moxiecrmConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={moxiecrmConf}
          setDataConf={setMoxieCRMConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default MoxieCRM
