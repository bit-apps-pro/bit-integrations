import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState, useRecoilValue } from 'recoil'
import { $actionConf, $appConfigState, $formFields, $newFlow } from '../../../GlobalStates'
import { deepCopy } from '../../../Utils/Helpers'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import Cooltip from '../../Utilities/Cooltip'
import SnackMsg from '../../Utilities/SnackMsg'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import SetEditIntegComponents from '../IntegrationHelpers/SetEditIntegComponents'
import CustomField from './CustomField'
import FieldMap from './FieldMap'
import {
  addFieldMap,
  checkMappedAcfFields,
  checkMappedJEFields,
  checkMappedMbFields,
  checkMappedPostFields,
  generatePostCreationFieldMap,
  getPostCreationFieldsByAction,
  isLegacyPostCreationAction,
  postCreationExtraActions,
  refreshPostCategories,
  refreshPostTypes
} from './PostHelperFunction'
import { ProFeatureTitle } from '../IntegrationHelpers/ActionProFeatureLabels'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import TutorialLink from '../../Utilities/TutorialLink'

function Post({ allIntegURL }) {
  const [users, setUsers] = useState([])
  const [postTypes, setPostTypes] = useState([])
  const [postCategories, setPostCategories] = useState([])
  const navigate = useNavigate()
  const { id } = useParams()
  const [postConf, setPostConf] = useRecoilState($actionConf)
  const formFields = useRecoilValue($formFields)
  const [flow, setFlow] = useRecoilState($newFlow)
  const [isLoading, setIsLoading] = useState(false)
  const [snack, setSnackbar] = useState({ show: false })
  const [acf, setAcf] = useState({ fields: [], files: [] })
  const [mb, setMb] = useState({ fields: [], files: [] })
  const [jeCPTMeta, setJeCPTMeta] = useState({ fields: [], files: [] })
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleInput = (typ, val) => {
    const tmpData = { ...postConf }
    tmpData[typ] = val
    setPostConf(tmpData)
  }

  const postCategoriesValue = Array.isArray(postConf?.post_categories)
    ? postConf.post_categories.map(String).join(',')
    : postConf?.post_categories?.toString() || ''

  useEffect(() => {
    const tmpData = deepCopy({ ...postConf })
    bitsFetch({}, 'user/list').then(res => {
      const { data } = res
      setUsers(data)
    })

    bitsFetch({}, 'post-types/list').then(res => {
      const { data } = res
      setPostTypes(data)
    })

    if (!tmpData.action_type) {
      tmpData.action_type = 'createNewPost'
    }
    if (!tmpData?.post_map?.[0]?.postField) {
      tmpData.post_map = generatePostCreationFieldMap(tmpData.action_type)
    }

    refreshPostCategories(tmpData?.post_type, setPostCategories)

    bitsFetch({ post_type: tmpData?.post_type }, 'customfield/list').then(res => {
      const { data } = res
      setAcf({ fields: data.acf_fields, files: data.acf_files })
      setMb({ fields: data.mb_fields, files: data.mb_files })
      setJeCPTMeta({ fields: data.je_cpt_fields, files: data.je_cpt_files })
    })

    setPostConf(tmpData)
  }, [])

  const getCustomFields = (typ, val) => {
    const tmpData = { ...postConf }
    tmpData[typ] = val
    refreshPostCategories(val, setPostCategories)

    bitsFetch({ post_type: val }, 'customfield/list').then(res => {
      const { data } = res
      setAcf({ fields: data.acf_fields, files: data.acf_files })
      setMb({ fields: data.mb_fields, files: data.mb_files })
      setJeCPTMeta({ fields: data.je_cpt_fields, files: data.je_cpt_files })
      if (data?.acf_fields) {
        tmpData.acf_map = data.acf_fields
          .filter(fld => fld.required)
          .map(fl => ({ formField: '', acfField: fl.key, required: fl.required }))
        if (tmpData.acf_map.length < 1) {
          tmpData.acf_map = [{}]
        }
      }
      if (data?.mb_fields) {
        tmpData.metabox_map = data.mb_fields
          .filter(fld => fld.required)
          .map(fl => ({ formField: '', metaboxField: fl.key, required: fl.required }))
        if (tmpData.metabox_map.length < 1) {
          tmpData.metabox_map = [{}]
        }
      }
      if (data?.je_cpt_fields) {
        tmpData.je_cpt_meta_map = data.je_cpt_fields
          .filter(fld => fld.required)
          .map(fl => ({ formField: '', jeCPTField: fl.key, required: fl.required }))
      }
      if (tmpData.je_cpt_meta_map.length < 1) {
        tmpData.je_cpt_meta_map = [{}]
      }
    })
    setPostConf(tmpData)
  }

  const setActionType = actionType => {
    const nextAction = actionType || 'createNewPost'
    setPostConf(prevConf => ({
      ...prevConf,
      action_type: nextAction,
      post_map: generatePostCreationFieldMap(nextAction)
    }))
  }

  const isLegacyAction = isLegacyPostCreationAction(postConf?.action_type)
  const selectedPostFields = getPostCreationFieldsByAction(postConf?.action_type || 'createNewPost')

  const saveConfig = () => {
    if (!checkMappedPostFields(postConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }
    if (isLegacyAction && !checkMappedAcfFields(postConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }
    if (isLegacyAction && !checkMappedMbFields(postConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }
    if (isLegacyAction && !checkMappedJEFields(postConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, postConf, navigate, id, 1, setIsLoading)
    resp.then(res => {
      if (res.success) {
        setSnackbar({ show: true, msg: res.data })
      } else {
        setSnackbar({ show: true, msg: res.data || res })
      }
    })
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div style={{ width: 900 }}>
        <TutorialLink linkKey="postCreation" />
        <div className="flx mt-3">
          <div className="wdt-200 d-in-b">
            <b>{__('Integration Name', 'bit-integrations')}</b>
          </div>
          <input
            className="btcd-paper-inp w-5 mt-1"
            onChange={e => handleInput(e.target.name, e.target.value)}
            name="name"
            value={postConf.name}
            type="text"
            placeholder={__('Integration Name...', 'bit-integrations')}
          />
        </div>
        <br />
        <SetEditIntegComponents entity={flow.triggered_entity} setSnackbar={setSnackbar} />

        <div className="flx mt-2">
          <div className="wdt-200 d-in-b">
            <b>{__('Action type', 'bit-integrations')}</b>
          </div>
          <select
            className="btcd-paper-inp w-5 mt-1"
            value={postConf?.action_type || 'createNewPost'}
            onChange={e => setActionType(e.target.value)}>
            {postCreationExtraActions.map(action => (
              <option key={action.value} value={action.value} disabled={!checkIsPro(isPro, action.is_pro)}>
                {checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label)}
              </option>
            ))}
          </select>
        </div>

        {isLegacyAction && (
          <>
            <div className="mt-3 flx">
              <b>{__('Post Type', 'bit-integrations')}</b>
              <Cooltip width={250} icnSize={17} className="ml-2">
                <div className="txt-body">
                  {__(
                    'Select one of the defined WordPress post types Or custom post types for the post',
                    'bit-integrations'
                  )}
                  <br />
                </div>
              </Cooltip>
            </div>
            <div>
              <select
                name="post_type"
                value={postConf?.post_type}
                onChange={e => getCustomFields(e.target.name, e.target.value)}
                className="btcd-paper-inp w-5 mt-1">
                <option disabled selected>
                  {__('Select Post Type', 'bit-integrations')}
                </option>
                {postTypes?.map((postType, key) => (
                  <option key={`acf-${key * 2}`} value={postType?.id}>
                    {postType?.title}
                  </option>
                ))}
              </select>
              <button
                onClick={() => refreshPostTypes(setPostTypes)}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh Post Types', 'bit-integrations')}'` }}
                type="button">
                &#x21BB;
              </button>
            </div>

            <div className="mt-3">
              <b>{__('Post Categories', 'bit-integrations')}</b>
              <Cooltip width={250} icnSize={17} className="ml-2">
                <div className="txt-body">
                  {__('Select one or multiple categories for the post', 'bit-integrations')}
                  <br />
                </div>
              </Cooltip>
            </div>
            <div className="flx">
              <MultiSelect
                key={`post-categories-${postConf?.post_type || 'default'}-${postCategoriesValue}-${postCategories?.length || 0}`}
                className="mt-2 w-5"
                defaultValue={postCategoriesValue}
                options={postCategories?.map(category => ({
                  label: category?.label,
                  value: category?.value?.toString()
                }))}
                onChange={val => handleInput('post_categories', val)}
              />
              <button
                onClick={() => refreshPostCategories(postConf?.post_type, setPostCategories)}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh Post Categories', 'bit-integrations')}'` }}
                type="button">
                &#x21BB;
              </button>
            </div>

            <div className="mt-3">
              <b>{__('Post Status', 'bit-integrations')}</b>
              <Cooltip width={250} icnSize={17} className="ml-2">
                <div className="txt-body">
                  {__(
                    'Select the status for the post. If published status is selected and the post date is in the future, it will automatically be changed to scheduled',
                    'bit-integrations'
                  )}
                  <br />
                </div>
              </Cooltip>
            </div>
            <select
              name="post_status"
              value={postConf?.post_status}
              onChange={e => handleInput(e.target.name, e.target.value)}
              className="btcd-paper-inp w-5 mt-2">
              <option disabled selected>
                {__('Select Status', 'bit-integrations')}
              </option>
              <option value="publish">{__('Publish', 'bit-integrations')}</option>
              <option value="draft">{__('Draft', 'bit-integrations')}</option>
              <option value="auto-draft">{__('Auto-Draft', 'bit-integrations')}</option>
              <option value="private">{__('Private', 'bit-integrations')}</option>
              <option value="pending">{__('Pending', 'bit-integrations')}</option>
            </select>

            <div className="mt-3 flx">
              <b>{__('Author', 'bit-integrations')}</b>
              <Cooltip width={250} icnSize={17} className="ml-2">
                <div className="txt-body">
                  {__('Select the user to be assigned to the post', 'bit-integrations')}
                  <br />
                </div>
              </Cooltip>
            </div>
            <div>
              <select
                name="post_author"
                value={postConf?.post_author}
                onChange={e => handleInput(e.target.name, e.target.value)}
                className="btcd-paper-inp w-5 mt-2">
                <option disabled selected>
                  {__('Select Author', 'bit-integrations')}
                </option>
                <option value="logged_in_user">{__('Logged In User', 'bit-integrations')}</option>
                {users?.map((user, key) => (
                  <option key={`acf-${key * 2}`} value={user.ID}>
                    {user.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3">
              <b>{__('Comment Status', 'bit-integrations')}</b>
            </div>
            <select
              name="comment_status"
              value={postConf?.comment_status}
              onChange={e => handleInput(e.target.name, e.target.value)}
              className="btcd-paper-inp w-5 mt-2">
              <option disabled selected>
                {__('Select Status', 'bit-integrations')}
              </option>
              <option value="open">{__('Open', 'bit-integrations')}</option>
              <option value="closed">{__('Closed', 'bit-integrations')}</option>
            </select>

            <div className="mt-3">
              <b>
                <ProFeatureTitle title={__('Add Post Tags', 'bit-integrations')} />
              </b>

              <Cooltip width={250} icnSize={17} className="ml-2">
                <div className="txt-body">
                  {__(
                    'Use commas to separate multiple tags. Example: tag1, tag2, tag3',
                    'bit-integrations'
                  )}
                  <br />
                </div>
              </Cooltip>
            </div>

            <input
              className="btcd-paper-inp w-5 mt-2 "
              onChange={e => handleInput(e.target.name, e.target.value)}
              name="post_tags"
              value={postConf.post_tags}
              type="text"
              placeholder={__('Add Post Tags...', 'bit-integrations')}
              disabled={!isPro}
            />
          </>
        )}

        <div>
          <div className="mt-3 mb-1">
            <b>{__('Post Field Mapping', 'bit-integrations')}</b>
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

        {postConf?.post_map?.map((itm, i) => (
          <FieldMap
            key={`analytics-m-${i + 9}`}
            i={i}
            type="post"
            field={itm}
            formFields={formFields}
            postConf={postConf}
            setPostConf={setPostConf}
            customFields={selectedPostFields}
          />
        ))}

        <div className="txt-center btcbi-field-map-button mt-2">
          <button
            onClick={() =>
              addFieldMap('post_map', postConf?.post_map?.length || 0, postConf, setPostConf)
            }
            className="icn-btn sh-sm"
            type="button">
            +
          </button>
        </div>
      </div>

      {isLegacyAction && (
        <div>
          <CustomField
            formFields={formFields}
            postConf={postConf}
            setPostConf={setPostConf}
            acfFields={acf}
            mbFields={mb}
            jeCPTFields={jeCPTMeta}
          />
        </div>
      )}

      <IntegrationStepThree
        edit
        saveConfig={saveConfig}
        isLoading={isLoading}
        dataConf={postConf}
        setDataConf={setPostConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Post
