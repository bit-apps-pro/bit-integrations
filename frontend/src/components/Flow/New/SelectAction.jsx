import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import c from 'react-multiple-select-dropdown-lite'
import { $appConfigState, $flowStep, $newFlow } from '../../../GlobalStates'
import { sortByField } from '../../../Utils/Helpers'
import { __ } from '../../../Utils/i18nwrap'
import GetLogo from '../../../Utils/GetLogo'
import ProModal from '../../Utilities/ProModal'

export default function SelectAction() {
  const { isPro } = useRecoilValue($appConfigState)
  const [newFlow, setNewFlow] = useRecoilState($newFlow)
  const setFlowStep = useSetRecoilState($flowStep)
  const navigate = useNavigate()

  const integs = [
    { type: 'Bit Form', is_pro: false },
    { type: 'Zoho CRM', is_pro: false },
    { type: 'Google Sheet', is_pro: false },
    { type: 'Mail Chimp', is_pro: false },
    { type: 'Mail', is_pro: false },
    { type: 'Slack', is_pro: false },
    { type: 'Trello', is_pro: false },
    { type: 'Web Hooks', is_pro: false },
    { type: 'Zapier', is_pro: false },
    { type: 'IFTTT', is_pro: false },
    { type: 'Make(Integromat)', logo: 'make', is_pro: false },
    { type: 'Integrately', is_pro: false },
    { type: 'Pabbly', is_pro: false },
    { type: 'N8n', is_pro: false },
    { type: 'SyncSpider', is_pro: false },
    { type: 'KonnectzIT', is_pro: false },
    { type: 'Ant Apps', is_pro: false },
    { type: 'MailerLite', is_pro: false },
    { type: 'Rapidmail', is_pro: false },
    { type: 'ActiveCampaign', is_pro: false },
    { type: 'Encharge', is_pro: false },
    { type: 'WP Post Creation', is_pro: false },
    { type: 'Fluent CRM', logo: 'fluentCrm', is_pro: false },
    { type: 'Autonami', is_pro: false },
    { type: 'Dropbox', is_pro: false },
    { type: 'OneDrive', is_pro: false },
    { type: 'Google Drive', is_pro: false },
    { type: 'Google Calendar', is_pro: false },
    { type: 'Pods', is_pro: false },
    { type: 'Zoho Flow', is_pro: false },
    { type: 'WP User Registration', logo: 'registration', is_pro: false },
    { type: 'Mail Poet', is_pro: false },
    { type: 'Brevo(SendinBlue)', logo: 'brevo', is_pro: false },
    { type: 'Telegram', is_pro: false },
    { type: 'Tutor Lms', is_pro: false },
    { type: 'WooCommerce', is_pro: false },
    { type: 'Zoho Bigin', is_pro: false },
    { type: 'Zoho Campaigns', is_pro: false },
    {
      type: 'Zoho Marketing Automation(Zoho Marketing Hub)',
      logo: 'zohoMarketingAutomation',
      is_pro: false
    },
    { type: 'Zoho Recruit', is_pro: false },
    { type: 'Getgist', is_pro: false },
    { type: 'ElasticEmail', is_pro: false },
    { type: 'WP Courseware', is_pro: false },
    { type: 'RestrictContent', is_pro: false },
    { type: 'Mautic', is_pro: false },
    { type: 'Keap', is_pro: false },
    { type: 'Hubspot', is_pro: false },
    { type: 'Freshdesk', is_pro: false },
    { type: 'Zoho Desk', is_pro: false },
    { type: 'Sendy', is_pro: false },
    { type: 'Zoom', is_pro: false },
    { type: 'Zoom Webinar', is_pro: false },
    { type: 'Fluent Support', is_pro: false },
    { type: 'Acumbamail', is_pro: false },
    { type: 'Groundhogg', is_pro: false },
    { type: 'SendFox', is_pro: false },
    { type: 'Twilio', is_pro: false },
    { type: 'Vbout', is_pro: false },
    { type: 'WhatsApp', is_pro: false },
    { type: 'LearnDash', is_pro: false },
    { type: 'Affiliate', is_pro: false },
    { type: 'BuddyBoss', is_pro: false },
    { type: 'GamiPress', is_pro: false },
    { type: 'Google Contacts', is_pro: false },
    { type: 'Kirim Email', is_pro: false },
    { type: 'Salesforce', is_pro: false },
    { type: 'Klaviyo', is_pro: false },
    { type: 'Selzy', is_pro: false },
    { type: 'Mailercloud', is_pro: false },
    { type: 'Moosend', is_pro: false },
    { type: 'Memberpress', is_pro: false },
    { type: 'PaidMembershipPro', is_pro: false },
    { type: 'MailBluster', is_pro: false },
    { type: 'MailRelay', is_pro: false },
    { type: 'Mailup', is_pro: false },
    { type: 'Notion', is_pro: false },
    { type: 'GetResponse', is_pro: false },
    { type: 'SliceWp', is_pro: false },
    { type: 'ConstantContact', is_pro: false },
    { type: 'OmniSend', is_pro: false },
    { type: 'Mailjet', is_pro: false },
    { type: 'SendGrid', is_pro: false },
    { type: 'Fabman', is_pro: false },
    { type: 'PCloud', is_pro: false },
    { type: 'CustomAction', is_pro: false },
    { type: 'PipeDrive', is_pro: false },
    { type: 'EmailOctopus', is_pro: false },
    { type: 'Smaily', is_pro: false },
    { type: 'CustomApi', is_pro: false },
    { type: 'SureCart', is_pro: false },
    { type: 'Agiled CRM', is_pro: false },
    { type: 'Kit(ConvertKit)', logo: 'convertKit', is_pro: false },
    { type: 'BenchMark', is_pro: false },
    { type: 'DirectIq', is_pro: false },
    { type: 'GiveWp', is_pro: false },
    { type: 'Airtable', is_pro: false },
    { type: 'Zoho Sheet', is_pro: false },
    { type: 'SendPulse', is_pro: false },
    { type: 'LifterLms', is_pro: false },
    { type: 'FreshSales', is_pro: false },
    { type: 'Insightly', is_pro: false },
    { type: 'CapsuleCRM', is_pro: false },
    { type: 'MasterStudyLms', is_pro: false },
    { type: 'Zendesk', is_pro: false },
    { type: 'ZendeskSupport', is_pro: true },
    { type: 'Asana', is_pro: false },
    { type: 'Clickup', is_pro: false },
    { type: 'ClinchPad', is_pro: false },
    { type: 'Propovoice CRM', is_pro: false },
    { type: 'Mail Mint', is_pro: false },
    { type: 'CopperCRM', is_pro: false },
    { type: 'Sarbacane(Mailify)', logo: 'sarbacane', is_pro: false },
    { type: 'Lemlist', is_pro: false },
    { type: 'Salesmate', is_pro: false },
    { type: 'LionDesk', is_pro: false },
    { type: 'CampaignMonitor', is_pro: false },
    { type: 'SuiteDash', is_pro: false },
    { type: 'Gravitec', is_pro: false },
    { type: 'CompanyHub', is_pro: false },
    { type: 'Demio', is_pro: false },
    { type: 'Flowlu', is_pro: false },
    { type: 'Livestorm', is_pro: false },
    { type: 'Nimble', is_pro: false },
    { type: 'Albato', is_pro: false },
    { type: 'SperseIO', is_pro: false },
    { type: 'FlowMattic', is_pro: false },
    { type: 'AutomatorWP', is_pro: false },
    { type: 'UncannyAutomator', is_pro: false },
    { type: 'ThriveAutomator', is_pro: false },
    { type: 'WPWebhooks', is_pro: false },
    { type: 'AdvancedFormIntegration', is_pro: false },
    { type: 'PerfexCRM', is_pro: false },
    { type: 'OttoKit (SureTriggers)', logo: 'ottoKit', is_pro: false },
    { type: 'OneHashCRM', is_pro: false },
    { type: 'Salesflare', is_pro: false },
    { type: 'AcademyLms', is_pro: false },
    { type: 'MoxieCRM', is_pro: false },
    { type: 'WPFusion', is_pro: false },
    { type: 'Woodpecker', is_pro: false },
    { type: 'NutshellCRM', is_pro: false },
    { type: 'SystemeIO', is_pro: false },
    { type: 'Discord', is_pro: false },
    { type: 'ZagoMail', is_pro: false },
    { type: 'Drip', is_pro: false },
    { type: 'Newsletter', is_pro: false },
    { type: 'SureDash', is_pro: true },
    { type: 'SureMembers', is_pro: false },
    { type: 'Mailster', is_pro: false },
    { type: 'WPForo', is_pro: false },
    { type: 'Dokan', is_pro: false },
    { type: 'JetEngine', is_pro: false },
    { type: 'GoHighLevel', is_pro: false },
    { type: 'The Events Calendar', is_pro: false },
    { type: 'License Manager For WooCommerce', is_pro: false },
    { type: 'Voxel', is_pro: false },
    { type: 'SmartSuite', is_pro: false },
    { type: 'Monday.Com', logo: 'mondayCom', is_pro: true },
    { type: 'Bento', is_pro: false },
    { type: 'Line', is_pro: false },
    { type: 'ACPT', is_pro: false },
    { type: 'Wishlist Member', is_pro: false },
    { type: 'Ultimate Affiliate Pro', is_pro: true },
    { type: 'MailerPress', is_pro: false },
    { type: 'CreatorLms', is_pro: true },
    { type: 'Bookly', is_pro: true },
    { type: 'FluentCart', is_pro: true },
    { type: 'MoreConvert Wishlist', logo: 'moreConvertWishlist', is_pro: true },
    { type: 'Heffl CRM', is_pro: true },
    { type: 'Secure Custom Fields', is_pro: true },
    { type: 'WordPress', is_pro: true },
    { type: 'BookingPress', is_pro: true },
    { type: 'WpDataTables', is_pro: true },
    { type: 'FormyChat', is_pro: true },
    { type: 'IvyForms', logo: 'ivyForms', is_pro: true },
    { type: 'WP ERP', logo: 'wpErp', is_pro: true },
    { type: 'PeepSo', is_pro: true },
    { type: 'Ninja Tables', is_pro: true },
    { type: 'WC Affiliate', is_pro: true },
    { type: 'Instasent', is_pro: true },
    { type: 'WPCafe', is_pro: true },
    { type: 'Teams For WooCommerce Memberships', is_pro: true },
    { type: 'SeoPress', is_pro: true },
    { type: 'NotificationX', is_pro: true },
    { type: 'weDocs', is_pro: true },
    { type: 'Asgaros Forum', logo: 'asgaros', is_pro: true },
    { type: 'Wsms', name: 'WSMS (WP SMS)', is_pro: true },
    { type: 'B2BKing', is_pro: true },
    { type: 'User Registration & Membership', logo: 'userRegistrationMembership', is_pro: true },
    { type: 'WebbaBooking', is_pro: true },
    { type: 'Sender', is_pro: true },
    { type: 'MainWP', is_pro: true },
  ]

  const [showProModal, setShowProModal] = useState(false)
  const [actionName, setActionName] = useState()

  const featuredProducts = ['Bit Form']

  const sortFeaturedProducts = (list = []) => {
    const featured = featuredProducts
      .map(name => list.find(integ => integ.type === name))
      .filter(Boolean)
    const rest = sortByField(
      list.filter(integ => !featuredProducts.includes(integ.type)),
      'type',
      'ASC'
    )

    if (isPro) return [...featured, ...rest]

    const freeProd = rest.filter(integ => !integ.is_pro)
    const proProd = rest.filter(integ => integ.is_pro)

    return [...featured, ...freeProd, ...proProd]
  }

  const [availableIntegs, setAvailableIntegs] = useState(sortFeaturedProducts(integs))

  const searchInteg = e => {
    const { value } = e.target
    const filtered = integs.filter(integ => integ.type.toLowerCase().includes(value.toLowerCase()))
    setAvailableIntegs(sortFeaturedProducts(filtered))
  }

  const showPModal = name => {
    setActionName(name)
    setShowProModal(true)
  }

  const closePModal = () => {
    setShowProModal(false)
    setActionName()
  }

  const updatedStep = () => {
    setFlowStep(1)
  }

  const getStrInsideParenthesis = str => {
    const startIndex = str.indexOf('(')
    const endIndex = str.indexOf(')')

    return str.slice(startIndex + 1, endIndex)
  }

  const setAction = str => {
    const action = str.includes('(') || str.includes(')') ? getStrInsideParenthesis(str) : str

    const tempConf = { ...newFlow }
    tempConf.action = action
    setNewFlow(tempConf)
    navigate(`/flow/action/new/${action}`)
  }

  return (
    <>
      <div className="txt-center" style={{ width: '100%' }}>
        <button type="button" className="f-left btn btcd-btn-o-gray mt-1" onClick={updatedStep}>
          <span className="btcd-icn icn-chevron-left" />
          &nbsp;{__('Back', 'bit-integrations')}
        </button>
        <h2 className="mt-0">{__('Please select an Action', 'bit-integrations')}</h2>
        <input
          type="search"
          className="btcd-paper-inp w-5 mb-3"
          onChange={searchInteg}
          placeholder={__('Search Actions...', 'bit-integrations')}
          style={{ height: '50%' }}
          autoFocus
        />
      </div>
      <div className="btcd-inte-wrp txt-center">
        <div className="flx flx-center flx-wrp pb-3">
          {availableIntegs.map((inte, i) => (
            <div
              key={`inte-sm-${i + 2}`}
              onClick={() =>
                !inte.disable && (isPro || !inte.is_pro)
                  ? setAction(inte.type)
                  : showPModal(inte.name || inte.type)
              }
              onKeyUp={() => !inte.disable && (isPro || !inte.is_pro) && setAction(inte.type)}
              role="button"
              tabIndex="0"
              className={`btcd-inte-card inte-sm mr-4 mt-3 ${inte.disable && (isPro || !inte.is_pro) && 'btcd-inte-dis'
                } ${inte.is_pro && !isPro && 'btcd-inte-pro'}`}>
              {inte.is_pro && !isPro && (
                <div className="pro-filter">
                  <button
                    className="btn txt-pro"
                    type="button"
                    onClick={() => showPModal(inte.name || inte.type)}>
                    {__('Pro', 'bit-integrations')}
                  </button>
                </div>
              )}

              <GetLogo name={inte?.logo || inte.type} extension="webp" />
              <div className="txt-center">{inte.name || inte.type}</div>
            </div>
          ))}
          <ProModal
            show={showProModal}
            setShow={closePModal}
            sub={actionName || __('This Action', 'bit-integrations')}
          />
        </div>
      </div>
    </>
  )
}
