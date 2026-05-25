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
import EmailOctopusAuthorization from './EmailOctopusAuthorization'
import { checkMappedFields, handleInput } from './EmailOctopusCommonFunc'
import EmailOctopusIntegLayout from './EmailOctopusIntegLayout'

function EmailOctopus({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false,
    tags: false,
    customFields: false,
    lists: false,
    emailOctopusFields: false
  })

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [emailOctopusConf, setEmailOctopusConf] = useState({
    name: 'EmailOctopus',
    type: 'EmailOctopus',
    auth_token: '',
    field_map: [{ formField: '', emailOctopusFormField: '' }],
    emailOctopusFields: [],
    lists: [],
    selectedList: '',
    status: '',
    tags: [],
    selectedTags: [],
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      emailOctopusConf,
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

    if (!checkMappedFields(emailOctopusConf)) {
      toast.error(__('Please map mandatory emailOctopusFields', 'bit-integrations'))
      return
    }
    emailOctopusConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <EmailOctopusAuthorization
        emailOctopusConf={emailOctopusConf}
        setEmailOctopusConf={setEmailOctopusConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <EmailOctopusIntegLayout
          formFields={formFields}
          handleInput={e =>
            handleInput(e, emailOctopusConf, setEmailOctopusConf, setLoading, setSnackbar)
          }
          emailOctopusConf={emailOctopusConf}
          setEmailOctopusConf={setEmailOctopusConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {emailOctopusConf?.selectedList && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(emailOctopusConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {/* STEP 3 */}
      {emailOctopusConf?.selectedList && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={emailOctopusConf}
          setDataConf={setEmailOctopusConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default EmailOctopus
