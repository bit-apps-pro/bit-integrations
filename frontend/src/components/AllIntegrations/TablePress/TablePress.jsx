import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import TablePressAuthorization from './TablePressAuthorization'
import { getConfError } from './TablePressCommonFunc'
import TablePressIntegLayout from './TablePressIntegLayout'

export default function TablePress({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [tablePressConf, setTablePressConf] = useState({
    name: 'TablePress',
    type: 'TablePress',
    field_map: [{ formField: '', tablePressField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      const confError = getConfError(tablePressConf)

      if (confError) {
        setSnackbar({ show: true, msg: confError })
        return
      }

      if (tablePressConf.name !== '' && tablePressConf.field_map.length > 0) {
        setStep(val)
      }
    } else {
      setStep(val)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2" />

      <TablePressAuthorization
        formID={formID}
        tablePressConf={tablePressConf}
        setTablePressConf={setTablePressConf}
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
        <TablePressIntegLayout
          formID={formID}
          formFields={formFields}
          tablePressConf={tablePressConf}
          setTablePressConf={setTablePressConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={tablePressConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, tablePressConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={tablePressConf}
        setDataConf={setTablePressConf}
        formFields={formFields}
      />
    </div>
  )
}
