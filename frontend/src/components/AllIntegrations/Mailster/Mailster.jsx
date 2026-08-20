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
import { checkMappedFields } from './MailsterCommonFunc'
import MailsterIntegLayout from './MailsterIntegLayout'
import MailsterAuthorization from './MailsterAuthorization'

function Mailster({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false,
    fields: false,
    lists: false,
    tags: false
  })

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [mailsterConf, setMailsterConf] = useState({
    name: 'Mailster',
    type: 'Mailster',
    field_map: [{ formField: '', mailsterFormField: '' }],
    mailsterFields: [],
    selectedStatus: '',
    lists: [],
    selectedLists: '',
    tags: [],
    selectedTags: ''
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      mailsterConf,
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

    if (!checkMappedFields(mailsterConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    mailsterConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <MailsterAuthorization
        mailsterConf={mailsterConf}
        setMailsterConf={setMailsterConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <MailsterIntegLayout
          formFields={formFields}
          mailsterConf={mailsterConf}
          setMailsterConf={setMailsterConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={!checkMappedFields(mailsterConf)}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={mailsterConf}
        setDataConf={setMailsterConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Mailster
