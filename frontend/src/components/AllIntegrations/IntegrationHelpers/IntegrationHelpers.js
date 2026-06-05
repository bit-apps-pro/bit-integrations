/* eslint-disable no-unused-expressions */
import toast from 'react-hot-toast'
import { getRecoil, resetRecoil } from 'recoil-nexus'
import { $actionConf, $appConfigState, $flowStep, $newFlow } from '../../../GlobalStates'
import { freeTriggers, webhookIntegrations } from '../../../Utils/StaticData/webhookIntegrations'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import {
  ARMemberStateIH,
  CFSStateIH,
  EDDStateIH,
  GamiPressStateIH,
  GiveWpStateIH,
  LifterLmsStateIH,
  MasterStudyLmsStateIH,
  PaidMembershipProStateIH,
  RestrictContentStateIH,
  SliceWpStateIH,
  SureCartStateIH,
  SureMembersStateIH,
  ThriveApprenticeStateIH,
  UltimateMemberStateIH,
  WCSubscriptionsStateIH,
  WCBookingsStateIH,
  actionHookStateIH,
  affiliateStateIH,
  buddybossStateIH,
  customTriggerStateIH,
  eventsCalendarIH,
  fluentBookingStateIH,
  fluentCrmStateIH,
  groundhoggStateIH,
  jetEngineStateIH,
  learndashStateIH,
  memberpressStateIH,
  postStateIH,
  tutorlmsStateIH,
  voxelIH,
  wooCommerceStateIH,
  wpCoursewareStateIH,
  wpForoStateIH,
  wpJobManagerStateIH
} from '../../Triggers/TriggerHelpers/TriggerStateHelper'
import c from 'react-multiple-select-dropdown-lite'
import { create } from 'mutative'

const checkWebhookIntegrationsExist = entity => {
  const integrations = webhookIntegrations
  return integrations.includes(entity)
}

