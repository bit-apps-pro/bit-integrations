/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import EditFormInteg from '../EditFormInteg'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import EditWebhookInteg from '../EditWebhookInteg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { checkMappedFields, handleInput, isConfigInvalid } from './FabmanCommonFunc'
import FabmanIntegLayout from './FabmanIntegLayout'
import { checkValidEmail } from '../../../Utils/Helpers'

function EditFabman({ allIntegURL }) {
  const navigate = useNavigate()
  const [flow, setFlow] = useRecoilState($newFlow)
  const [fabmanConf, setFabmanConf] = useRecoilState($actionConf)
  const [loading, setLoading] = useState({
    list: false,
    field: false,
    auth: false
  })
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const [localName, setLocalName] = useState(fabmanConf.name || '')

  const getEmailMappingRow = () => {
    const rows = Array.isArray(fabmanConf?.field_map) ? fabmanConf.field_map : []
    return rows.find(r => r?.fabmanFormField === 'emailAddress')
  }

  const isEmailMappingInvalid = () => {
    const emailRow = getEmailMappingRow()
    if (!emailRow) return true
    if (emailRow.formField === 'custom') {
      const customValue = (emailRow.customValue || '').trim()
      return !customValue || !checkValidEmail(customValue)
    }
    // Non-custom: a form field is selected. Consider valid if:
    // - field type is email, OR
    // - type is missing/unknown, OR
    // - field name/label includes "email"
    const selectedField = (formField || []).find(f => f.name === emailRow.formField)

    if (!selectedField) return true

    const hasEmailType = selectedField.type && String(selectedField.type).toLowerCase() === 'email'
    const looksLikeEmailField =
      /email/i.test(selectedField.name || '') || /email/i.test(selectedField.label || '')
    return !hasEmailType && selectedField.type && !looksLikeEmailField
  }

  const saveConfig = () => {
    if (!fabmanConf.actionName) {
      setSnackbar({ show: true, msg: __('Please select an action', 'bit-integrations') })
      return
    }

    if (['update_member', 'delete_member'].includes(fabmanConf.actionName)) {
      if (!checkMappedFields(fabmanConf)) {
        setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
        return
      }

      if (isEmailMappingInvalid()) {
        setSnackbar({ show: true, msg: __('Please map a valid email address', 'bit-integrations') })
        return
      }

      saveActionConf({
        flow,
        allIntegURL,
        conf: fabmanConf,
        navigate,
        edit: 1,
        setLoading,
        setSnackbar
      })
      return
    }

    if (!checkMappedFields(fabmanConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }

    const requiresWorkspaceSelection =
      fabmanConf.actionName === 'update_spaces' || fabmanConf.actionName === 'delete_spaces'

    if (requiresWorkspaceSelection && !fabmanConf.selectedWorkspace) {
      setSnackbar({ show: true, msg: __('Please select a workspace', 'bit-integrations') })
      return
    }

    saveActionConf({
      flow,
      allIntegURL,
      conf: fabmanConf,
      navigate,
      edit: 1,
      setLoading,
      setSnackbar
    })
  }

  const handleNameChange = e => {
    setLocalName(e.target.value)
    setFabmanConf(prev => ({ ...prev, name: e.target.value }))
  }

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="flx mt-3">
        <b className="wdt-200 d-in-b">{__('Integration Name:', 'bit-integrations')}</b>
        <input
          className="btcd-paper-inp w-5"
          onChange={handleNameChange}
          name="name"
          value={localName}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />
      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <FabmanIntegLayout
        formID={flow.triggered_entity_id}
        formFields={formField}
        handleInput={e => handleInput(e, fabmanConf, setFabmanConf, setLoading, setSnackbar)}
        fabmanConf={fabmanConf}
        setFabmanConf={setFabmanConf}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />
      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        disabled={isConfigInvalid(fabmanConf, formField, checkValidEmail)}
        isLoading={loading.list || loading.field || loading.auth}
        dataConf={fabmanConf}
        setDataConf={setFabmanConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditFabman
