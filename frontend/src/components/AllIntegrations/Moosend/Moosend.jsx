import { useState } from 'react'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import StepPage from '../../Utilities/StepPage'
import Steps from '../../Utilities/Steps'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import MoosendAuthorization from './MoosendAuthorization'
import { nextPage, saveConfig } from './MoosendCommonFunc'
import MoosendIntegLayout from './MoosendIntegLayout'

function Moosend({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState({
    auth: false,
    list: false,
    page: false
  })
  const [moosendConf, setMoosendConf] = useState({
    name: 'Moosend',
    type: 'Moosend',
    authKey: '',
    field_map: [{ formFields: '', moosendFormFields: '' }],
    listId: '',
    method: '',
    actions: {},
    moosendFields: [],
    basicFields: [
      { key: 'Email', label: __('Email', 'bit-integrations'), required: true },
      { key: 'Name', label: __('Name', 'bit-integrations'), required: false },
      { key: 'Mobile', label: __('Mobile', 'bit-integrations'), required: false }
    ]
  })

  const setSavePageLoad = value => {
    setLoading({ ...loading, page: value })
  }

  return (
    <div>
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <MoosendAuthorization
        moosendConf={moosendConf}
        setMoosendConf={setMoosendConf}
        loading={loading}
        setLoading={setLoading}
        step={step}
        setStep={setStep}
      />

      <StepPage step={step} stepNo={2} style={{ width: 900, height: 'auto', overflow: 'visible' }}>
        <MoosendIntegLayout
          moosendConf={moosendConf}
          setMoosendConf={setMoosendConf}
          formFields={formFields}
          loading={loading}
          setLoading={setLoading}
        />
        {moosendConf?.method && (
          <button
            onClick={() => nextPage(moosendConf, setStep, 3)}
            disabled={moosendConf.field_map.length < 1}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next')}
            &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </StepPage>

      {moosendConf.method && (
        <IntegrationStepThree
          step={step}
          saveConfig={() =>
            saveConfig(flow, setFlow, allIntegURL, moosendConf, navigate, setSavePageLoad)
          }
          isLoading={loading.page}
          dataConf={moosendConf}
          setDataConf={setMoosendConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Moosend
