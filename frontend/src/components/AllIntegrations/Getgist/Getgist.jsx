/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf, saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import GetgistAuthorization from './GetgistAuthorization'
import { checkMappedFields, handleInput } from './GetgistCommonFunc'
import GetgistIntegLayout from './GetgistIntegLayout'

function Getgist({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const fields = [
    { key: 'name', label: __('Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'gender', label: __('Gender', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'company_name', label: __('Company Name', 'bit-integrations'), required: false },
    { key: 'industry', label: __('Industry', 'bit-integrations'), required: false },
    { key: 'job_title', label: __('Job Title', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'postal_code', label: __('Postal Code', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false }
  ]
  const [getgistConf, setGetgistConf] = useState({
    name: 'Getgist',
    type: 'Getgist',
    api_key: '',
    field_map: [{ formField: '', getgistFormField: '' }],
    actions: {},
    gistFields: fields
  })

  const saveConfig = () => {
    setIsLoading(true)
    saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: getgistConf,
      navigate,
      setIsLoading,
      setSnackbar
    })
  }
  const nextPage = pageNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedFields(getgistConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }
    getgistConf.field_map.length > 0 && setstep(pageNo)
  }

  return (
    <div>
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>


      <GetgistAuthorization
        getgistConf={getgistConf}
        setGetgistConf={setGetgistConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <GetgistIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, getgistConf, setGetgistConf, setIsLoading)}
          getgistConf={getgistConf}
          setGetgistConf={setGetgistConf}
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
        dataConf={getgistConf}
        setDataConf={setGetgistConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Getgist
