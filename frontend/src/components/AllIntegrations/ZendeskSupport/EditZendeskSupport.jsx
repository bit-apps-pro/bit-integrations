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
import ZendeskSupportIntegLayout from './ZendeskSupportIntegLayout'
import { checkMappedFields, handleInput } from './ZendeskSupportCommonFunc'

function EditZendeskSupport({ allIntegURL }) {
  const navigate = useNavigate()
  const [flow, setFlow] = useRecoilState($newFlow)
  const [zendeskSupportConf, setZendeskSupportConf] = useRecoilState($actionConf)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({})
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const saveConfig = () => {
    if (!checkMappedFields(zendeskSupportConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }

    saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: zendeskSupportConf,
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
          onChange={e => handleInput(e, zendeskSupportConf, setZendeskSupportConf)}
          name="name"
          value={zendeskSupportConf.name}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <ZendeskSupportIntegLayout
        formFields={formField}
        zendeskSupportConf={zendeskSupportConf}
        setZendeskSupportConf={setZendeskSupportConf}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        disabled={!checkMappedFields(zendeskSupportConf)}
        isLoading={isLoading}
        dataConf={zendeskSupportConf}
        setDataConf={setZendeskSupportConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditZendeskSupport
