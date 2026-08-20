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
import { checkMappedFields } from './VoxelCommonFunctions'
import VoxelIntegLayout from './VoxelIntegLayout'
import VoxelAuthorization from './VoxelAuthorization'
import { POST_TYPE_TASK_ARRAY, TASKS } from './VoxelConstants'

function Voxel({ formFields, setFlow, flow, allIntegURL }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState({
    auth: false,
    postTypes: false,
    postFields: false,
    posts: false
  })

  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })

  const [voxelConf, setVoxelConf] = useState({
    name: 'Voxel',
    type: 'Voxel',
    field_map: [],
    selectedTask: '',
    postTypes: [],
    selectedPostType: '',
    selectedPostStatus: '',
    voxelFields: [],
    actions: {},
    posts: [],
    selectedPost: ''
  })

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, voxelConf, navigate, '', '', setIsLoading)
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

    if (!voxelConf.selectedTask) {
      toast.error(__('Please select a task!', 'bit-integrations'))
      return
    }

    if (
      (voxelConf.selectedTask === TASKS.NEW_POST || voxelConf.selectedTask === TASKS.UPDATE_POST) &&
      !voxelConf.selectedPostType
    ) {
      toast.error(__('Please select a post type!', 'bit-integrations'))
      return
    }

    if (POST_TYPE_TASK_ARRAY.includes(voxelConf.selectedTask) && !voxelConf.selectedPostStatus) {
      toast.error(__('Please select a post status!', 'bit-integrations'))
      return
    }

    if (
      (voxelConf.selectedTask === TASKS.UPDATE_POST ||
        voxelConf.selectedTask === TASKS.UPDATE_COLLECTION_POST) &&
      !voxelConf.selectedPost
    ) {
      toast.error(__('Please select a post!', 'bit-integrations'))
      return
    }

    if (!checkMappedFields(voxelConf)) {
      toast.error(__('Please map mandatory fields!', 'bit-integrations'))
      return
    }

    voxelConf.field_map.length > 0 && setStep(pageNo)
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <VoxelAuthorization
        voxelConf={voxelConf}
        setVoxelConf={setVoxelConf}
        step={step}
        setStep={setStep}
        loading={loading}
        setLoading={setLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <VoxelIntegLayout
          formFields={formFields}
          voxelConf={voxelConf}
          setVoxelConf={setVoxelConf}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />
        <button
          onClick={() => nextPage(3)}
          disabled={!checkMappedFields(voxelConf)}
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
        dataConf={voxelConf}
        setDataConf={setVoxelConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Voxel
