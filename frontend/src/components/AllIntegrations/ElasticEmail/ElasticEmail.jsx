/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import ElasticEmailAuthorization from './ElasticEmailAuthorization'
import { checkMappedFields, handleInput } from './ElasticEmailCommonFunc'
import ElasticEmailIntegLayout from './ElasticEmailIntegLayout'

function ElasticEmail({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const fields = [
    { key: 'Email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'FirstName', label: __('FirstName', 'bit-integrations'), required: false },
    { key: 'LastName', label: __('LastName', 'bit-integrations'), required: false }
  ]
  const [elasticEmailConf, setElasticEmailConf] = useState({
    name: 'Elastic Email',
    type: 'ElasticEmail',
    api_key: '',
    field_map: [{ formField: '', elasticEmailField: '' }],
    actions: {},
    elasticEmailFields: fields
  })

  const saveConfig = () => {
    setIsLoading(true)
    saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: elasticEmailConf,
      navigate,
      setIsLoading,
      setSnackbar
    })
  }
  const nextPage = pageNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedFields(elasticEmailConf)) {
      // setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    elasticEmailConf.field_map.length > 0 && setstep(pageNo)
  }

  return (
    <div>
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <ElasticEmailAuthorization
        elasticEmailConf={elasticEmailConf}
        setElasticEmailConf={setElasticEmailConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <ElasticEmailIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, elasticEmailConf, setElasticEmailConf, setIsLoading)}
          elasticEmailConf={elasticEmailConf}
          setElasticEmailConf={setElasticEmailConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
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
        dataConf={elasticEmailConf}
        setDataConf={setElasticEmailConf}
        formFields={formFields}
      />
    </div>
  )
}

export default ElasticEmail
