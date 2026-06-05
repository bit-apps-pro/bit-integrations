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
import MailerLiteAuthorization from './MailerLiteAuthorization'
import { checkMappedFields, handleInput } from './MailerLiteCommonFunc'
import MailerLiteIntegLayout from './MailerLiteIntegLayout'

function MailerLite({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    list: false,
    field: false,
    auth: false,
    group: false
  })

  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [mailerLiteConf, setMailerLiteConf] = useState({
    name: 'MailerLite',
    type: 'MailerLite',
    // eslint-disable-next-line max-len
    auth_token: '',
    field_map: [{ formField: '', mailerLiteFormField: 'email' }],
    mailer_lite_type: '',
    mailerLiteFields: [],
    groups: [],
    group_ids: [],
    actions: {},
    action: ''
  })

  const saveConfig = () => {
    if (mailerLiteConf?.action === 'unassign_subscriber_from_group' && !mailerLiteConf?.selected_group_id) {
      toast.error(__('Please select a group', 'bit-integrations'))
      return
    }

    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      mailerLiteConf,
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

    if (!checkMappedFields(mailerLiteConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    if (mailerLiteConf?.action === 'unassign_subscriber_from_group' && !mailerLiteConf?.selected_group_id) {
      toast.error(__('Please select a group', 'bit-integrations'))
      return
    }
    mailerLiteConf.field_map.length > 0 && setstep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}

      <MailerLiteAuthorization
        mailerLiteConf={mailerLiteConf}
        setMailerLiteConf={setMailerLiteConf}
        step={step}
        setstep={setstep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <MailerLiteIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, mailerLiteConf, setMailerLiteConf, loading, setLoading)}
          mailerLiteConf={mailerLiteConf}
          setMailerLiteConf={setMailerLiteConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {mailerLiteConf?.action && (
          <button
            onClick={() => nextPage(3)}
            disabled={
              !checkMappedFields(mailerLiteConf) ||
              (mailerLiteConf?.action === 'unassign_subscriber_from_group' && !mailerLiteConf?.selected_group_id)
            }
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {/* STEP 3 */}
      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={mailerLiteConf}
        setDataConf={setMailerLiteConf}
        formFields={formFields}
      />
    </div>
  )
}

export default MailerLite
