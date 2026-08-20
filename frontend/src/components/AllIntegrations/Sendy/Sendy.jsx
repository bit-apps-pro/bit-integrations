/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import SendyAuthorization from './SendyAuthorization'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SendyIntegLayout from './SendyIntegLayout'
import { checkMappedFields, handleInput } from './SendyCommonFunc'

function Sendy({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const subscriberFields = [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'name', label: __('Name', 'bit-integrations'), required: false }
  ]

  const [sendyConf, setSendyConf] = useState({
    name: 'Sendy',
    type: 'Sendy',
    api_key: '',
    sendy_url: '',
    field_map: [{ formField: '', sendyField: '' }],
    subscriberFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, sendyConf, navigate, '', '', setIsLoading)
    resp.then(res => {
      if (res.success) {
        // setSnackbar({ show: true, msg: res.data?.msg })
        toast.success(res.data?.msg)
        navigate(allIntegURL)
      } else {
        // setSnackbar({ show: true, msg: res.data || res })
        toast.error(res.data || res)
      }
    })
  }
  const nextPage = pageNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedFields(sendyConf)) {
      // setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    sendyConf.field_map.length > 0 && setstep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <SendyAuthorization
        sendyConf={sendyConf}
        setSendyConf={setSendyConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <SendyIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, sendyConf, setSendyConf, setIsLoading, setSnackbar)}
          sendyConf={sendyConf}
          setSendyConf={setSendyConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
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
        dataConf={sendyConf}
        setDataConf={setSendyConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Sendy
