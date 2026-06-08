// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '../../../Utils/i18nwrap'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import bitsFetch from '../../../Utils/bitsFetch'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import { addFieldMap, checkMappedPostFields, checkMappedPodFields } from './PodHelperFunction'
import PodsFieldMap from './FieldMap'
import SnackMsg from '../../Utilities/SnackMsg'
import { postFields } from '../../../Utils/StaticData/postField'
import LoaderSm from '../../Loaders/LoaderSm'
import TableCheckBox from '../../Utilities/TableCheckBox'
import ConditionalLogic from '../../ConditionalLogic'
import TutorialLink from '../../Utilities/TutorialLink'

function Pods({ formFields, setFlow, flow, allIntegURL }) {
  const [podFields, setPodsFields] = useState([])
  const [podFiles, setPodFiles] = useState([])
  const [users, setUsers] = useState([])
  const [postTypes, setPostTypes] = useState([])
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
const [podsConf, setPodsConf] = useState({
    name: 'Pods',
    type: 'Pods',
    post_map: [{ post_author: 'logged_in_user' }],
    pod_field_map: [{}],
    pod_file_map: [{}],
    condition: {
      action_behavior: '',
      actions: [{ field: '', action: 'value' }],
      logics: [{ field: '', logic: '', val: '' }, 'or', { field: '', logic: '', val: '' }]
    }
  })
  const [snack, setSnackbar] = useState({ show: false })

  const handleInput = (typ, val, isNumber) => {
    const tmpData = { ...podsConf }
    if (isNumber) {
      tmpData[typ] = Number(val)
    } else {
      tmpData[typ] = val
    }
    setPodsConf(tmpData)
  }

  const getPodsField = (typ, val) => {
    const tmpData = { ...podsConf }
    tmpData[typ] = val
    bitsFetch({ post_type: val }, 'pods/fields').then(res => {
      if (res?.success && res !== undefined) {
        setPodsFields(Object.values(res?.data?.podFields))
        setPodFiles(Object.values(res?.data?.podFiles))
        if (res?.data) {
          tmpData.pod_field_map = Object.values(res?.data?.podFields)
            .filter(fld => fld.required)
            .map(fl => ({ formField: '', podFormField: fl.key, required: fl.required }))
          if (tmpData?.pod_field_map?.length < 1) {
            tmpData.pod_field_map = [{}]
          }
        }
        setPodsConf(tmpData)
      }
    })
  }

  useEffect(() => {
    bitsFetch(
      {},
      'pods/list',

      '',

      'GET'
    ).then(res => {
      const { data } = res
      setPostTypes(data?.post_types)
      setUsers(data.users)
    })

    // const newConf = { ...podsConf }
    // newConf.post_map = postFields.filter(fld => fld.required).map(fl => ({ formField: '', postFormField: fl.key, required: fl.required }))
    // setPodsConf(newConf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkedCondition = (val, checked) => {
    const tmpConf = { ...podsConf }
    if (checked) {
      tmpConf.condition.action_behavior = val
    } else {
      tmpConf.condition.action_behavior = ''
    }
    setPodsConf(tmpConf)
  }

  const saveConfig = () => {
    if (!podsConf.post_type) {
      setSnackbar({ show: true, msg: __("Pod can't be empty", 'bit-integrations') })
      return
    }
    if (!podsConf.post_status) {
      setSnackbar({ show: true, msg: __("Post Status can't be empty", 'bit-integrations') })
      return
    }
    if (!checkMappedPostFields(podsConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }
    if (!checkMappedPodFields(podsConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }
    setIsLoading(true)
    saveIntegConfig(flow, setFlow, allIntegURL, podsConf, navigate, '', '', setIsLoading)
  }

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
            <TutorialLink linkKey="podLinks" />

      <div className="mt-3">
        <b>{__('Integration Name', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-5 mt-1"
        onChange={e => handleInput(e.target.name, e.target.value)}
        name="name"
        value={podsConf.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
      />

      <div className="mt-3">
        <b>{__('Pod', 'bit-integrations')}</b> <span style={{ color: 'red' }}>*</span>
      </div>
      <select
        name="post_type"
        onChange={e => getPodsField(e.target.name, e.target.value)}
        className="btcd-paper-inp w-5 mt-1">
        <option disabled selected>
          Select type
        </option>
        {postTypes?.map((type, key) => (
          <option key={`pod-${key * 2}`} value={type.name}>
            {type.label}
          </option>
        ))}
      </select>

      <div className="mt-3">
        <b>{__('Post Status', 'bit-integrations')}</b> <span style={{ color: 'red' }}>*</span>
      </div>
      <select
        name="post_status"
        onChange={e => handleInput(e.target.name, e.target.value)}
        className="btcd-paper-inp w-5 mt-1">
        <option disabled selected>
          {__('Select Status', 'bit-integrations')}
        </option>
        <option value="publish">{__('Publish', 'bit-integrations')}</option>
        <option value="draft">{__('Draft', 'bit-integrations')}</option>
        <option value="inherit">{__('Inherit', 'bit-integrations')}</option>
        <option value="auto-draft">{__('Auto-Draft', 'bit-integrations')}</option>
        <option value="private ">{__('Private', 'bit-integrations')}</option>
        <option value="pending">{__('Pending', 'bit-integrations')}</option>
      </select>

      <div className="mt-3">
        <b>{__('Comment Status', 'bit-integrations')}</b>
      </div>
      <select
        name="comment_status"
        onChange={e => handleInput(e.target.name, e.target.value)}
        className="btcd-paper-inp w-5 mt-1">
        <option disabled selected>
          {__('Select Status', 'bit-integrations')}
        </option>
        <option value="open">{__('Open', 'bit-integrations')}</option>
        <option value="closed">{__('Closed', 'bit-integrations')}</option>
      </select>

      <div className="mt-3">
        <b>{__('Author', 'bit-integrations')}</b>
      </div>
      <select
        name="post_author"
        onChange={e => handleInput(e.target.name, e.target.value)}
        className="btcd-paper-inp w-5 mt-1">
        <option disabled selected>
          {__('Select Author', 'bit-integrations')}
        </option>
        <option value="logged_in_user">{__('Logged In User', 'bit-integrations')}</option>
        {users.map((user, key) => (
          <option key={`pod-${key * 2}`} value={user.ID}>
            {user.display_name}
          </option>
        ))}
      </select>

      <div>
        <div>
          <div className="mt-3 mb-1">
            <b>{__('Post Fields Mapping', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Post Fields', 'bit-integrations')}</b>
            </div>
          </div>
        </div>
        {podsConf?.post_map?.map((itm, i) => (
          <PodsFieldMap
            key={`analytics-m-${i + 9}`}
            i={i}
            type="post"
            field={itm}
            formFields={formFields}
            podsConf={podsConf}
            setPodsConf={setPodsConf}
            podFields={postFields}
            fieldType="fields"
          />
        ))}

        <div className="txt-center btcbi-field-map-button mt-2">
          <button
            onClick={() => addFieldMap('post_map', podsConf.post_map.length, podsConf, setPodsConf)}
            className="icn-btn sh-sm"
            type="button">
            +
          </button>
        </div>

        <div>
          <div className="mt-3 mb-1">
            <b>{__('Pod Fields Mapping', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Pod Fields', 'bit-integrations')}</b>
            </div>
          </div>
        </div>
        {podsConf.pod_field_map.map((itm, i) => (
          <PodsFieldMap
            key={`analytics-m-${i + 9}`}
            i={i}
            type="pod"
            field={itm}
            formFields={formFields}
            podsConf={podsConf}
            setPodsConf={setPodsConf}
            podFields={podFields}
            fieldType="fields"
          />
        ))}
        <div className="txt-center btcbi-field-map-button mt-2">
          <button
            onClick={() =>
              addFieldMap('pod_field_map', podsConf.pod_field_map.length, podsConf, setPodsConf)
            }
            className="icn-btn sh-sm"
            type="button">
            +
          </button>
        </div>

        <div>
          <div className="mt-3 mb-1">
            <b>{__('Pod File Upload Mapping', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Pod Fields', 'bit-integrations')}</b>
            </div>
          </div>
        </div>
        {podsConf.pod_file_map.map((itm, i) => (
          <PodsFieldMap
            key={`analytics-m-${i + 9}`}
            i={i}
            type="podFile"
            field={itm}
            formFields={formFields}
            podsConf={podsConf}
            setPodsConf={setPodsConf}
            podFields={podFiles}
            fieldType="file"
          />
        ))}
        <div className="txt-center btcbi-field-map-button mt-2">
          <button
            onClick={() =>
              addFieldMap('pod_file_map', podsConf.pod_file_map.length, podsConf, setPodsConf)
            }
            className="icn-btn sh-sm"
            type="button">
            +
          </button>
        </div>
      </div>

      {podsConf?.condition && (
        <>
          <div className="flx">
            <TableCheckBox
              onChange={e => checkedCondition(e.target.value, e.target.checked)}
              checked={podsConf?.condition?.action_behavior === 'cond'}
              className="wdt-200 mt-4 mr-2"
              value="cond"
              title={__('Conditional Logics', 'bit_integration')}
            />
          </div>
          <br />
          {podsConf?.condition?.action_behavior === 'cond' && (
            <ConditionalLogic formFields={formFields} dataConf={podsConf} setDataConf={setPodsConf} />
          )}
        </>
      )}

      <button
        className="btn f-left btcd-btn-lg purple sh-sm flx"
        type="button"
        onClick={() => saveConfig()}>
        {__('Save', 'bit-integrations')}{' '}
        {isLoading && <LoaderSm size={20} clr="#022217" className="ml-2" />}
      </button>
    </div>
  )
}

export default Pods
