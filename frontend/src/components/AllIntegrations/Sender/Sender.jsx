import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SenderAuthorization from './SenderAuthorization'
import { checkMappedFields } from './SenderCommonFunc'
import SenderIntegLayout from './SenderIntegLayout'
import { singleGroupActions } from './staticData'

function Sender({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({ field: false, auth: false, group: false })
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [senderConf, setSenderConf] = useState({
    name: 'Sender',
    type: 'Sender',
    api_token: '',
    field_map: [{ formField: '', senderField: '' }],
    mainAction: '',
    senderFields: [],
    allGroups: [],
    allFields: [],
    groups: [],
    groupId: '',
    actions: {}
  })

  const saveConfig = () => {
    if (singleGroupActions.includes(senderConf?.mainAction) && !senderConf?.groupId) {
      toast.error(__('Please select a group', 'bit-integrations'))
      return
    }
    if (!checkMappedFields(senderConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, senderConf, navigate, '', '', setIsLoading)
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

    if (!senderConf.mainAction) {
      toast.error(__('Please select an action', 'bit-integrations'))
      return
    }
    if (singleGroupActions.includes(senderConf?.mainAction) && !senderConf?.groupId) {
      toast.error(__('Please select a group', 'bit-integrations'))
      return
    }
    if (!checkMappedFields(senderConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    setstep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <SenderAuthorization
        senderConf={senderConf}
        setSenderConf={setSenderConf}
        step={step}
        setstep={setstep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, minHeight: '500px', overflow: 'visible' }) }}>
        <SenderIntegLayout
          formFields={formFields}
          senderConf={senderConf}
          setSenderConf={setSenderConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {senderConf?.mainAction && (
          <button
            onClick={() => nextPage(3)}
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
        dataConf={senderConf}
        setDataConf={setSenderConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Sender
