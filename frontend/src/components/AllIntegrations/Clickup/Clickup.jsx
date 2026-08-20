/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
import { useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import ClickupAuthorization from './ClickupAuthorization'
import { checkMappedFields, handleInput } from './ClickupCommonFunc'
import ClickupIntegLayout from './ClickupIntegLayout'

function Clickup({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const taskFields = [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'start_date', label: __('Start Date', 'bit-integrations'), required: false },
    { key: 'due_date', label: __('Due Date', 'bit-integrations'), required: false }
  ]

  const [clickupConf, setClickupConf] = useState({
    name: 'Clickup',
    type: 'Clickup',
    api_key: '',
    field_map: [{ formField: '', clickupFormField: '' }],
    actionName: '',
    taskFields,
    actions: {}
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, clickupConf, navigate, '', '', setIsLoading)
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

    if (!checkMappedFields(clickupConf)) {
      toast.error(__('Please map mandatory fields', 'bit-integrations'))
      return
    }

    if (clickupConf.actionName === 'task') {
      if (!clickupConf.selectedTeam) {
        toast.error(__('Please select a team', 'bit-integrations'))
        return
      }
      if (!clickupConf.selectedSpace) {
        toast.error(__('Please select a space', 'bit-integrations'))
        return
      }
      if (!clickupConf.selectedFolder) {
        toast.error(__('Please select a folder', 'bit-integrations'))
        return
      }
      if (!clickupConf.selectedList) {
        toast.error(__('Please select a list', 'bit-integrations'))
        return
      }
    }

    clickupConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <ClickupAuthorization
        clickupConf={clickupConf}
        setClickupConf={setClickupConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <ClickupIntegLayout
          formFields={formFields}
          handleInput={e => handleInput(e, clickupConf, setClickupConf, setLoading, setSnackbar)}
          clickupConf={clickupConf}
          setClickupConf={setClickupConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />

        {clickupConf?.actionName && (
          <button
            onClick={() => nextPage(3)}
            disabled={!checkMappedFields(clickupConf)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')} &nbsp;
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        )}
      </div>

      {clickupConf?.actionName && (
        <IntegrationStepThree
          step={step}
          saveConfig={() => saveConfig()}
          isLoading={isLoading}
          dataConf={clickupConf}
          setDataConf={setClickupConf}
          formFields={formFields}
        />
      )}
    </div>
  )
}

export default Clickup
