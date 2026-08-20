/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */

// suffix IH = call from IntegrationHelpers
// suffix FP = call from FormPlugin

export const FormPluginStateHelper = (val, tmpNewFlow, resp, setNewFlow) => {
  if (tmpNewFlow?.triggered_entity === 'TutorLms') {
    tutorlmsStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'WC') {
    WooCommerceStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'LearnDash') {
    learndashStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'GamiPress') {
    GamiPressStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'WPCourseware') {
    wpCoursewareStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'FluentCrm') {
    fluentCrmStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'Post') {
    postStateFP(Number(val), tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'JetEngine') {
    JetEngineStateFP(Number(val), tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'Groundhogg') {
    groundhoggStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'RestrictContent') {
    RestrictContentStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'BuddyBoss') {
    buddybossStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'Affiliate') {
    AffiliateStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'Memberpress') {
    MemberpressStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'PaidMembershipPro') {
    PaidMembershipProStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'SliceWp') {
    SliceWpStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'SureCart') {
    SureCartStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'GiveWp') {
    GiveWpStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'LifterLms') {
    LifterLmsStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'MasterStudyLms') {
    MasterStudyLmsStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'ThriveApprentice') {
    ThriveApprenticeStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'EDD') {
    EDDStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'UltimateMember') {
    UltimateMemberStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'AcademyLms') {
    academylmsStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'FluentBooking') {
    fluentBookingStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'SureMembers') {
    SureMembersStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'WPForo') {
    wpForoStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'WPJobManager') {
    wpJobManagerStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'EventsCalendar') {
    eventsCalendarStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'Voxel') {
    voxelStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else if (tmpNewFlow?.triggered_entity === 'WCSubscriptions') {
    WCSubscriptionsStateFP(val, tmpNewFlow, resp, setNewFlow)
  } else {
    setNewFlow(tmpNewFlow)
  }
}

const fluentCrmStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val === 'fluentcrm-1' || val === 'fluentcrm-2') {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      tags: resp.data.tags,
      selectedTag: 'any'
    }
  } else if (val === 'fluentcrm-3' || val === 'fluentcrm-4') {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      lists: resp.data.lists,
      selectedList: 'any'
    }
  } else if (val === 'fluentcrm-5') {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      status: resp.data.status,
      selectedStatus: 'any'
    }
  }
  setNewFlow(tmpNewFlow)
}

const tutorlmsStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val === '2') {
    tmpNewFlow.triggerData.quizzes = resp.data.quizzes
  } else if (val === '3') {
    tmpNewFlow.triggerData.lessons = resp.data.lessons
  } else if (val === '4' || val === '1') {
    tmpNewFlow.triggerData.courses = resp.data.courses
  } else if (val === '5') {
    tmpNewFlow.triggerData.quizzes = resp.data.quizzes
    tmpNewFlow.triggerData.percentageCondition = resp.data.percentageCondition
  }
  setNewFlow(tmpNewFlow)
}

const fluentBookingStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val) {
    tmpNewFlow.triggerData.events = resp.data.events
  }
  setNewFlow(tmpNewFlow)
}

const SureMembersStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val) {
    tmpNewFlow.triggerData.groups = resp.data.groups
  }
  setNewFlow(tmpNewFlow)
}

const wpForoStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val === 'wpforo-1') {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      forums: resp.data.forums,
      selectedForum: 'any'
    }
  }

  if (
    val === 'wpforo-2' ||
    val === 'wpforo-3' ||
    val === 'wpforo-4' ||
    val === 'wpforo-5' ||
    val === 'wpforo-6' ||
    val === 'wpforo-11'
  ) {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      topics: resp.data.topics,
      selectedTopic: 'any'
    }
  }

  if (
    val === 'wpforo-7' ||
    val === 'wpforo-8' ||
    val === 'wpforo-9' ||
    val === 'wpforo-10' ||
    val === 'wpforo-12'
  ) {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      users: resp.data.users,
      selectedUser: 'any'
    }
  }

  setNewFlow(tmpNewFlow)
}

const wpJobManagerStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (
    val === 'wp_job_manager-1' ||
    val === 'wp_job_manager-4' ||
    val === 'wp_job_manager-5' ||
    val === 'wp_job_manager-8'
  ) {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      jobTypes: resp.data.jobTypes,
      selectedJobType: 'any'
    }
  }
  if (
    val === 'wp_job_manager-2' ||
    val === 'wp_job_manager-3' ||
    val === 'wp_job_manager-6' ||
    val === 'wp_job_manager-7' ||
    val === 'wp_job_manager-11'
  ) {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      jobList: resp.data.jobList,
      selectedJob: 'any'
    }
  }
  if (val === 'wp_job_manager-9') {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      statusList: resp.data.statusList,
      selectedStatus: 'any'
    }
  }

  if (val === 'wp_job_manager-10') {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      jobTypes: resp.data.jobTypes,
      selectedJobType: 'any',
      statusList: resp.data.statusList,
      selectedStatus: 'any'
    }
  }

  setNewFlow(tmpNewFlow)
}

const eventsCalendarStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (
    val === 'events_calendar-1' ||
    val === 'events_calendar-2' ||
    val === 'events_calendar-3' ||
    val === 'events_calendar-4'
  ) {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      events: resp.data.events,
      selectedEvent: 'any'
    }
  }

  setNewFlow(tmpNewFlow)
}

const voxelStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (
    val === 'voxel-7' ||
    val === 'voxel-8' ||
    val === 'voxel-9' ||
    val === 'voxel-10' ||
    val === 'voxel-11' ||
    val === 'voxel-20'
  ) {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      postTypes: resp.data.postTypes,
      selectedPostType: ''
    }
  }

  setNewFlow(tmpNewFlow)
}

const WCSubscriptionsStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (['user_subscribes_to_product', 'user_purchases_variable_subscription'].includes(val)) {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      allSubscriptionProducts: resp.data.allSubscriptionProducts,
      selectedProduct: 'any'
    }
  } else if (val === 'user_subscription_status_updated') {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      allSubscriptions: resp.data.allSubscriptions,
      allSubscriptionProducts: resp.data.allSubscriptionProducts,
      selectedSubscription: 'any',
      selectedProduct: 'any',
      selectedStatus: 'any'
    }
  } else {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      allSubscriptions: resp.data.allSubscriptions,
      allSubscriptionProducts: resp.data.allSubscriptionProducts,
      selectedSubscription: 'any',
      selectedProduct: 'any'
    }
  }

  setNewFlow(tmpNewFlow)
}

const WooCommerceStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val === '10' || val === '19') {
    tmpNewFlow.triggerData.products = resp.data.products
  }
  if (val === '11') {
    tmpNewFlow.triggerData.orderStatus = resp.data.orderStatus
  }
  if (val === '17') {
    tmpNewFlow.triggerData.allProductCategories = resp.data.allProductCategories
  }
  if (val === '20') {
    tmpNewFlow.triggerData.allVariableProduct = resp.data.allVariableProduct
    tmpNewFlow.triggerData.allVariation = resp.data.allVariation
  }
  setNewFlow(tmpNewFlow)
}

const groundhoggStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val === '2' || val === '3') {
    tmpNewFlow.triggerData.allTag = resp.data.allTag
  }
  setNewFlow(tmpNewFlow)
}

const RestrictContentStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  tmpNewFlow.triggerData.allMembership = resp.data.allMembership
  setNewFlow(tmpNewFlow)
}

const buddybossStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val.toString() === '3') {
    tmpNewFlow.triggerData.forums = resp.data.forums
  } else if (
    val.toString() === '9' ||
    val.toString() === '10' ||
    val.toString() === '11' ||
    val.toString() === '12' ||
    val.toString() === '13'
  ) {
    tmpNewFlow.triggerData.groups = resp.data.groups
  } else if (val.toString() === '4') {
    tmpNewFlow.triggerData.forums = resp.data.forums
    tmpNewFlow.triggerData.topics = resp.data.topics
  }
  setNewFlow(tmpNewFlow)
}

const LifterLmsStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val.toString() === '1' || val.toString() === '2' || val.toString() === '3') {
    tmpNewFlow.triggerData.allQuiz = resp.data.allQuiz
  } else if (val.toString() === '4') {
    tmpNewFlow.triggerData.allLesson = resp.data.allLesson
  } else if (val.toString() === '5' || val.toString() === '6' || val.toString() === '7') {
    tmpNewFlow.triggerData.allCourse = resp.data.allCourse
  } else if (val.toString() === '8') {
    tmpNewFlow.triggerData.allMembership = resp.data.allMembership
  }
  setNewFlow(tmpNewFlow)
}

const MasterStudyLmsStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val.toString() === '2') {
    tmpNewFlow.triggerData.allLesson = resp.data.allLesson
  }
  if (['1', '3', '4', '5'].includes(val.toString())) {
    tmpNewFlow.triggerData.allCourse = resp.data.allCourse
  }
  if (val.toString() === '6') {
    tmpNewFlow.triggerData.allDistribution = resp.data.allDistribution
  }
  if (val.toString() === '4' || val.toString() === '5') {
    tmpNewFlow.triggerData.allQuiz = resp.data.allQuiz
  }
  setNewFlow(tmpNewFlow)
}

const ThriveApprenticeStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (['1'].includes(val.toString())) {
    tmpNewFlow.triggerData.allCourse = resp.data.allCourse
  } else if (val.toString() === '2') {
    tmpNewFlow.triggerData.allLesson = resp.data.allLesson
  } else if (val.toString() === '3') {
    tmpNewFlow.triggerData.allModule = resp.data.allModule
  }
  setNewFlow(tmpNewFlow)
}

const EDDStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val.toString() === '1') {
    tmpNewFlow.triggerData.allProduct = resp.data.allProduct
  } else if (val.toString() === '2') {
    tmpNewFlow.triggerData.allDiscountCode = resp.data.allDiscountCode
  }
  setNewFlow(tmpNewFlow)
}

const UltimateMemberStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val.toString() === 'roleSpecificChange') {
    tmpNewFlow.triggerData.allRole = resp.data.allRole
  }
  setNewFlow(tmpNewFlow)
}

const learndashStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val === '1' || val === '2' || val === '3') {
    tmpNewFlow.triggerData.courses = resp.data.courses
  } else if (val === '4' || val === '11') {
    tmpNewFlow.triggerData.courses = resp.data.courses
    tmpNewFlow.triggerData.lessons = resp.data.lessons
  } else if (val === '5') {
    tmpNewFlow.triggerData.courses = resp.data.courses
    tmpNewFlow.triggerData.lessons = resp.data.lessons
    tmpNewFlow.triggerData.topics = resp.data.topics
  } else if (val === '6' || val === '7' || val === '8') {
    tmpNewFlow.triggerData.quizes = resp.data.quizes
  } else if (val === '9' || val === '10') {
    tmpNewFlow.triggerData.groups = resp.data.groups
  }
  setNewFlow(tmpNewFlow)
}

const GamiPressStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val === '1') {
    tmpNewFlow.triggerData.rankTypes = resp.data.rankTypes
  }
  if (val === '2' || val === '3' || val === '5') {
    tmpNewFlow.triggerData.achievementTypes = resp.data.achievementTypes
  }
  setNewFlow(tmpNewFlow)
}

const postStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if ([1, 2, 3, 6].includes(val)) {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      types: resp.data.types,
      selectedPostType: 'any'
    }
  } else if ([4, 5, 7, 8, 9].includes(val)) {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      posts: resp.data.posts,
      selectedPostId: 'any-post'
    }
  }
  setNewFlow(tmpNewFlow)
}

const JetEngineStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if ([1, 2].includes(val)) {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      types: resp.data.types,
      selectedPostType: 'any-post-type'
    }
  }
  setNewFlow(tmpNewFlow)
}

const AffiliateStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val === '4' || val === '5' || val === '3') {
    tmpNewFlow.triggerData.allType = resp.data.allType
  }
  setNewFlow(tmpNewFlow)
}

const MemberpressStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val === '1') {
    tmpNewFlow.triggerData.oneTimeMembership = resp.data.oneTimeMembership
  } else if (val === '2' || val === '5') {
    tmpNewFlow.triggerData.recurringMembership = resp.data.recurringMembership
  } else if (val === '3' || val === '4') {
    tmpNewFlow.triggerData.allMemberships = resp.data.allMemberships
  }
  setNewFlow(tmpNewFlow)
}

const PaidMembershipProStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  tmpNewFlow.triggerData.AllMembershipLevels = resp.data.AllMembershipLevels

  setNewFlow(tmpNewFlow)
}

const SliceWpStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val === '2') {
    tmpNewFlow.triggerData.AllCommissionType = resp.data.AllCommissionType
  }
  setNewFlow(tmpNewFlow)
}

const SureCartStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val === '1' || val === '2' || val === '3') {
    tmpNewFlow.triggerData.allProduct = resp.data.allProduct
  }
  setNewFlow(tmpNewFlow)
}

const GiveWpStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val === '1') {
    tmpNewFlow.triggerData.allDonationForms = resp.data.allDonationForms
  }
  if (val === '2') {
    tmpNewFlow.triggerData.allRecurringForms = resp.data.allRecurringForms
  }
  setNewFlow(tmpNewFlow)
}

const wpCoursewareStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val === 'userEnrolledCourse' || val === 'courseCompleted') {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      courses: resp.data.courses,
      selectedCourse: 'any'
    }
  } else if (val === 'moduleCompleted') {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      modules: resp.data.modules,
      selectedModule: 'any'
    }
  } else if (val === 'unitCompleted') {
    tmpNewFlow.triggerData = {
      ...tmpNewFlow.triggerData,
      units: resp.data.units,
      selectedUnit: 'any'
    }
  }
  setNewFlow(tmpNewFlow)
}

export const fluentCrmStateIH = (tmpConf, flowData, triggered_entity_id) => {
  const formId = flowData.formID ? flowData.formID : triggered_entity_id
  if (formId === 'fluentcrm-1' || formId === 'fluentcrm-2') {
    tmpConf.selectedTag = flowData?.selectedTag
    tmpConf.tags = flowData.tags
  } else if (formId === 'fluentcrm-3' || formId === 'fluentcrm-4') {
    tmpConf.selectedList = flowData?.selectedList
    tmpConf.lists = flowData.lists
  } else if (formId === 'fluentcrm-5') {
    tmpConf.selectedStatus = flowData?.selectedStatus
    tmpConf.status = flowData.status
  }
  return tmpConf
}

export const fluentBookingStateIH = (tmpConf, flowData, triggered_entity_id) => {
  const formId = flowData.formID ? flowData.formID : triggered_entity_id

  if (formId) {
    tmpConf.selectedEvent = flowData.selectedEvent
    tmpConf.events = flowData.events
  }

  return tmpConf
}

export const SureMembersStateIH = (tmpConf, flowData, triggered_entity_id) => {
  const formId = flowData.formID ? flowData.formID : triggered_entity_id

  if (formId) {
    tmpConf.selectedGroup = flowData.selectedGroup
    tmpConf.groups = flowData.groups
  }

  return tmpConf
}

export const wpForoStateIH = (tmpConf, flowData, triggered_entity_id) => {
  const formId = flowData.formID ? flowData.formID : triggered_entity_id

  if (formId === 'wpforo-1') {
    tmpConf.selectedForum = flowData.selectedForum
    tmpConf.forums = flowData.forums
  }

  if (
    formId === 'wpforo-2' ||
    formId === 'wpforo-3' ||
    formId === 'wpforo-4' ||
    formId === 'wpforo-5' ||
    formId === 'wpforo-6' ||
    formId === 'wpforo-11'
  ) {
    tmpConf.selectedTopic = flowData.selectedTopic
    tmpConf.topics = flowData.topics
  }

  if (
    formId === 'wpforo-7' ||
    formId === 'wpforo-8' ||
    formId === 'wpforo-9' ||
    formId === 'wpforo-10' ||
    formId === 'wpforo-12'
  ) {
    tmpConf.selectedUser = flowData.selectedUser
    tmpConf.users = flowData.users
  }

  return tmpConf
}

export const wpJobManagerStateIH = (tmpConf, flowData, triggered_entity_id) => {
  const formId = flowData.formID ? flowData.formID : triggered_entity_id

  if (
    formId === 'wp_job_manager-1' ||
    formId === 'wp_job_manager-4' ||
    formId === 'wp_job_manager-5' ||
    formId === 'wp_job_manager-10'
  ) {
    tmpConf.selectedJobType = flowData.selectedJobType
    tmpConf.jobTypes = flowData.jobTypes
  }
  if (
    formId === 'wp_job_manager-2' ||
    formId === 'wp_job_manager-3' ||
    formId === 'wp_job_manager-6' ||
    formId === 'wp_job_manager-7' ||
    formId === 'wp_job_manager-11'
  ) {
    tmpConf.selectedJob = flowData.selectedJob
    tmpConf.jobList = flowData.jobList
  }
  if (formId === 'wp_job_manager-9' || formId === 'wp_job_manager-10') {
    tmpConf.selectedStatus = flowData.selectedStatus
    tmpConf.statusList = flowData.statusList
  }

  return tmpConf
}

