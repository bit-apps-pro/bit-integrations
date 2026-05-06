import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import c from 'react-multiple-select-dropdown-lite'
import { $appConfigState, $flowStep, $newFlow } from '../../../GlobalStates'
import { sortByField } from '../../../Utils/Helpers'
import { __ } from '../../../Utils/i18nwrap'
import GetLogo from '../../../Utils/GetLogo'

export default function SelectAction() {
  const { isPro } = useRecoilValue($appConfigState)
  const [newFlow, setNewFlow] = useRecoilState($newFlow)
  const setFlowStep = useSetRecoilState($flowStep)
  const navigate = useNavigate()

  const integs = [
    { type: 'Bit Form' },
    { type: 'Zoho CRM' },
    { type: 'Google Sheet' },
    { type: 'Mail Chimp' },
    { type: 'Mail' },
    { type: 'Slack' },
    { type: 'Trello' },
    { type: 'Web Hooks' },
    { type: 'Zapier' },
    { type: 'IFTTT' },
    { type: 'Make(Integromat)', logo: 'make' },
    { type: 'Integrately' },
    { type: 'Pabbly' },
    { type: 'N8n' },
    { type: 'SyncSpider' },
    { type: 'KonnectzIT' },
    { type: 'Ant Apps' },
    { type: 'MailerLite' },
    { type: 'Rapidmail' },
    { type: 'ActiveCampaign' },
    { type: 'Encharge' },
    { type: 'WP Post Creation' },
    { type: 'Fluent CRM', logo: 'fluentCrm' },
    { type: 'Autonami' },
    { type: 'Dropbox' },
    { type: 'OneDrive' },
    { type: 'Google Drive' },
    { type: 'Google Calendar' },
    { type: 'Pods' },
    { type: 'Zoho Flow' },
    { type: 'WP User Registration' },
    { type: 'Mail Poet' },
    { type: 'Brevo(SendinBlue)', logo: 'brevo' },
    { type: 'Telegram' },
    { type: 'Tutor Lms' },
    { type: 'WooCommerce' },
    { type: 'Zoho Bigin' },
    { type: 'Zoho Campaigns' },
    { type: 'Zoho Marketing Automation(Zoho Marketing Hub)', logo: 'zohoMarketingAutomation' },
    { type: 'Zoho Recruit' },
    { type: 'Getgist' },
    { type: 'ElasticEmail' },
    { type: 'WP Courseware' },
    { type: 'RestrictContent' },
    { type: 'Mautic' },
    { type: 'Keap' },
    { type: 'Hubspot' },
    { type: 'Freshdesk' },
    { type: 'Zoho Desk' },
    { type: 'Sendy' },
    { type: 'Zoom' },
    { type: 'Zoom Webinar' },
    { type: 'Fluent Support' },
    { type: 'Acumbamail' },
    { type: 'Groundhogg' },
    { type: 'SendFox' },
    { type: 'Twilio' },
    { type: 'Vbout' },
    { type: 'WhatsApp' },
    { type: 'LearnDash' },
    { type: 'Affiliate' },
    { type: 'BuddyBoss' },
    { type: 'GamiPress' },
    { type: 'Google Contacts' },
    { type: 'Kirim Email' },
    { type: 'Salesforce' },
    { type: 'Klaviyo' },
    { type: 'Selzy' },
    { type: 'Mailercloud' },
    { type: 'Moosend' },
    { type: 'Memberpress' },
    { type: 'PaidMembershipPro' },
    { type: 'MailBluster' },
    { type: 'MailRelay' },
    { type: 'Mailup' },
    { type: 'Notion' },
    { type: 'GetResponse' },
    { type: 'SliceWp' },
    { type: 'ConstantContact' },
    { type: 'OmniSend' },
    { type: 'Mailjet' },
    { type: 'SendGrid' },
    { type: 'Fabman' },
    { type: 'PCloud' },
    { type: 'CustomAction' },
    { type: 'PipeDrive' },
    { type: 'EmailOctopus' },
    { type: 'Smaily' },
    { type: 'CustomApi' },
    { type: 'SureCart' },
    { type: 'Agiled CRM' },
    { type: 'Kit(ConvertKit)', logo: 'convertKit' },
    { type: 'BenchMark' },
    { type: 'DirectIq' },
    { type: 'GiveWp' },
    { type: 'Airtable' },
    { type: 'Zoho Sheet' },
    { type: 'SendPulse' },
    { type: 'LifterLms' },
    { type: 'FreshSales' },
    { type: 'Insightly' },
    { type: 'CapsuleCRM' },
    { type: 'MasterStudyLms' },
    { type: 'Zendesk' },
    { type: 'Asana' },
    { type: 'Clickup' },
    { type: 'ClinchPad' },
    { type: 'Propovoice CRM' },
    { type: 'Mail Mint' },
    { type: 'CopperCRM' },
    { type: 'Sarbacane(Mailify)', logo: 'sarbacane' },
    { type: 'Lemlist' },
    { type: 'Salesmate' },
    { type: 'LionDesk' },
    { type: 'CampaignMonitor' },
    { type: 'SuiteDash' },
    { type: 'Gravitec' },
    { type: 'CompanyHub' },
    { type: 'Demio' },
    { type: 'Flowlu' },
    { type: 'Livestorm' },
    { type: 'Nimble' },
    { type: 'Albato' },
    { type: 'SperseIO' },
    { type: 'FlowMattic' },
    { type: 'AutomatorWP' },
    { type: 'UncannyAutomator' },
    { type: 'ThriveAutomator' },
    { type: 'WPWebhooks' },
    { type: 'AdvancedFormIntegration' },
    { type: 'PerfexCRM' },
    { type: 'OttoKit (SureTriggers)', logo: 'ottoKit' },
    { type: 'OneHashCRM' },
    { type: 'Salesflare' },
    { type: 'AcademyLms' },
    { type: 'MoxieCRM' },
    { type: 'WPFusion' },
    { type: 'Woodpecker' },
    { type: 'NutshellCRM' },
    { type: 'SystemeIO' },
    { type: 'Discord' },
    { type: 'ZagoMail' },
    { type: 'Drip' },
    { type: 'Newsletter' },
    { type: 'SureMembers' },
    { type: 'Mailster' },
    { type: 'WPForo' },
    { type: 'Dokan' },
    { type: 'JetEngine' },
    { type: 'GoHighLevel' },
    { type: 'The Events Calendar' },
    { type: 'License Manager For WooCommerce' },
    { type: 'Voxel' },
    { type: 'SmartSuite' },
    { type: 'Monday.Com', logo: 'mondayCom' },
    { type: 'Bento' },
    { type: 'Line' },
    { type: 'ACPT' },
    { type: 'Wishlist Member' },
    { type: 'Ultimate Affiliate Pro' },
    { type: 'MailerPress' },
    { type: 'CreatorLms' },
    { type: 'FluentCart' },
    { type: 'PeepSo' },
    { type: 'Ninja Tables' },
    { type: 'WC Affiliate' },
    { type: 'WPCafe' },
    { type: 'Teams For WooCommerce Memberships' },
    { type: 'SeoPress' },
    { type: 'NotificationX' },
    { type: 'weDocs' },
    { type: 'Asgaros Forum', logo: 'asgaros' },
    { type: 'User Registration & Membership', logo: 'userRegistrationMembership' }
  ]

  const [availableIntegs, setAvailableIntegs] = useState(sortByField(integs, 'type', 'ASC') || integs)
  const organizeIntegs = () => {
    const bitformIndex = availableIntegs.findIndex(i => i.type === 'Bit Form')
    if (bitformIndex === -1) return availableIntegs
    const bitformData = availableIntegs[bitformIndex]
    availableIntegs.splice(bitformIndex, 1)
    return [bitformData, ...availableIntegs]
  }

  const allOrganizeIntegs = isPro ? organizeIntegs() : availableIntegs

  const searchInteg = e => {
    const { value } = e.target
    const filtered = integs.filter(integ => integ.type.toLowerCase().includes(value.toLowerCase()))
    setAvailableIntegs(filtered)
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
          {allOrganizeIntegs.map((inte, i) => (
            <div
              key={`inte-sm-${i + 2}`}
              onClick={() => !inte.disable && !inte.pro && setAction(inte.type)}
              onKeyPress={() => !inte.disable && !inte.pro && setAction(inte.type)}
              role="button"
              tabIndex="0"
              className={`btcd-inte-card inte-sm mr-4 mt-3 ${inte.disable && !inte.pro && 'btcd-inte-dis'} ${inte.pro && 'btcd-inte-pro'}`}>
              {inte.pro && (
                <div className="pro-filter">
                  <span className="txt-pro">
                    <a href="https://www.bitapps.pro" target="_blank" rel="noreferrer">
                      {__('Premium', 'bit-integrations')}
                    </a>
                  </span>
                </div>
              )}

              <GetLogo name={inte?.logo || inte.type} extension="webp" />
              <div className="txt-center">{inte.type}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