export const saveIntegConfig = async (
  flow,
  setFlow,
  allIntegURL,
  confTmp,
  navigate,
  index,
  edit,
  setIsLoading
) => {
  const btcbi = getRecoil($appConfigState)
  const { isPro, version } = btcbi

  let action = 'flow/save'
  setIsLoading(true)
  let tmpConf = confTmp
  tmpConf['trigger_type'] = flow?.triggerData?.trigger_type || flow?.flow_details?.trigger_type || ''

  if (confTmp?.condition?.action_behavior !== 'cond') {
    tmpConf.condition = {
      action_behavior: '',
      actions: [{ field: '', action: 'value' }],
      logics: [{ field: '', logic: '', val: '' }, 'or', { field: '', logic: '', val: '' }]
    }
  }

  /**
   * TODO
   *
   * This is a temporary fix
   * Have to move this to a better place
   */

  if (flow.triggered_entity === 'CartFlow') {
    if (edit) {
      tmpConf.postId = flow?.flow_details?.postId ?? null
    } else {
      tmpConf.postId = flow?.triggerData?.postId ?? null
    }
  } else if (flow.triggered_entity === 'TutorLms') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = tutorlmsStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'FluentBooking') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = fluentBookingStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'SureMembers') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = SureMembersStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'WC') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = wooCommerceStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'Groundhogg') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = groundhoggStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'RestrictContent') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = RestrictContentStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'LearnDash') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = learndashStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'GamiPress') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = GamiPressStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'Affiliate') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = affiliateStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'BuddyBoss') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = buddybossStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'WPCourseware') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = wpCoursewareStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'FluentCrm') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = fluentCrmStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'Post') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = postStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'JetEngine') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = jetEngineStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'Memberpress') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = memberpressStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'PaidMembershipPro') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = PaidMembershipProStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'SliceWp') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = SliceWpStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'SureCart') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = SureCartStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'GiveWp') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = GiveWpStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'LifterLms') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = LifterLmsStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'MasterStudyLms') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    const formID = dataFlow?.formID || flow?.triggered_entity_id
    tmpConf = MasterStudyLmsStateIH(tmpConf, dataFlow, formID)
  } else if (flow.triggered_entity === 'ThriveApprentice') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = ThriveApprenticeStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'EDD') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = EDDStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'UltimateMember') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = UltimateMemberStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'ARMember') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = ARMemberStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'WPForo') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = wpForoStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'WPJobManager') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = wpJobManagerStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'EventsCalendar') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = eventsCalendarIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'Voxel') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = voxelIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'WCSubscriptions') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = WCSubscriptionsStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'WCBookings') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = WCBookingsStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (
    flow.triggered_entity === 'ActionHook' ||
    flow.triggered_entity === 'Spectra' ||
    flow.triggered_entity === 'EssentialBlocks' ||
    flow.triggered_entity === 'Coblocks'
  ) {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = actionHookStateIH(dataFlow, tmpConf)
  } else if (flow.triggered_entity === 'CustomTrigger') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = customTriggerStateIH(dataFlow, tmpConf)
  } 
  
  if (
    flow?.triggerData?.trigger_type === 'custom_form_submission' ||
    flow?.flow_details?.trigger_type === 'custom_form_submission'
  ) {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = CFSStateIH(dataFlow, tmpConf)
  } 

  if (isPro && !freeTriggers.includes(flow.triggered_entity)) {
    tmpConf['pro_integ_v'] = version
  }

  const data = {
    name: confTmp.name,
    trigger: flow.triggered_entity,
    triggered_entity_id: flow?.triggerData?.formID
      ? flow.triggerData.formID
      : flow.triggered_entity_id || 0,
    flow_details: tmpConf
  }
  if (flow.id) {
    data.id = flow.id
  }

  if (checkWebhookIntegrationsExist(flow.triggered_entity)) {
    data.flow_details.fields = !edit ? flow?.triggerDetail?.data : flow?.flow_details?.fields
  }
  if (edit) {
    action = 'flow/update'
  }

  if (confTmp?.type === 'CustomAction') {
    action = edit ? 'flow/custom-action/update' : 'flow/custom-action/save'
  }
  if (confTmp?.type === 'Mail') {
    action = edit ? 'flow/mail/update' : 'flow/mail/save'
  }

  try {
    const res = await bitsFetch(data, action)
    if (!edit && res.success) {
      navigate(allIntegURL)
      // getRecoil, setRecoil, resetRecoil
      resetRecoil($newFlow)
      resetRecoil($flowStep)
      resetRecoil($actionConf)
    }
    setIsLoading(false)
    return res
  } catch (e) {
    setIsLoading(false)
    return __('Failed to save integration', 'bit-integrations')
  }
}

