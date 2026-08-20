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
import { checkMappedFields } from './jetEngineCommonFunctions'
import JetEngineIntegLayout from './JetEngineIntegLayout'
import JetEngineAuthorization from './JetEngineAuthorization'
import { DELETE_LIST_ARRAY, TASK_LIST_VALUES } from './jetEngineConstants'

function JetEngine({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false,
    cptOptions: false,
    relationTypes: false,
    cptList: false,
    cctList: false,
    taxList: false,
    relationList: false
  })

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [jetEngineConf, setJetEngineConf] = useState({
    name: 'JetEngine',
    type: 'JetEngine',
    field_map: [],
    staticFields: [],
    selectedTask: '',
    actions: {},
    deleteVendorFieldMap: false,
    selectedMenuPosition: '',
    selectedMenuIcon: '',
    selectedSupports: '',
    selectedTaxPostTypes: '',
    allRelationTypes: [],
    relOptions: {
      parentObject: '',
      childObject: '',
      selectedRelationType: '',
      selectedRelationForEdit: ''
    },
    cptList: [],
    selectedCPT: '',
    cctList: [],
    selectedCCT: '',
    taxList: [],
    selectedTaxForEdit: '',
    relationList: [],
    deleteFieldMap: {
      deletePostType: false,
      deleteContentType: false,
      deleteTaxonomy: false,
      deleteRelation: false
    }
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(
      flow,
      setFlow,
      allIntegURL,
      jetEngineConf,
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

    jetEngineConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <JetEngineAuthorization
        jetEngineConf={jetEngineConf}
        setJetEngineConf={setJetEngineConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <JetEngineIntegLayout
          formFields={formFields}
          jetEngineConf={jetEngineConf}
          setJetEngineConf={setJetEngineConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={false}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')} &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={jetEngineConf}
        setDataConf={setJetEngineConf}
        formFields={formFields}
      />
    </div>
  )
}

export default JetEngine
