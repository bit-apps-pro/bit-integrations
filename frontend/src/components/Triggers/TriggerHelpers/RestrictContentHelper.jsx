import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilState } from 'recoil'
import { $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'

const RestrictContentHelper = ({ flow, setFlowData, edit = false }) => {
  const id = !edit ? flow?.triggerData?.formID : flow.triggered_entity_id

  const [newFlow, setNewFlow] = useRecoilState($newFlow)
  const setFlowDataDepend = (val, type, isLoad = true) => {
    const tmpFlow = { ...flow }
    if (!edit) {
      tmpFlow.triggerData[type] = val
    } else {
      tmpFlow.flow_details[type] = val
    }

    setNewFlow({ ...tmpFlow })
  }
  // const courses = !edit ? newFlow?.triggerData?.courses: flow.flow_details.courses
  const triggerData = !edit ? newFlow?.triggerData : flow.flow_details
  return (
    <div className={edit ? 'flx mt-3' : ''}>
      <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
        {__('Select a Membership', 'bit-integrations')}
      </b>
      <MultiSelect
        className="msl-wrp-options"
        defaultValue={triggerData?.selectedMembership}
        options={triggerData?.allMembership?.map(list => ({
          label: list.level_name,
          value: list.level_id.toString()
        }))}
        onChange={val => setFlowDataDepend(val, 'selectedMembership')}
        singleSelect
        style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
      />
    </div>
  )
}

export default RestrictContentHelper