export const saveActionConf = async ({
  flow,
  setFlow,
  allIntegURL,
  conf,
  navigate,
  index,
  edit,
  setIsLoading,
  setSnackbar
}) => {
  const btcbi = getRecoil($appConfigState)
  const { isPro, version } = btcbi

  let action = 'flow/save'
  setIsLoading && setIsLoading instanceof Function && setIsLoading(true)
  let tmpConf = conf
  tmpConf['trigger_type'] = flow?.triggerData?.trigger_type || flow?.flow_details?.trigger_type || ''

  /**
   * TODO
   *
   * This is a temporary fix
   * Have to move this to a better place
   */
  if (flow.triggered_entity === 'CartFlow') {
    if (edit) {
      tmpConf.postId = flow?.flow_details?.postId ?? null
    } else {
      tmpConf.postId = flow?.triggerData?.postId ?? null
    }
  } else if (flow.triggered_entity === 'TutorLms') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = tutorlmsStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'FluentBooking') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = fluentBookingStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'SureMembers') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = SureMembersStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'WC') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = wooCommerceStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'Groundhogg') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = groundhoggStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'RestrictContent') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = RestrictContentStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'LearnDash') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = learndashStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'GamiPress') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = GamiPressStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'Affiliate') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = affiliateStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'BuddyBoss') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = buddybossStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'WPCourseware') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = wpCoursewareStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'FluentCrm') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = fluentCrmStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'Post') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = postStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'JetEngine') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = jetEngineStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'Memberpress') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = memberpressStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'PaidMembershipPro') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = PaidMembershipProStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'SliceWp') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = SliceWpStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'SureCart') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = SureCartStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'GiveWp') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = GiveWpStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'LifterLms') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = LifterLmsStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'MasterStudyLms') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    const formID = dataFlow?.formID || flow?.triggered_entity_id
    tmpConf = MasterStudyLmsStateIH(tmpConf, dataFlow, formID)
  } else if (flow.triggered_entity === 'ThriveApprentice') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = ThriveApprenticeStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'EDD') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = EDDStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'UltimateMember') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = UltimateMemberStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'ARMember') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = ARMemberStateIH(tmpConf, dataFlow)
  } else if (flow.triggered_entity === 'WPForo') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = wpForoStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'WPJobManager') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = wpJobManagerStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'EventsCalendar') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = eventsCalendarIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'Voxel') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = voxelIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'WCSubscriptions') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = WCSubscriptionsStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (flow.triggered_entity === 'WCBookings') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = WCBookingsStateIH(tmpConf, dataFlow, flow.triggered_entity_id)
  } else if (
    flow.triggered_entity === 'ActionHook' ||
    flow.triggered_entity === 'Spectra' ||
    flow.triggered_entity === 'EssentialBlocks' ||
    flow.triggered_entity === 'Coblocks'
  ) {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = actionHookStateIH(dataFlow, tmpConf)
  } else if (flow.triggered_entity === 'CustomTrigger') {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = customTriggerStateIH(dataFlow, tmpConf)
  }
  
  if (
    flow?.triggerData?.trigger_type === 'custom_form_submission' ||
    flow?.flow_details?.trigger_type === 'custom_form_submission'
  ) {
    const dataFlow = edit ? flow?.flow_details : flow?.triggerData
    tmpConf = CFSStateIH(dataFlow, tmpConf)
  } 

  if (isPro && !freeTriggers.includes(flow.triggered_entity)) {
    tmpConf['pro_integ_v'] = version
  }

  const data = {
    name: conf.name,
    trigger: flow.triggered_entity,
    triggered_entity_id: flow?.triggerData?.formID
      ? flow.triggerData.formID
      : flow.triggered_entity_id || 0,
    flow_details: tmpConf
  }
  if (flow.id) {
    data.id = flow.id
  }
  if (checkWebhookIntegrationsExist(flow.triggered_entity)) {
    data.flow_details.fields = !edit ? flow?.triggerDetail?.data : flow?.flow_details?.fields
  }
  if (edit) {
    action = 'flow/update'
  }

  if (conf?.type === 'CustomAction') {
    action = edit ? 'flow/custom-action/update' : 'flow/custom-action/save'
  }
  if (conf?.type === 'Mail') {
    action = edit ? 'flow/mail/update' : 'flow/mail/save'
  }

  try {
    await bitsFetch(data, action).then(res => {
      if (!edit && res.success) {
        navigate(allIntegURL)
      }

      let msg = ''
      let msgType = 'success'
      if (res.data?.msg) {
        msg = res.data.msg
      } else if (res.success) {
        msg = edit
          ? __('Integration updated successfully', 'bit-integrations')
          : __('Integration saved successfully', 'bit-integrations')
      } else {
        msgType = 'error'
        msg = edit
          ? __('Failed to update integration', 'bit-integrations')
          : __('Failed to save integration', 'bit-integrations')
      }
      toast(msg, { type: msgType })

      setIsLoading && setIsLoading instanceof Function && setIsLoading(false)
      if (!edit) {
        setTimeout(() => {
          navigate(allIntegURL)
        }, 700)
      }
    })
  } catch (e) {
    setIsLoading && setIsLoading instanceof Function && setIsLoading(false)
    return __('Failed to save integration', 'bit-integrations')
  }
}

