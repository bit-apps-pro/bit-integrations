// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '../../../Utils/i18nwrap'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../../GlobalStates'
import { postFields } from '../../../Utils/StaticData/postField'
import bitsFetch from '../../../Utils/bitsFetch'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import PodsFieldMap from './FieldMap'
import { addFieldMap, checkMappedPodFields, checkMappedPostFields } from './PodHelperFunction'

function EditPod({ allIntegURL }) {
  const [types, setTypes] = useState([])
  const [users, setUsers] = useState([])
  const [data, setData] = useRecoilState($actionConf)
  const [flow, setFlow] = useRecoilState($newFlow)
  const formFields = useRecoilValue($formFields)
  const [pods, setPods] = useState([])
  const { id } = useParams()
  const navigate = useNavigate()
  const [podFields, setPodsFields] = useState([])
  const [podFiles, setPodFiles] = useState([])
  const [snack, setSnackbar] = useState({ show: false })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    bitsFetch({}, 'pods/list', null, 'GET').then(res => {
      if (res?.success && res !== undefined) {
        setTypes(Object.values(res.data?.post_types))
        setUsers(res.data?.users)
      }
    })

    bitsFetch({ post_type: data?.post_type }, 'pods/fields').then(res => {
      if (res?.success && res !== undefined) {
        setPodsFields(Object.values(res?.data?.podFields))
        setPodFiles(Object.values(res?.data?.podFiles))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInput = (typ, val, isNumber) => {
    const tmpData = { ...data }
    if (isNumber) {
      tmpData[typ] = Number(val)
    } else {
      tmpData[typ] = val
    }
    setData(tmpData)
  }

  const getPodsField = (typ, val) => {
    const tmpData = { ...data }
    tmpData[typ] = val
    bitsFetch({ post_type: val }, 'pods/fields').then(res => {
      if (res?.success && res !== undefined) {
        setPodsFields(Object.values(res?.data?.podFields))
        setPodFiles(Object.values(res?.data?.podFiles))
        if (res?.data) {
          tmpData.pod_map = Object.values(res.data)
            .filter(fld => fld.required)
            .map(fl => ({ formField: '', podField: fl.key, required: fl.required }))
          if (tmpData?.pod_map?.length < 1) {
            tmpData.pod_map = [{}]
          }
        }
        setData(tmpData)
      }
    })
  }

  const saveConfig = () => {
    if (!checkMappedPostFields(data)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }
    if (!checkMappedPodFields(data)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }
    saveActionConf({
      flow,
      setFlow,
      allIntegURL,
      conf: data,
      navigate,
      edit: 1,
      setIsLoading,
      setSnackbar
    })
  }

  return (
    <div style={{ width: 900 }}>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <div className="mt-3">
        <b>{__('Integration Name', 'bit-integrations')}</b>
      </div>
      <input
        className="btcd-paper-inp w-5 mt-1"
        onChange={e => handleInput(e.target.name, e.target.value)}
        name="name"
        value={data.name}
        type="text"
        placeholder={__('Integration Name...', 'bit-integrations')}
      />
      <br />
      <br />
      <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

      <div className="mt-3">
        <b>{__('Post Type', 'bit-integrations')}</b>
      </div>
      <select
        name="post_type"
        onChange={e => getPodsField(e.target.name, e.target.value)}
        value={data?.post_type}
        className="btcd-paper-inp w-5 mt-1">
        <option disabled selected>
          Select type
        </option>
        {types.map((type, key) => (
          <option key={`pod-${key * 2}`} value={type.name}>
            {type.label}
          </option>
        ))}
      </select>

      <div className="mt-3">
        <b>{__('Post Status', 'bit-integrations')}</b>
      </div>
      <select
        name="post_status"
        onChange={e => handleInput(e.target.name, e.target.value)}
        value={data?.post_status}
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
        value={data?.comment_status}
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
        value={data?.post_author}
        className="btcd-paper-inp w-5 mt-1">
        <option disabled selected>
          {__('Select Author', 'bit-integrations')}
        </option>
        <option value="logged_in_user">Logged In User</option>
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
        {data?.post_map?.map((itm, i) => (
          <PodsFieldMap
            key={`analytics-m-${i + 9}`}
            i={i}
            type="post"
            field={itm}
            formFields={formFields}
            podsConf={data}
            setPodsConf={setData}
            podFields={postFields}
            fieldType="fields"
          />
        ))}

        <div className="txt-center btcbi-field-map-button mt-2">
          <button
            onClick={() => addFieldMap('post_map', data.post_map.length, data, setData)}
            className="icn-btn sh-sm"
            type="button">
            +
          </button>
        </div>

        <div>
          <div className="mt-3 mb-1">
            <b>Pod Fields Mapping</b>
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
        {data?.pod_field_map?.map((itm, i) => (
          <PodsFieldMap
            key={`analytics-m-${i + 9}`}
            i={i}
            type="pod"
            field={itm}
            formFields={formFields}
            podsConf={data}
            setPodsConf={setData}
            podFields={podFields}
            fieldType="fields"
          />
        ))}
        <div className="txt-center btcbi-field-map-button mt-2">
          <button
            onClick={() => addFieldMap('pod_field_map', data.pod_field_map.length, data, setData)}
            className="icn-btn sh-sm"
            type="button">
            +
          </button>
        </div>

        <div>
          <div className="mt-3 mb-1">
            <b>Pod File Upload Mapping</b>
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
        {data?.pod_file_map?.map((itm, i) => (
          <PodsFieldMap
            key={`analytics-m-${i + 9}`}
            i={i}
            type="podFile"
            field={itm}
            formFields={formFields}
            podsConf={data}
            setPodsConf={setData}
            podFields={podFiles}
            fieldType="file"
          />
        ))}
        <div className="txt-center btcbi-field-map-button mt-2">
          <button
            onClick={() => addFieldMap('pod_file_map', data.pod_file_map.length, data, setData)}
            className="icn-btn sh-sm"
            type="button">
            +
          </button>
        </div>
      </div>
      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        isLoading={isLoading}
        dataConf={data}
        setDataConf={setData}
        formFields={formFields}
      />
    </div>
  )
}

export default EditPod
