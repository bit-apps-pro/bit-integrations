import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import PointicsAuthorization from './PointicsAuthorization'
import { checkMappedFields } from './PointicsCommonFunc'
import PointicsIntegLayout from './PointicsIntegLayout'
import { needsChannel, needsReward } from './staticData'

export default function Pointics({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [pointicsConf, setPointicsConf] = useState({
    name: 'Pointics',
    type: 'Pointics',
    field_map: [{ formField: '', pointicsField: '' }],
    actions: {},
    mainAction: ''
  })

  const nextPage = val => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (val === 3) {
      if (needsChannel.includes(pointicsConf.mainAction) && !pointicsConf?.selectedChannel) {
        setSnackbar({
          show: true,
          msg: __('Please select a channel to continue.', 'bit-integrations')
        })
        return
      }

      if (needsReward.includes(pointicsConf.mainAction) && !pointicsConf?.selectedReward) {
        setSnackbar({
          show: true,
          msg: __('Please select a reward to continue.', 'bit-integrations')
        })
        return
      }

      if (!checkMappedFields(pointicsConf)) {
        setSnackbar({
          show: true,
          msg: __('Please map all required fields to continue.', 'bit-integrations')
        })
        return
      }

      if (pointicsConf.name !== '' && pointicsConf.field_map.length > 0) {
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

      <PointicsAuthorization
        formID={formID}
        pointicsConf={pointicsConf}
        setPointicsConf={setPointicsConf}
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
        <PointicsIntegLayout
          formID={formID}
          formFields={formFields}
          pointicsConf={pointicsConf}
          setPointicsConf={setPointicsConf}
          setSnackbar={setSnackbar}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
        />
        <br />
        <br />
        <br />
        <button
          onClick={() => nextPage(3)}
          disabled={pointicsConf.field_map.length < 1}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <BackIcn className="ml-1 rev-icn" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveIntegConfig(flow, setFlow, allIntegURL, pointicsConf, navigate, '', '', setIsLoading)
        }
        isLoading={isLoading}
        dataConf={pointicsConf}
        setDataConf={setPointicsConf}
        formFields={formFields}
      />
    </div>
  )
}
