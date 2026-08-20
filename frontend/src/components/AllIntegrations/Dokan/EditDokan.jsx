/* eslint-disable no-param-reassign */

import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import DokanIntegLayout from './DokanIntegLayout'
import toast from 'react-hot-toast'
import { TASK_LIST_VALUES } from './dokanConstants'
import { checkMappedFields, handleInput } from './dokanCommonFunctions'

function EditDokan({ allIntegURL }) {
  const navigate = useNavigate()
  const [flow, setFlow] = useRecoilState($newFlow)
  const [dokanConf, setDokanConf] = useRecoilState($actionConf)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false,
    euFields: false,
    vendors: false
  })
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const saveConfig = () => {
    if (!dokanConf.selectedTask) {
      toast.error(__('Please select a task!', 'bit-integrations'))
      return
    }

    if (
      (dokanConf.selectedTask === TASK_LIST_VALUES.UPDATE_VENDOR ||
        dokanConf.selectedTask === TASK_LIST_VALUES.WITHDRAW_REQUEST) &&
      !dokanConf.selectedVendor
    ) {
      toast.error(__('Please select a vendor!', 'bit-integrations'))
      return
    }

    if (dokanConf.selectedTask !== TASK_LIST_VALUES.DELETE_VENDOR && !checkMappedFields(dokanConf)) {
      toast.error(__('Please map mandatory fields!', 'bit-integrations'))
      return
    }

    if (
      dokanConf.selectedTask === TASK_LIST_VALUES.DELETE_VENDOR &&
      !dokanConf.selectedVendor &&
      !checkMappedFields(dokanConf)
    ) {
      toast.error(__('Please select a topic or map fields!', 'bit-integrations'))
      return
    }

    if (
      dokanConf.selectedTask === TASK_LIST_VALUES.WITHDRAW_REQUEST &&
      !dokanConf.selectedPaymentMethod
    ) {
      toast.error(__('Please select a payment method!', 'bit-integrations'))
      return
    }

    saveActionConf({
      flow,
      allIntegURL,
      conf: dokanConf,
      navigate,
      edit: 1,
      setLoading,
      setSnackbar
    })
  }

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={e => handleInput(e, dokanConf, setDokanConf)}
          name="name"
          defaultValue={dokanConf.name || ''}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <DokanIntegLayout
        formID={flow.triggered_entity_id}
        formFields={formField}
        handleInput={e => handleInput(e, dokanConf, setDokanConf, setLoading, setSnackbar)}
        dokanConf={dokanConf}
        setDokanConf={setDokanConf}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        isLoading={isLoading}
        dataConf={dokanConf}
        setDataConf={setDokanConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditDokan
