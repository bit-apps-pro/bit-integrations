/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { checkMappedFields, handleInput } from './MondayComCommonFunc'
import MondayComIntegLayout from './MondayComIntegLayout'
import { needsBoard, needsItem } from './staticData'

function EditMondayCom({ allIntegURL }) {
  const navigate = useNavigate()
  const [flow, setFlow] = useRecoilState($newFlow)
  const [mondayComConf, setMondayComConf] = useRecoilState($actionConf)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const saveConfig = () => {
    if (!checkMappedFields(mondayComConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
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

    saveActionConf({
      flow,
      allIntegURL,
      conf: mondayComConf,
      navigate,
      edit: 1,
      setIsLoading,
      setSnackbar
    })
  }

  return (
    <div style={{ width: 900, minHeight: 500, overflow: 'visible' }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, mondayComConf, setMondayComConf)}
          name="name"
          value={mondayComConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <MondayComIntegLayout
        formFields={formField}
        mondayComConf={mondayComConf}
        setMondayComConf={setMondayComConf}
        loading={loading}
        setLoading={setLoading}
        isLoading={isLoading}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        disabled={!checkMappedFields(mondayComConf)}
        isLoading={isLoading}
        dataConf={mondayComConf}
        setDataConf={setMondayComConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditMondayCom
