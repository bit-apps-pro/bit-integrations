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
import MondayComAuthorization from './MondayComAuthorization'
import { checkMappedFields, generateMappedField } from './MondayComCommonFunc'
import MondayComIntegLayout from './MondayComIntegLayout'
import { actionLists, needsBoard, needsItem } from './staticData'

function MondayCom({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const mondayComFields = []
  const [mondayComConf, setMondayComConf] = useState({
    name: 'Monday.Com',
    type: 'Monday.Com',
    apiToken: '',
    field_map: generateMappedField(mondayComFields),
    mainAction: '',
    mondayComFields,
    actionLists
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      mondayComConf,
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

    if (!checkMappedFields(mondayComConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    const action = mondayComConf.mainAction
    if (needsBoard.includes(action) && !mondayComConf.selectedBoard) {
      toast.error(__('Please select a board', 'bit-integrations'))
      return
    }
    if (needsItem.includes(action) && !mondayComConf.selectedItem) {
      toast.error(__('Please select an item', 'bit-integrations'))
      return
    }
    if (action === 'create_column' && !mondayComConf.columnType) {
      toast.error(__('Please select a column type', 'bit-integrations'))
      return
    }
    setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      {/* STEP 1 */}
      <MondayComAuthorization
        mondayComConf={mondayComConf}
        setMondayComConf={setMondayComConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      {/* STEP 2 */}
      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, minHeight: 500, overflow: 'visible' }) }}>
        <MondayComIntegLayout
          formFields={formFields}
          mondayComConf={mondayComConf}
          setMondayComConf={setMondayComConf}
          loading={loading}
          setLoading={setLoading}
          isLoading={isLoading}
        />

        {mondayComConf?.mainAction && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(mondayComConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {/* STEP 3 */}
      {mondayComConf?.mainAction && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={mondayComConf}
          setDataConf={setMondayComConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default MondayCom
