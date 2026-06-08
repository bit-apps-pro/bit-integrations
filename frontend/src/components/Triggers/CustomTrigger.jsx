/* eslint-disable react/button-has-type */
/* eslint-disable no-console */
import { create } from 'mutative'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { $flowStep, $formFields, $newFlow } from '../../GlobalStates'
import bitsFetch from '../../Utils/bitsFetch'
import CustomFetcherHelper, { resetActionHookFlowData } from '../../Utils/CustomFetcherHelper'
import { __, sprintf } from '../../Utils/i18nwrap'
import Loader from '../Loaders/Loader'
import LoaderSm from '../Loaders/LoaderSm'
import CopyTextTrigger from '../Utilities/CopyTextTrigger'
import EyeIcn from '../Utilities/EyeIcn'
import EyeOffIcn from '../Utilities/EyeOffIcn'
import FieldContainer from '../Utilities/FieldContainer'
import Note from '../Utilities/Note'
import SnackMsg from '../Utilities/SnackMsg'
import TreeViewer from '../Utilities/treeViewer/TreeViewer'
import TutorialLink from '../Utilities/TutorialLink'

const CustomTrigger = () => {
  const [selectedFields, setSelectedFields] = useState([])
  const [newFlow, setNewFlow] = useRecoilState($newFlow)
  const setFlowStep = useSetRecoilState($flowStep)
  const setFields = useSetRecoilState($formFields)
  const [hookID, setHookID] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })
  const [showResponse, setShowResponse] = useState(false)
  const isFetchingRef = useRef(false)
  const triggerLinkKey = newFlow?.triggered_entity
  const triggerTutorialLinks = triggerLinkKey
    ? {
        [triggerLinkKey]: {
          docLink: newFlow?.triggerDetail?.documentation_url || '',
          youTubeLink: newFlow?.triggerDetail?.tutorial_url || ''
        }
      }
    : undefined

  let controller = new AbortController()
  const signal = controller.signal
  const { stopFetching } = CustomFetcherHelper(
    isFetchingRef,
    hookID,
    controller,
    setIsLoading,
    'custom_trigger/test/remove',
    'POST',
    'hook_id'
  )

  const triggerAbeleHook = `do_action(
    'bit_integrations_custom_trigger',
    '${hookID}',
     array()
     );`

  const setTriggerData = () => {
    if (!selectedFields.length) {
      toast.error(__('Please Select Fields', 'bit-integrations'))
      return
    }

    const tmpNewFlow = { ...newFlow }
    tmpNewFlow.triggerData = {
      formID: hookID,
      fields: selectedFields,
      rawData: newFlow.triggerDetail?.data
    }
    tmpNewFlow.triggered_entity_id = hookID
    setFields(selectedFields)
    setNewFlow(tmpNewFlow)
    setFlowStep(2)
  }

  const setSelectedFieldsData = (value = null, remove = false, index = null) => {
    if (remove) {
      index = index ? index : selectedFields.findIndex(field => field.name === value)

      if (index !== -1) {
        removeSelectedField(index)
      }
      return
    }
    addSelectedField(value)
  }

  const addSelectedField = value => {
    setSelectedFields(prevFields =>
      create(prevFields, draftFields => {
        draftFields.push({ label: value, name: value })
      })
    )
  }

  const onUpdateField = (value, index, key) => {
    setSelectedFields(prevFields =>
      create(prevFields, draftFields => {
        draftFields[index][key] = value
      })
    )
  }

  const removeSelectedField = index => {
    setSelectedFields(prevFields =>
      create(prevFields, draftFields => {
        draftFields.splice(index, 1)
      })
    )
  }

  useEffect(() => {
    if (newFlow.triggerDetail?.data?.length > 0 && newFlow.triggerDetail?.hook_id) {
      setHookID(newFlow.triggerDetail?.hook_id)
    } else {
      bitsFetch({ hook_id: hookID }, 'custom_trigger/new', null, 'get').then(resp => {
        if (resp.success) {
          setHookID(resp.data.hook_id)
        }
      })
    }

    return () => {
      stopFetching()
    }
  }, [])

  const startFetching = () => {
    isFetchingRef.current = true
    setIsLoading(true)
    setShowResponse(false)
    setSelectedFields([])
    resetActionHookFlowData(setNewFlow)
  }

  const handleFetch = () => {
    if (isFetchingRef.current) {
      stopFetching()
      return
    }

    startFetching()
    fetchSequentially()
  }

  const fetchSequentially = () => {
    try {
      if (!isFetchingRef.current || !hookID) {
        stopFetching()
        return
      }

      bitsFetch({ hook_id: hookID }, 'custom_trigger/test', null, 'POST', signal).then(resp => {
        if (!resp.success && isFetchingRef.current) {
          fetchSequentially()
          return
        }

        if (resp.success) {
          setNewFlow(prevFlow =>
            create(prevFlow, draftFlow => {
              draftFlow.triggerDetail['tmp'] = resp.data.custom_trigger
              draftFlow.triggerDetail['data'] = resp.data.custom_trigger
              draftFlow.triggerDetail['hook_id'] = hookID
            })
          )

          setShowResponse(true)
        }

        stopFetching()
      })
    } catch (err) {
      console.log(
        err.name === 'AbortError' ? __('AbortError: Fetch request aborted', 'bit-integrations') : err
      )
    }
  }

  return (
    <div className="trigger-custom-width">
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="mt-3">
        <b>{__('Custom action trigger:', 'bit-integrations')}</b>
      </div>
      {!hookID ? (
        <Loader
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            transform: 'scale(0.7)'
          }}
        />
      ) : (
        <CopyTextTrigger
          value={triggerAbeleHook}
          className="flx mt-2"
          setSnackbar={setSnackbar}
          readOnly
        />
      )}

      {newFlow.triggerDetail?.data && (
        <>
          <div className="my-3">
            <b>{__('Selected Fields:', 'bit-integrations')}</b>
          </div>
          <FieldContainer
            data={selectedFields}
            onUpdateField={onUpdateField}
            onRemoveField={removeSelectedField}
          />
        </>
      )}

      <div className="flx flx-between">
        <button
          onClick={handleFetch}
          className={`btn btcd-btn-lg sh-sm flx ${
            isLoading ? 'purple' : newFlow.triggerDetail?.data ? 'gray' : 'purple'
          }`}
          type="button"
          disabled={!hookID}>
          {isLoading
            ? __('Stop', 'bit-integrations')
            : newFlow.triggerDetail?.data
              ? __('Fetched ✔', 'bit-integrations')
              : __('Fetch', 'bit-integrations')}
          {isLoading && <LoaderSm size="20" clr="#022217" className="ml-2" />}
        </button>
      </div>

      {newFlow.triggerDetail?.data && showResponse && (
        <>
          <div className="mt-3">
            <b>{__('Select Fields:', 'bit-integrations')}</b>
          </div>
          <TreeViewer data={newFlow?.triggerDetail?.data} onChange={setSelectedFieldsData} />
        </>
      )}

      {newFlow.triggerDetail?.data && (
        <div className="flx flx-between">
          <button
            onClick={() => setShowResponse(prevState => !prevState)}
            className="btn btcd-btn-lg sh-sm flx gray">
            <span className="txt-actionHook-resbtn font-inter-500">
              {showResponse
                ? __('Hide Response', 'bit-integrations')
                : __('View Response', 'bit-integrations')}
            </span>
            {!showResponse ? (
              <EyeIcn width="20" height="20" strokeColor="#222" />
            ) : (
              <EyeOffIcn width="20" height="20" strokeColor="#222" />
            )}
          </button>
          <button
            onClick={setTriggerData}
            className="btn btcd-btn-lg purple sh-sm flx"
            type="button"
            disabled={!selectedFields.length}>
            {__('Set Action', 'bit-integrations')}
          </button>
        </div>
      )}
      <Note note={info} isInstruction={true}>
        <TutorialLink
          linkKey={triggerLinkKey}
          linksMap={triggerTutorialLinks}
          style={{ marginTop: 0 }}
        />
      </Note>
    </div>
  )
}
export default CustomTrigger

const info = `<h4>${sprintf(
  __('Set up the %s in a few quick steps', 'bit-integrations'),
  'Action Hook'
)}</h4>
            <ul>
            <li>${__(
              'Copy the <b>do action hook</b> snippet and paste it into your form submission function.',
              'bit-integrations'
            )}</li>
              <li>${__('Click <b>Fetch</b>.', 'bit-integrations')}</li>
              <li>${__('Submit the form to send test data.', 'bit-integrations')}</li>
              <li>${__('Select the fields you need, then click <b>Set Action</b>.', 'bit-integrations')}</li>
            </ul>`
