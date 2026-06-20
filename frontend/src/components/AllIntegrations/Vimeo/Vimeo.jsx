/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { checkMappedFields } from './VimeoCommonFunc'
import VimeoAuthorization from './VimeoAuthorization'
import VimeoIntegLayout from './VimeoIntegLayout'

function Vimeo({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false,
    videos: false,
    showcases: false,
    folders: false,
    channels: false
  })
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [vimeoConf, setVimeoConf] = useState({
    name: 'Vimeo',
    type: 'Vimeo',
    token: '',
    field_map: [{ formField: '', vimeoFormField: '' }],
    mainAction: '',
    default: {}
  })

  const saveConfig = () => {
    if (!checkMappedFields(vimeoConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, vimeoConf, navigate, '', '', setIsLoading)
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

    if (!checkMappedFields(vimeoConf)) {
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

      <VimeoAuthorization
        vimeoConf={vimeoConf}
        setVimeoConf={setVimeoConf}
        step={step}
        setstep={setstep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, minHeight: '500px', overflow: 'visible' }) }}>
        <VimeoIntegLayout
          formFields={formFields}
          vimeoConf={vimeoConf}
          setVimeoConf={setVimeoConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {vimeoConf?.mainAction && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(vimeoConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={vimeoConf}
        setDataConf={setVimeoConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Vimeo
