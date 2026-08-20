import { useState } from 'react'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import Steps from '../../Utilities/Steps'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import KlaviyoAuthorization from './KlaviyoAuthorization'
import { nextPage, saveConfig } from './KlaviyoCommonFunc'
import KlaviyoIntegLayout from './KlaviyoIntegLayout'

function Klaviyo({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    list: false,
    field: false,
    auth: false
  })
  const [step, setStep] = useState(1)
  const [klaviyoConf, setKlaviyoConf] = useState({
    name: 'Klaviyo',
    type: 'Klaviyo',
    authKey: '',
    field_map: [{ formField: '', klaviyoFormField: '' }],
    custom_field_map: [{ formField: '', klaviyoFormField: '' }],
    klaviyoFields: [
      { key: 'email', label: __('Email', 'bit-integrations'), required: true },
      { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
      { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
      { key: 'title', label: __('Title', 'bit-integrations'), required: false },
      { key: 'organization', label: __('Organization', 'bit-integrations'), required: false },
      { key: 'phone_number', label: __('Phone Number', 'bit-integrations'), required: false }
    ],
    listId: '',
    actions: {}
  })
  return (
    <div>
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>


      <KlaviyoAuthorization
        klaviyoConf={klaviyoConf}
        setKlaviyoConf={setKlaviyoConf}
        loading={loading}
        setLoading={setLoading}
        step={step}
        setStep={setStep}
      />


      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <KlaviyoIntegLayout
          formFields={formFields}
          klaviyoConf={klaviyoConf}
          setKlaviyoConf={setKlaviyoConf}
          loading={loading}
          setLoading={setLoading}
        />

        <button
          onClick={() => nextPage(klaviyoConf, setStep, 3)}
          disabled={!klaviyoConf.listId || klaviyoConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig(flow, setFlow, allIntegURL, klaviyoConf, navigate, setIsLoading)}
        isLoading={isLoading}
        dataConf={klaviyoConf}
        setDataConf={setKlaviyoConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Klaviyo
