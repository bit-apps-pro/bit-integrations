/* eslint-disable no-console */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import ZendeskSupportAuthorization from './ZendeskSupportAuthorization'
import ZendeskSupportIntegLayout from './ZendeskSupportIntegLayout'
import { checkMappedFields } from './ZendeskSupportCommonFunc'

function ZendeskSupport({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [zendeskSupportConf, setZendeskSupportConf] = useState({
    name: 'Zendesk Support',
    type: 'ZendeskSupport',
    subdomain: '',
    email: '',
    apiToken: '',
    field_map: [{ formField: '', zendeskSupportField: '' }],
    actionName: '',
    utilities: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      zendeskSupportConf,
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

    if (!checkMappedFields(zendeskSupportConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    zendeskSupportConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <ZendeskSupportAuthorization
        zendeskSupportConf={zendeskSupportConf}
        setZendeskSupportConf={setZendeskSupportConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <ZendeskSupportIntegLayout
          formFields={formFields}
          zendeskSupportConf={zendeskSupportConf}
          setZendeskSupportConf={setZendeskSupportConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {zendeskSupportConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(zendeskSupportConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {/* STEP 3 */}
      {zendeskSupportConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={zendeskSupportConf}
          setDataConf={setZendeskSupportConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default ZendeskSupport
