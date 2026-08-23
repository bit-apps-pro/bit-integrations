import { useEffect, useState } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useNavigate, useParams } from 'react-router'
import { useRecoilValue } from 'recoil'
import BackIcn from '../../../Icons/BackIcn'
import { __ } from '../../../Utils/i18nwrap'
import SnackMsg from '../../Utilities/SnackMsg'
import Steps from '../../Utilities/Steps'
import { saveActionConf } from '../IntegrationHelpers/IntegrationHelpers'
import IntegrationStepThree from '../IntegrationHelpers/IntegrationStepThree'
import { handleInput, checkMappedFields } from './BuddyBossCommonFunc'
import BuddyBossAuthorization from './BuddyBossAuthorization'
import BuddyBossIntegLayout from './BuddyBossIntegLayout'
import {
  ADD_POST_GRP_ACTIVITY_STREAM_PRO,
  ADD_POST_SITE_WIDE_ACTIVITY_STREAM_PRO,
  ADD_POST_USER_ACTIVITY_STREAM_PRO,
  ADD_USER_GROUP,
  CREATE_GROUP_PRO,
  END_FRIENDSHIP_WITH_USER_PRO,
  FOLLOW_USER_PRO,
  isDisabled,
  POST_REPLY_TOPIC_FORUM_PRO,
  POST_TOPIC_FORUM_PRO,
  REMOVE_USER_FROM_GROUP_PRO,
  SEND_FRIENDSHIP_REQ_USER_PRO,
  SEND_NOTIFICATION_MEMBER_GRP_PRO,
  SEND_NOTIFICATION_USER_PRO,
  SEND_PRIVATE_MSG_MEMBER_GRP_PRO,
  SEND_PRIVATE_MSG_USER_PRO,
  SET_USER_STATUS_PRO,
  STOP_FOLLOWING_USER_PRO,
  SUBSCRIBE_USER_FORUM_PRO
} from './IntegrationHelpers'

function BuddyBoss({ formFields, setFlow, flow, allIntegURL, isInfo, edit }) {
  const navigate = useNavigate()
  const { formID } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [snack, setSnackbar] = useState({ show: false })
  const [buddyBossConf, setBuddyBossConf] = useState({
    name: 'BuddyBoss',
    type: 'BuddyBoss',
    mainAction: '',
    field_map: [{ formField: '', buddyBossFormField: '' }],
    allActions,
    groupPrivacyOptions,
    userStatusOptions,
    createGroupFields,
    topicInForumFields,
    sendAllUserNotificationFields,
    sendAllGroupPrivateMessageFields,
    addPostToGroupFields,
    addPostSiteWideActivityStreamFields,
    postReplyTopicForumFields,
    actions: {}
  })
  const nextPage = () => {
    setTimeout(() => {
      document.getElementById('btcd-settings-wrp').scrollTop = 0
    }, 300)
    if (!checkMappedFields(buddyBossConf)) {
      setSnackbar({ show: true, msg: __('Please map fields to continue.', 'bit-integrations') })
      return
    }
    if (buddyBossConf.mainAction !== '') {
      setStep(3)
    }
  }

  return (
    <div>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="txt-center mt-2">
        <Steps step={3} active={step} />
      </div>

      <BuddyBossAuthorization
        formID={formID}
        buddyBossConf={buddyBossConf}
        setBuddyBossConf={setBuddyBossConf}
        step={step}
        setStep={setStep}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />

      <div
        className="btcd-stp-page"
        style={{ ...(step === 2 && { width: 900, height: 'auto', overflow: 'visible' }) }}>
        <BuddyBossIntegLayout
          formFields={formFields}
          handleInput={e =>
            handleInput(e, buddyBossConf, setBuddyBossConf, setIsLoading, setSnackbar, formID)
          }
          buddyBossConf={buddyBossConf}
          setBuddyBossConf={setBuddyBossConf}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setSnackbar={setSnackbar}
          allIntegURL={allIntegURL}
          isInfo={isInfo}
          edit={edit}
        />

        <button
          onClick={() => nextPage(3)}
          disabled={
            !buddyBossConf.mainAction ||
            !checkMappedFields(buddyBossConf) ||
            isLoading ||
            isDisabled(buddyBossConf)
          }
          className="btn f-right btcd-btn-lg purple sh-sm flx"
          type="button">
          {__('Next', 'bit-integrations')}
          &nbsp;
          <div className="btcd-icn icn-arrow_back rev-icn d-in-b" />
        </button>
      </div>

      <IntegrationStepThree
        step={step}
        saveConfig={() =>
          saveActionConf({
            flow,
            setFlow,
            allIntegURL,
            navigate,
            conf: buddyBossConf,
            setIsLoading,
            setSnackbar
          })
        }
        isLoading={isLoading}
        dataConf={buddyBossConf}
        setDataConf={setBuddyBossConf}
        formFields={formFields}
      />
    </div>
  )
}

