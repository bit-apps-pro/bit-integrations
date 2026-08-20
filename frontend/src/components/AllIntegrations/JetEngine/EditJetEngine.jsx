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
import JetEngineIntegLayout from './JetEngineIntegLayout'
import toast from 'react-hot-toast'
import { DELETE_LIST_ARRAY, TASK_LIST_VALUES } from './jetEngineConstants'
import { checkMappedFields, handleInput } from './jetEngineCommonFunctions'

function EditJetEngine({ allIntegURL }) {
  const navigate = useNavigate()
  const [flow, setFlow] = useRecoilState($newFlow)
  const [jetEngineConf, setJetEngineConf] = useRecoilState($actionConf)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false,
    menuPosition: false,
    relationTypes: false,
    cptList: false,
    cctList: false,
    relationList: false
  })
  const [snack, setSnackbar] = useState({ show: false })
  const formField = useRecoilValue($formFields)

  const saveConfig = () => {
    if (!jetEngineConf.selectedTask) {
      toast.error(__('Please select a task!', 'bit-integrations'))
      return
    }

    if (!DELETE_LIST_ARRAY.includes(jetEngineConf.selectedTask)) {
      if (!checkMappedFields(jetEngineConf)) {
        toast.error(__('Please map mandatory fields!', 'bit-integrations'))
        return
      }
    }

    if (
      (jetEngineConf.selectedTask === TASK_LIST_VALUES.CREATE_TAXONOMY ||
        jetEngineConf.selectedTask === TASK_LIST_VALUES.UPDATE_TAXONOMY) &&
      !jetEngineConf.selectedTaxPostTypes
    ) {
      toast.error(__('Please select post type(s)!', 'bit-integrations'))
      return
    }

    if (
      jetEngineConf.selectedTask === TASK_LIST_VALUES.CREATE_RELATION ||
      jetEngineConf.selectedTask === TASK_LIST_VALUES.UPDATE_RELATION
    ) {
      if (!jetEngineConf.relOptions.parentObject) {
        toast.error(__('Please select a parent object!', 'bit-integrations'))
        return
      }
      if (!jetEngineConf.relOptions.childObject) {
        toast.error(__('Please select a child object!', 'bit-integrations'))
        return
      }
      if (!jetEngineConf.relOptions.selectedRelationType) {
        toast.error(__('Please select a relation type!', 'bit-integrations'))
        return
      }
    }

    if (jetEngineConf.selectedTask === TASK_LIST_VALUES.UPDATE_POST_TYPE && !jetEngineConf.selectedCPT) {
      toast.error('Please select a custom post type!')
      return
    }

    if (
      jetEngineConf.selectedTask === TASK_LIST_VALUES.UPDATE_CONTENT_TYPE &&
      !jetEngineConf.selectedCCT
    ) {
      toast.error('Please select a custom content type!')
      return
    }

    if (
      jetEngineConf.selectedTask === TASK_LIST_VALUES.UPDATE_TAXONOMY &&
      !jetEngineConf.selectedTaxForEdit
    ) {
      toast.error('Please select a taxonomy!')
      return
    }

    if (
      jetEngineConf.selectedTask === TASK_LIST_VALUES.UPDATE_RELATION &&
      !jetEngineConf.relOptions.selectedRelationForEdit
    ) {
      toast.error('Please select a relation!')
      return
    }

    if (jetEngineConf.selectedTask === TASK_LIST_VALUES.DELETE_POST_TYPE) {
      if (!jetEngineConf.selectedCPT && !checkMappedFields(jetEngineConf)) {
        toast.error('Please select a custom post type or map fields!')
        return
      }
    }

    if (jetEngineConf.selectedTask === TASK_LIST_VALUES.DELETE_CONTENT_TYPE) {
      if (!jetEngineConf.selectedCCT && !checkMappedFields(jetEngineConf)) {
        toast.error('Please select a custom content type or map fields!')
        return
      }
    }

    if (jetEngineConf.selectedTask === TASK_LIST_VALUES.DELETE_TAXONOMY) {
      if (!jetEngineConf.selectedTaxForEdit && !checkMappedFields(jetEngineConf)) {
        toast.error('Please select a taxonomy or map fields!')
        return
      }
    }

    if (jetEngineConf.selectedTask === TASK_LIST_VALUES.DELETE_RELATION) {
      if (!jetEngineConf.relOptions.selectedRelationForEdit && !checkMappedFields(jetEngineConf)) {
        toast.error('Please select a relation or map fields!')
        return
      }
    }

    saveActionConf({
      flow,
      allIntegURL,
      conf: jetEngineConf,
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
          onChange={e => handleInput(e, jetEngineConf, setJetEngineConf)}
          name="name"
          defaultValue={jetEngineConf.name || ''}
          type="text"
          placeholder={__('Integration Name...', 'bit-integrations')}
        />
      </div>
      <br />

      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />
      <JetEngineIntegLayout
        formID={flow.triggered_entity_id}
        formFields={formField}
        handleInput={e => handleInput(e, jetEngineConf, setJetEngineConf, setLoading, setSnackbar)}
        jetEngineConf={jetEngineConf}
        setJetEngineConf={setJetEngineConf}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        isLoading={isLoading}
        dataConf={jetEngineConf}
        setDataConf={setJetEngineConf}
        formFields={formField}
      />
      <br />
    </div>
  )
}

export default EditJetEngine