export const eventsCalendarIH = (tmpConf, flowData, triggered_entity_id) => {
  const formId = flowData.formID ? flowData.formID : triggered_entity_id

  if (
    formId === 'events_calendar-1' ||
    formId === 'events_calendar-2' ||
    formId === 'events_calendar-3' ||
    formId === 'events_calendar-4'
  ) {
    tmpConf.selectedEvent = flowData.selectedEvent
    tmpConf.events = flowData.events
  }

  return tmpConf
}

export const voxelIH = (tmpConf, flowData, triggered_entity_id) => {
  const formId = flowData.formID ? flowData.formID : triggered_entity_id

  if (
    formId === 'voxel-7' ||
    formId === 'voxel-8' ||
    formId === 'voxel-9' ||
    formId === 'voxel-10' ||
    formId === 'voxel-11' ||
    formId === 'voxel-20'
  ) {
    tmpConf.selectedPostType = flowData.selectedPostType
    tmpConf.postTypes = flowData.postTypes
  }

  return tmpConf
}

export const WCSubscriptionsStateIH = (tmpConf, flowData, triggered_entity_id) => {
  const formId = flowData.formID ? flowData.formID : triggered_entity_id

  tmpConf.selectedProduct = flowData.selectedProduct
  tmpConf.allSubscriptionProducts = flowData.allSubscriptionProducts
  tmpConf.fields = flowData?.fields

  if (!['user_subscribes_to_product', 'user_purchases_variable_subscription'].includes(formId)) {
    tmpConf.selectedSubscription = flowData.selectedSubscription
    tmpConf.allSubscriptions = flowData.allSubscriptions
  }
  if (formId === 'user_subscription_status_updated') {
    tmpConf.selectedStatus = flowData.selectedStatus
    tmpConf.allStatus = [
      { label: 'Any Status', value: 'any' },
      { label: 'Active', value: 'active' },
      { label: 'On Hold', value: 'on-hold' },
      { label: 'Pending', value: 'pending' },
      { label: 'Cancelled', value: 'cancelled' },
      { label: 'Pending Cancel', value: 'pending-cancel' }
    ]
  }

  return tmpConf
}

export const WCBookingsStateIH = (tmpConf, flowData, triggered_entity_id) => {
  const formId = flowData.formID ? flowData.formID : triggered_entity_id
  tmpConf.fields = flowData?.fields

  if (formId === 'booking_status_changed') {
    tmpConf.selectedStatus = flowData.selectedStatus
    tmpConf.allStatus = [
      { label: 'Any Status', value: 'any' },
      { label: 'Unpaid', value: 'unpaid' },
      { label: 'Pending Confirmation', value: 'pending-confirmation' },
      { label: 'Confirmed', value: 'confirmed' },
      { label: 'Paid', value: 'paid' },
      { label: 'Complete', value: 'complete' },
      { label: 'In Cart', value: 'in-cart' },
      { label: 'Cancelled', value: 'cancelled' }
    ]
  }

  return tmpConf
}

export const tutorlmsStateIH = (tmpConf, flowData) => {
  if (flowData.formID === '2') {
    tmpConf.selectedQuiz = flowData.selectedQuiz
  } else if (flowData.formID === '3') {
    tmpConf.selectedLesson = flowData.selectedLesson
  } else if (flowData.formID === '1' || flowData.formID === '4') {
    tmpConf.selectedCourse = flowData.selectedCourse
  } else if (flowData.formID === '5') {
    tmpConf.selectedQuiz = flowData.selectedQuiz
    tmpConf.requiredPercent = flowData.requiredPercent
    tmpConf.selectedCondition = flowData.selectedCondition
  }
  return tmpConf
}