export default BuddyBoss

const allActions = [
  { key: CREATE_GROUP_PRO, label: __('Create Group Pro', 'bit-integrations') },
  { key: ADD_USER_GROUP, label: __('Add the user to a group', 'bit-integrations') },
  {
    key: END_FRIENDSHIP_WITH_USER_PRO,
    label: __('End friendship with a user Pro', 'bit-integrations')
  },
  { key: FOLLOW_USER_PRO, label: __('Follow a user Pro', 'bit-integrations') },
  { key: POST_TOPIC_FORUM_PRO, label: __('Post a topic in a forum Pro', 'bit-integrations') },
  { key: REMOVE_USER_FROM_GROUP_PRO, label: __('Remove user from a group Pro', 'bit-integrations') },
  {
    key: SEND_FRIENDSHIP_REQ_USER_PRO,
    label: __('Send a friendship request to a user Pro', 'bit-integrations')
  },
  {
    key: SEND_NOTIFICATION_MEMBER_GRP_PRO,
    label: __('Send a notification to all members of a group Pro', 'bit-integrations')
  },
  {
    key: SEND_PRIVATE_MSG_MEMBER_GRP_PRO,
    label: __('Send a private message to all members of a group Pro', 'bit-integrations')
  },
  {
    key: SEND_PRIVATE_MSG_USER_PRO,
    label: __('Send a private message to a user Pro', 'bit-integrations')
  },
  {
    key: SEND_NOTIFICATION_USER_PRO,
    label: __('Send a notification to a user Pro', 'bit-integrations')
  },
  { key: STOP_FOLLOWING_USER_PRO, label: __('Stop following a user Pro', 'bit-integrations') },
  {
    key: SUBSCRIBE_USER_FORUM_PRO,
    label: __('Subscribe the user to a forum Pro', 'bit-integrations')
  },
  {
    key: ADD_POST_GRP_ACTIVITY_STREAM_PRO,
    label: __('Add a post to the activity stream of a group Pro', 'bit-integrations')
  },
  {
    key: ADD_POST_SITE_WIDE_ACTIVITY_STREAM_PRO,
    label: __('Add a post to the site wide activity stream Pro', 'bit-integrations')
  },
  {
    key: ADD_POST_USER_ACTIVITY_STREAM_PRO,
    label: __("Add a post to the user's activity stream Pro", 'bit-integrations')
  },
  {
    key: POST_REPLY_TOPIC_FORUM_PRO,
    label: __('Post a reply to a topic in a forum', 'bit-integrations')
  },
  {
    key: SET_USER_STATUS_PRO,
    label: __("Set the user's status to a specific status", 'bit-integrations')
  }
]

const createGroupFields = [
  { key: 'group_name', label: __('Group Name', 'bit-integrations'), required: true }
]

const topicInForumFields = [
  { key: 'topic_content', label: __('Topic Content', 'bit-integrations'), required: true },
  { key: 'topic_title', label: __('Topic Title', 'bit-integrations'), required: false }
]

const sendAllUserNotificationFields = [
  {
    key: 'notification_content',
    label: __('Notification Content', 'bit-integrations'),
    required: true
  },
  {
    key: 'notification_link',
    label: __('Notification Link', 'bit-integrations'),
    required: false
  }
]

const sendAllGroupPrivateMessageFields = [
  { key: 'message_content', label: __('Message Content', 'bit-integrations'), required: true },
  { key: 'message_subject', label: __('Message subject', 'bit-integrations'), required: false }
]

const addPostToGroupFields = [
  { key: 'activity_action', label: __('activity_action', 'bit-integrations'), required: true },
  { key: 'activity_content', label: __('activity_content', 'bit-integrations'), required: true }
]

const addPostSiteWideActivityStreamFields = [
  { key: 'activity_action', label: __('activity_action', 'bit-integrations'), required: false },
  {
    key: 'activity_action_link',
    label: __('activity_action_link', 'bit-integrations'),
    required: false
  },
  { key: 'activity_content', label: __('activity_content', 'bit-integrations'), required: true }
]

const postReplyTopicForumFields = [
  { key: 'reply_content', label: __('Reply Content', 'bit-integrations'), required: true }
]

const groupPrivacyOptions = [
  { key: '1', label: __('Public', 'bit-integrations') },
  { key: '2', label: __('Private', 'bit-integrations') },
  { key: '3', label: __('Hidden', 'bit-integrations') }
]

const userStatusOptions = [
  { key: '1', label: __('Active', 'bit-integrations') },
  { key: '2', label: __('Suspend', 'bit-integrations') }
]
