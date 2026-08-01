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
import VboutAuthorization from './VboutAuthorization'
import { checkMappedFields, handleInput } from './VboutCommonFunc'
import VboutIntegLayout from './VboutIntegLayout'

function Vbout({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    list: false,
    field: false,
    auth: false
  })
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [vboutConf, setVboutConf] = useState({
    name: 'Vbout',
    type: 'Vbout',
    auth_token: '',
    field_map: [{ formField: '', VboutFormField: '' }],
    VboutFields: [],
    list_id: '',
    contact_status: '',
    actions: {}
  })
  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, vboutConf, navigate, '', '', setIsLoading)
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

    if (!checkMappedFields(vboutConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    vboutConf.field_map.length > 0 && setstep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}

      <VboutAuthorization
        vboutConf={vboutConf}
        setVboutConf={setVboutConf}
        step={step}
        setstep={setstep}
        loading={loading}
        setLoading={setLoading}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <VboutIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, vboutConf, setVboutConf)}
          vboutConf={vboutConf}
          setVboutConf={setVboutConf}
          loading={loading}
          setLoading={setLoading}
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

      {/* STEP 3 */}
      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={vboutConf}
        setDataConf={setVboutConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Vbout
