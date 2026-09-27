<?php

declare(strict_types=1);

namespace BitApps\Restructure\Cli;

use InvalidArgumentException;

final class Batches
{
    private const FREE = [
        'F1'  => 'MailChimp,FluentCrm,Asana,GiveWp,WpErp',
        'F2'  => 'Autonami,Mailster,Memberpress,Newsletter,PaidMembershipPro,RestrictContent,SliceWp,SureCart,SureMembers,TheEventsCalendar,WPCourseware,Airtable,BenchMark,CampaignMonitor,Clickup,CompanyHub,Demio,DirectIq,ElasticEmail,EmailOctopus,Encharge,Flowlu,Getgist,Gravitec,Lemlist,Livestorm,MailBluster,MailRelay,Mailercloud,Mailify,Mailjet,MoxieCRM,OneHashCRM,PerfexCRM,Salesflare,SendFox,SendGrid,Sendy,Smaily,SuiteDash,SystemeIO,Vbout,Woodpecker',
        'F3'  => 'AsgarosForum,B2BKing,BadgeOS,BookingCalendar,BookingPress,Bookly,CartAbandonmentRecovery,ClickWhale,ConvertForce,CreatorLms,EventsManager,FluentSupport,FormyChat,IvyForms,LatePoint,MailPoet,MainWP,ModernCart,MoreConvertWishlist,NextCrm,NotificationX,PeepSo,Pointics,PopupMaker,PowerCoupons,ProfilePress,SenseiLMS,SeoPress,SureDash,TeamsForWooCommerceMemberships,UltimateAffiliatePro,WCAffiliate,WPCafe,WeDocs,WpDataTables,WpTableBuilder,Wsms,BrilliantDirectories,HefflCRM,Instasent,Klaviyo,MondayCom,Sender,SmartSuite,WhatsApp',
        'F4'  => 'ActiveCampaign,Acumbamail,AgiledCRM,BitForm,CapsuleCRM,ConvertKit,CopperCRM,Drip,Groundhogg,Insightly,Notion,NutshellCRM,Selzy,SendinBlue,ZagoMail,Zendesk,Affiliate,GamiPress,LifterLms,MailMint,WPForo',
        'F5'  => 'FreshSales,GetResponse,HighLevel,LMFWC,Line,MailerLite,OmniSend,SureContact,Dokan,FluentCart,FluentPlayer,JetEngine,MailerPress,SecureCustomFields,WishlistMember,WordPress',
        'F6'  => 'ConstantContact,Dropbox,GoogleCalendar,GoogleContacts,GoogleDrive,GoogleSheet,Keap,LionDesk,Mailup,Mautic,OneDrive,PCloud,Rapidmail,Twilio,SendPulse,ZohoBigin,ZohoCampaigns,ZohoDesk,ZohoMarketingHub,ZohoSheet,Zoom,ZoomWebinar',
        'F7'  => 'WebHooks,CustomApi,AdvancedFormIntegration,Albato,AntApps,AutomatorWP,FlowMattic,Integrately,Integromat,KonnectzIT,N8n,Pabbly,SperseIO,SureTriggers,SyncSpider,ThriveAutomator,UncannyAutomator,WPFusion,WPWebhooks,Zapier,ZohoFlow',
        'F8'  => 'Mail,LearnDash,PostCreation,Registration,Pods,AcademyLms,TutorLms,CustomAction,Fabman',
        'F9'  => 'ZohoCRM,ZohoRecruit,Freshdesk,Discord,Slack,Telegram,PropovoiceCRM,Hubspot,ACPT,Bento,MasterStudyLms,Voxel,WooCommerce,BuddyBoss,KirimEmail,ZendeskSupport,NinjaTables,UserRegistrationMembership,WebbaBooking,PipeDrive,Trello,ClinchPad,Nimble,Salesmate,BitCrm',
        'F10' => 'Salesforce,Moosend',
    ];

    /**
     * @return list<string>
     */
    public static function folders(string $batch): array
    {
        $key = strtoupper($batch);

        if (!isset(self::FREE[$key])) {
            throw new InvalidArgumentException("Unknown batch {$batch}; known: " . implode(', ', array_keys(self::FREE)));
        }

        return explode(',', self::FREE[$key]);
    }
}
