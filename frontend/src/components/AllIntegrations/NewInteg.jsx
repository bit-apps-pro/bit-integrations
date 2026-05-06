/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/jsx-no-undef */
import { lazy, Suspense, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState } from 'recoil'
import { $newFlow } from '../../GlobalStates'
import { __ } from '../../Utils/i18nwrap'
import Loader from '../Loaders/Loader'
import { getRecoil } from 'recoil-nexus'

const CustomAction = lazy(() => import('./CustomAction/CustomAction'))
const PaidMembershipPro = lazy(() => import('./PaidMembershipPro/PaidMembershipPro'))
const RestrictContent = lazy(() => import('./RestrictContent/RestrictContent'))
const Twilio = lazy(() => import('./Twilio/Twilio'))
const SliceWp = lazy(() => import('./SliceWp/SliceWp'))
const ZohoCRM = lazy(() => import('./ZohoCRM/ZohoCRM'))
const OneDrive = lazy(() => import('./OneDrive/OneDrive'))
const Rapidmail = lazy(() => import('./Rapidmail/Rapidmail'))
const ZohoBigin = lazy(() => import('./ZohoBigin/ZohoBigin'))
const ZohoCampaigns = lazy(() => import('./ZohoCampaigns/ZohoCampaigns'))
const ZohoMarketingHub = lazy(() => import('./ZohoMarketingHub/ZohoMarketingHub'))
const ZohoRecruit = lazy(() => import('./ZohoRecruit/ZohoRecruit'))
const GoogleSheet = lazy(() => import('./GoogleSheet/GoogleSheet'))
const Mail = lazy(() => import('./Mail/Mail'))
const MailChimp = lazy(() => import('./MailChimp/MailChimp'))
const MailPoet = lazy(() => import('./MailPoet/MailPoet'))
const MailerPress = lazy(() => import('./MailerPress/MailerPress'))
const Sendinblue = lazy(() => import('./SendinBlue/SendinBlue'))
const WooCommerce = lazy(() => import('./WooCommerce/WooCommerce'))
const Pods = lazy(() => import('./Pods/Pods'))
const ActiveCampaign = lazy(() => import('./ActiveCampaign/ActiveCampaign'))
const ZohoFlow = lazy(() => import('./ZohoFlow/ZohoFlow'))
const Zapier = lazy(() => import('./Zapier/Zapier'))
const IFTTT = lazy(() => import('./IFTTT/IFTTT'))
const WebHooks = lazy(() => import('./WebHooks/WebHooks'))
const Pabbly = lazy(() => import('./Pabbly/Pabbly'))
const N8n = lazy(() => import('./N8n/N8n'))
const SyncSpider = lazy(() => import('./SyncSpider/SyncSpider'))
const KonnectzIT = lazy(() => import('./KonnectzIT/KonnectzIT'))
const AntApps = lazy(() => import('./AntApps/AntApps'))
const Integromat = lazy(() => import('./Integromat/Integromat'))
const Integrately = lazy(() => import('./Integrately/Integrately'))
const Telegram = lazy(() => import('./Telegram/Telegram'))
const FluentCrm = lazy(() => import('./FluentCRM/FluentCrm'))
const Encharge = lazy(() => import('./Encharge/Encharge'))
const Post = lazy(() => import('./PostCreation/Post'))
const Registration = lazy(() => import('./Registration/Registration'))
const Getgist = lazy(() => import('./Getgist/Getgist'))
const ElasticEmail = lazy(() => import('./ElasticEmail/ElasticEmail'))
const WPCourseware = lazy(() => import('./WPCourseware/WPCourseware'))
const TutorLms = lazy(() => import('./TutorLms/TutorLms'))
const Autonami = lazy(() => import('./Autonami/Autonami'))
const Dropbox = lazy(() => import('./Dropbox/Dropbox'))
const GoogleDrive = lazy(() => import('./GoogleDrive/GoogleDrive'))
const GoogleCalendar = lazy(() => import('./GoogleCalendar/GoogleCalendar'))
const Slack = lazy(() => import('./Slack/Slack'))
const Trello = lazy(() => import('./Trello/Trello'))
const Mautic = lazy(() => import('./Mautic/Mautic'))
const Keap = lazy(() => import('./Keap/Keap'))
const Hubspot = lazy(() => import('./Hubspot/Hubspot'))
const ZohoDesk = lazy(() => import('./ZohoDesk/ZohoDesk'))
const Freshdesk = lazy(() => import('./Freshdesk/Freshdesk'))
const Sendy = lazy(() => import('./Sendy/Sendy'))
const Zoom = lazy(() => import('./Zoom/Zoom'))
const ZoomWebinar = lazy(() => import('./ZoomWebinar/ZoomWebinar'))
const FluentSupport = lazy(() => import('./FluentSupport/FluentSupport'))
const BitForm = lazy(() => import('./BitForm/BitForm'))
const Acumbamail = lazy(() => import('./Acumbamail/Acumbamail'))
const Groundhogg = lazy(() => import('./Groundhogg/Groundhogg'))
const SendFox = lazy(() => import('./SendFox/SendFox'))
const MailerLite = lazy(() => import('./MailerLite/MailerLite'))
const Vbout = lazy(() => import('./Vbout/Vbout'))
const WhatsApp = lazy(() => import('./WhatsApp/WhatsApp'))
const LearnDesh = lazy(() => import('./LearnDash/LearnDash'))
const Affiliate = lazy(() => import('./Affiliate/Affiliate'))
const BuddyBoss = lazy(() => import('./BuddyBoss/BuddyBoss'))
const GoogleContacts = lazy(() => import('./GoogleContacts/GoogleContacts'))
const KirimEmail = lazy(() => import('./KirimEmail/KirimEmail'))
const Salesforce = lazy(() => import('./Salesforce/Salesforce'))
const GamiPress = lazy(() => import('./GamiPress/GamiPress'))
const Klaviyo = lazy(() => import('./Klaviyo/Klaviyo'))
const Selzy = lazy(() => import('./Selzy/Selzy'))
const ConstantContact = lazy(() => import('./ConstantContact/ConstantContact'))
const OmniSend = lazy(() => import('./OmniSend/OmniSend'))
const PipeDrive = lazy(() => import('./PipeDrive/PipeDrive'))
const Mailercloud = lazy(() => import('./Mailercloud/Mailercloud'))
const Moosend = lazy(() => import('./Moosend/Moosend'))
const Memberpress = lazy(() => import('./Memberpress/Memberpress'))
const GetResponse = lazy(() => import('./GetResponse/GetResponse'))
const MailBluster = lazy(() => import('./MailBluster/MailBluster'))
const MailRelay = lazy(() => import('./MailRelay/MailRelay'))
const Mailup = lazy(() => import('./Mailup/Mailup'))
const Notion = lazy(() => import('./Notion/Notion'))
const Mailjet = lazy(() => import('./Mailjet/Mailjet'))
const SendGrid = lazy(() => import('./SendGrid/SendGrid'))
const Fabman = lazy(() => import('./Fabman/Fabman'))
const PCloud = lazy(() => import('./PCloud/PCloud'))
const EmailOctopus = lazy(() => import('./EmailOctopus/EmailOctopus'))
const Smaily = lazy(() => import('./Smaily/Smaily'))
const CustomApi = lazy(() => import('./CustomApi/CustomApi'))
const SureCart = lazy(() => import('./SureCart/SureCart'))
const Agiled = lazy(() => import('./AgiledCRM/Agiled'))
const ConvertKit = lazy(() => import('./ConvertKit/ConvertKit'))
const BenchMark = lazy(() => import('./BenchMark/BenchMark'))
const DirectIq = lazy(() => import('./DirectIq/DirectIq'))
const SendPulse = lazy(() => import('./SendPulse/SendPulse'))
const GiveWp = lazy(() => import('./GiveWp/GiveWp'))
const Airtable = lazy(() => import('./Airtable/Airtable'))
const ZohoSheet = lazy(() => import('./ZohoSheet/ZohoSheet'))
const LifterLms = lazy(() => import('./LifterLms/LifterLms'))
const FreshSales = lazy(() => import('./FreshSales/FreshSales'))
const Insightly = lazy(() => import('./Insightly/Insightly'))
const CapsuleCRM = lazy(() => import('./CapsuleCRM/CapsuleCRM'))
const MasterStudyLms = lazy(() => import('./MasterStudyLms/MasterStudyLms'))
const Zendesk = lazy(() => import('./Zendesk/Zendesk'))
const Asana = lazy(() => import('./Asana/Asana'))
const PropovoiceCrm = lazy(() => import('./PropovoiceCRM/PropovoiceCrm'))
const Clickup = lazy(() => import('./Clickup/Clickup'))
const ClinchPad = lazy(() => import('./ClinchPad/ClinchPad'))
const CopperCRM = lazy(() => import('./CopperCRM/CopperCRM'))
const MailMint = lazy(() => import('./MailMint/MailMint'))
const Drip = lazy(() => import('./Drip/Drip'))
const Mailify = lazy(() => import('./Mailify/Mailify'))
const Lemlist = lazy(() => import('./Lemlist/Lemlist'))
const LionDesk = lazy(() => import('./LionDesk/LionDesk'))
const CampaignMonitor = lazy(() => import('./CampaignMonitor/CampaignMonitor'))
const Salesmate = lazy(() => import('./Salesmate/Salesmate'))
const SuiteDash = lazy(() => import('./SuiteDash/SuiteDash'))
const Gravitec = lazy(() => import('./Gravitec/Gravitec'))
const CompanyHub = lazy(() => import('./CompanyHub/CompanyHub'))
const Demio = lazy(() => import('./Demio/Demio'))
const Flowlu = lazy(() => import('./Flowlu/Flowlu'))
const Livestorm = lazy(() => import('./Livestorm/Livestorm'))
const Nimble = lazy(() => import('./Nimble/Nimble'))
const Albato = lazy(() => import('./Albato/Albato'))
const SperseIO = lazy(() => import('./SperseIO/SperseIO'))
const FlowMattic = lazy(() => import('./FlowMattic/FlowMattic'))
const AutomatorWP = lazy(() => import('./AutomatorWP/AutomatorWP'))
const UncannyAutomator = lazy(() => import('./UncannyAutomator/UncannyAutomator'))
const ThriveAutomator = lazy(() => import('./ThriveAutomator/ThriveAutomator'))
const WPWebhooks = lazy(() => import('./WPWebhooks/WPWebhooks'))
const AdvancedFormIntegration = lazy(() => import('./AdvancedFormIntegration/AdvancedFormIntegration'))
const PerfexCRM = lazy(() => import('./PerfexCRM/PerfexCRM'))
const SureTriggers = lazy(() => import('./SureTriggers/SureTriggers'))
const OneHashCRM = lazy(() => import('./OneHashCRM/OneHashCRM'))
const Salesflare = lazy(() => import('./Salesflare/Salesflare'))
const AcademyLms = lazy(() => import('./AcademyLms/AcademyLms'))
const MoxieCRM = lazy(() => import('./MoxieCRM/MoxieCRM'))
const WPFusion = lazy(() => import('./WPFusion/WPFusion'))
const Woodpecker = lazy(() => import('./Woodpecker/Woodpecker'))
const NutshellCRM = lazy(() => import('./NutshellCRM/NutshellCRM'))
const SystemeIO = lazy(() => import('./SystemeIO/SystemeIO'))
const Discord = lazy(() => import('./Discord/Discord'))
const ZagoMail = lazy(() => import('./ZagoMail/ZagoMail'))
const Newsletter = lazy(() => import('./Newsletter/Newsletter'))
const SureMembers = lazy(() => import('./SureMembers/SureMembers'))
const Mailster = lazy(() => import('./Mailster/Mailster'))
const WPForo = lazy(() => import('./WPForo/WPForo'))
const Dokan = lazy(() => import('./Dokan/Dokan'))
const JetEngine = lazy(() => import('./JetEngine/JetEngine'))
const HighLevel = lazy(() => import('./HighLevel/HighLevel'))
const TheEventsCalendar = lazy(() => import('./TheEventsCalendar/TheEventsCalendar'))
const LMFWC = lazy(() => import('./LMFWC/LMFWC'))
const Voxel = lazy(() => import('./Voxel/Voxel'))
const SmartSuite = lazy(() => import('./SmartSuite/SmartSuite'))
const MondayCom = lazy(() => import('./MondayCom/MondayCom'))
const Bento = lazy(() => import('./Bento/Bento'))
const Line = lazy(() => import('./Line/Line'))
const ACPT = lazy(() => import('./ACPT/ACPT'))
const WishlistMember = lazy(() => import('./WishlistMember/WishlistMember'))
const CreatorLms = lazy(() => import('./CreatorLms/CreatorLms'))
const UltimateAffiliatePro = lazy(() => import('./UltimateAffiliatePro/UltimateAffiliatePro'))
const FluentCart = lazy(() => import('./FluentCart/FluentCart'))
const WpErp = lazy(() => import('./WpErp/WpErp'))
const PeepSo = lazy(() => import('./PeepSo/PeepSo'))
const NinjaTables = lazy(() => import('./NinjaTables/NinjaTables'))
const WCAffiliate = lazy(() => import('./WCAffiliate/WCAffiliate'))
const WPCafe = lazy(() => import('./WPCafe/WPCafe'))
const NotificationX = lazy(() => import('./NotificationX/NotificationX'))
const WeDocs = lazy(() => import('./WeDocs/WeDocs'))
const TeamsForWooCommerceMemberships = lazy(
  () => import('./TeamsForWooCommerceMemberships/TeamsForWooCommerceMemberships')
)
const AsgarosForum = lazy(() => import('./AsgarosForum/AsgarosForum'))
const SeoPress = lazy(() => import('./SeoPress/SeoPress'))
const UserRegistrationMembership = lazy(
  () => import('./UserRegistrationMembership/UserRegistrationMembership')
)

