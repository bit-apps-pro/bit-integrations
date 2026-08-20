import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilState } from 'recoil'
import { $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { getTopicByForum } from './BuddybossHelper/BuddybossCommonFunction'
import { create } from 'mutative'

const BuddyBossHelper = ({ flow, setFlowData, edit = false }) => {
  const id = !edit ? flow?.triggerData?.formID : flow.triggered_entity_id

  const [newFlow, setNewFlow] = useRecoilState($newFlow)
  const triggerData = !edit ? newFlow?.triggerData : flow.flow_details

  const setFlowDataDepend = (val, type, isLoad = true) => {
    const tmpFlow = create(flow, draftChangeData => {
      if (!edit) {
        draftChangeData.triggerData[type] = val
      } else {
        draftChangeData.flow_details[type] = val
      }
    })
    if (type === 'selectedForum' && id === '4') {
      getTopicByForum(val, tmpFlow, setNewFlow, edit)
    } else {
      setNewFlow(tmpFlow)
    }
  }

  return (
    <>
      {(id === '3' || id === '4') && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
            {__('Select a Forum', 'bit-integrations')}
          </b>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={triggerData?.selectedForum}
            options={triggerData?.forums?.map(list => ({
              label: list.forum_title,
              value: list.forum_id.toString()
            }))}
            onChange={val => setFlowDataDepend(val, 'selectedForum')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}
      {id === '4' && triggerData?.topics && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
            {__('Select a Topic', 'bit-integrations')}
          </b>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={triggerData?.selectedTopic}
            options={triggerData?.topics?.map(list => ({
              label: list.topic_title,
              value: list.topic_id.toString()
            }))}
            onChange={val => setFlowData(val, 'selectedTopic')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}
      {(id === '9' || id === '10' || id === '11' || id === '12' || id === '13') && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
            {__('Select a Group', 'bit-integrations')}
          </b>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={triggerData?.selectedGroup}
            options={triggerData?.groups?.map(list => ({
              label: list.group_title,
              value: list.group_id.toString()
            }))}
            onChange={val => setFlowData(val, 'selectedGroup')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}
    </>
  )
}

export default BuddyBossHelper
