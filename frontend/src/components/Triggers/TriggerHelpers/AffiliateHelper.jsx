import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilState } from 'recoil'
import { $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'

const AffiliateHelper = ({ flow, setFlowData, edit = false }) => {
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
    <div>
      {(id === '4' || id === '5' || id === '3') && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
            {__('Select a Type', 'bit-integrations')}
          </b>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={triggerData?.selectedType}
            options={triggerData?.allType?.map(list => ({
              label: list.type_name,
              value: list.type_id.toString()
            }))}
            onChange={val => setFlowData(val, 'selectedType')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}
    </div>
  )
}
export default AffiliateHelper
