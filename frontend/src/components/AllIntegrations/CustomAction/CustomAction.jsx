import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import uuid from 'react-uuid'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import CustomActionStepTwo from './CustomActionStepTwo'
import CustomFuncEditor from './CustomFuncEditor'
import { checkFunctionValidity } from './CustomFunctionHelper'
import TutorialLink from '../../Utilities/TutorialLink'
import LoaderSm from '../../Loaders/LoaderSm'

const CustomAction = ({ formFields, setFlow, flow, allIntegURL }) => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})
  const [snack, setSnackbar] = useState({ show: false })
  const randomFileName = uuid()
  const [customActionConf, setCustomActionConf] = useState({
    name: 'Custom Action',
    type: 'CustomAction',
    randomFileName,
    defaultValue: `<?php if (!defined('ABSPATH')) {exit;} 
    
  function yourFunctionName($trigger){
    $trigger['yourKey'];
    //write here your custom function
  }  
  yourFunctionName($trigger);`,
    value: ''
  })
  useEffect(() => {
    const newConf = { ...customActionConf }
    delete newConf.isValid
    setCustomActionConf({ ...newConf })
  }, [customActionConf?.value])

  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    setStep(2)
  }

  const handleInput = e => {
    const newConf = { ...customActionConf }
    newConf[e.target.name] = e.target.value
    setCustomActionConf(newConf)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={2} active={step} />
      </div>

      <div
        className="btcd-stp-page"
        style={{ ...(step === 1 && { width: '70%', height: 'auto', overflow: 'visible' }) }}>
        <TutorialLink linkKey="customAction" />

        <div className="d-flx my-3">
          <div className="wdt-200 d-in-b mt-3">
            <b>{__('Integration Name:', 'bit-integrations')}</b>
          </div>
          <input
            className="btcd-paper-inp mt-1"
            onChange={handleInput}
            name="name"
            value={customActionConf.name}
            type="text"
            placeholder={__('Integration Name...', 'bit-integrations')}
          />
        </div>
        <CustomFuncEditor
          customActionConf={customActionConf}
          setCustomActionConf={setCustomActionConf}
          formFields={formFields}
        />
        <button
          onClick={() =>
            checkFunctionValidity(customActionConf, setCustomActionConf, loading, setLoading)
          }
          disabled={!customActionConf.value || loading?.validate}
          className="btn f-left btcd-btn-lg purple sh-sm flx mt-5"
          type="button">
          {customActionConf?.isValid
            ? __('Validated ✔', 'bit-integrations')
            : __('Validated', 'bit-integrations')}
          {loading?.validate && <LoaderSm size="20" clr="#022217" className="ml-2" />}
        </button>
        <button
          onClick={() => nextPage(2)}
          disabled={!customActionConf.isValid}
          className="btn f-right btcd-btn-lg purple sh-sm flx mt-5"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      <div
        className="btcd-stp-page"
        style={{ width: step === 2 && '100%', height: step === 2 && 'auto' }}>
        <CustomActionStepTwo
          step={step}
          saveConfig={() =>
            saveIntegConfig(flow, setFlow, allIntegURL, customActionConf, navigate, '', '', setIsLoading)
          }
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default CustomAction
