import { useState } from 'react'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import StepPage from '../../Utilities/StepPage'
import Steps from '../../Utilities/Steps'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SelzyAuthorization from './SelzyAuthorization'
import { nextPage, saveConfig } from './SelzyCommonFunc'
import SelzyIntegLayout from './SelzyIntegLayout'

function Selzy({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState({
    auth: false,
    list: false,
    tag: false,
    page: false
  })

  const [selzyConf, setSelzyConf] = useState({
    name: 'Selzy',
    type: 'Selzy',
    api_key: '',
    field_map: [{ formFields: '', selzyFormField: '' }],
    listIds: '',
    tags: '',
    method: '',
    option: '0',
    overwrite: '0',
    doubleOption: [
      { key: '0', name: 'Invitation' },
      { key: '3', name: 'Auto Subscribe' },
      { key: '4', name: 'Update Subscribe' }
    ],
    overwriteOption: [
      { key: '0', name: 'Default' },
      { key: '1', name: 'Field and Tag' },
      { key: '2', name: 'Tag' }
    ],
    actions: {},
    selzyFields: [
      { key: 'email', label: 'Email', required: true },
      // { key: 'name', label: 'Name', required: false },
      { key: 'phone', label: 'Phone Number', required: false }
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

      {/* --- STEP 1 --- */}

      <SelzyAuthorization
        selzyConf={selzyConf}
        setSelzyConf={setSelzyConf}
        loading={loading}
        setLoading={setLoading}
        step={step}
        setStep={setStep}
      />

      {/* --- STEP 2 --- */}

      <StepPage step={step} stepNo={2} style={{ width: 900, height: 'auto', overflow: 'visible' }}>
        <SelzyIntegLayout
          selzyConf={selzyConf}
          setSelzyConf={setSelzyConf}
          formFields={formFields}
          loading={loading}
          setLoading={setLoading}
        />

        {selzyConf?.listIds && (
          <button
            onClick={() => nextPage(selzyConf, setStep, 3)}
            disabled={!selzyConf.listIds || selzyConf.field_map.length < 1}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next')}
            &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </StepPage>

      {/* --- STEP 3 --- */}
      {selzyConf.listIds && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig(flow, setFlow, allIntegURL, selzyConf, navigate, setSavePageLoad)}
          isLoading={loading.page}
          dataConf={selzyConf}
          setDataConf={setSelzyConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Selzy
