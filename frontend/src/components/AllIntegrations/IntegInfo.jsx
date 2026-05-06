/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/jsx-no-undef */
import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import useFetch from '../../hooks/useFetch'
import { __ } from '../../Utils/i18nwrap'
import SnackMsg from '../Utilities/SnackMsg'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../GlobalStates'

const Loader = lazy(() => import('../Loaders/Loader'))
const PaidMembershipProAuthorization = lazy(
  () => import('./PaidMembershipPro/PaidMembershipProAuthorization')
)
const ZohoCRMAuthorization = lazy(() => import('./ZohoCRM/ZohoCRMAuthorization'))
const DropboxAuthorization = lazy(() => import('./Dropbox/DropboxAuthorization'))
const OneDriveAuthorization = lazy(() => import('./OneDrive/OneDriveAuthorization'))
const GoogleDriveAuthorization = lazy(() => import('./GoogleDrive/GoogleDriveAuthorization'))
const GoogleCalendarAuthorization = lazy(() => import('./GoogleCalendar/GoogleCalendarAuthorization'))
const AutonamiAuthorization = lazy(() => import('./Autonami/AutonamiAuthorization'))
const RapidmailAuthorization = lazy(() => import('./Rapidmail/RapidmailAuthorization'))
const ZohoBiginAuthorization = lazy(() => import('./ZohoBigin/ZohoBiginAuthorization'))
const ZohoCampaignsAuthorization = lazy(() => import('./ZohoCampaigns/ZohoCampaignsAuthorization'))
const ZohoMarketingHubAuthorization = lazy(
  () => import('./ZohoMarketingHub/ZohoMarketingHubAuthorization')
)
const ZohoRecruitAuthorization = lazy(() => import('./ZohoRecruit/ZohoRecruitAuthorization'))
const GoogleSheetAuthorization = lazy(() => import('./GoogleSheet/GoogleSheetAuthorization'))
const MailChimpAuthorization = lazy(() => import('./MailChimp/MailChimpAuthorization'))
const MailPoetAuthorization = lazy(() => import('./MailPoet/MailPoetAuthorization'))
const MailerPressAuthorization = lazy(() => import('./MailerPress/MailerPressAuthorization'))
const SendinblueAuthorization = lazy(() => import('./SendinBlue/SendinBlueAuthorization'))
const WooCommerceAuthorization = lazy(() => import('./WooCommerce/WooCommerceAuthorization'))
const ActiveCampaignAuthorization = lazy(() => import('./ActiveCampaign/ActiveCampaignAuthorization'))
const ZohoFlowAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const WebHooksAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const ZapierAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const IFTTTAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const PabblyAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const N8nAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const SyncSpiderAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const KonnectzITAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const AntAppsAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const IntegromatAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const IntegratelyAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const TelegramAuthorization = lazy(() => import('./Telegram/TelegramAuthorization'))
const FluentCrmAuthorization = lazy(() => import('./FluentCRM/FluentCrmAuthorization'))
const EnchargeAuthorization = lazy(() => import('./Encharge/EnchargeAuthorization'))
const GetgistAuthorization = lazy(() => import('./Getgist/GetgistAuthorization'))
const ElasticEmailAuthorization = lazy(() => import('./ElasticEmail/ElasticEmailAuthorization'))
const WPCourseware = lazy(() => import('./WPCourseware/WPCoursewareAuthorization'))
const RestrictContentAuthorization = lazy(() => import('./RestrictContent/RestrictContentAuthorization'))
const Slack = lazy(() => import('./Slack/SlackAuthorization'))
const Trello = lazy(() => import('./Trello/TrelloAuthorization'))
const MauticAuthorization = lazy(() => import('./Mautic/MauticAuthorization'))
const HubspotAuthorization = lazy(() => import('./Hubspot/HubspotAuthorization'))
const ZohoDeskAuthorization = lazy(() => import('./ZohoDesk/ZohoDeskAuthorization'))
const SendyAuthorization = lazy(() => import('./Sendy/SendyAuthorization'))
const KeapAuthorization = lazy(() => import('./Keap/KeapAuthorization'))
const ZoomAuthorization = lazy(() => import('./Zoom/ZoomAuthorization'))
const FluentSupportAuthorization = lazy(() => import('./FluentSupport/FluentSupportAuthorization'))
const ZoomWebinarAuthorization = lazy(() => import('./ZoomWebinar/ZoomWebinarAuthorization'))
const BitFormAuthorization = lazy(() => import('./BitForm/BitFormAuthorization'))
const AcumbamailAuthorization = lazy(() => import('./Acumbamail/AcumbamailAuthorization'))
const GroundhoggAuthorization = lazy(() => import('./Groundhogg/GroundhoggAuthorization'))
const SendFoxAuthorization = lazy(() => import('./SendFox/SendFoxAuthorization'))
const TwilioAuthorization = lazy(() => import('./Twilio/TwilioAuthorization'))
const MailerLiteAuthorization = lazy(() => import('./MailerLite/MailerLiteAuthorization'))
const VboutAuthorization = lazy(() => import('./Vbout/VboutAuthorization'))
const FreshdeskAuthorization = lazy(() => import('./Freshdesk/FreshdeskAuthorization'))
const GoogleContactsAuthorization = lazy(() => import('./GoogleContacts/GoogleContactsAuthorization'))
const KirimEmailAuthorization = lazy(() => import('./KirimEmail/KirimEmailAuthorization'))
const SalesforceAuthorization = lazy(() => import('./Salesforce/SalesforceAuthorization'))
const KlaviyoAuthorization = lazy(() => import('./Klaviyo/KlaviyoAuthorization'))
const SelzyAuthorization = lazy(() => import('./Selzy/SelzyAuthorization'))
const ConstantContactAuthorization = lazy(() => import('./ConstantContact/ConstantContactAuthorization'))
const OmniSendAuthorization = lazy(() => import('./OmniSend/OmniSendAuthorization'))
const PipeDriveAuthorization = lazy(() => import('./PipeDrive/PipeDriveAuthorization'))
const MailercloudAuthorization = lazy(() => import('./Mailercloud/MailercloudAuthorization'))
const MoosendAuthorization = lazy(() => import('./Moosend/MoosendAuthorization'))
const MemberpressAuthorization = lazy(() => import('./Memberpress/MemberpressAuthorization'))
const GetResponseAuthentication = lazy(() => import('./GetResponse/GetResponseAuthorization'))
const MailBlusterAuthentication = lazy(() => import('./MailBluster/MailBlusterAuthorization'))
const MailRelayAuthentication = lazy(() => import('./MailRelay/MailRelayAuthorization'))
const MailupAuthentication = lazy(() => import('./Mailup/MailupAuthorization'))
const NotionAuthorization = lazy(() => import('./Notion/NotionAuthorization'))
const MailjetAuthorization = lazy(() => import('./Mailjet/MailjetAuthorization'))
const SendGridAuthorization = lazy(() => import('./SendGrid/SendGridAuthorization'))
const FabmanAuthorization = lazy(() => import('./Fabman/FabmanAuthorization'))
const PCloudAuthorization = lazy(() => import('./PCloud/PCloudAuthorization'))
const EmailOctopusAuthorization = lazy(() => import('./EmailOctopus/EmailOctopusAuthorization'))
const CustomAction = lazy(() => import('./CustomAction/CustomFuncEditor'))
const SmailyAuthentication = lazy(() => import('./Smaily/SmailyAuthorization'))
const SureCartAuthorization = lazy(() => import('./SureCart/SureCartAuthorization'))
const AgiledAuthorization = lazy(() => import('./AgiledCRM/AgiledAuthorization'))
const ConvertKitAuthorization = lazy(() => import('./ConvertKit/ConvertKitAuthorization'))
const BenchMarkAuthorization = lazy(() => import('./BenchMark/BenchMarkAuthorization'))
const DirectIqAuthorization = lazy(() => import('./DirectIq/DirectIqAuthorization'))
const SendPulseAuthorization = lazy(() => import('./SendPulse/SendPulseAuthorization'))
const GiveWpAuthorization = lazy(() => import('./GiveWp/GiveWpAuthorization'))
const AirtableAuthorization = lazy(() => import('./Airtable/AirtableAuthorization'))
const ZohoSheetAuthorization = lazy(() => import('./ZohoSheet/ZohoSheetAuthorization'))
const FreshSalesAuthorization = lazy(() => import('./FreshSales/FreshSalesAuthorization'))
const InsightlyAuthorization = lazy(() => import('./Insightly/InsightlyAuthorization'))
const CapsuleCRMAuthorization = lazy(() => import('./CapsuleCRM/CapsuleCRMAuthorization'))
const MasterStudyLmsAuthorization = lazy(() => import('./MasterStudyLms/MasterStudyLmsAuthorization'))
const ZendeskAuthorization = lazy(() => import('./Zendesk/ZendeskAuthorization'))
const AsanaAuthorization = lazy(() => import('./Asana/AsanaAuthorization'))
const PropovoiceCrmAuthorization = lazy(() => import('./PropovoiceCRM/PropovoiceCrmAuthorization'))
const MailMintAuthorization = lazy(() => import('./MailMint/MailMintAuthorization'))
const ClickupAuthorization = lazy(() => import('./Clickup/ClickupAuthorization'))
const ClinchPadAuthorization = lazy(() => import('./ClinchPad/ClinchPadAuthorization'))
const CopperCRMAuthorization = lazy(() => import('./CopperCRM/CopperCRMAuthorization'))
const DripAuthorization = lazy(() => import('./Drip/DripAuthorization'))
const MailifyAuthorization = lazy(() => import('./Mailify/MailifyAuthorization'))
const LemlistAuthorization = lazy(() => import('./Lemlist/LemlistAuthorization'))
const LionDeskAuthorization = lazy(() => import('./LionDesk/LionDeskAuthorization'))
const CampaignMonitorAuthorization = lazy(() => import('./CampaignMonitor/CampaignMonitorAuthorization'))
const SalesmateAuthorization = lazy(() => import('./Salesmate/SalesmateAuthorization'))
const SuiteDashAuthorization = lazy(() => import('./SuiteDash/SuiteDashAuthorization'))
const GravitecAuthorization = lazy(() => import('./Gravitec/GravitecAuthorization'))
const CompanyHubAuthorization = lazy(() => import('./CompanyHub/CompanyHubAuthorization'))
const DemioAuthorization = lazy(() => import('./Demio/DemioAuthorization'))
const FlowluAuthorization = lazy(() => import('./Flowlu/FlowluAuthorization'))
const LivestormAuthorization = lazy(() => import('./Livestorm/LivestormAuthorization'))
const NimbleAuthorization = lazy(() => import('./Nimble/NimbleAuthorization'))
const AlbatoAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const SperseIOAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const FlowMatticAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const AutomatorWPAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const UncannyAutomatorAuthorization = lazy(
  () => import('./IntegrationHelpers/WebHook/WebHooksIntegration')
)
const ThriveAutomatorAuthorization = lazy(
  () => import('./IntegrationHelpers/WebHook/WebHooksIntegration')
)
const WPWebhooksAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const AdvancedFormIntegrationAuthorization = lazy(
  () => import('./IntegrationHelpers/WebHook/WebHooksIntegration')
)
const PerfexCRMAuthorization = lazy(() => import('./PerfexCRM/PerfexCRMAuthorization'))
const SureTriggersAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const OneHashCRMAuthorization = lazy(() => import('./OneHashCRM/OneHashCRMAuthorization'))
const SalesflareAuthorization = lazy(() => import('./Salesflare/SalesflareAuthorization'))
const AcademyLmsAuthorization = lazy(() => import('./AcademyLms/AcademyLmsAuthorization'))
const MoxieCRMAuthorization = lazy(() => import('./MoxieCRM/MoxieCRMAuthorization'))
const WPFusionAuthorization = lazy(() => import('./IntegrationHelpers/WebHook/WebHooksIntegration'))
const WoodpeckerAuthorization = lazy(() => import('./Woodpecker/WoodpeckerAuthorization'))
const NutshellCRMAuthorization = lazy(() => import('./NutshellCRM/NutshellCRMAuthorization'))
const SystemeIOAuthorization = lazy(() => import('./SystemeIO/SystemeIOAuthorization'))
const DiscordAuthorization = lazy(() => import('./Discord/DiscordAuthorization'))
const ZagoMailAuthorization = lazy(() => import('./ZagoMail/ZagoMailAuthorization'))
const WhatsAppAuthorization = lazy(() => import('./WhatsApp/WhatsAppAuthorization'))
const NewsletterAuthorization = lazy(() => import('./Newsletter/NewsletterAuthorization'))
const SureMembersAuthorization = lazy(() => import('./SureMembers/SureMembersAuthorization'))
const MailsterAuthentication = lazy(() => import('./Mailster/MailsterAuthorization'))
const WPForoAuthorization = lazy(() => import('./WPForo/WPForoAuthorization'))
const DokanAuthorization = lazy(() => import('./Dokan/DokanAuthorization'))
const JetEngineAuthorization = lazy(() => import('./JetEngine/JetEngineAuthorization'))
const HighLevelAuthorization = lazy(() => import('./HighLevel/HighLevelAuthorization'))
const TheEventsCalendarAuthorization = lazy(
  () => import('./TheEventsCalendar/TheEventsCalendarAuthorization')
)
const LMFWCAuthorization = lazy(() => import('./LMFWC/LMFWCAuthorization'))
const VoxelAuthorization = lazy(() => import('./Voxel/VoxelAuthorization'))
const SmartSuiteAuthorization = lazy(() => import('./SmartSuite/SmartSuiteAuthorization'))
const MondayComAuthorization = lazy(() => import('./MondayCom/MondayComAuthorization'))
const BentoAuthorization = lazy(() => import('./Bento/BentoAuthorization'))
const LineAuthorization = lazy(() => import('./Line/LineAuthorization'))
const ACPTAuthorization = lazy(() => import('./ACPT/ACPTAuthorization'))
const WishlistMemberAuthorization = lazy(() => import('./WishlistMember/WishlistMemberAuthorization'))
const CreatorLmsAuthorization = lazy(() => import('./CreatorLms/CreatorLmsAuthorization'))
const UltimateAffiliateProAuthorization = lazy(
  () => import('./UltimateAffiliatePro/UltimateAffiliateProAuthorization')
)
const FluentCartAuthorization = lazy(() => import('./FluentCart/FluentCartAuthorization'))
const WpErpAuthorization = lazy(() => import('./WpErp/WpErpAuthorization'))
const PeepSoAuthorization = lazy(() => import('./PeepSo/PeepSoAuthorization'))
const NinjaTablesAuthorization = lazy(() => import('./NinjaTables/NinjaTablesAuthorization'))
const WCAffiliateAuthorization = lazy(() => import('./WCAffiliate/WCAffiliateAuthorization'))
const WPCafeAuthorization = lazy(() => import('./WPCafe/WPCafeAuthorization'))
const TeamsForWooCommerceMembershipsAuthorization = lazy(
  () => import('./TeamsForWooCommerceMemberships/TeamsForWooCommerceMembershipsAuthorization')
)
const SeoPressAuthorization = lazy(() => import('./SeoPress/SeoPressAuthorization'))
const NotificationXAuthorization = lazy(() => import('./NotificationX/NotificationXAuthorization'))
const WeDocsAuthorization = lazy(() => import('./WeDocs/WeDocsAuthorization'))
const AsgarosForumAuthorization = lazy(() => import('./AsgarosForum/AsgarosForumAuthorization'))
const UserRegistrationMembershipAuthorization = lazy(
  () => import('./UserRegistrationMembership/UserRegistrationMembershipAuthorization')
)

