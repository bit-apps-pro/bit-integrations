import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { __ } from '../../../Utils/i18nwrap'
import Cooltip from '../../Utilities/Cooltip'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import CustomField from './CustomField'
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
import FieldMap from './FieldMap'
import bitsFetch from '../../../Utils/bitsFetch'
import { saveIntegConfig } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import TutorialLink from '../../Utilities/TutorialLink'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { ProFeatureTitle } from '../IntegrationHelpers/ActionProFeatureLabels'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'

function Post({ formFields, setFlow, flow, allIntegURL }) {
  const [users, setUsers] = useState([])
  const [postTypes, setPostTypes] = useState([])
  const [postCategories, setPostCategories] = useState([])
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setstep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [acf, setAcf] = useState({ fields: [], files: [] })
  const [mb, setMb] = useState({ fields: [], files: [] })
  const [jeCPTMeta, setJeCPTMeta] = useState({ fields: [], files: [] })
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const [postConf, setPostConf] = useState({
    name: 'WP Post Creation',
    type: 'WP Post Creation',
    action_type: 'createNewPost',
    post_map: generatePostCreationFieldMap('createNewPost'),
    acf_map: [{}],
    acf_file_map: [{}],
    metabox_map: [{}],
    metabox_file_map: [{}],
    je_cpt_meta_map: [{}],
    je_cpt_file_map: [{}],
    post_categories: ''
  })

  const handleInput = (typ, val) => {
    const tmpData = { ...postConf }
    tmpData[typ] = val
    setPostConf(tmpData)
  }

  useEffect(() => {
    bitsFetch({}, 'user/list').then(res => {
      const { data } = res
      setUsers(data)
    })

    bitsFetch({}, 'post-types/list').then(res => {
      const { data } = res
      setPostTypes(data)
    })

    const newConf = { ...postConf }
    if (!newConf.action_type) {
      newConf.action_type = 'createNewPost'
    }
    if (!newConf?.post_map?.[0]?.postField) {
      newConf.post_map = generatePostCreationFieldMap(newConf.action_type)
    }
    setPostConf(newConf)
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
    setstep(1)
  }

  const isLegacyAction = isLegacyPostCreationAction(postConf?.action_type)
  const selectedPostFields = getPostCreationFieldsByAction(postConf?.action_type || 'createNewPost')

  const nextPage = stepNo => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)

    if (!checkMappedPostFields(postConf)) {
      setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
      return
    }

    if (isLegacyAction && !postConf.post_type) {
      setSnackbar({ show: true, msg: __("Post Type can't be empty", 'bit-integrations') })
      return
    }
    if (isLegacyAction && !postConf.post_status) {
      setSnackbar({ show: true, msg: __("Post Status can't be empty", 'bit-integrations') })
      return
    }

    if (isLegacyAction && stepNo === 3) {
      if (!checkMappedAcfFields(postConf)) {
        setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
        return
      }

      if (!checkMappedMbFields(postConf)) {
        setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
        return
      }

      if (!checkMappedJEFields(postConf)) {
        setSnackbar({ show: true, msg: __('Please map mandatory fields', 'bit-integrations') })
        return
      }
    }
    setstep(stepNo)
  }

  const saveConfig = () => {
    setIsLoading(true)
    const resp = saveIntegConfig(flow, setFlow, allIntegURL, postConf, navigate, '', '', setIsLoading)
    resp.then(res => {
      if (res.success) {
        setSnackbar({ show: true, msg: res.data?.msg })
        navigate(allIntegURL)
      } else {
        setSnackbar({ show: true, msg: res.data || res })
      }
    })
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <TutorialLink linkKey="postCreation" />

      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>
      <div
        className="btcd-stp-page"
        style={{ ...{ width: step === 1 && 900 }, ...{ height: step === 1 && 'auto' } }}>
        <div className="mt-3">
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

        <div className="mt-3">
          <b>{__('Action Type', 'bit-integrations')}</b>
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
                key={`post-categories-${postConf?.post_type || 'default'}-${postConf?.post_categories || ''}`}
                className="mt-2 w-5"
                defaultValue={postConf?.post_categories || ''}
                options={postCategories}
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

        <button
          onClick={() => nextPage(isLegacyAction ? 2 : 3)}
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      {isLegacyAction && (
        <div
          className="btcd-stp-page"
          style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
          <CustomField
            formFields={formFields}
            postConf={postConf}
            setPostConf={setPostConf}
            acfFields={acf}
            mbFields={mb}
            jeCPTFields={jeCPTMeta}
          />

          <button
            onClick={() => nextPage(3)}
            className="btn f-right btcd-btn-lg purple sh-sm flx"
            type="button">
            {__('Next', 'bit-integrations')}
            <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
          </button>
        </div>
      )}

      <IntegrationStepThree
        step={step}
        saveConfig={() => saveConfig()}
        isLoading={isLoading}
        dataConf={postConf}
        setDataConf={setPostConf}
        formFields={formFields}
      />
    </div>
  )
}

export default Post