export const wooCommerceStateIH = (tmpConf, flowData, triggered_entity_id) => {
  const formId = flowData.formID ? flowData.formID : triggered_entity_id

  if (formId === '10' || formId === '19') {
    tmpConf.selectedProduct = flowData.selectedProduct
    tmpConf.products = flowData.products
  }
  if (formId === '11') {
    tmpConf.selectedOrderStatus = flowData.selectedOrderStatus
    tmpConf.orderStatus = flowData.orderStatus
  }

  if (formId === '12' || formId === '13' || formId === '14' || formId === '15' || formId === '16') {
    tmpConf.selectedSubscription = flowData.selectedSubscription
    tmpConf.subscriptions = flowData.subscriptions
  }
  if (formId === '15') {
    tmpConf.selectedSubscriptionStatus = flowData.selectedSubscriptionStatus
    tmpConf.subscriptionStatus = flowData.subscriptionStatus
  }
  if (formId === '17') {
    tmpConf.selectedProductCategory = flowData.selectedProductCategory
    tmpConf.allProductCategories = flowData.allProductCategories
  }
  if (formId === '20') {
    tmpConf.selectedVariableProduct = flowData.selectedVariableProduct
    tmpConf.allVariableProduct = flowData.allVariableProduct
    tmpConf.selectedVariation = flowData.selectedVariation
    tmpConf.allVariation = flowData.allVariation
  }

  return tmpConf
}

export const groundhoggStateIH = (tmpConf, flowData, formID) => {
  if (formID === '2' || formID === '3') {
    tmpConf.selectedTag = flowData.selectedTag
  }
  return tmpConf
}

export const RestrictContentStateIH = (tmpConf, flowData) => {
  tmpConf.selectedMembership = flowData.selectedMembership
  tmpConf.allMembership = flowData.allMembership
  return tmpConf
}

export const buddybossStateIH = (tmpConf, flowData) => {
  if (flowData.formID === '3') {
    tmpConf.selectedForum = flowData.selectedForum
    tmpConf.forums = flowData.forums
  } else if (
    flowData.formID === '9' ||
    flowData.formID === '10' ||
    flowData.formID === '11' ||
    flowData.formID === '12' ||
    flowData.formID === '13'
  ) {
    tmpConf.selectedGroup = flowData.selectedGroup
    tmpConf.groups = flowData.groups
  } else if (flowData.formID === '4') {
    tmpConf.selectedForum = flowData.selectedForum
    tmpConf.forums = flowData.forums
    tmpConf.selectedTopic = flowData.selectedTopic
    tmpConf.topics = flowData.topics
  }
  return tmpConf
}

export const learndashStateIH = (tmpConf, flowData, formId) => {
  const formID = flowData?.formID || formId

  if (formID === '1') {
    tmpConf.selectedCourse = flowData.selectedCourse
    tmpConf.courses = flowData.courses
  } else if (formID === '2') {
    tmpConf.unenrollCourse = flowData.unenrollCourse
    tmpConf.courses = flowData.courses
  } else if (formID === '3') {
    tmpConf.completeCourse = flowData.completeCourse
    tmpConf.courses = flowData.courses
  } else if (formID === '4' || formID === '11') {
    tmpConf.selectedLesson = flowData.selectedLesson
    tmpConf.courses = flowData.courses
    tmpConf.lessons = flowData.lessons
  } else if (formID === '5') {
    tmpConf.selectedCourse = flowData.selectedCourse
    tmpConf.selectedLesson = flowData.selectedLesson
    tmpConf.selectedTopic = flowData.selectedTopic
    tmpConf.courses = flowData.courses
    tmpConf.lessons = flowData.lessons
    tmpConf.topics = flowData.topics
  } else if (formID === '6' || formID === '7' || formID === '8') {
    tmpConf.selectedQuiz = flowData.selectedQuiz
    tmpConf.quizes = flowData.quizes
  } else if (formID === '9' || formID === '10') {
    tmpConf.selectedGroup = flowData.selectedGroup
    tmpConf.groups = flowData.groups
  }

  return tmpConf
}

export const GamiPressStateIH = (tmpConf, flowData) => {
  if (flowData.formID === '1') {
    tmpConf.selectedRankType = flowData.selectedRankType
    tmpConf.rankTypes = flowData.rankTypes
    tmpConf.selectedRank = flowData.selectedRank
    tmpConf.ranks = flowData.ranks
  } else if (flowData.formID === '2') {
    tmpConf.selectedAchievementType = flowData.selectedAchievementType
    tmpConf.achievementTypes = flowData.achievementTypes
    tmpConf.selectedAward = flowData.selectedAward
    tmpConf.awards = flowData.awards
  } else if (flowData.formID === '3' || flowData.formID === '5') {
    tmpConf.selectedAchievementType = flowData.selectedAchievementType
    tmpConf.achievementTypes = flowData.achievementTypes
  } else if (flowData.formID === '6') {
    tmpConf.selectedPoint = flowData.selectedPoint
  }
  return tmpConf
}

