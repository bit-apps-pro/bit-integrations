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
import InstasentAuthorization from './InstasentAuthorization'
import { checkMappedFields, handleInput } from './InstasentCommonFunc'
import InstasentIntegLayout from './InstasentIntegLayout'

function Instasent({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    list: false,
    field: false,
    auth: false,
    datasource: false
  })

  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [instasentConf, setInstasentConf] = useState({
    name: 'Instasent',
    type: 'Instasent',
    auth_token: '',
    action: '',
    projectId: '',
    datasourceId: '',
    instasentFields: [],
    field_map: [{ formField: '', instasentFormField: '' }],
    default: { datasources: [] }
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      instasentConf,
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

    if (!checkMappedFields(instasentConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    instasentConf.field_map.length > 0 && setstep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}

      <InstasentAuthorization
        instasentConf={instasentConf}
        setInstasentConf={setInstasentConf}
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
        <InstasentIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, instasentConf, setInstasentConf, loading, setLoading)}
          instasentConf={instasentConf}
          setInstasentConf={setInstasentConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {instasentConf?.action && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(instasentConf)}
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
        dataConf={instasentConf}
        setDataConf={setInstasentConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Instasent
