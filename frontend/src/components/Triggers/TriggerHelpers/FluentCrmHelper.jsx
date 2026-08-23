import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilState } from 'recoil'
import { $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'

const FluentCrmHelper = ({ flow, setFlowData, edit = false }) => {
  const id = !edit ? flow?.triggerData?.formID : flow.triggered_entity_id

  const [newFlow, setNewFlow] = useRecoilState($newFlow)
  // const courses = !edit ? newFlow?.triggerData?.courses: flow.flow_details.courses
  const triggerData = !edit ? newFlow?.triggerData : flow.flow_details
  return (
    <div>
      {(id === 'fluentcrm-1' || id === 'fluentcrm-2') && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
            {__('Select tag', 'bit-integrations')}
          </b>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={triggerData?.selectedTag}
            options={triggerData?.tags?.map(list => ({
              label: list.tag_title,
              value: list.tag_id.toString()
            }))}
            onChange={val => setFlowData(val, 'selectedTag')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}

      {(id === 'fluentcrm-3' || id === 'fluentcrm-4') && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
            {__('Select List', 'bit-integrations')}
          </b>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={triggerData?.selectedList}
            options={triggerData?.lists?.map(list => ({
              label: list.list_title,
              value: list.list_id.toString()
            }))}
            onChange={val => setFlowData(val, 'selectedList')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}

      {id === 'fluentcrm-5' && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
            {__('Select Status', 'bit-integrations')}
          </b>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={triggerData?.selectedStatus}
            options={triggerData?.status?.map(status => ({
              label: status.status_title,
              value: status.status_id.toString()
            }))}
            onChange={val => setFlowData(val, 'selectedStatus')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}
    </div>
  )
}

export default FluentCrmHelper
