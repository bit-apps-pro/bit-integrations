import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilState } from 'recoil'
import Cooltip from '../../Utilities/Cooltip'
import { $newFlow } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'

const PostHelper = ({ flow, setFlowData, edit = false }) => {
  const id = !edit ? Number(flow?.triggerData?.formID) : Number(flow.triggered_entity_id)

  const [newFlow, setNewFlow] = useRecoilState($newFlow)

  const triggerData = !edit ? newFlow?.triggerData : flow.flow_details
  return (
    <div>
      {[1, 2, 3, 6].includes(id) && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? '' : 'wdt-200 d-in-b mt-3 mb-3'}>
            {__('Post Types', 'bit-integrations')}
          </b>
          <Cooltip width={250} icnSize={17} className="ml-2 mr-16">
            <div className="txt-body">
              {__('Note', 'bit-integrations')}:{' '}
              {__(
                'if you have not selected any post type, it will be By default "any post type"',
                'bit-integrations'
              )}
              <br />
            </div>
          </Cooltip>
          <MultiSelect
            className="msl-wrp-options mt-2"
            defaultValue={triggerData?.selectedPostType}
            options={triggerData?.types?.map(type => ({
              label: type.title,
              value: type.id.toString()
            }))}
            onChange={val => setFlowData(val, 'selectedPostType')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}
      {[4, 5, 7, 8, 9].includes(id) && (
        <div className={edit ? 'flx mt-3' : ''}>
          <b className={edit ? '' : 'wdt-100 d-in-b mt-3 mb-3'}>
            {__('Post Titles', 'bit-integrations')}
          </b>
          <Cooltip width={250} icnSize={17} className="ml-2 mr-18">
            <div className="txt-body">
              {__('Note', 'bit-integrations')}:{' '}
              {__(
                'if you have not selected any post title, it will be By default "any post"',
                'bit-integrations'
              )}
              <br />
            </div>
          </Cooltip>
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={triggerData?.selectedPostId}
            options={triggerData?.posts?.map(post => ({
              label: post.title,
              value: post.id.toString()
            }))}
            onChange={val => setFlowData(val, 'selectedPostId')}
            singleSelect
            style={{ width: '100%', minWidth: 300, maxWidth: 400 }}
          />
        </div>
      )}
    </div>
  )
}

export default PostHelper
