/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import StepPage from '../../Utilities/StepPage'
import Steps from '../../Utilities/Steps'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import NotionAuthorization from './NotionAuthorization'
import { nextPage, saveConfig } from './NotionCommonFunc'
import NotionIntegLayout from './NotionIntegLayout'

function Notion({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState({
    list: false,
    page: false,
    field: false
  })
  const [notionConf, setNotionConf] = useState({
    name: 'Notion',
    type: 'Notion',
    clientId: '',
    clientSecret: '',
    databaseId: '',
    field_map: [{ formFields: '', notionFormFields: '' }],
    notionFields: ''
  })
  const setSavePageLoad = value => {
    setLoading({ ...loading, page: value })
  }

  return (
    <div>
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>
      <NotionAuthorization
        step={step}
        setStep={setStep}
        notionConf={notionConf}
        setNotionConf={setNotionConf}
      />

      {/* --- STEP 2 --- */}

      <StepPage step={step} stepNo={2} style={{ width: 900, height: 'auto', overflow: 'visible' }}>
        <NotionIntegLayout
          notionConf={notionConf}
          setNotionConf={setNotionConf}
          formFields={formFields}
          loading={loading}
          setLoading={setLoading}
        />
        {notionConf?.databaseId && (
          <button
            onClick={() => nextPage(notionConf, setStep, 3)}
            disabled={!notionConf.databaseId || notionConf.field_map.length < 1}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next')}
            &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </StepPage>

      {notionConf.databaseId && (
        <IntegrationStepThree
          step={step}
          saveConfig={() =>
            saveConfig(flow, setFlow, allIntegURL, notionConf, navigate, setSavePageLoad)
          }
          isLoading={loading.page}
          dataConf={notionConf}
          setDataConf={setNotionConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Notion