export default function IntegInfo() {
  const { id, type } = useParams()
  const btcbi = useRecoilValue($appConfigState)
  const [snack, setSnackbar] = useState({ show: false })
  const [integrationConf, setIntegrationConf] = useState({})
  const { data, isLoading, isError } = useFetch({
    payload: { id },
    action: 'flow/get',
    method: 'post'
  })

  useEffect(() => {
    if (!isError && !isLoading) {
      if (data?.success) {
        setIntegrationConf(data?.data?.integration.flow_details)
      } else {
        setSnackbar({
          ...{
            show: true,
            msg: __('Failed to integration info', 'bit-integrations')
          }
        })
      }
    }
  }, [data])

  // route is info/:id but for redirect uri need to make new/:type
  // let location = window.location.toString()
  // const toReplaceInd = location.indexOf('/info')
  // location = window.encodeURI(`${location.slice(0, toReplaceInd)}/new/${type}`)
  let location = `${btcbi.api}/redirect`

  const IntegrationInfo = () => {
    switch (integrationConf.type) {
      case 'Zoho CRM':
        return (
          <ZohoCRMAuthorization crmConf={integrationConf} step={1} redirectLocation={location} isInfo />
        )
      case 'Autonami':
        return <AutonamiAuthorization autonamiConf={integrationConf} step={1} isInfo />
      case 'Dropbox':
        return <DropboxAuthorization dropboxConf={integrationConf} step={1} isInfo />
      case 'OneDrive':
        return <OneDriveAuthorization oneDriveConf={integrationConf} step={1} isInfo />
      case 'Google Sheet':
        return (
          <GoogleSheetAuthorization
            sheetConf={integrationConf}
            step={1}
            redirectLocation={location}
            isInfo
          />
        )
      case 'Google Drive':
        return (
          <GoogleDriveAuthorization
            googleDriveConf={integrationConf}
            step={1}
            redirectLocation={location}
            isInfo
          />
        )
      case 'Google Calendar':
        return (
          <GoogleCalendarAuthorization
            googleCalendarConf={integrationConf}
            step={1}
            redirectLocation={location}
            isInfo
          />
        )
      case 'Rapidmail':
        return <RapidmailAuthorization rapidmailConf={integrationConf} step={1} isInfo />
      case 'Zoho Recruit':
        return (
          <ZohoRecruitAuthorization
            recruitConf={integrationConf}
            step={1}
            redirectLocation={location}
            isInfo
          />
        )
      case 'Zoho Campaigns':
        return (
          <ZohoCampaignsAuthorization
            campaignsConf={integrationConf}
            step={1}
            redirectLocation={location}
            isInfo
          />
        )
      case 'Zoho Marketing Hub':
      case 'Zoho Marketing Automation(Zoho Marketing Hub)':
        return (
          <ZohoMarketingHubAuthorization
            marketingHubConf={integrationConf}
            step={1}
            redirectLocation={location}
            isInfo
          />
        )
      case 'User Registration & Membership':
        return (
          <UserRegistrationMembershipAuthorization
            userRegistrationConf={integrationConf}
            step={1}
            isInfo
          />
        )
      case 'Zoho Bigin':
        return (
          <ZohoBiginAuthorization
            biginConf={integrationConf}
            step={1}
            redirectLocation={location}
            isInfo
          />
        )
      case 'Mail Chimp':
        return (
          <MailChimpAuthorization
            mailChimpConf={integrationConf}
            step={1}
            redirectLocation={location}
            isInfo
          />
        )
      case 'Mail Poet':
        return <MailPoetAuthorization mailPoetConf={integrationConf} step={1} isInfo />
      case 'MailerPress':
        return <MailerPressAuthorization mailerPressConf={integrationConf} step={1} isInfo />
      case 'SendinBlue':
      case 'Brevo(Sendinblue)':
        return <SendinblueAuthorization sendinBlueConf={integrationConf} step={1} isInfo />
      case 'WooCommerce':
        return <WooCommerceAuthorization wcConf={integrationConf} step={1} isInfo />
      case 'ActiveCampaign':
        return <ActiveCampaignAuthorization activeCampaingConf={integrationConf} step={1} isInfo />
      case 'Web Hooks':
        return <WebHooksAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'Zapier':
        return <ZapierAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'IFTTT':
        return <IFTTTAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'Integromat':
      case 'Make(Integromat)':
        return <IntegromatAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'Integrately':
        return <IntegratelyAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'Pabbly':
        return <PabblyAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'N8n':
        return <N8nAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'SyncSpider':
        return <SyncSpiderAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'KonnectzIT':
        return <KonnectzITAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'Ants & Apps':
        return <AntAppsAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'Zoho Flow':
        return (
          <ZohoFlowAuthorization
            webHooks={integrationConf}
            redirectLocation={location}
            step={1}
            isInfo
          />
        )
      case 'Telegram':
        return <TelegramAuthorization telegramConf={integrationConf} step={1} isInfo />
      case 'Fluent CRM':
        return <FluentCrmAuthorization fluentCrmConf={integrationConf} step={1} isInfo />
      case 'Encharge':
        return <EnchargeAuthorization enchargeConf={integrationConf} step={1} isInfo />
      case 'Getgist':
        return <GetgistAuthorization getgistConf={integrationConf} step={1} isInfo />
      case 'ElasticEmail':
        return <ElasticEmailAuthorization elasticEmailConf={integrationConf} step={1} isInfo />
      case 'WP Courseware':
        return <WPCourseware autonamiConf={integrationConf} step={1} isInfo />
      case 'RestrictContent':
        return <RestrictContentAuthorization restrictConf={integrationConf} step={1} isInfo />
      case 'Mautic':
        return <MauticAuthorization mauticConf={integrationConf} step={1} isInfo />
      case 'Slack':
        return <Slack slackConf={integrationConf} step={1} isInfo />
      case 'Trello':
        return <Trello trelloConf={integrationConf} step={1} isInfo />
      case 'Hubspot':
        return <HubspotAuthorization hubspotConf={integrationConf} step={1} isInfo />
      case 'Zoho Desk':
        return (
          <ZohoDeskAuthorization
            deskConf={integrationConf}
            redirectLocation={location}
            step={1}
            isInfo
          />
        )
      case 'Sendy':
        return <SendyAuthorization deskConf={integrationConf} step={1} isInfo />
      case 'Keap':
        return <KeapAuthorization keapConf={integrationConf} step={1} isInfo />
      case 'Zoom':
        return <ZoomAuthorization zoomConf={integrationConf} step={1} isInfo />
      case 'Fluent Support':
        return <FluentSupportAuthorization fluentSupportConf={integrationConf} step={1} isInfo />
      case 'Zoom Webinar':
        return <ZoomWebinarAuthorization zoomWebinarConf={integrationConf} step={1} isInfo />
      case 'Bit Form':
        return <BitFormAuthorization bitFormConf={integrationConf} step={1} isInfo />
      case 'Acumbamail':
        return <AcumbamailAuthorization acumbamailConf={integrationConf} step={1} isInfo />
      case 'Groundhogg':
        return <GroundhoggAuthorization groundhoggConf={integrationConf} step={1} isInfo />
      case 'SendFox':
        return <SendFoxAuthorization sendFoxConf={integrationConf} step={1} isInfo />
      case 'Twilio':
        return <TwilioAuthorization twilioConf={integrationConf} step={1} isInfo />
      case 'MailerLite':
        return <MailerLiteAuthorization mailerLiteConf={integrationConf} step={1} isInfo />
      case 'Vbout':
        return <VboutAuthorization vboutConf={integrationConf} step={1} isInfo />
      case 'Freshdesk':
        return <FreshdeskAuthorization freshdeskConf={integrationConf} step={1} isInfo />
      case 'Google Contacts':
        return <GoogleContactsAuthorization googleContactsConf={integrationConf} step={1} isInfo />
      case 'Kirim Email':
        return <KirimEmailAuthorization kirimEmailConf={integrationConf} step={1} isInfo />
      case 'Salesforce':
        return (
          <SalesforceAuthorization
            salesforceConf={integrationConf}
            step={1}
            redirectLocation={location}
            isInfo
          />
        )
      case 'Klaviyo':
        return <KlaviyoAuthorization klaviyoConf={integrationConf} step={1} isInfo />
      case 'Selzy':
        return <SelzyAuthorization selzyConf={integrationConf} step={1} isInfo />
      case 'Mailercloud':
        return <MailercloudAuthorization mailercloudConf={integrationConf} step={1} isInfo />
      case 'Moosend':
        return <MoosendAuthorization moosendConf={integrationConf} step={1} isInfo />
      case 'Memberpress':
        return <MemberpressAuthorization memberpressConf={integrationConf} step={1} isInfo />
      case 'GetResponse':
        return <GetResponseAuthentication getResponseConf={integrationConf} step={1} isInfo />
      case 'PaidMembershipPro':
        return <PaidMembershipProAuthorization paidMembershipProConf={integrationConf} step={1} isInfo />
      case 'MailBluster':
        return <MailBlusterAuthentication mailBlusterConf={integrationConf} step={1} isInfo />
      case 'MailRelay':
        return <MailRelayAuthentication mailRelayConf={integrationConf} step={1} isInfo />
      case 'Mailup':
        return <MailupAuthentication mailupConf={integrationConf} step={1} isInfo />
      case 'Notion':
        return <NotionAuthorization notionConf={integrationConf} step={1} isInfo />
      case 'ConstantContact':
        return <ConstantContactAuthorization constantContactConf={integrationConf} step={1} isInfo />
      case 'OmniSend':
        return <OmniSendAuthorization omniSendConf={integrationConf} step={1} isInfo />
      case 'Mailjet':
        return <MailjetAuthorization mailjetConf={integrationConf} step={1} isInfo />
      case 'SendGrid':
        return <SendGridAuthorization sendGridConf={integrationConf} step={1} isInfo />
      case 'Fabman':
        return <FabmanAuthorization fabmanConf={integrationConf} step={1} isInfo />
      case 'PCloud':
        return <PCloudAuthorization pCloudConf={integrationConf} step={1} isInfo />
      case 'EmailOctopus':
        return <EmailOctopusAuthorization emailOctopusConf={integrationConf} step={1} isInfo />
      case 'CustomAction':
        return <CustomAction customActionConf={integrationConf} step={1} isInfo />
      case 'PipeDrive':
        return <PipeDriveAuthorization pipeDriveConf={integrationConf} step={1} isInfo />
      case 'Smaily':
        return <SmailyAuthentication smailyConf={integrationConf} step={1} isInfo />
      case 'SureCart':
        return <SureCartAuthorization sureCartConf={integrationConf} step={1} isInfo />
      case 'Agiled CRM':
        return <AgiledAuthorization agiledConf={integrationConf} step={1} isInfo />
      case 'ConvertKit':
      case 'Kit(ConvertKit)':
        return <ConvertKitAuthorization convertKitConf={integrationConf} step={1} isInfo />
      case 'BenchMark':
        return <BenchMarkAuthorization benchMarkConf={integrationConf} step={1} isInfo />
      case 'DirectIq':
        return <DirectIqAuthorization directIqConf={integrationConf} step={1} isInfo />
      case 'SendPulse':
        return (
          <SendPulseAuthorization
            sendPulseConf={integrationConf}
            step={1}
            redirectLocation={location}
            isInfo
          />
        )
      case 'GiveWp':
        return <GiveWpAuthorization giveWpConf={integrationConf} step={1} isInfo />
      case 'Airtable':
        return <AirtableAuthorization airtableConf={integrationConf} step={1} isInfo />
      case 'Zoho Sheet':
        return (
          <ZohoSheetAuthorization
            zohoSheetConf={integrationConf}
            redirectLocation={location}
            step={1}
            isInfo
          />
        )
      case 'FreshSales':
        return <FreshSalesAuthorization freshSalesConf={integrationConf} step={1} isInfo />
      case 'Insightly':
        return <InsightlyAuthorization insightlyConf={integrationConf} step={1} isInfo />
      case 'CapsuleCRM':
        return <CapsuleCRMAuthorization capsuleCRMConf={integrationConf} step={1} isInfo />
      case 'MasterStudyLms':
        return <MasterStudyLmsAuthorization msLmsConf={integrationConf} step={1} isInfo />
      case 'Zendesk':
        return <ZendeskAuthorization zendeskConf={integrationConf} step={1} isInfo />
      case 'Asana':
        return <AsanaAuthorization asanaConf={integrationConf} step={1} isInfo />
      case 'Propovoice CRM':
        return <PropovoiceCrmAuthorization propovoiceCrmConf={integrationConf} step={1} isInfo />
      case 'Mail Mint':
        return <MailMintAuthorization mailMintConf={integrationConf} step={1} isInfo />
      case 'Clickup':
        return <ClickupAuthorization clickupConf={integrationConf} step={1} isInfo />
      case 'ClinchPad':
        return <ClinchPadAuthorization clinchPadConf={integrationConf} step={1} isInfo />
      case 'CopperCRM':
        return <CopperCRMAuthorization copperCRMConf={integrationConf} step={1} isInfo />
      case 'Drip':
        return <DripAuthorization dripConf={integrationConf} step={1} isInfo />
      case 'Mailify':
      case 'Sarbacane(Mailify)':
        return <MailifyAuthorization mailifyConf={integrationConf} step={1} isInfo />
      case 'Lemlist':
        return <LemlistAuthorization lemlistConf={integrationConf} step={1} isInfo />
      case 'LionDesk':
        return <LionDeskAuthorization lionDeskConf={integrationConf} step={1} isInfo />
      case 'CampaignMonitor':
        return <CampaignMonitorAuthorization campaignMonitorConf={integrationConf} step={1} isInfo />
      case 'Salesmate':
        return <SalesmateAuthorization salesmateConf={integrationConf} step={1} isInfo />
      case 'SuiteDash':
        return <SuiteDashAuthorization suiteDashConf={integrationConf} step={1} isInfo />
      case 'Gravitec':
        return <GravitecAuthorization gravitecConf={integrationConf} step={1} isInfo />
      case 'CompanyHub':
        return <CompanyHubAuthorization companyHubConf={integrationConf} step={1} isInfo />
      case 'Demio':
        return <DemioAuthorization demioConf={integrationConf} step={1} isInfo />
      case 'Flowlu':
        return <FlowluAuthorization flowluConf={integrationConf} step={1} isInfo />
      case 'Livestorm':
        return <LivestormAuthorization livestormConf={integrationConf} step={1} isInfo />
      case 'Nimble':
        return <NimbleAuthorization nimbleConf={integrationConf} step={1} isInfo />
      case 'Albato':
        return <AlbatoAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'SperseIO':
        return <SperseIOAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'FlowMattic':
        return <FlowMatticAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'AutomatorWP':
        return <AutomatorWPAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'UncannyAutomator':
        return <UncannyAutomatorAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'ThriveAutomator':
        return <ThriveAutomatorAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'WPWebhooks':
        return <WPWebhooksAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'AdvancedFormIntegration':
        return <AdvancedFormIntegrationAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'PerfexCRM':
        return <PerfexCRMAuthorization perfexCRMConf={integrationConf} step={1} isInfo />
      case 'SureTriggers':
      case 'OttoKit (SureTriggers)':
        return <SureTriggersAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'OneHashCRM':
        return <OneHashCRMAuthorization oneHashCRMConf={integrationConf} step={1} isInfo />
      case 'Salesflare':
        return <SalesflareAuthorization salesflareConf={integrationConf} step={1} isInfo />
      case 'Academy Lms':
        return <AcademyLmsAuthorization academyLmsConf={integrationConf} step={1} isInfo />
      case 'MoxieCRM':
        return <MoxieCRMAuthorization moxiecrmConf={integrationConf} step={1} isInfo />
      case 'WPFusion':
        return <WPFusionAuthorization webHooks={integrationConf} step={1} isInfo />
      case 'Woodpecker':
        return <WoodpeckerAuthorization woodpeckerConf={integrationConf} step={1} isInfo />
      case 'NutshellCRM':
        return <NutshellCRMAuthorization nutshellCRMConf={integrationConf} step={1} isInfo />
      case 'SystemeIO':
        return <SystemeIOAuthorization systemeIOConf={integrationConf} step={1} isInfo />
      case 'Discord':
        return <DiscordAuthorization discordConf={integrationConf} step={1} isInfo />
      case 'ZagoMail':
        return <ZagoMailAuthorization zagoMailConf={integrationConf} step={1} isInfo />
      case 'WhatsApp':
        return <WhatsAppAuthorization whatsAppConf={integrationConf} step={1} isInfo />
      case 'Newsletter':
        return <NewsletterAuthorization newsletterConf={integrationConf} step={1} isInfo />
      case 'SureMembers':
        return <SureMembersAuthorization sureMembersConf={integrationConf} step={1} isInfo />
      case 'Mailster':
        return <MailsterAuthentication mailsterConf={integrationConf} step={1} isInfo />
      case 'WPForo':
        return <WPForoAuthorization wpforoConf={integrationConf} step={1} isInfo />
      case 'Dokan':
        return <DokanAuthorization dokanConf={integrationConf} step={1} isInfo />
      case 'JetEngine':
        return <JetEngineAuthorization jetEngineConf={integrationConf} step={1} isInfo />
      case 'GoHighLevel':
        return <HighLevelAuthorization highLevelConf={integrationConf} step={1} isInfo />
      case 'The Events Calendar':
        return <TheEventsCalendarAuthorization theEventsCalendarConf={integrationConf} step={1} isInfo />
      case 'License Manager For WooCommerce':
        return <LMFWCAuthorization licenseManagerConf={integrationConf} step={1} isInfo />
      case 'Voxel':
        return <VoxelAuthorization voxelConf={integrationConf} step={1} isInfo />
      case 'SmartSuite':
        return <SmartSuiteAuthorization smartSuiteConf={integrationConf} step={1} isInfo />
      case 'Monday.Com':
        return <MondayComAuthorization mondayComConf={integrationConf} step={1} isInfo />
      case 'Bento':
        return <BentoAuthorization bentoConf={integrationConf} step={1} isInfo />
      case 'Line':
        return <LineAuthorization lineConf={integrationConf} step={1} isInfo />
      case 'ACPT':
        return <ACPTAuthorization acptConf={integrationConf} step={1} isInfo />
      case 'WishlistMember':
        return <WishlistMemberAuthorization wishlistMemberConf={integrationConf} step={1} isInfo />
      case 'CreatorLms':
        return <CreatorLmsAuthorization creatorLmsConf={integrationConf} step={1} isInfo />
      case 'Ultimate Affiliate Pro':
        return (
          <UltimateAffiliateProAuthorization
            ultimateAffiliateProConf={integrationConf}
            step={1}
            isInfo
          />
        )
      case 'FluentCart':
        return <FluentCartAuthorization fluentCartConf={integrationConf} step={1} isInfo />
      case 'WP ERP':
        return <WpErpAuthorization wpErpConf={integrationConf} step={1} isInfo />
      case 'PeepSo':
        return <PeepSoAuthorization peepSoConf={integrationConf} step={1} isInfo />
      case 'Ninja Tables':
        return <NinjaTablesAuthorization ninjaTablesConf={integrationConf} step={1} isInfo />
      case 'WC Affiliate':
        return <WCAffiliateAuthorization wcAffiliateConf={integrationConf} step={1} isInfo />
      case 'WPCafe':
        return <WPCafeAuthorization wpcafeConf={integrationConf} step={1} isInfo />
      case 'Teams For WooCommerce Memberships':
        return (
          <TeamsForWooCommerceMembershipsAuthorization
            teamsForWcConf={integrationConf}
            step={1}
            isInfo
          />
        )
      case 'SeoPress':
        return <SeoPressAuthorization seoPressConf={integrationConf} step={1} isInfo />
      case 'NotificationX':
        return <NotificationXAuthorization notificationXConf={integrationConf} step={1} isInfo />
      case 'weDocs':
      case 'WeDocs':
        return <WeDocsAuthorization weDocsConf={integrationConf} step={1} isInfo />
      case 'Asgaros Forum':
      case 'AsgarosForum':
        return <AsgarosForumAuthorization asgarosForumConf={integrationConf} step={1} isInfo />
      default:
        return <></>
    }
  }

  return (
    <>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="flx">
        <Link to="/" className="btn btcd-btn-o-gray">
          <span className="btcd-icn icn-chevron-left" />
          &nbsp;{__('Back', 'bit-integrations')}
        </Link>
        <div className="w-10 txt-center" style={{ marginRight: '73px' }}>
          <b className="f-lg">{type}</b>
          <div>{__('Integration Info', 'bit-integrations')}</div>
        </div>
      </div>

      <Suspense fallback={<Loader className="g-c" style={{ height: '82vh' }} />}>
        <IntegrationInfo />
      </Suspense>
    </>
  )
}
