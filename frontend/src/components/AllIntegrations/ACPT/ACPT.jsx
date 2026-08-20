/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import toast from 'react-hot-toast'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import ACPTAuthorization from './ACPTAuthorization'
import { checkMappedFields } from './ACPTCommonFunc'
import ACPTIntegLayout from './ACPTIntegLayout'
import {
  cptFields,
  cptLabels,
  modules,
  optionPageFields,
  taxonomyFields,
  taxonomyLabels
} from './staticData'

function ACPT({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [acptConf, setAcptConf] = useState({
    name: 'ACPT',
    type: 'ACPT',
    base_url: window.location.origin,
    api_key: '',
    field_map: [{ formField: '', acptFormField: '' }],
    label_field_map: [{ formField: '', acptFormField: '' }],
    acptFields: [],
    acptLabels: [],
    utilities: {},
    icon: 'wordpress',
    capability: 'manage_options',
    module: '',
    cptFields,
    cptLabels,
    taxonomyLabels,
    taxonomyFields,
    optionPageFields,
    modules
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, acptConf, navigate, '', '', setIsLoading)
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

    if (!checkMappedFields(acptConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (
      ['create_cpt', 'update_cpt', 'create_option_page', 'update_option_page'].includes(
        acptConf.module
      ) &&
      !acptConf?.icon
    ) {
      toast.error(__('Please select Icon', 'bit-integrations'))
      return
    }

    if (
      ['create_option_page', 'update_option_page'].includes(acptConf.module) &&
      !acptConf?.capability
    ) {
      toast.error(__('Please select Capability', 'bit-integrations'))
      return
    }

    acptConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <ACPTAuthorization
        acptConf={acptConf}
        setAcptConf={setAcptConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
      />

      <div
        className="btcd-stp-page"
        style={{
          ...(step === 2 && { width: 900, minHeight: '400px', height: 'auto', overflow: 'visible' })
        }}>
        <ACPTIntegLayout
          formFields={formFields}
          acptConf={acptConf}
          setAcptConf={setAcptConf}
          loading={loading}
          setLoading={setLoading}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        {acptConf?.module && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(acptConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {acptConf?.module && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={acptConf}
          setDataConf={setAcptConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default ACPT
