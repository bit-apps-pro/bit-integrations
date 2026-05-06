/* eslint-disable react-hooks/exhaustive-deps */
import { lazy, memo, Suspense, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil'
import { $actionConf, $formFields, $newFlow } from '../../GlobalStates'
import useFetch from '../../hooks/useFetch'
import { __ } from '../../Utils/i18nwrap'
import Loader from '../Loaders/Loader'
import SnackMsg from '../Utilities/SnackMsg'
import EditCustomApi from './CustomApi/EditCustomApi'

const EditOmniSend = lazy(() => import('./OmniSend/EditOmniSend'))
const EditSliceWp = lazy(() => import('./SliceWp/EditSliceWp'))
const EditZohoBigin = lazy(() => import('./ZohoBigin/EditZohoBigin'))
const EditOneDrive = lazy(() => import('./OneDrive/EditOneDrive'))
const EditZohoCampaigns = lazy(() => import('./ZohoCampaigns/EditZohoCampaigns'))
const EditZohoCRM = lazy(() => import('./ZohoCRM/EditZohoCRM'))
const EditRapidmail = lazy(() => import('./Rapidmail/EditRapidmail'))
const EditTwilio = lazy(() => import('./Twilio/EditTwilio'))
const EditZohoMarketingHub = lazy(() => import('./ZohoMarketingHub/EditZohoMarketingHub'))
const EditZohoRecruit = lazy(() => import('./ZohoRecruit/EditZohoRecruit'))
const EditGoogleSheet = lazy(() => import('./GoogleSheet/EditGoogleSheet'))
const EditMailChimp = lazy(() => import('./MailChimp/EditMailChimp'))
const Mail = lazy(() => import('./Mail/Mail'))
const EditPod = lazy(() => import('./Pods/EditPod'))
const EditMailPoet = lazy(() => import('./MailPoet/EditMailPoet'))
const EditMailerPress = lazy(() => import('./MailerPress/EditMailerPress'))
const EditSendinBlue = lazy(() => import('./SendinBlue/EditSendinBlue'))
const EditWooCommerce = lazy(() => import('./WooCommerce/EditWooCommerce'))
const EditActiveCampaign = lazy(() => import('./ActiveCampaign/EditActiveCampaign'))
const EditWebHooks = lazy(() => import('./WebHooks/EditWebHooks'))
const EditZohoFlow = lazy(() => import('./ZohoFlow/EditZohoFlow'))
const EditTelegram = lazy(() => import('./Telegram/EditTelegram'))
const EditTutorLms = lazy(() => import('./TutorLms/EditTutorLms'))
const EditFluentCrm = lazy(() => import('./FluentCRM/EditFluentCrm'))
const EditEncharge = lazy(() => import('./Encharge/EditEncharge'))
const EditAutonami = lazy(() => import('./Autonami/EditAutonami'))
const EditDropbox = lazy(() => import('./Dropbox/EditDropbox'))
const EditGoogleDrive = lazy(() => import('./GoogleDrive/EditGoogleDrive'))
const EditGoogleCalendar = lazy(() => import('./GoogleCalendar/EditGoogleCalendar'))
const EditRegistration = lazy(() => import('./Registration/EditRegistration'))
const EditPost = lazy(() => import('./PostCreation/PostEdit'))
const EditIntegrately = lazy(() => import('./Integrately/EditIntegrately'))
const EditZapier = lazy(() => import('./Zapier/EditZapier'))
const EditIFTTT = lazy(() => import('./IFTTT/EditIFTTT'))
const EditPabbly = lazy(() => import('./Pabbly/EditPabbly'))
const EditN8n = lazy(() => import('./N8n/EditN8n'))
const EditSyncSpider = lazy(() => import('./SyncSpider/EditSyncSpider'))
const EditKonnectzIT = lazy(() => import('./KonnectzIT/EditKonnectzIT'))
const EditAntApps = lazy(() => import('./AntApps/EditAntApps'))
const EditIntegromat = lazy(() => import('./Integromat/EditIntegromat'))
const EditSlack = lazy(() => import('./Slack/EditSlack'))
const EditElasticEmail = lazy(() => import('./ElasticEmail/EditElasticEmail'))
const EditWPCourseware = lazy(() => import('./WPCourseware/EditWPCourseware'))
const EditMautic = lazy(() => import('./Mautic/EditMautic'))
const EditTrello = lazy(() => import('./Trello/EditTrello'))
const EditHubspot = lazy(() => import('./Hubspot/EditHubspot'))
const EditGetgist = lazy(() => import('./Getgist/EditGetgist'))
const EditZohoDesk = lazy(() => import('./ZohoDesk/EditZohoDesk'))
const EditSendy = lazy(() => import('./Sendy/EditSendy'))
const EditKeap = lazy(() => import('./Keap/EditKeap'))
const EditFreshdesk = lazy(() => import('./Freshdesk/EditFreshdesk'))
const EditZoom = lazy(() => import('./Zoom/EditZoom'))
const EditZoomWebinar = lazy(() => import('./ZoomWebinar/EditZoomWebinar'))
const EditFluentSupport = lazy(() => import('./FluentSupport/EditFluentSupport'))
const EditBitForm = lazy(() => import('./BitForm/EditBitForm'))
const EditAcumbamail = lazy(() => import('./Acumbamail/EditAcumbamail'))
const EditGroundhogg = lazy(() => import('./Groundhogg/EditGroundhogg'))
const EditSendFox = lazy(() => import('./SendFox/EditSendFox'))
const EditMailerLite = lazy(() => import('./MailerLite/EditMailerLite'))
const EditVbout = lazy(() => import('./Vbout/EditVbout'))
const EditWhatsApp = lazy(() => import('./WhatsApp/EditWhatsApp'))
const EditLearnDash = lazy(() => import('./LearnDash/EditLearnDash'))
const EditRestrictContent = lazy(() => import('./RestrictContent/EditRestrictContent'))
const EditAffiliate = lazy(() => import('./Affiliate/EditAffiliate'))
const EditBuddyBoss = lazy(() => import('./BuddyBoss/EditBuddyBoss'))
const EditGoogleContacts = lazy(() => import('./GoogleContacts/EditGoogleContacts'))
const EditKirimEmail = lazy(() => import('./KirimEmail/EditKirimEmail'))
const EditGamiPress = lazy(() => import('./GamiPress/EditGamiPress'))
const EditSalesforce = lazy(() => import('./Salesforce/EditSalesforce'))
const EditKlaviyo = lazy(() => import('./Klaviyo/EditKlaviyo'))
const EditSelzy = lazy(() => import('./Selzy/EditSelzy'))
const EditConstantContact = lazy(() => import('./ConstantContact/EditConstantContact'))
const EditPipeDrive = lazy(() => import('./PipeDrive/EditPipeDrive'))
const EditMailercloud = lazy(() => import('./Mailercloud/EditMailercloud'))
const EditMoosend = lazy(() => import('./Moosend/EditMoosend'))
const EditMemberpress = lazy(() => import('./Memberpress/EditMemberpress'))
const EditGetResponse = lazy(() => import('./GetResponse/EditGetResponse'))
const EditPaidMembershipPro = lazy(() => import('./PaidMembershipPro/EditPaidMembershipPro'))
const EditMailBluster = lazy(() => import('./MailBluster/EditMailBluster'))
const EditMailRelay = lazy(() => import('./MailRelay/EditMailRelay'))
const EditMailup = lazy(() => import('./Mailup/EditMailup'))
const EditNotion = lazy(() => import('./Notion/EditNotion'))
const EditMailjet = lazy(() => import('./Mailjet/EditMailjet'))
const EditSendGrid = lazy(() => import('./SendGrid/EditSendGrid'))
const EditFabman = lazy(() => import('./Fabman/EditFabman'))
const EditPCloud = lazy(() => import('./PCloud/EditPCloud'))
const EditEmailOctopus = lazy(() => import('./EmailOctopus/EditEmailOctopus'))
const EditCustomAction = lazy(() => import('./CustomAction/EditCustomAction'))
const EditSmaily = lazy(() => import('./Smaily/EditSmaily'))
const EditSureCart = lazy(() => import('./SureCart/EditSureCart'))
const EditAgiled = lazy(() => import('./AgiledCRM/EditAgiled'))
const EditConvertKit = lazy(() => import('./ConvertKit/EditConvertKit'))
const EditBenchMark = lazy(() => import('./BenchMark/EditBenchMark'))
const EditDirectIq = lazy(() => import('./DirectIq/EditDirectIq'))
const EditSendPulse = lazy(() => import('./SendPulse/EditSendPulse'))
const EditGiveWp = lazy(() => import('./GiveWp/EditGiveWp'))
const EditAirtable = lazy(() => import('./Airtable/EditAirtable'))
const EditZohoSheet = lazy(() => import('./ZohoSheet/EditZohoSheet'))
const EditLifterLms = lazy(() => import('./LifterLms/EditLifterLms'))
const EditFreshSales = lazy(() => import('./FreshSales/EditFreshSales'))
const EditInsightly = lazy(() => import('./Insightly/EditInsightly'))
const EditCapsuleCRM = lazy(() => import('./CapsuleCRM/EditCapsuleCRM'))
const EditMasterStudyLms = lazy(() => import('./MasterStudyLms/EditMasterStudyLms'))
const EditZendesk = lazy(() => import('./Zendesk/EditZendesk'))
const EditAsana = lazy(() => import('./Asana/EditAsana'))
const EditPropovoiceCrm = lazy(() => import('./PropovoiceCRM/EditPropovoiceCrm'))
const EditMailMint = lazy(() => import('./MailMint/EditMailMint'))
const EditClickup = lazy(() => import('./Clickup/EditClickup'))
const EditClinchPad = lazy(() => import('./ClinchPad/EditClinchPad'))
const EditCopperCRM = lazy(() => import('./CopperCRM/EditCopperCRM'))
const EditDrip = lazy(() => import('./Drip/EditDrip'))
const EditMailify = lazy(() => import('./Mailify/EditMailify'))
const EditLemlist = lazy(() => import('./Lemlist/EditLemlist'))
const EditLionDesk = lazy(() => import('./LionDesk/EditLionDesk'))
const EditCampaignMonitor = lazy(() => import('./CampaignMonitor/EditCampaignMonitor'))
const EditSalesmate = lazy(() => import('./Salesmate/EditSalesmate'))
const EditSuiteDash = lazy(() => import('./SuiteDash/EditSuiteDash'))
const EditGravitec = lazy(() => import('./Gravitec/EditGravitec'))
const EditCompanyHub = lazy(() => import('./CompanyHub/EditCompanyHub'))
const EditDemio = lazy(() => import('./Demio/EditDemio'))
const EditFlowlu = lazy(() => import('./Flowlu/EditFlowlu'))
const EditLivestorm = lazy(() => import('./Livestorm/EditLivestorm'))
const EditNimble = lazy(() => import('./Nimble/EditNimble'))
const EditAlbato = lazy(() => import('./Albato/EditAlbato'))
const EditSperseIO = lazy(() => import('./SperseIO/EditSperseIO'))
const EditFlowMattic = lazy(() => import('./FlowMattic/EditFlowMattic'))
const EditAutomatorWP = lazy(() => import('./AutomatorWP/EditAutomatorWP'))
const EditUncannyAutomator = lazy(() => import('./UncannyAutomator/EditUncannyAutomator'))
const EditThriveAutomator = lazy(() => import('./ThriveAutomator/EditThriveAutomator'))
const EditWPWebhooks = lazy(() => import('./WPWebhooks/EditWPWebhooks'))
const EditAdvancedFormIntegration = lazy(
  () => import('./AdvancedFormIntegration/EditAdvancedFormIntegration')
)
const EditPerfexCRM = lazy(() => import('./PerfexCRM/EditPerfexCRM'))
const EditSureTriggers = lazy(() => import('./SureTriggers/EditSureTriggers'))
const EditOneHashCRM = lazy(() => import('./OneHashCRM/EditOneHashCRM'))
const EditSalesflare = lazy(() => import('./Salesflare/EditSalesflare'))
const EditAcademyLms = lazy(() => import('./AcademyLms/EditAcademyLms'))
const EditMoxieCRM = lazy(() => import('./MoxieCRM/EditMoxieCRM'))
const EditWPFusion = lazy(() => import('./WPFusion/EditWPFusion'))
const EditWoodpecker = lazy(() => import('./Woodpecker/EditWoodpecker'))
const EditNutshellCRM = lazy(() => import('./NutshellCRM/EditNutshellCRM'))
const EditSystemeIO = lazy(() => import('./SystemeIO/EditSystemeIO'))
const EditDiscord = lazy(() => import('./Discord/EditDiscord'))
const EditZagoMail = lazy(() => import('./ZagoMail/EditZagoMail'))
const EditNewsletter = lazy(() => import('./Newsletter/EditNewsletter'))
const EditSureMembers = lazy(() => import('./SureMembers/EditSureMembers'))
const EditMailster = lazy(() => import('./Mailster/EditMailster'))
const EditWPForo = lazy(() => import('./WPForo/EditWPForo'))
const EditDokan = lazy(() => import('./Dokan/EditDokan'))
const EditJetEngine = lazy(() => import('./JetEngine/EditJetEngine'))
const EditHighLevel = lazy(() => import('./HighLevel/EditHighLevel'))
const EditTheEventsCalendar = lazy(() => import('./TheEventsCalendar/EditTheEventsCalendar'))
const EditLMFWC = lazy(() => import('./LMFWC/EditLMFWC'))
const EditVoxel = lazy(() => import('./Voxel/EditVoxel'))
const EditSmartSuite = lazy(() => import('./SmartSuite/EditSmartSuite'))
const EditMondayCom = lazy(() => import('./MondayCom/EditMondayCom'))
const EditBento = lazy(() => import('./Bento/EditBento'))
const EditLine = lazy(() => import('./Line/EditLine'))
const EditACPT = lazy(() => import('./ACPT/EditACPT'))
const EditWishlistMember = lazy(() => import('./WishlistMember/EditWishlistMember'))
const EditCreatorLms = lazy(() => import('./CreatorLms/EditCreatorLms'))
const EditUltimateAffiliatePro = lazy(() => import('./UltimateAffiliatePro/EditUltimateAffiliatePro'))
const EditFluentCart = lazy(() => import('./FluentCart/EditFluentCart'))
const EditWpErp = lazy(() => import('./WpErp/EditWpErp'))
const EditPeepSo = lazy(() => import('./PeepSo/EditPeepSo'))
const EditNinjaTables = lazy(() => import('./NinjaTables/EditNinjaTables'))
const EditWCAffiliate = lazy(() => import('./WCAffiliate/EditWCAffiliate'))
const EditWPCafe = lazy(() => import('./WPCafe/EditWPCafe'))
const EditNotificationX = lazy(() => import('./NotificationX/EditNotificationX'))
const EditWeDocs = lazy(() => import('./WeDocs/EditWeDocs'))
const EditTeamsForWooCommerceMemberships = lazy(
  () => import('./TeamsForWooCommerceMemberships/EditTeamsForWooCommerceMemberships')
)
const EditAsgarosForum = lazy(() => import('./AsgarosForum/EditAsgarosForum'))
const EditSeoPress = lazy(() => import('./SeoPress/EditSeoPress'))
const EditUserRegistrationMembership = lazy(
  () => import('./UserRegistrationMembership/EditUserRegistrationMembership')
)

const loaderStyle = {
  display: 'flex',
  height: '82vh',
  justifyContent: 'center',
  alignItems: 'center'
}

export default function EditInteg({ allIntegURL }) {
  const { id } = useParams()
  const { data, isLoading, isError } = useFetch({
    payload: { id },
    action: ['flow/get', id]
  })
  const [flow, setFlow] = useRecoilState($newFlow)
  const [actionConfig, setActionConfig] = useRecoilState($actionConf)
  const setFormFields = useSetRecoilState($formFields)
  const actionConfReset = useResetRecoilState($actionConf)
  const formFieldsReset = useResetRecoilState($formFields)
  const flowReset = useResetRecoilState($newFlow)
  const [snack, setSnackbar] = useState({ show: false, msg: '' })
  useEffect(() => {
    if (!isLoading && !isError && data?.data?.integration) {
      if (data?.data?.integration?.fields?.length === 0) {
        setSnackbar({
          show: true,
          msg: __('Trigger Form Is Deleted', 'bit-integrations')
        })
      }
      setFlow(data.data?.integration)
      setActionConfig(data.data?.integration?.flow_details)
      setFormFields(data.data?.integration?.fields || [])
    }

    return () => {
      actionConfReset()
      formFieldsReset()
      flowReset()
    }
  }, [data])
  if (isLoading || isError) {
    return <Loader style={loaderStyle} />
  }

  if (!data.success) {
    return (
      <div style={loaderStyle}>
        <h1 className="txt-center mt-5">{data?.data}</h1>
      </div>
    )
  }
  return (
    <div>
      <div className="flx">
        <SnackMsg snack={snack} setSnackbar={setSnackbar} />
        <Link to={allIntegURL} className="btn btcd-btn-o-gray">
          <span className="btcd-icn icn-chevron-left" />
          &nbsp;{__('Back', 'bit-integrations')}
        </Link>
        <div className="w-10 txt-center" style={{ marginRight: '73px' }}>
          <b className="f-lg mb-2">{flow.flow_details?.type}</b>
          <div>{__('Integration Settings', 'bit-integrations')}</div>
        </div>
      </div>
      <Suspense fallback={<Loader className="g-c" style={{ height: '82vh' }} />}>
        {actionConfig && Object.keys(actionConfig).length && (
          <IntegType allIntegURL={allIntegURL} formFields={flow.fields} flow={flow} setFlow={setFlow} />
        )}
      </Suspense>
    </div>
  )
}
const IntegType = memo(({ allIntegURL, flow }) => {
  switch (flow?.flow_details?.type) {
    case 'Zoho CRM':
      return <EditZohoCRM allIntegURL={allIntegURL} />
    case 'SliceWp':
      return <EditSliceWp allIntegURL={allIntegURL} />
    case 'Rapidmail':
      return <EditRapidmail allIntegURL={allIntegURL} />
    case 'Twilio':
      return <EditTwilio allIntegURL={allIntegURL} />
    case 'OneDrive':
      return <EditOneDrive allIntegURL={allIntegURL} />
    case 'Zoho Recruit':
      return <EditZohoRecruit allIntegURL={allIntegURL} />
    case 'Zoho Campaigns':
      return <EditZohoCampaigns allIntegURL={allIntegURL} />
    case 'Zoho Marketing Hub':
    case 'Zoho Marketing Automation(Zoho Marketing Hub)':
      return <EditZohoMarketingHub allIntegURL={allIntegURL} />
    case 'Zoho Bigin':
      return <EditZohoBigin allIntegURL={allIntegURL} />
    case 'Google Sheet':
      return <EditGoogleSheet allIntegURL={allIntegURL} />
    case 'Mail Chimp':
      return <EditMailChimp allIntegURL={allIntegURL} />
    case 'Mail':
      return <Mail allIntegURL={allIntegURL} edit />
    case 'Pods':
      return <EditPod allIntegURL={allIntegURL} />
    case 'Mail Poet':
      return <EditMailPoet allIntegURL={allIntegURL} />
    case 'MailerPress':
      return <EditMailerPress allIntegURL={allIntegURL} />
    case 'SendinBlue':
    case 'Brevo(Sendinblue)':
      return <EditSendinBlue allIntegURL={allIntegURL} />
    case 'WooCommerce':
      return <EditWooCommerce allIntegURL={allIntegURL} />
    case 'ActiveCampaign':
      return <EditActiveCampaign allIntegURL={allIntegURL} />
    case 'Web Hooks':
      return <EditWebHooks allIntegURL={allIntegURL} />
    case 'Zapier':
      return <EditZapier allIntegURL={allIntegURL} />
    case 'IFTTT':
      return <EditIFTTT allIntegURL={allIntegURL} />
    case 'Pabbly':
      return <EditPabbly allIntegURL={allIntegURL} />
    case 'N8n':
      return <EditN8n allIntegURL={allIntegURL} />
    case 'SyncSpider':
      return <EditSyncSpider allIntegURL={allIntegURL} />
    case 'KonnectzIT':
      return <EditKonnectzIT allIntegURL={allIntegURL} />
    case 'Ant Apps':
      return <EditAntApps allIntegURL={allIntegURL} />
    case 'Integrately':
      return <EditIntegrately allIntegURL={allIntegURL} />
    case 'Integromat':
    case 'Make(Integromat)':
      return <EditIntegromat allIntegURL={allIntegURL} />
    case 'Zoho Flow':
      return <EditZohoFlow allIntegURL={allIntegURL} />
    case 'Telegram':
      return <EditTelegram allIntegURL={allIntegURL} />
    case 'Fluent Crm':
      return <EditFluentCrm allIntegURL={allIntegURL} />
    case 'Encharge':
      return <EditEncharge allIntegURL={allIntegURL} />
    case 'Registration':
    case 'WP User Registration':
      return <EditRegistration allIntegURL={allIntegURL} />
    case 'Autonami':
      return <EditAutonami allIntegURL={allIntegURL} />
    case 'Dropbox':
      return <EditDropbox allIntegURL={allIntegURL} />
    case 'Google Drive':
      return <EditGoogleDrive allIntegURL={allIntegURL} />
    case 'Google Calendar':
      return <EditGoogleCalendar allIntegURL={allIntegURL} />
    case 'Post Creation':
    case 'WP Post Creation':
      return <EditPost allIntegURL={allIntegURL} />
    case 'Slack':
      return <EditSlack allIntegURL={allIntegURL} />
    case 'ElasticEmail':
      return <EditElasticEmail allIntegURL={allIntegURL} />
    case 'WP Courseware':
      return <EditWPCourseware allIntegURL={allIntegURL} />
    case 'Tutor Lms':
      return <EditTutorLms allIntegURL={allIntegURL} />
    case 'Mautic':
      return <EditMautic allIntegURL={allIntegURL} />
    case 'Trello':
      return <EditTrello allIntegURL={allIntegURL} />
    case 'Hubspot':
      return <EditHubspot allIntegURL={allIntegURL} />
    case 'Getgist':
      return <EditGetgist allIntegURL={allIntegURL} />
    case 'Zoho Desk':
      return <EditZohoDesk allIntegURL={allIntegURL} />
    case 'Sendy':
      return <EditSendy allIntegURL={allIntegURL} />
    case 'Keap':
      return <EditKeap allIntegURL={allIntegURL} />
    case 'User Registration & Membership':
      return <EditUserRegistrationMembership allIntegURL={allIntegURL} />
    case 'Freshdesk':
      return <EditFreshdesk allIntegURL={allIntegURL} />
    case 'Zoom':
      return <EditZoom allIntegURL={allIntegURL} />
    case 'Zoom Webinar':
      return <EditZoomWebinar allIntegURL={allIntegURL} />
    case 'Fluent Support':
      return <EditFluentSupport allIntegURL={allIntegURL} />
    case 'Bit Form':
      return <EditBitForm allIntegURL={allIntegURL} />
    case 'Acumbamail':
      return <EditAcumbamail allIntegURL={allIntegURL} />
    case 'Groundhogg':
      return <EditGroundhogg allIntegURL={allIntegURL} />
    case 'SendFox':
      return <EditSendFox allIntegURL={allIntegURL} />
    case 'MailerLite':
      return <EditMailerLite allIntegURL={allIntegURL} />
    case 'Vbout':
      return <EditVbout allIntegURL={allIntegURL} />
    case 'WhatsApp':
      return <EditWhatsApp allIntegURL={allIntegURL} />
    case 'LearnDash':
      return <EditLearnDash allIntegURL={allIntegURL} />
    case 'RestrictContent':
      return <EditRestrictContent allIntegURL={allIntegURL} />
    case 'Affiliate':
      return <EditAffiliate allIntegURL={allIntegURL} />
    case 'BuddyBoss':
      return <EditBuddyBoss allIntegURL={allIntegURL} />
    case 'GamiPress':
      return <EditGamiPress allIntegURL={allIntegURL} />
    case 'Google Contacts':
      return <EditGoogleContacts allIntegURL={allIntegURL} />
    case 'Kirim Email':
      return <EditKirimEmail allIntegURL={allIntegURL} />
    case 'Salesforce':
      return <EditSalesforce allIntegURL={allIntegURL} />
    case 'Klaviyo':
      return <EditKlaviyo allIntegURL={allIntegURL} />
    case 'Selzy':
      return <EditSelzy allIntegURL={allIntegURL} />
    case 'Mailercloud':
      return <EditMailercloud allIntegURL={allIntegURL} />
    case 'Moosend':
      return <EditMoosend allIntegURL={allIntegURL} />
    case 'Memberpress':
      return <EditMemberpress allIntegURL={allIntegURL} />
    case 'GetResponse':
      return <EditGetResponse allIntegURL={allIntegURL} />
    case 'PaidMembershipPro':
      return <EditPaidMembershipPro allIntegURL={allIntegURL} />
    case 'MailBluster':
      return <EditMailBluster allIntegURL={allIntegURL} />
    case 'MailRelay':
      return <EditMailRelay allIntegURL={allIntegURL} />
    case 'Mailup':
      return <EditMailup allIntegURL={allIntegURL} />
    case 'Notion':
      return <EditNotion allIntegURL={allIntegURL} />
    case 'ConstantContact':
      return <EditConstantContact allIntegURL={allIntegURL} />
    case 'OmniSend':
      return <EditOmniSend allIntegURL={allIntegURL} />
    case 'PipeDrive':
      return <EditPipeDrive allIntegURL={allIntegURL} />
    case 'Mailjet':
      return <EditMailjet allIntegURL={allIntegURL} />
    case 'SendGrid':
      return <EditSendGrid allIntegURL={allIntegURL} />
    case 'Fabman':
      return <EditFabman allIntegURL={allIntegURL} />
    case 'PCloud':
      return <EditPCloud allIntegURL={allIntegURL} />
    case 'EmailOctopus':
      return <EditEmailOctopus allIntegURL={allIntegURL} />
    case 'CustomAction':
      return <EditCustomAction allIntegURL={allIntegURL} />
    case 'Smaily':
      return <EditSmaily allIntegURL={allIntegURL} />
    case 'SureCart':
      return <EditSureCart allIntegURL={allIntegURL} />
    case 'Agiled CRM':
      return <EditAgiled allIntegURL={allIntegURL} />
    case 'ConvertKit':
    case 'Kit(ConvertKit)':
      return <EditConvertKit allIntegURL={allIntegURL} />
    case 'BenchMark':
      return <EditBenchMark allIntegURL={allIntegURL} />
    case 'DirectIq':
      return <EditDirectIq allIntegURL={allIntegURL} />
    case 'SendPulse':
      return <EditSendPulse allIntegURL={allIntegURL} />
    case 'GiveWp':
      return <EditGiveWp allIntegURL={allIntegURL} />
    case 'Airtable':
      return <EditAirtable allIntegURL={allIntegURL} />
    case 'Zoho Sheet':
      return <EditZohoSheet allIntegURL={allIntegURL} />
    case 'LifterLms':
      return <EditLifterLms allIntegURL={allIntegURL} />
    case 'FreshSales':
      return <EditFreshSales allIntegURL={allIntegURL} />
    case 'Insightly':
      return <EditInsightly allIntegURL={allIntegURL} />
    case 'CapsuleCRM':
      return <EditCapsuleCRM allIntegURL={allIntegURL} />
    case 'MasterStudyLms':
      return <EditMasterStudyLms allIntegURL={allIntegURL} />
    case 'Zendesk':
      return <EditZendesk allIntegURL={allIntegURL} />
    case 'Asana':
      return <EditAsana allIntegURL={allIntegURL} />
    case 'Propovoice CRM':
      return <EditPropovoiceCrm allIntegURL={allIntegURL} />
    case 'Mail Mint':
      return <EditMailMint allIntegURL={allIntegURL} />
    case 'Clickup':
      return <EditClickup allIntegURL={allIntegURL} />
    case 'ClinchPad':
      return <EditClinchPad allIntegURL={allIntegURL} />
    case 'CopperCRM':
      return <EditCopperCRM allIntegURL={allIntegURL} />
    case 'CustomApi':
      return <EditCustomApi allIntegURL={allIntegURL} />
    case 'Drip':
      return <EditDrip allIntegURL={allIntegURL} />
    case 'Mailify':
    case 'Sarbacane(Mailify)':
      return <EditMailify allIntegURL={allIntegURL} />
    case 'Lemlist':
      return <EditLemlist allIntegURL={allIntegURL} />
    case 'LionDesk':
      return <EditLionDesk allIntegURL={allIntegURL} />
    case 'CampaignMonitor':
      return <EditCampaignMonitor allIntegURL={allIntegURL} />
    case 'Salesmate':
      return <EditSalesmate allIntegURL={allIntegURL} />
    case 'SuiteDash':
      return <EditSuiteDash allIntegURL={allIntegURL} />
    case 'Gravitec':
      return <EditGravitec allIntegURL={allIntegURL} />
    case 'CompanyHub':
      return <EditCompanyHub allIntegURL={allIntegURL} />
    case 'Demio':
      return <EditDemio allIntegURL={allIntegURL} />
    case 'Flowlu':
      return <EditFlowlu allIntegURL={allIntegURL} />
    case 'Livestorm':
      return <EditLivestorm allIntegURL={allIntegURL} />
    case 'Nimble':
      return <EditNimble allIntegURL={allIntegURL} />
    case 'Albato':
      return <EditAlbato allIntegURL={allIntegURL} />
    case 'SperseIO':
      return <EditSperseIO allIntegURL={allIntegURL} />
    case 'FlowMattic':
      return <EditFlowMattic allIntegURL={allIntegURL} />
    case 'AutomatorWP':
      return <EditAutomatorWP allIntegURL={allIntegURL} />
    case 'UncannyAutomator':
      return <EditUncannyAutomator allIntegURL={allIntegURL} />
    case 'ThriveAutomator':
      return <EditThriveAutomator allIntegURL={allIntegURL} />
    case 'WPWebhooks':
      return <EditWPWebhooks allIntegURL={allIntegURL} />
    case 'AdvancedFormIntegration':
      return <EditAdvancedFormIntegration allIntegURL={allIntegURL} />
    case 'PerfexCRM':
      return <EditPerfexCRM allIntegURL={allIntegURL} />
    case 'SureTriggers':
    case 'OttoKit (SureTriggers)':
      return <EditSureTriggers allIntegURL={allIntegURL} />
    case 'OneHashCRM':
      return <EditOneHashCRM allIntegURL={allIntegURL} />
    case 'Salesflare':
      return <EditSalesflare allIntegURL={allIntegURL} />
    case 'Academy Lms':
      return <EditAcademyLms allIntegURL={allIntegURL} />
    case 'MoxieCRM':
      return <EditMoxieCRM allIntegURL={allIntegURL} />
    case 'WPFusion':
      return <EditWPFusion allIntegURL={allIntegURL} />
    case 'Woodpecker':
      return <EditWoodpecker allIntegURL={allIntegURL} />
    case 'NutshellCRM':
      return <EditNutshellCRM allIntegURL={allIntegURL} />
    case 'SystemeIO':
      return <EditSystemeIO allIntegURL={allIntegURL} />
    case 'Discord':
      return <EditDiscord allIntegURL={allIntegURL} />
    case 'ZagoMail':
      return <EditZagoMail allIntegURL={allIntegURL} />
    case 'Newsletter':
      return <EditNewsletter allIntegURL={allIntegURL} />
    case 'SureMembers':
      return <EditSureMembers allIntegURL={allIntegURL} />
    case 'Mailster':
      return <EditMailster allIntegURL={allIntegURL} />
    case 'WPForo':
      return <EditWPForo allIntegURL={allIntegURL} />
    case 'Dokan':
      return <EditDokan allIntegURL={allIntegURL} />
    case 'JetEngine':
      return <EditJetEngine allIntegURL={allIntegURL} />
    case 'GoHighLevel':
      return <EditHighLevel allIntegURL={allIntegURL} />
    case 'The Events Calendar':
      return <EditTheEventsCalendar allIntegURL={allIntegURL} />
    case 'License Manager For WooCommerce':
      return <EditLMFWC allIntegURL={allIntegURL} />
    case 'Voxel':
      return <EditVoxel allIntegURL={allIntegURL} />
    case 'SmartSuite':
      return <EditSmartSuite allIntegURL={allIntegURL} />
    case 'Monday.Com':
      return <EditMondayCom allIntegURL={allIntegURL} />
    case 'Bento':
      return <EditBento allIntegURL={allIntegURL} />
    case 'Line':
      return <EditLine allIntegURL={allIntegURL} />
    case 'ACPT':
      return <EditACPT allIntegURL={allIntegURL} />
    case 'Wishlist Member':
      return <EditWishlistMember allIntegURL={allIntegURL} />
    case 'CreatorLms':
      return <EditCreatorLms allIntegURL={allIntegURL} />
    case 'Ultimate Affiliate Pro':
      return <EditUltimateAffiliatePro allIntegURL={allIntegURL} />
    case 'FluentCart':
      return <EditFluentCart allIntegURL={allIntegURL} />
    case 'WP ERP':
      return <EditWpErp allIntegURL={allIntegURL} />
    case 'PeepSo':
      return <EditPeepSo allIntegURL={allIntegURL} />
    case 'Ninja Tables':
      return <EditNinjaTables allIntegURL={allIntegURL} />
    case 'WC Affiliate':
      return <EditWCAffiliate allIntegURL={allIntegURL} />
    case 'WPCafe':
      return <EditWPCafe allIntegURL={allIntegURL} />
    case 'NotificationX':
      return <EditNotificationX allIntegURL={allIntegURL} />
    case 'weDocs':
    case 'WeDocs':
      return <EditWeDocs allIntegURL={allIntegURL} />
    case 'Asgaros Forum':
    case 'AsgarosForum':
      return <EditAsgarosForum allIntegURL={allIntegURL} />
    case 'Teams For WooCommerce Memberships':
      return <EditTeamsForWooCommerceMemberships allIntegURL={allIntegURL} />
    case 'SeoPress':
      return <EditSeoPress allIntegURL={allIntegURL} />
    default:
      return <Loader style={loaderStyle} />
  }
})
