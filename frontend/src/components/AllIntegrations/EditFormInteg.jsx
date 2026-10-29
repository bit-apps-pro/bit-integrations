import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { $formFields, $newFlow } from '../../GlobalStates'
import bitsFetch from '../../Utils/bitsFetch'
import { __ } from '../../Utils/i18nwrap'
import { deepCopy } from '../../Utils/Helpers'
import getAllType from '../Triggers/TriggerHelpers/AffiliateHelper/AffiliateCommonFunction'
import {
  getBuddybossForum,
  getBuddybossGroup,
  getBuddybossTopicByForum
} from '../Triggers/TriggerHelpers/BuddybossHelper/BuddybossCommonFunction'
import {
  getAllEDDDiscountCode,
  getAllEDDProduct
} from '../Triggers/TriggerHelpers/EDDHelper/EDDCommonFunction.js.js'
import {
  getFluentCrmLists,
  getFluentCrmStatus,
  getFluentCrmTags
} from '../Triggers/TriggerHelpers/FluentCrmHelper/FluentCrmCommonFunction'
import {
  getAllAchievementType,
  getAllRankType
} from '../Triggers/TriggerHelpers/GamiPressHelper/GamiPressCommonFunction'
import getAllDonationForms, {
  getAllRecurringDonationForms
} from '../Triggers/TriggerHelpers/GiveWpHelper/GiveWpCommonFunction'
import { getAllPostTypeJetEngine } from '../Triggers/TriggerHelpers/JetEngineHelper/JetEngineCommonFunction'
import {
  getAllCourses,
  getAllGroups,
  getAllQuizes
} from '../Triggers/TriggerHelpers/LearndashHelper/LearnDashCommonFunction'
import {
  getAllLifterLmsQuiz,
  getAllLifterLmsLesson,
  getAllLifterLmsCourse,
  getAllLifterLmsMembership
} from '../Triggers/TriggerHelpers/LifterLmsHelper/LifterLmsCommonFunction.js'
import {
  getAllMembership,
  getAllOneTimeMembership,
  getAllRecurringMembership
} from '../Triggers/TriggerHelpers/MemberpressHelper/MemberpressCommonFunction'
import getAllPaidMembershipProLevel from '../Triggers/TriggerHelpers/PaidMembershipProHelper/PaidMembershipProCommonFunction'
import {
  getAllPostPosts,
  getAllPostType
} from '../Triggers/TriggerHelpers/PostHelper/PostCommonFunction'
import getAllLevels from '../Triggers/TriggerHelpers/RestrictContentHelper/RestrictContentCommonFunction'
import getAllCommissionType from '../Triggers/TriggerHelpers/SliceWpHelper/SliceWpCommonFunction'
import getSureCartAllProduct from '../Triggers/TriggerHelpers/SureCartHelper/SureCartCommonFunction'
import {
  getAllOrderStatus,
  getAllWCProductCategory,
  getAllWCProducts
} from '../Triggers/TriggerHelpers/WooCommerceHelper/WooCommerceCommonFunction'
import TriggerMultiOption from '../Triggers/TriggerMultiOption'
import {
  getAllMasterStudyLmsCourse,
  getAllMasterStudyLmsDistribution,
  getAllMasterStudyLmsLesson
} from '../Triggers/TriggerHelpers/MasterStudyLmsHelper/MasterStudyLmsCommonFunction.js'
import {
  getAllThriveApprenticeCourse,
  getAllThriveApprenticeLesson,
  getAllThriveApprenticeModule
} from '../Triggers/TriggerHelpers/ThriveApprenticeHelper/ThriveApprenticeCommonFunction'
import { getAllUMrole } from '../Triggers/TriggerHelpers/UltimateMemberHelper/UltimatedMemberCommonFunction'
import { getAllGroundhoggTags } from '../Triggers/TriggerHelpers/GroundhoggHelper/GroundhoggCommonFunction'
import { create } from 'mutative'
import { getFluentBookingEvents } from '../Triggers/TriggerHelpers/FluentBookingHelper/FluentBookingCommonFunction.js'
import { getSureMembersGroups } from '../Triggers/TriggerHelpers/SureMembersHelper/SureMembersCommonFunction.js'
import {
  getWPForoForums,
  getWPForoTopics,
  getWPForoUsers
} from '../Triggers/TriggerHelpers/WPForoHelper/WPForoCommonFunction.js'
import {
  getApplicationStatuses,
  getWPJobManagerJobs,
  getWPJobManagerJobTypes
} from '../Triggers/TriggerHelpers/WPJobManager/WPJobManagerCommonFunction.js'
import {
  getWCSubscriptionsAllSubscriptionProducts,
  getWCSubscriptionsAllSubscriptions
} from '../Triggers/TriggerHelpers/WCSubscriptions/WCSubscriptionsCommonFunction.js'
import {
  EVENTS_CALENDAR_EVENT_FILTER_TASKS,
  EVENTS_CALENDAR_SERIES_FILTER_TASKS,
  getEventsCalendarEvents,
  getEventsCalendarSeries
} from '../Triggers/TriggerHelpers/EventsCalendar/EventsCalendarCommonFunction.js'
import { getVoxelPostTypes } from '../Triggers/TriggerHelpers/Voxel/voxelCommonFunction.js'

