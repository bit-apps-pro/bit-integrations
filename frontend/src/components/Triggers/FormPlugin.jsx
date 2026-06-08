import { create } from 'mutative'
import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { $appConfigState, $flowStep, $formFields, $newFlow } from '../../GlobalStates'
import useFetch from '../../hooks/useFetch'
import bitsFetch from '../../Utils/bitsFetch'
import { __, sprintf } from '../../Utils/i18nwrap'
import Loader from '../Loaders/Loader'
import LoaderSm from '../Loaders/LoaderSm'
import Note from '../Utilities/Note'
import SnackMsg from '../Utilities/SnackMsg'
import { FormPluginStateHelper } from './TriggerHelpers/TriggerStateHelper'
import TriggerMultiOption from './TriggerMultiOption'
import TutorialLink from '../Utilities/TutorialLink'

const FormPlugin = () => {
  const [newFlow, setNewFlow] = useRecoilState($newFlow)
  const setFlowStep = useSetRecoilState($flowStep)
  const setFormFields = useSetRecoilState($formFields)
  const [snack, setSnackbar] = useState({ show: false, msg: '' })
  const [isLoad, setIsLoad] = useState(false)
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi
  const triggerLinkKey = newFlow?.triggered_entity
  const triggerTutorialLinks = triggerLinkKey
    ? {
        [triggerLinkKey]: {
          docLink: newFlow?.triggerDetail?.documentation_url || '',
          youTubeLink: newFlow?.triggerDetail?.tutorial_url || ''
        }
      }
    : undefined

  const { data, isLoading } = useFetch({
    payload: {},
    action: newFlow.triggerDetail.list.action,
    method: newFlow.triggerDetail.list.method
  })

  const setFlowData = (val, type) => {
    setNewFlow(prevState =>
      create(prevState, draft => {
        draft.triggerData[type] = val
      })
    )
  }

  const setTriggerData = val => {
    const tmpNewFlow = { ...newFlow }

    if (!val) {
      delete tmpNewFlow.triggerData
      setNewFlow(tmpNewFlow)
    } else {
      setIsLoad(true)
      let queryData = { id: val }

      // Page Builder triggers requires postId
      if (
        newFlow?.triggerDetail?.name === 'PiotnetAddon' ||
        newFlow?.triggerDetail?.name === 'CartFlow'
      ) {
        const filterData = data?.data?.filter(item => item.id === val)[0]?.post_id || null
        queryData = { ...queryData, postId: filterData }
      }

      bitsFetch(queryData, newFlow.triggerDetail.fields.action).then(resp => {
        if (resp.success) {
          tmpNewFlow.triggerData = {
            formID: val,
            fields: resp.data.fields,
            postId: resp.data.postId,
            trigger_type: newFlow?.triggerDetail?.type || 'form'
          }
          setFormFields(resp.data.fields)
          FormPluginStateHelper(val, tmpNewFlow, resp, setNewFlow)
        } else {
          setSnackbar({ show: true, msg: __(resp.data, 'bit-integrations') })
          delete tmpNewFlow.triggerData
          setNewFlow(tmpNewFlow)
        }
      })
      setIsLoad(false)
    }
  }

  const updatedStep = () => {
    setFlowStep(2)
  }

  let taskNote = ''

  if (newFlow.triggerData?.formID) {
    const selectedTask = data?.data?.filter(item => item.id == newFlow.triggerData?.formID)
    if (selectedTask?.length > 0 && selectedTask[0]?.note) {
      taskNote = selectedTask[0].note
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <br />
      {isLoading || isLoad ? (
        <Loader
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 50,
            transform: 'scale(0.7)'
          }}
        />
      ) : (
        <div>
          {data?.success === false ? (
            <span>{__(data.data, 'bit-integrations')}</span>
          ) : (
            <>
              <div>
                <h4>{__('Select a Form/Task Name', 'bit-integrations')}</h4>
                <MultiSelect
                  className="msl-wrp-options"
                  defaultValue={newFlow.triggerData?.formID}
                  options={data?.data?.map(form => ({
                    label: isFormSelectable(isPro, form?.isPro || false)
                      ? form?.title
                      : form?.title + ' (Pro)',
                    value: form.id.toString(),
                    disabled: !isFormSelectable(isPro, form?.isPro || false)
                  }))}
                  onChange={val => setTriggerData(val)}
                  singleSelect
                  style={{ width: '100%', minWidth: 400, maxWidth: 450 }}
                />
                {taskNote && (
                  <small className="trigger-task-note">
                    <strong>Task Details: </strong>
                    {__(taskNote, 'bit-integrations')}
                  </small>
                )}
                <TriggerMultiOption flow={newFlow} setFlowData={setFlowData} />
                <div>
                  <button
                    type="button"
                    onClick={updatedStep}
                    className="btn ml-auto btcd-btn-lg purple sh-sm flx mt-4"
                    disabled={!newFlow?.triggerData?.formID}>
                    &nbsp;{__('Next', 'bit-integrations')}
                    <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
                    {isLoad && <LoaderSm size={20} clr="#fff" className="ml-2" />}
                  </button>
                </div>
              </div>

              <Note note={info(newFlow)} isInstruction={true}>
                <TutorialLink
                  linkKey={triggerLinkKey}
                  linksMap={triggerTutorialLinks}
                  style={{ marginTop: 0 }}
                />
              </Note>
            </>
          )}
        </div>
      )}
    </div>
  )
}
export default FormPlugin

const isFormSelectable = (isProPluginActivated, formIsPro = false) => !formIsPro || isProPluginActivated

const info = newFlow => `<h4>${sprintf(
  __('Set up %s in a few quick steps', 'bit-integrations'),
  newFlow?.triggerDetail?.name
)}</h4>
            <ul>
              <li>${__('Choose the form or task you want to use.', 'bit-integrations')}</li>
              <li>${__('Click <b>Next</b> to <b>Go</b>.', 'bit-integrations')}</li>
            </ul>
            ${
              newFlow?.triggerDetail?.note
                ? `<h4>${__('Note', 'bit-integrations')}</h4>${newFlow?.triggerDetail?.note}`
                : ''
            }`