export const setGrantTokenResponse = integ => {
  const grantTokenResponse = {}
  const authWindowLocation = window.location.href
  const queryParams = authWindowLocation
    .replace(`${window.opener.location.href}/redirect`, '')
    .split('&')
  if (queryParams) {
    queryParams.forEach(element => {
      const gtKeyValue = element.split('=')
      if (gtKeyValue[1]) {
        // eslint-disable-next-line prefer-destructuring
        grantTokenResponse[gtKeyValue[0]] = gtKeyValue[1]
      }
    })
  }
  localStorage.setItem(`__${integ}`, JSON.stringify(grantTokenResponse))
  window.close()
}

export const handleAuthorize = (
  integ,
  ajaxInteg,
  scopes,
  confTmp,
  setConf,
  setError,
  setisAuthorized,
  setIsLoading,
  setSnackbar,
  btcbi
) => {
  if (!confTmp.dataCenter || !confTmp.clientId || !confTmp.clientSecret) {
    setError({
      dataCenter: !confTmp.dataCenter ? __("Data center can't be empty", 'bit-integrations') : '',
      clientId: !confTmp.clientId ? __("Client Id can't be empty", 'bit-integrations') : '',
      clientSecret: !confTmp.clientSecret ? __("Secret key can't be empty", 'bit-integrations') : ''
    })
    return
  }
  setIsLoading(true)
  const apiEndpoint = `https://accounts.zoho.${
    confTmp.dataCenter
  }/oauth/v2/auth?scope=${scopes}&response_type=code&client_id=${
    confTmp.clientId
  }&prompt=Consent&access_type=offline&state=${encodeURIComponent(
    window.location.href
  )}/redirect&redirect_uri=${encodeURIComponent(`${btcbi.api}`)}/redirect`
  const authWindow = window.open(apiEndpoint, integ, 'width=400,height=609,toolbar=off')
  const popupURLCheckTimer = setInterval(() => {
    if (authWindow.closed) {
      clearInterval(popupURLCheckTimer)
      let grantTokenResponse = {}
      let isauthRedirectLocation = false
      const bitformsZoho = localStorage.getItem(`__${integ}`)
      if (bitformsZoho) {
        isauthRedirectLocation = true
        grantTokenResponse = JSON.parse(bitformsZoho)
        localStorage.removeItem(`__${integ}`)
      }

      if (
        !grantTokenResponse.code ||
        grantTokenResponse.error ||
        !grantTokenResponse ||
        !isauthRedirectLocation
      ) {
        const errorCause = grantTokenResponse.error ? `Cause: ${grantTokenResponse.error}` : ''
        setSnackbar({
          show: true,
          msg: `${__('Authorization failed', 'bit-integrations')} ${errorCause}. ${__(
            'please try again',
            'bit-integrations'
          )}`
        })
        setIsLoading(false)
      } else {
        grantTokenResponse['accounts-server'] = decodeURIComponent(grantTokenResponse['accounts-server'])
        const newConf = { ...confTmp }
        newConf.accountServer = grantTokenResponse['accounts-server']
        tokenHelper(
          ajaxInteg,
          grantTokenResponse,
          newConf,
          setConf,
          setisAuthorized,
          setIsLoading,
          setSnackbar,
          btcbi
        )
      }
    }
  }, 500)
}