export const affiliateStateIH = (tmpConf, flowData) => {
  if (flowData.formID === '4' || flowData.formID === '5' || flowData.formID === '3') {
    tmpConf.selectedType = flowData.selectedType
    tmpConf.allType = flowData.allType
  }
  return tmpConf
}

export const wpCoursewareStateIH = (tmpConf, flowData) => {
  if (flowData.formID === 'userEnrolledCourse' || flowData.formID === 'courseCompleted') {
    tmpConf.selectedCourse = flowData?.selectedCourse
  } else if (flowData.formID === 'moduleCompleted') {
    tmpConf.selectedModule = flowData?.selectedModule
  } else if (flowData.formID === 'unitCompleted') {
    tmpConf.selectedUnit = flowData?.selectedUnit
  }
  return tmpConf
}

export const postStateIH = (tmpConf, flowData) => {
  const val = Number(flowData.formID)
  if (val === 1 || val === 2 || val === 3 || val === 6) {
    tmpConf.selectedPostType = flowData.selectedPostType
    tmpConf.types = flowData.types
  } else if ([4, 5, 7, 8, 9].includes(val)) {
    tmpConf.selectedPostId = flowData.selectedPostId
    tmpConf.posts = flowData.posts
  }
  return tmpConf
}
export const jetEngineStateIH = (tmpConf, flowData) => {
  const val = Number(flowData.formID)
  if (val === 1 || val === 2) {
    tmpConf.selectedPostType = flowData.selectedPostType
    tmpConf.types = flowData.types
    tmpConf.selectedMetaKey = flowData.selectedMetaKey
    tmpConf.selectedMetaValue = flowData.selectedMetaValue
  }
  return tmpConf
}

export const memberpressStateIH = (tmpConf, flowData) => {
  const val = Number(flowData.formID)
  if (val === 1) {
    tmpConf.selectedOneTimeMembership = flowData.selectedOneTimeMembership
    tmpConf.oneTimeSubscriptions = flowData.oneTimeSubscriptions
  } else if (val === 2) {
    tmpConf.selectedRecurringMembership = flowData.selectedRecurringMembership
    tmpConf.recurringSubscriptions = flowData.recurringSubscriptions
  } else if (val === 3 || val === 4) {
    tmpConf.selectedCancelMembership = flowData.selectedCancelMembership
    tmpConf.allMemberships = flowData.allMemberships
  } else if (val === 5) {
    tmpConf.selectedRecurringMembership = flowData.selectedRecurringMembership
    tmpConf.recurringSubscriptions = flowData.recurringSubscriptions
  }
  return tmpConf
}

export const PaidMembershipProStateIH = (tmpConf, flowData) => {
  tmpConf.selectedMembershipLevel = flowData.selectedMembershipLevel
  tmpConf.AllMembershipLevels = flowData.AllMembershipLevels

  return tmpConf
}

export const SliceWpStateIH = (tmpConf, flowData) => {
  const val = Number(flowData.formID)
  if (val === 2) {
    tmpConf.selectedCommissionType = flowData.selectedCommissionType
    tmpConf.AllCommissionType = flowData.AllCommissionType
  }
  return tmpConf
}

export const SureCartStateIH = (tmpConf, flowData) => {
  tmpConf.selectedProduct = flowData.selectedProduct
  tmpConf.allProduct = flowData.allProduct

  return tmpConf
}

export const GiveWpStateIH = (tmpConf, flowData) => {
  const val = Number(flowData.formID)
  if (val === 1) {
    tmpConf.selectedDonationForm = flowData.selectedDonationForm
    tmpConf.allDonationForms = flowData.allDonationForms
  }
  if (val === 2) {
    tmpConf.selectedRecurringDonationForm = flowData.selectedRecurringDonationForm
    tmpConf.allRecurringForms = flowData.allRecurringForms
  }
  return tmpConf
}