export default function NewInteg({ allIntegURL }) {
  const { integUrlName } = useParams()
  const [flow, setFlow] = useRecoilState($newFlow)
  const navigate = useNavigate()

  useEffect(() => {
    if (!window.opener && !Object.keys(flow).length) {
      navigate('/flow/new')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const NewIntegs = () => {
    switch (integUrlName) {
      case 'Zoho CRM':
        return (
          <ZohoCRM
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'SliceWp':
        return (
          <SliceWp
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'OneDrive':
        return (
          <OneDrive
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Rapidmail':
        return (
          <Rapidmail
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Zoho Recruit':
        return (
          <ZohoRecruit
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Zoho Campaigns':
        return (
          <ZohoCampaigns
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Zoho Marketing Hub':
        return (
          <ZohoMarketingHub
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Zoho Bigin':
        return (
          <ZohoBigin
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Google Sheet':
        return (
          <GoogleSheet
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Mail Chimp':
        return (
          <MailChimp
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Mail':
        return (
          <Mail
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'MailerPress':
        return (
          <MailerPress
            formFields={flow?.triggerData?.fields}
            setFlow={setFlow}
            flow={flow}
            allIntegURL={allIntegURL}
          />
        )
      case 'Mail Poet':
        return (
          <MailPoet
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'SendinBlue':
        return (
          <Sendinblue
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'WooCommerce':
        return (
          <WooCommerce
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'ActiveCampaign':
        return (
          <ActiveCampaign
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Web Hooks':
        return (
          <WebHooks
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Zapier':
        return (
          <Zapier
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Integromat':
        return (
          <Integromat
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Integrately':
        return (
          <Integrately
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Pabbly':
        return (
          <Pabbly
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'N8n':
        return (
          <N8n
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'SyncSpider':
        return (
          <SyncSpider
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'KonnectzIT':
        return (
          <KonnectzIT
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Ant Apps':
        return (
          <AntApps
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Pods':
        return (
          <Pods
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Zoho Flow':
        return (
          <ZohoFlow
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Telegram':
        return (
          <Telegram
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Fluent CRM':
        return (
          <FluentCrm
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Autonami':
        return (
          <Autonami
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Dropbox':
        return (
          <Dropbox
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Google Drive':
        return (
          <GoogleDrive
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Google Calendar':
        return (
          <GoogleCalendar
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Encharge':
        return (
          <Encharge
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'WP User Registration':
        return (
          <Registration
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Getgist':
        return (
          <Getgist
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'ElasticEmail':
        return (
          <ElasticEmail
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'WP Courseware':
        return (
          <WPCourseware
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Tutor Lms':
        return (
          <TutorLms
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'RestrictContent':
        return (
          <RestrictContent
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'WP Post Creation':
        return (
          <Post
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Slack':
        return (
          <Slack
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Trello':
        return (
          <Trello
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Mautic':
        return (
          <Mautic
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Keap':
        return (
          <Keap
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Hubspot':
        return (
          <Hubspot
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Freshdesk':
        return (
          <Freshdesk
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Zoho Desk':
        return (
          <ZohoDesk
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Sendy':
        return (
          <Sendy
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Zoom':
        return (
          <Zoom
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Zoom Webinar':
        return (
          <ZoomWebinar
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Fluent Support':
        return (
          <FluentSupport
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Bit Form':
        return (
          <BitForm
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Acumbamail':
        return (
          <Acumbamail
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Groundhogg':
        return (
          <Groundhogg
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'SendFox':
        return (
          <SendFox
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Twilio':
        return (
          <Twilio
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'MailerLite':
        return (
          <MailerLite
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Vbout':
        return (
          <Vbout
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'WhatsApp':
        return (
          <WhatsApp
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'LearnDash':
        return (
          <LearnDesh
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Affiliate':
        return (
          <Affiliate
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'BuddyBoss':
        return (
          <BuddyBoss
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'GamiPress':
        return (
          <GamiPress
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Google Contacts':
        return (
          <GoogleContacts
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Kirim Email':
        return (
          <KirimEmail
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Salesforce':
        return (
          <Salesforce
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Klaviyo':
        return (
          <Klaviyo
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Selzy':
        return (
          <Selzy
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'User Registration & Membership':
        return (
          <UserRegistrationMembership
            formFields={flow?.triggerData?.fields}
            allIntegURL={allIntegURL}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Mailercloud':
        return (
          <Mailercloud
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Moosend':
        return (
          <Moosend
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Memberpress':
        return (
          <Memberpress
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'GetResponse':
        return (
          <GetResponse
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'PaidMembershipPro':
        return (
          <PaidMembershipPro
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'MailBluster':
        return (
          <MailBluster
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'MailRelay':
        return (
          <MailRelay
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Mailup':
        return (
          <Mailup
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Notion':
        return (
          <Notion
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'ConstantContact':
        return (
          <ConstantContact
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'OmniSend':
        return (
          <OmniSend
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Mailjet':
        return (
          <Mailjet
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'SendGrid':
        return (
          <SendGrid
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Fabman':
        return (
          <Fabman
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'PCloud':
        return (
          <PCloud
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'EmailOctopus':
        return (
          <EmailOctopus
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'CustomAction':
        return (
          <CustomAction
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'PipeDrive':
        return (
          <PipeDrive
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Smaily':
        return (
          <Smaily
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'CustomApi':
        return (
          <CustomApi
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'SureCart':
        return (
          <SureCart
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Agiled CRM':
        return (
          <Agiled
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'ConvertKit':
      case 'Kit(ConvertKit)':
        return (
          <ConvertKit
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'BenchMark':
        return (
          <BenchMark
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'IFTTT':
        return (
          <IFTTT
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'DirectIq':
        return (
          <DirectIq
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'SendPulse':
        return (
          <SendPulse
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'GiveWp':
        return (
          <GiveWp
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Airtable':
        return (
          <Airtable
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Zoho Sheet':
        return (
          <ZohoSheet
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'LifterLms':
        return (
          <LifterLms
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'FreshSales':
        return (
          <FreshSales
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Insightly':
        return (
          <Insightly
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'CapsuleCRM':
        return (
          <CapsuleCRM
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'MasterStudyLms':
        return (
          <MasterStudyLms
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Zendesk':
        return (
          <Zendesk
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Asana':
        return (
          <Asana
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Propovoice CRM':
        return (
          <PropovoiceCrm
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Mail Mint':
        return (
          <MailMint
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Clickup':
        return (
          <Clickup
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'ClinchPad':
        return (
          <ClinchPad
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'CopperCRM':
        return (
          <CopperCRM
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Drip':
        return (
          <Drip
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Mailify':
        return (
          <Mailify
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Lemlist':
        return (
          <Lemlist
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'LionDesk':
        return (
          <LionDesk
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'CampaignMonitor':
        return (
          <CampaignMonitor
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Salesmate':
        return (
          <Salesmate
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'SuiteDash':
        return (
          <SuiteDash
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Gravitec':
        return (
          <Gravitec
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'CompanyHub':
        return (
          <CompanyHub
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Demio':
        return (
          <Demio
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Flowlu':
        return (
          <Flowlu
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Livestorm':
        return (
          <Livestorm
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Nimble':
        return (
          <Nimble
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Albato':
        return (
          <Albato
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'SperseIO':
        return (
          <SperseIO
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'FlowMattic':
        return (
          <FlowMattic
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'AutomatorWP':
        return (
          <AutomatorWP
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'UncannyAutomator':
        return (
          <UncannyAutomator
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'ThriveAutomator':
        return (
          <ThriveAutomator
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'WPWebhooks':
        return (
          <WPWebhooks
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'AdvancedFormIntegration':
        return (
          <AdvancedFormIntegration
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'PerfexCRM':
        return (
          <PerfexCRM
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'SureTriggers':
      case 'OttoKit (SureTriggers)':
        return (
          <SureTriggers
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'OneHashCRM':
        return (
          <OneHashCRM
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Salesflare':
        return (
          <Salesflare
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'AcademyLms':
        return (
          <AcademyLms
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'MoxieCRM':
        return (
          <MoxieCRM
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'WPFusion':
        return (
          <WPFusion
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Woodpecker':
        return (
          <Woodpecker
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'NutshellCRM':
        return (
          <NutshellCRM
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'SystemeIO':
        return (
          <SystemeIO
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Discord':
        return (
          <Discord
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'ZagoMail':
        return (
          <ZagoMail
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Newsletter':
        return (
          <Newsletter
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'SureMembers':
        return (
          <SureMembers
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Mailster':
        return (
          <Mailster
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'WPForo':
        return (
          <WPForo
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Dokan':
        return (
          <Dokan
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'JetEngine':
        return (
          <JetEngine
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'GoHighLevel':
        return (
          <HighLevel
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'The Events Calendar':
        return (
          <TheEventsCalendar
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'License Manager For WooCommerce':
        return (
          <LMFWC
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Voxel':
        return (
          <Voxel
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'SmartSuite':
        return (
          <SmartSuite
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Monday.Com':
        return (
          <MondayCom
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Bento':
        return (
          <Bento
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Line':
        return (
          <Line
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'ACPT':
        return (
          <ACPT
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Wishlist Member':
        return (
          <WishlistMember
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'CreatorLms':
        return (
          <CreatorLms
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Ultimate Affiliate Pro':
        return (
          <UltimateAffiliatePro
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'FluentCart':
        return (
          <FluentCart
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'WP ERP':
        return (
          <WpErp
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'PeepSo':
        return (
          <PeepSo
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Ninja Tables':
        return (
          <NinjaTables
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'WC Affiliate':
        return (
          <WCAffiliate
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'WPCafe':
        return (
          <WPCafe
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'NotificationX':
        return (
          <NotificationX
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'weDocs':
      case 'WeDocs':
        return (
          <WeDocs
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Asgaros Forum':
      case 'AsgarosForum':
        return (
          <AsgarosForum
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'Teams For WooCommerce Memberships':
        return (
          <TeamsForWooCommerceMemberships
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      case 'SeoPress':
        return (
          <SeoPress
            allIntegURL={allIntegURL}
            formFields={flow?.triggerData?.fields}
            flow={flow}
            setFlow={setFlow}
          />
        )
      default:
        return <></>
    }
  }

  let integrationName

  switch (integUrlName) {
    case 'SendinBlue':
      integrationName = 'Brevo(Sendinblue)'
      break
    case 'Integromat':
      integrationName = 'Make(Integromat)'
      break
    case 'Mailify':
      integrationName = 'Sarbacane(Mailify)'
      break
    case 'Zoho Marketing Hub':
      integrationName = 'Zoho Marketing Automation(Zoho Marketing Hub)'
      break
    case 'ConvertKit':
      integrationName = 'Kit(ConvertKit)'
      break
    case 'SureTriggers':
      integrationName = 'OttoKit (SureTriggers)'
      break

    default:
      integrationName = integUrlName
      break
  }

  const goBack = () => {
    const tmpFlow = { ...flow }
    delete tmpFlow.action
    setFlow(tmpFlow)
    navigate(-1)
  }

  return (
    <div>
      <div className="flx">
        <button type="button" className="f-left btn btcd-btn-o-gray" onClick={goBack}>
          <span className="btcd-icn icn-chevron-left" />
          &nbsp;{__('Back', 'bit-integrations')}
        </button>
        <div className="w-10 txt-center" style={{ marginRight: '73px' }}>
          <div className="mb-2">
            <b className="f-lg">{integrationName}</b>
          </div>
          <div>{__('Integration Settings', 'bit-integrations')}</div>
        </div>
      </div>

      <Suspense fallback={<Loader className="g-c" style={{ height: '82vh' }} />}>
        <NewIntegs />
      </Suspense>
    </div>
  )
}
