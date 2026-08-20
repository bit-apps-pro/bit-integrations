import { useState } from 'react'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import StepPage from '../../Utilities/StepPage'
import Steps from '../../Utilities/Steps'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import MailercloudAuthorization from './MailercloudAuthorization'
import { nextPage, saveConfig } from './MailercloudCommonFunc'
import MailercloudIntegLayout from './MailercloudIntegLayout'

function Mailercloud({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState({
    auth: false,
    list: false,
    page: false
  })
  const [mailercloudConf, setMailercloudConf] = useState({
    name: 'Mailercloud',
    type: 'Mailercloud',
    api_key: '',
    field_map: [{ formFields: '', mailercloudFormField: '' }],
    listId: '',
    contactType: '',
    actions: {}
  })
  const setSavePageLoad = value => {
    setLoading({ ...loading, page: value })
  }
  return (
    <div>
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>


      <MailercloudAuthorization
        mailercloudConf={mailercloudConf}
        setMailercloudConf={setMailercloudConf}
        loading={loading}
        setLoading={setLoading}
        step={step}
        setStep={setStep}
      />


      <StepPage step={step} stepNo={2} style={{ width: 900, height: 'auto', overflow: 'visible' }}>
        <MailercloudIntegLayout
          mailercloudConf={mailercloudConf}
          setMailercloudConf={setMailercloudConf}
          formFields={formFields}
          loading={loading}
          setLoading={setLoading}
        />
        {mailercloudConf?.listId && (
          <button
            onClick={() => nextPage(mailercloudConf, setStep, 3)}
            disabled={!mailercloudConf.listId || mailercloudConf.field_map.length < 1}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next')}
            &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </StepPage>


      {mailercloudConf.listId && (
        <IntegrationStepThree
          step={step}
          saveConfig={() =>
            saveConfig(flow, setFlow, allIntegURL, mailercloudConf, navigate, setSavePageLoad)
          }
          isLoading={loading.page}
          dataConf={mailercloudConf}
          setDataConf={setMailercloudConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Mailercloud