export const LifterLmsStateIH = (tmpConf, flowData) => {
  const val = Number(flowData.formID)
  if (val === 1 || val === 2 || val === 3) {
    tmpConf.selectedQuiz = flowData.selectedQuiz
    tmpConf.allQuiz = flowData.allQuiz
  } else if (val === 4) {
    tmpConf.selectedLesson = flowData.selectedLesson
    tmpConf.allLesson = flowData.allLesson
  } else if (val === 5 || val === 6 || val === 7) {
    tmpConf.selectedCourse = flowData.selectedCourse
    tmpConf.allCourse = flowData.allCourse
  } else if (val === 8) {
    tmpConf.selectedMembership = flowData.selectedMembership
    tmpConf.allMembership = flowData.allMembership
  }
  return tmpConf
}
export const MasterStudyLmsStateIH = (tmpConf, flowData, formID) => {
  const val = Number(formID)
  if (val === 2) {
    tmpConf.selectedLesson = flowData.selectedLesson
    tmpConf.allLesson = flowData.allLesson
  }
  if (val === 1 || val === 3 || val === 4 || val === 5) {
    tmpConf.selectedCourse = flowData.selectedCourse
    tmpConf.allCourse = flowData.allCourse
  }
  if (val === 4 || val === 5) {
    tmpConf.selectedQuiz = flowData.selectedQuiz
    tmpConf.allQuiz = flowData.allQuiz
  }
  if (val === 6) {
    tmpConf.selectedDistribution = flowData.selectedDistribution
    tmpConf.allDistribution = flowData.allDistribution
  }

  return tmpConf
}

export const ThriveApprenticeStateIH = (tmpConf, flowData) => {
  const val = Number(flowData.formID)
  if (val === 1) {
    tmpConf.selectedCourse = flowData.selectedCourse
    tmpConf.allCourse = flowData.allCourse
  } else if (val === 2) {
    tmpConf.selectedLesson = flowData.selectedLesson
    tmpConf.allLesson = flowData.allLesson
  }
  if (val === 3) {
    tmpConf.selectedModule = flowData.selectedModule
    tmpConf.allModule = flowData.allModule
  }
  return tmpConf
}

export const EDDStateIH = (tmpConf, flowData) => {
  const val = Number(flowData.formID)
  if (val === 1) {
    tmpConf.selectedProduct = flowData.selectedProduct
    tmpConf.allProduct = flowData.allProduct
  } else if (val === 2) {
    tmpConf.selectedDiscount = flowData.selectedDiscount
    tmpConf.allDiscountCode = flowData.allDiscountCode
  }
  return tmpConf
}

export const UltimateMemberStateIH = (tmpConf, flowData) => {
  const val = flowData.formID
  if (val === 'roleSpecificChange') {
    tmpConf.selectedRole = flowData.selectedRole
    tmpConf.allRole = flowData.allRole
  }

  tmpConf.fields = flowData.fields

  return tmpConf
}

export const ARMemberStateIH = (tmpConf, flowData) => {
  if (flowData?.formID && Array.isArray(flowData?.fields)) {
    tmpConf.fields = flowData.fields
  }

  return tmpConf
}

const academylmsStateFP = (val, tmpNewFlow, resp, setNewFlow) => {
  if (val === '2') {
    tmpNewFlow.triggerData.quizzes = resp.data.quizzes
  } else if (val === '3') {
    tmpNewFlow.triggerData.lessons = resp.data.lessons
  } else if (val === '4' || val === '1') {
    tmpNewFlow.triggerData.courses = resp.data.courses
  } else if (val === '5') {
    tmpNewFlow.triggerData.quizzes = resp.data.quizzes
    tmpNewFlow.triggerData.percentageCondition = resp.data.percentageCondition
  }
  setNewFlow(tmpNewFlow)
}

export const actionHookStateIH = (dataFlow, tmpConf) => {
  tmpConf['primaryKey'] = dataFlow?.primaryKey
  tmpConf['fields'] = dataFlow?.fields
  tmpConf['rawData'] = dataFlow?.rawData
  tmpConf['fetch'] = dataFlow?.fetch || ''
  tmpConf['fetch_remove'] = dataFlow?.fetch_remove || ''

  return tmpConf
}

export const customTriggerStateIH = (dataFlow, tmpConf) => {
  tmpConf['fields'] = dataFlow?.fields
  tmpConf['rawData'] = dataFlow?.rawData

  return tmpConf
}

export const CFSStateIH = (dataFlow, tmpConf) => {
  tmpConf['primaryKey'] = dataFlow?.primaryKey
  tmpConf['fields'] = dataFlow?.fields
  tmpConf['tasks'] = dataFlow?.tasks || ''
  tmpConf['fetch'] = dataFlow?.fetch || ''
  tmpConf['fetch_remove'] = dataFlow?.fetch_remove || ''

  return tmpConf
}