function EditFormInteg({ setSnackbar, className = '' }) {
  const [forms, setForms] = useState([])
  const [formPost, setFormPost] = useState([])
  const [flow, setFlow] = useRecoilState($newFlow)
  const setFormFields = useSetRecoilState($formFields)
  const setFlowData = (val, type) => {
    setFlow(prevFlow =>
      create(prevFlow, draftFlow => {
        draftFlow.flow_details[type] = val
      })
    )
  }

  const isPageBuilderTrigger = ['PiotnetAddon', 'CartFlow'].includes(flow.triggered_entity)

  const fetchFormFields = (id, postId) =>
    bitsFetch(
      isPageBuilderTrigger ? { id, postId } : { id },
      `${flow.triggered_entity.toLowerCase()}/get/form`
    )

  const handle = e => {
    const tmpInteg = { ...flow }
    const { name, value } = e.target
    tmpInteg[name] = value
    setFlow(tmpInteg)
    if (!isPageBuilderTrigger) {
      baseDataLoad(flow.triggered_entity, tmpInteg)
    }

    if (flow.triggered_entity !== 'FluentBooking') {
      const loadFormFields = fetchFormFields(
        value,
        formPost[value] ?? flow.flow_details.postId
      ).then(res => {
        if (res.success) {
          setFormFields(res.data.fields)
          setFlow(prevFlow =>
            create(prevFlow, draftFlow => {
              draftFlow.flow_details.fields = res.data.fields
            })
          )
        }
        return res.data
      })
      toast.promise(loadFormFields, {
        success: __('Form fields Refresh successfully', 'bit-integrations'),
        error: __('Error Occurred', 'bit-integrations'),
        loading: __('Loading Form Fields...')
      })
    }
  }

  const baseDataLoad = (trigger, data) => {
    if (trigger === 'LearnDash') {
      if (
        data.triggered_entity_id === '1' ||
        data.triggered_entity_id === '2' ||
        data.triggered_entity_id === '3' ||
        data.triggered_entity_id === '4' ||
        data.triggered_entity_id === '5' ||
        data.triggered_entity_id === '11'
      ) {
        getAllCourses(data, setFlow)
      } else if (
        data.triggered_entity_id === '6' ||
        data.triggered_entity_id === '7' ||
        data.triggered_entity_id === '8'
      ) {
        getAllQuizes(data, setFlow)
      } else if (data.triggered_entity_id === '9' || data.triggered_entity_id === '10') {
        getAllGroups(data, setFlow)
      }
    }
    if (trigger === 'RestrictContent') {
      getAllLevels(data, setFlow)
    }

    if (trigger === 'BuddyBoss') {
      if (
        data.triggered_entity_id === '9' ||
        data.triggered_entity_id === '10' ||
        data.triggered_entity_id === '11' ||
        data.triggered_entity_id === '12' ||
        data.triggered_entity_id === '13'
      ) {
        getBuddybossGroup(data, setFlow)
      }
      if (data.triggered_entity_id === '3' || data.triggered_entity_id === '4') {
        getBuddybossForum(data, setFlow)
      }
    }
    if (trigger === 'Affiliate') {
      if (
        data.triggered_entity_id === '3' ||
        data.triggered_entity_id === '4' ||
        data.triggered_entity_id === '5'
      ) {
        getAllType(data, setFlow)
      }
    }
    if (trigger === 'WC') {
      if (['10', '19'].includes(data.triggered_entity_id)) {
        getAllWCProducts(data, setFlow)
      }
      if (['11'].includes(data.triggered_entity_id)) {
        getAllOrderStatus(data, setFlow)
      }
      if (['17'].includes(data.triggered_entity_id)) {
        getAllWCProductCategory(data, setFlow)
      }
    }
    if (trigger === 'Post') {
      if ([1, 2, 3, 6].includes(Number(data.triggered_entity_id))) {
        getAllPostType(data, setFlow)
      }
      if ([4, 5, 7, 8, 9].includes(Number(data.triggered_entity_id))) {
        getAllPostPosts(data, setFlow)
      }
    }
    if (trigger === 'FluentCrm') {
      if (data.triggered_entity_id === 'fluentcrm-1' || data.triggered_entity_id === 'fluentcrm-2') {
        getFluentCrmTags(data, setFlow)
      } else if (
        data.triggered_entity_id === 'fluentcrm-3' ||
        data.triggered_entity_id === 'fluentcrm-4'
      ) {
        getFluentCrmLists(data, setFlow)
      } else if (data.triggered_entity_id === 'fluentcrm-5') {
        getFluentCrmStatus(data, setFlow)
      }
    }
    if (trigger === 'GamiPress') {
      if ([1].includes(Number(data.triggered_entity_id))) {
        getAllRankType(data, setFlow)
      }
      if ([2, 3, 5].includes(Number(data.triggered_entity_id))) {
        getAllAchievementType(data, setFlow)
      }
    }
    if (trigger === 'JetEngine') {
      if ([1, 2].includes(Number(data.triggered_entity_id))) {
        getAllPostTypeJetEngine(data, setFlow)
      }
    }
    if (trigger === 'Memberpress') {
      if ([3, 4].includes(Number(data.triggered_entity_id))) {
        getAllMembership(data, setFlow)
      }
      if ([1].includes(Number(data.triggered_entity_id))) {
        getAllOneTimeMembership(data, setFlow)
      }
      if ([2, 5].includes(Number(data.triggered_entity_id))) {
        getAllRecurringMembership(data, setFlow)
      }
    }
    if (trigger === 'PaidMembershipPro') {
      getAllPaidMembershipProLevel(data, setFlow)
    }
    if (trigger === 'SliceWp') {
      if ([2].includes(Number(data.triggered_entity_id))) {
        getAllCommissionType(data, setFlow)
      }
    }
    if (trigger === 'SureCart') {
      if ([1, 2, 3].includes(Number(data.triggered_entity_id))) {
        getSureCartAllProduct(data, setFlow)
      }
    }
    if (trigger === 'GiveWp') {
      if ([1].includes(Number(data.triggered_entity_id))) {
        getAllDonationForms(data, setFlow)
      }
      if ([2].includes(Number(data.triggered_entity_id))) {
        getAllRecurringDonationForms(data, setFlow)
      }
    }
    if (trigger === 'LifterLms') {
      if ([1, 2, 3].includes(Number(data.triggered_entity_id))) {
        getAllLifterLmsQuiz(data, setFlow)
      } else if ([4].includes(Number(data.triggered_entity_id))) {
        getAllLifterLmsLesson(data, setFlow)
      } else if ([5, 6, 7].includes(Number(data.triggered_entity_id))) {
        getAllLifterLmsCourse(data, setFlow)
      } else if ([8].includes(Number(data.triggered_entity_id))) {
        getAllLifterLmsMembership(data, setFlow)
      }
    }
    if (trigger === 'EDD') {
      if ([1].includes(Number(data.triggered_entity_id))) {
        getAllEDDProduct(data, setFlow)
      } else if ([2].includes(Number(data.triggered_entity_id))) {
        getAllEDDDiscountCode(data, setFlow)
      }
    }
    if (trigger === 'MasterStudyLms') {
      if ([1, 3, 4, 5].includes(Number(data.triggered_entity_id))) {
        getAllMasterStudyLmsCourse(data, setFlow)
      } else if ([2].includes(Number(data.triggered_entity_id))) {
        getAllMasterStudyLmsLesson(data, setFlow)
      } else if ([6].includes(Number(data.triggered_entity_id))) {
        getAllMasterStudyLmsDistribution(data, setFlow)
      }
    }
    if (trigger === 'Groundhogg') {
      if ([2, 3].includes(Number(data.triggered_entity_id))) {
        getAllGroundhoggTags(data, setFlow)
      }
    }
    if (trigger === 'ThriveApprentice') {
      if ([1].includes(Number(data.triggered_entity_id))) {
        getAllThriveApprenticeCourse(data, setFlow)
      } else if ([2].includes(Number(data.triggered_entity_id))) {
        getAllThriveApprenticeLesson(data, setFlow)
      } else if ([3].includes(Number(data.triggered_entity_id))) {
        getAllThriveApprenticeModule(data, setFlow)
      }
    }
    if (trigger === 'UltimateMember') {
      if (data.triggered_entity_id == 'roleSpecificChange') {
        getAllUMrole(data, setFlow)
      }
    }
    if (trigger === 'FluentBooking') {
      getFluentBookingEvents(data, setFlow)
    }
    if (trigger === 'SureMembers') {
      getSureMembersGroups(data, setFlow)
    }
    if (trigger === 'WPForo') {
      if (data.triggered_entity_id === 'wpforo-1') {
        getWPForoForums(data, setFlow)
      }
      if (
        data.triggered_entity_id === 'wpforo-2' ||
        data.triggered_entity_id === 'wpforo-3' ||
        data.triggered_entity_id === 'wpforo-4' ||
        data.triggered_entity_id === 'wpforo-5' ||
        data.triggered_entity_id === 'wpforo-6' ||
        data.triggered_entity_id === 'wpforo-11'
      ) {
        getWPForoTopics(data, setFlow)
      }
      if (
        data.triggered_entity_id === 'wpforo-7' ||
        data.triggered_entity_id === 'wpforo-8' ||
        data.triggered_entity_id === 'wpforo-9' ||
        data.triggered_entity_id === 'wpforo-10' ||
        data.triggered_entity_id === 'wpforo-12'
      ) {
        getWPForoUsers(data, setFlow)
      }
    }

    if (trigger === 'WPJobManager') {
      if (
        data.triggered_entity_id === 'wp_job_manager-1' ||
        data.triggered_entity_id === 'wp_job_manager-4' ||
        data.triggered_entity_id === 'wp_job_manager-5' ||
        data.triggered_entity_id === 'wp_job_manager-8' ||
        data.triggered_entity_id === 'wp_job_manager-10'
      ) {
        getWPJobManagerJobTypes(data, setFlow)
      }
      if (
        data.triggered_entity_id === 'wp_job_manager-2' ||
        data.triggered_entity_id === 'wp_job_manager-3' ||
        data.triggered_entity_id === 'wp_job_manager-6' ||
        data.triggered_entity_id === 'wp_job_manager-7' ||
        data.triggered_entity_id === 'wp_job_manager-11'
      ) {
        getWPJobManagerJobs(data, setFlow)
      }
      if (data.triggered_entity_id === 'wp_job_manager-9') {
        getApplicationStatuses(data, setFlow)
      }
    }

    if (trigger === 'WCSubscriptions') {
      if (
        ['user_subscribes_to_product', 'user_purchases_variable_subscription'].includes(
          data.triggered_entity_id
        )
      ) {
        getWCSubscriptionsAllSubscriptionProducts(data, setFlow)
      } else {
        getWCSubscriptionsAllSubscriptions(data, setFlow)
        getWCSubscriptionsAllSubscriptionProducts(data, setFlow)
      }
    }

    if (trigger === 'EventsCalendar') {
      if (EVENTS_CALENDAR_EVENT_FILTER_TASKS.includes(data.triggered_entity_id)) {
        getEventsCalendarEvents(data, setFlow)
      }

      if (EVENTS_CALENDAR_SERIES_FILTER_TASKS.includes(data.triggered_entity_id)) {
        getEventsCalendarSeries(data, setFlow)
      }
    }

    if (trigger === 'Voxel') {
      if (
        data.triggered_entity_id === 'voxel-7' ||
        data.triggered_entity_id === 'voxel-8' ||
        data.triggered_entity_id === 'voxel-9' ||
        data.triggered_entity_id === 'voxel-10' ||
        data.triggered_entity_id === 'voxel-11' ||
        data.triggered_entity_id === 'voxel-20'
      ) {
        getVoxelPostTypes(data, setFlow)
      }
    }
  }

  useEffect(() => {
    bitsFetch({}, `${flow.triggered_entity.toLowerCase()}/get`, null, 'GET').then(res => {
      if (res.success) {
        setForms(res.data)
        const tmpFormPost = {}
        res.data?.map(form => {
          tmpFormPost[form.id] = form.post_id
        })
        setFormPost(tmpFormPost)
      }
    })
  }, [])

  useEffect(() => {
    if (
      flow.fields?.length ||
      !flow.triggered_entity_id ||
      flow.triggered_entity === 'FluentBooking'
    ) {
      return
    }

    fetchFormFields(flow.triggered_entity_id, flow.flow_details?.postId).then(res => {
      if (res?.success) {
        setFormFields(res.data.fields)
      }
    })
  }, [])

  return (
    <>
      <div className={`${className || 'flx'}`}>
        <b className="wdt-200 d-in-b">{__('Form/Task Name:', 'bit-integrations')}</b>
        <select
          name="triggered_entity_id"
          value={flow.triggered_entity_id}
          onChange={handle}
          className={`btcd-paper-inp w-5 ${className}`}>
          <option value="">{__('Select Form', 'bit-integrations')}</option>
          {forms?.map(form => (
            <option key={form.id} value={form.id}>
              {form.title}
            </option>
          ))}
        </select>
      </div>
      <TriggerMultiOption flow={flow} setFlowData={setFlowData} edit={true} />
    </>
  )
}

export default EditFormInteg
