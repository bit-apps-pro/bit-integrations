import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilState } from 'recoil'
import { $newFlow } from '../../../GlobalStates'
import { getAllAwardByAchievementType, getAllRank } from './GamiPressHelper/GamiPressCommonFunction'
import { __ } from '../../../Utils/i18nwrap'

const GamiPressHelper = ({ flow, setFlowData, edit = false }) => {
  const id = !edit ? flow?.triggerData?.formID : flow.triggered_entity_id
  const [newFlow, setNewFlow] = useRecoilState($newFlow)
  const setFlowDataDepend = (val, type, isLoad = true) => {
    const tmpFlow = { ...flow }
    if (!edit) {
      tmpFlow.triggerData[type] = val
    } else {
      tmpFlow.flow_details[type] = val
    }
    if (type === 'selectedRankType') {
      getAllRank(val, tmpFlow, setNewFlow, edit)
    } else if (type === 'selectedAchievementType' && id === '2') {
      getAllAwardByAchievementType(val, tmpFlow, setNewFlow, edit)
    } else {
      setNewFlow({ ...tmpFlow })
    }
  }
  // const courses = !edit ? newFlow?.triggerData?.courses: flow.flow_details.courses
  const triggerData = !edit ? newFlow?.triggerData : flow.flow_details

  return (
    <>
      {id === '1' && (
        <>
          <div className={edit ? 'flx mt-3' : ''}>
            <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
              {__('Select a Rank Type', 'bit-integrations')}
            </b>
            <MultiSelect
              className="msl-wrp-options"
              defaultValue={triggerData.selectedRankType}
              options={triggerData?.rankTypes?.map(type => ({
                label: type.post_title,
                value: type.post_name.toString()
              }))}
              onChange={val => setFlowDataDepend(val, 'selectedRankType')}
              singleSelect
              style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
            />
          </div>

          <div className={edit ? 'flx mt-3' : ''}>
            <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
              {__('Select a Rank', 'bit-integrations')}
            </b>
            <MultiSelect
              className="msl-wrp-options"
              defaultValue={triggerData?.selectedRank}
              options={triggerData?.ranks?.map(list => ({
                label: list.post_title,
                value: list.post_name.toString()
              }))}
              onChange={val => setFlowData(val, 'selectedRank')}
              singleSelect
              style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
            />
          </div>
        </>
      )}
      {(id === '2' || id === '3' || id === '5') && (
        <>
          <div className={edit ? 'flx mt-3' : ''}>
            <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
              {__('Select an achievement type', 'bit-integrations')}
            </b>
            <MultiSelect
              className="msl-wrp-options"
              defaultValue={triggerData.selectedAchievementType}
              options={triggerData?.achievementTypes?.map(type => ({
                label: type.post_title,
                value: type.post_name.toString()
              }))}
              onChange={val => setFlowDataDepend(val, 'selectedAchievementType')}
              singleSelect
              style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
            />
          </div>

          {id === '2' && (
            <div className={edit ? 'flx mt-3' : ''}>
              <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
                {__('Select an award', 'bit-integrations')}
              </b>
              <MultiSelect
                className="msl-wrp-options"
                defaultValue={triggerData?.selectedAward}
                options={triggerData?.awards?.map(list => ({
                  label: list.post_title,
                  value: list.post_name.toString()
                }))}
                onChange={val => setFlowData(val, 'selectedAward')}
                singleSelect
                style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
              />
            </div>
          )}
        </>
      )}
      {id === '6' && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? 'wdt-200 d-in-b' : 'wdt-200 d-in-b mt-3 mb-3'}>
            {__('Enter Point', 'bit-integrations')}
          </b>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={triggerData?.selectedPoint}
            placeholder="Leave empty for any amount of points."
            customValue
            onChange={val => setFlowData(val, 'selectedPoint')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}
    </>
  )
}

export default GamiPressHelper
