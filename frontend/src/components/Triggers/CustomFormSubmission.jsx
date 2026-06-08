/* eslint-disable react/button-has-type */
/* eslint-disable no-console */
import { create, rawReturn } from 'mutative'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { $flowStep, $formFields, $newFlow } from '../../GlobalStates'
import bitsFetch from '../../Utils/bitsFetch'
import CustomFetcherHelper, { startFetching } from '../../Utils/CustomFetcherHelper'
import { __, sprintf } from '../../Utils/i18nwrap'
import LoaderSm from '../Loaders/LoaderSm'
import ConfirmModal from '../Utilities/ConfirmModal'
import EyeIcn from '../Utilities/EyeIcn'
import EyeOffIcn from '../Utilities/EyeOffIcn'
import Note from '../Utilities/Note'
import SnackMsg from '../Utilities/SnackMsg'
import TutorialLink from '../Utilities/TutorialLink'
import WebhookDataTable from '../Utilities/WebhookDataTable'
import useFetch from '../../hooks/useFetch'
import Loader from '../Loaders/Loader'

const CustomFormSubmission = () => {
  const [newFlow, setNewFlow] = useRecoilState($newFlow)
  const setFlowStep = useSetRecoilState($flowStep)
  const setFormFields = useSetRecoilState($formFields)
  const [primaryKey, setPrimaryKey] = useState()
  const [skipPrimaryKey, setSkipPrimaryKey] = useState(false)
  const [taskNote, setTaskNote] = useState()
  const [primaryKeyModal, setPrimaryKeyModal] = useState(false)
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
  const fetchAction = newFlow?.triggerDetail?.fetch?.action || ''
  const fetchMethod = newFlow?.triggerDetail?.fetch?.method || ''
  const removeAction = newFlow?.triggerDetail?.fetch_remove?.action || ''
  const removeMethod = newFlow?.triggerDetail?.fetch_remove?.method || ''
  const { data: { data: allTasks = [] } = {}, isLoading: formsLoading } = useFetch({
    payload: {},
    action: newFlow?.triggerDetail?.tasks?.action || '',
    method: newFlow?.triggerDetail?.tasks?.method || ''
  })

  const { stopFetching } = CustomFetcherHelper(
    isFetchingRef,
    newFlow?.triggerDetail?.triggered_entity_id,
    controller,
    setIsLoading,
    removeAction,
    removeMethod
  )

  const setTriggerData = () => {
    if (!primaryKey && !skipPrimaryKey) {
      toast.error(__('Please Select a Primary Key', 'bit-integrations'))
      return
    }
    if (!newFlow?.triggerDetail?.triggered_entity_id) {
      toast.error(__('Triggered Entity Id not found!', 'bit-integrations'))
      return
    }

    const tmpNewFlow = { ...newFlow }
    tmpNewFlow.triggerData = {
      primaryKey: skipPrimaryKey ? false : primaryKey,
      trigger_type: newFlow?.triggerDetail?.type || 'custom_form_submission',
      fields: tmpNewFlow.triggerDetail.data,
      tasks: newFlow?.triggerDetail?.tasks,
      fetch: newFlow?.triggerDetail?.fetch,
      fetch_remove: newFlow?.triggerDetail?.fetch_remove
    }

    tmpNewFlow.triggered_entity_id = newFlow?.triggerDetail?.triggered_entity_id
    setFormFields(tmpNewFlow.triggerDetail.data)
    setNewFlow(tmpNewFlow)
    setFlowStep(2)
  }

  const handleFetch = async () => {
    if (isFetchingRef.current) {
      stopFetching()
      return
    }

    startFetching(isFetchingRef, setShowResponse, setPrimaryKey, setNewFlow, setIsLoading)
    fetchSequentially()
  }

  const fetchSequentially = () => {
    const entityId = newFlow?.triggerDetail?.triggered_entity_id

    try {
      if (!isFetchingRef.current || !entityId) {
        stopFetching()
        return
      }

      bitsFetch({ triggered_entity_id: entityId }, fetchAction, null, fetchMethod, signal).then(resp => {
        if (!resp.success && isFetchingRef.current) {
          fetchSequentially()

          return
        }

        if (resp.success) {
          setNewFlow(prevFlow =>
            create(prevFlow, draftFlow => {
              draftFlow.triggerDetail.data = Array.isArray(resp.data?.formData)
                ? resp.data.formData
                : Object.values(resp.data?.formData)
            })
          )

          setPrimaryKey(resp.data?.primaryKey || undefined)
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

  const showResponseTable = () => {
    setShowResponse(prevState => !prevState)
  }

  const primaryKeySet = key => {
    setPrimaryKey(prev =>
      create(prev, draft => {
        if (key === '' || key === null) {
          return rawReturn(undefined)
        }

        const keys = key?.split(',') || []
        const primaryKey = keys.map(k => ({
          key: k,
          value: newFlow.triggerDetail?.data?.find(item => item.name === k)?.value
        }))

        const hasEmptyValues = primaryKey.some(item => !item.value)
        if (key && hasEmptyValues) {
          toast.error('Unique value not found!')
          return rawReturn(null)
        }

        return rawReturn(primaryKey)
      })
    )
  }

  useEffect(() => {
    return () => {
      stopFetching()
    }
  }, [])

  const setTriggerEntityId = entityId => {
    if (isLoading || isFetchingRef.current) {
      stopFetching()
      return
    }

    setNewFlow(prevFlow =>
      create(prevFlow, draftFlow => {
        draftFlow.triggerDetail.triggered_entity_id = entityId
        delete draftFlow.triggerDetail.data
      })
    )

    const selectedTask = allTasks.filter(item => item.triggered_entity_id == entityId)
    if (selectedTask?.length > 0) {
      setTaskNote(selectedTask[0]?.note || '')
      setSkipPrimaryKey(selectedTask[0]?.skipPrimaryKey || false)
    }
  }

  return !newFlow?.triggerDetail?.is_active ? (
    <span className="mt-3">
      {sprintf(
        __('%s is not installed or activated.', 'bit-integrations'),
        newFlow?.triggerDetail?.name
      )}
    </span>
  ) : formsLoading ? (
    <div>
      <br />
      <Loader
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 50,
          transform: 'scale(0.7)'
        }}
      />
    </div>
  ) : (
    <div className="trigger-custom-width">
      {allTasks && Array.isArray(allTasks) && (
        <div className="w-8 m-a">
          <h4>{__('Select a Form/Task Name', 'bit-integrations')}</h4>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={newFlow?.triggerDetail?.triggered_entity_id}
            options={allTasks?.map(field => ({
              label: field?.form_name,
              value: field?.triggered_entity_id
            }))}
            style={{ width: '100%', minWidth: 400, maxWidth: 450 }}
            onChange={val => setTriggerEntityId(val)}
            singleSelect
            selectOnClose
          />
          {taskNote && (
            <small className="trigger-task-note">
              <strong>Note: </strong>
              {taskNote}
            </small>
          )}
        </div>
      )}
      {newFlow?.triggerDetail?.triggered_entity_id && (
        <>
          <SnackMsg snack={snack} setSnackbar={setSnackbar} />
          <div
            className={`flx mt-2 flx-${newFlow.triggerDetail?.data && !skipPrimaryKey ? 'between' : 'around'
              }`}>
            <button
              onClick={handleFetch}
              className={`btn btcd-btn-lg sh-sm flx ${isLoading ? 'purple' : newFlow.triggerDetail?.data ? 'gray' : 'purple'
                }`}
              type="button">
              {isLoading
                ? __('Waiting for form submission...', 'bit-integrations')
                : newFlow.triggerDetail?.data
                  ? __('Fetched ✔', 'bit-integrations')
                  : __('Fetch', 'bit-integrations')}
              {isLoading && <LoaderSm size="20" clr="#022217" className="ml-2" />}
            </button>
            {newFlow.triggerDetail?.data?.length > 0 && !skipPrimaryKey && (
              <button
                onClick={() => setPrimaryKeyModal(true)}
                className={`btn btcd-btn-lg sh-sm flx ${newFlow.triggerDetail?.data?.length > 0 && 'gray'
                  }`}
                type="button"
                disabled={!newFlow.triggerDetail?.data?.length > 0}>
                {primaryKey
                  ? __('Unique Key ✔', 'bit-integrations')
                  : __('Unique Key', 'bit-integrations')}
              </button>
            )}
          </div>
          <ConfirmModal
            className="custom-conf-mdl"
            mainMdlCls="o-v"
            btnClass="purple"
            btnTxt={__('Ok', 'bit-integrations')}
            show={primaryKeyModal}
            close={() => setPrimaryKeyModal(false)}
            action={() => setPrimaryKeyModal(false)}
            title={__('Unique Key', 'bit-integrations')}
            cssTransStyle={{ zIndex: 99999 }}>
            <div className="btcd-hr mt-2 mb-2" />
            <div className="mt-2">{__('Select Unique Key', 'bit-integrations')}</div>
            <div className="flx flx-between mt-2">
              <MultiSelect
                options={newFlow.triggerDetail?.data?.map(field => ({
                  label: field?.label,
                  value: field?.name
                }))}
                className="msl-wrp-options"
                defaultValue={
                  Array.isArray(primaryKey) ? primaryKey.map(item => item.key).join(',') : ''
                }
                onChange={primaryKeySet}
                closeOnSelect
              />
            </div>
          </ConfirmModal>

          {newFlow.triggerDetail?.data && showResponse && (
            <WebhookDataTable data={newFlow?.triggerDetail?.data} flow={newFlow} setFlow={setNewFlow} />
          )}
          {newFlow.triggerDetail?.data && (
            <div className="flx flx-between">
              <button onClick={showResponseTable} className="btn btcd-btn-lg sh-sm gray flx">
                <span className="txt-essentialBlocks-resbtn font-inter-500">
                  {showResponse
                    ? __('Hide Response', 'bit-integrations')
                    : __('View Response', 'bit-integrations')}
                </span>
                &nbsp;
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
                disabled={!newFlow.triggerDetail.data.length || (!primaryKey && !skipPrimaryKey)}>
                {__('Set Action', 'bit-integrations')}
              </button>
            </div>
          )}
        </>
      )}
      <div className="flx flx-center">
        <div style={{ width: '100%', maxWidth: 450 }}>
          <Note note={info(newFlow)} isInstruction={true} maxWidth="100%">
            <TutorialLink
              linkKey={triggerLinkKey}
              linksMap={triggerTutorialLinks}
              style={{ marginTop: 0 }}
            />
          </Note>
        </div>
      </div>
    </div>
  )
}

export default CustomFormSubmission

const info = newFlow => `<h4>${sprintf(
  __('Follow these simple steps to set up the %s', 'bit-integrations'),
  newFlow?.triggerDetail?.name
)}</h4>
            <ul>
              <li>${__('Click the <b>Fetch</b> button.', 'bit-integrations')}</li>
              <li>${__(
  'Submit <b>The Form</b> while the Fetch button is <b>spinning</b>.',
  'bit-integrations'
)}</li>
              <li>${__(
  'After submitting the form, Click <b>Next</b> and then <b>Go</b></b>',
  'bit-integrations'
)}</li>
            </ul>
            <p><b>${__('Important', 'bit-integrations')}:</b> ${__(
  'The Fetch button will keep spinning until you submit the form/task.',
  'bit-integrations'
)}</p>
            <p><b>${__('Important', 'bit-integrations')}:</b> ${__(
  'Choose a consistent unique identifier like <b>Form ID</b> (default) or <b>Post ID</b> for each form entry, or create a hidden custom field if unavailable.',
  'bit-integrations'
)}</p>
            ${newFlow?.triggerDetail?.note
    ? `<h4 className="mt-0">Note</h4>${newFlow?.triggerDetail?.note}`
    : ''
  }`