const tokenHelper = (
  ajaxInteg,
  grantToken,
  confTmp,
  setConf,
  setisAuthorized,
  setIsLoading,
  setSnackbar,
  btcbi
) => {
  const tokenRequestParams = { ...grantToken }
  tokenRequestParams.dataCenter = confTmp.dataCenter
  tokenRequestParams.clientId = confTmp.clientId
  tokenRequestParams.clientSecret = confTmp.clientSecret
  // tokenRequestParams.redirectURI = `${encodeURIComponent(window.location.href)}/redirect`
  tokenRequestParams.redirectURI = `${btcbi.api}/redirect`

  bitsFetch(tokenRequestParams, `${ajaxInteg}_generate_token`)
    .then(result => result)
    .then(result => {
      if (result && result.success) {
        const newConf = { ...confTmp }
        newConf.tokenDetails = result.data
        setConf(newConf)
        setisAuthorized(true)
        setSnackbar({
          show: true,
          msg: __('Authorized Successfully', 'bit-integrations')
        })
      } else if (
        (result && result.data && result.data.data) ||
        (!result.success && typeof result.data === 'string')
      ) {
        setSnackbar({
          show: true,
          msg: `${__('Authorization failed Cause:', 'bit-integrations')}${
            result.data.data || result.data
          }. ${__('please try again', 'bit-integrations')}`
        })
      } else {
        setSnackbar({
          show: true,
          msg: __('Authorization failed. please try again', 'bit-integrations')
        })
      }
      setIsLoading(false)
    })
}

export const addFieldMap = (i, confTmp, setConf, uploadFields, tab) => {
  const newConf = { ...confTmp }
  if (tab) {
    uploadFields
      ? newConf.relatedlists[tab - 1].upload_field_map.splice(i, 0, {})
      : newConf.relatedlists[tab - 1].field_map.splice(i, 0, {})
  } else {
    uploadFields ? newConf.upload_field_map.splice(i, 0, {}) : newConf.field_map.splice(i, 0, {})
  }

  setConf({ ...newConf })
}

export const delFieldMap = (i, confTmp, setConf, uploadFields, tab) => {
  const newConf = { ...confTmp }
  if (tab) {
    if (uploadFields) {
      if (newConf.relatedlists[tab - 1].upload_field_map.length > 1) {
        newConf.relatedlists[tab - 1].upload_field_map.splice(i, 1)
      }
    } else if (newConf.relatedlists[tab - 1].field_map.length > 1) {
      newConf.relatedlists[tab - 1].field_map.splice(i, 1)
    }
  } else if (uploadFields) {
    if (newConf.upload_field_map.length > 1) {
      newConf.upload_field_map.splice(i, 1)
    }
  } else if (newConf.field_map.length > 1) {
    newConf.field_map.splice(i, 1)
  }

  setConf({ ...newConf })
}

export const handleFieldMapping = (event, index, conftTmp, setConf, uploadFields, tab) => {
  const newConf = { ...conftTmp }

  if (tab) {
    if (uploadFields)
      newConf.relatedlists[tab - 1].upload_field_map[index][event.target.name] = event.target.value
    else newConf.relatedlists[tab - 1].field_map[index][event.target.name] = event.target.value
  } else if (uploadFields) newConf.upload_field_map[index][event.target.name] = event.target.value
  else newConf.field_map[index][event.target.name] = event.target.value

  if (event.target.value === 'custom') {
    if (tab) {
      newConf.relatedlists[tab - 1].field_map[index].customValue = ''
    } else newConf.field_map[index].customValue = ''
  }
  setConf({ ...newConf })
}

export const handleCustomValue = (event, index, conftTmp, setConf, tab) => {
  const newConf = { ...conftTmp }
  if (tab) {
    newConf.relatedlists[tab - 1].field_map[index].customValue = event?.target?.value || event
  } else {
    newConf.field_map[index].customValue = event?.target?.value || event
  }
  setConf({ ...newConf })
}

export const setFieldInputOnMsgBody = (val, setConf, inputRef) => {
  setConf(prevConf =>
    create(prevConf, draftConf => {
      const body = draftConf.body
      const cursorPosition = inputRef.current.selectionStart
      const firstHalfBody = body.substring(0, cursorPosition)
      const lastHalfBody = body.substring(cursorPosition, body.length)

      draftConf.body = firstHalfBody + val + lastHalfBody
    })
  )
}
