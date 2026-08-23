/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import FreshSalesAuthorization from './FreshSalesAuthorization'
import { checkMappedFields, checkRequired, handleInput } from './FreshSalesCommonFunc'
import FreshSalesIntegLayout from './FreshSalesIntegLayout'

function FreshSales({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [freshSalesConf, setFreshSalesConf] = useState({
    name: 'FreshSales',
    type: 'FreshSales',
    api_key: '',
    bundle_alias: '',
    default: {
      modules: {
        Account: {
          required: true,
          requiredFields: []
        },
        Deal: {
          required: true,
          requiredFields: []
        },
        Contact: {
          required: true,
          requiredFields: []
        },
        Product: {
          requiredFields: []
        }
      }
    },
    moduleData: { module: '' },
    field_map: [{ formField: '', freshSalesFormField: '' }],
    actions: {}
  })

  const saveConfig = () => {
    saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: freshSalesConf,
      navigate,
      setIsLoading,
      setSnackbar
    })
  }
  const nextPage = pageNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedFields(freshSalesConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }
    if (!checkRequired(freshSalesConf)) {
      if (['Deal', 'Contact'].includes(freshSalesConf.moduleData.module)) {
        setSnackbar({
          show: true,
          msg: __('Please select a account or a contact', 'bit-integrations')
        })
      }
      if (freshSalesConf.moduleData.module === 'Contacts') {
        setSnackbar({ show: true, msg: __('Please select a account', 'bit-integrations') })
      }
      return
    }
    freshSalesConf.moduleData.module && freshSalesConf.field_map.length > 0 && setstep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <FreshSalesAuthorization
        formID={formID}
        freshSalesConf={freshSalesConf}
        setFreshSalesConf={setFreshSalesConf}
        step={step}
        setstep={setstep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <FreshSalesIntegLayout
          formID={formID}
          formFields={formFields}
          handleInput={e =>
            handleInput(e, freshSalesConf, setFreshSalesConf, formID, setIsLoading, setSnackbar)
          }
          freshSalesConf={freshSalesConf}
          setFreshSalesConf={setFreshSalesConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={freshSalesConf.moduleData.module === '' || freshSalesConf.field_map.length < 1}
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
        dataConf={freshSalesConf}
        setDataConf={setFreshSalesConf}
        formFields={formFields}
      />
    </div>
  )
}

export default FreshSales
