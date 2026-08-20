import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import NinjaTablesAuthorization from './NinjaTablesAuthorization'
import { checkMappedFields } from './NinjaTablesCommonFunc'
import NinjaTablesIntegLayout from './NinjaTablesIntegLayout'

export default function NinjaTables({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [ninjaTablesConf, setNinjaTablesConf] = useState({
    name: 'Ninja Tables',
    type: 'Ninja Tables',
    field_map: [{ formField: '', columnName: '' }],
    actions: {},
    mainAction: '',
    default: {}
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (!checkMappedFields(ninjaTablesConf)) {
        setSnackbar({
          show: true,
          msg: __('Please select all required options to continue.', 'bit-integrations')
        })
        return
      }

      if (ninjaTablesConf.name !== '') {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2"></div>

      <NinjaTablesAuthorization
        formID={formID}
        ninjaTablesConf={ninjaTablesConf}
        setNinjaTablesConf={setNinjaTablesConf}
        step={step}
        nextPage={nextPage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{
          width: step === 2 && 900,
          height: step === 2 && 'auto',
          minHeight: step === 2 && '500px'
        }}>
        <NinjaTablesIntegLayout
          formID={formID}
          formFields={formFields}
          ninjaTablesConf={ninjaTablesConf}
          setNinjaTablesConf={setNinjaTablesConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={!checkMappedFields(ninjaTablesConf)}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, ninjaTablesConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={ninjaTablesConf}
        setDataConf={setNinjaTablesConf}
        formFields={formFields}
      />
    </div>
  )
}
