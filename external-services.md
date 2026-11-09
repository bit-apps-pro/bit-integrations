# External Services Documentation

Bit Integrations connects to various third-party external services to enable automation workflows between WordPress and 300+ platforms. This document provides comprehensive information about all external services used by this plugin, including what data is sent, when it's sent, and links to each service's terms of service and privacy policies.

**Important**: Data is only sent to external services when you actively configure and enable an integration. No integration data is transmitted unless you explicitly create a workflow that connects to a specific service. The only exception is the optional usage data sent to Bit Apps, the plugin's developer, after a site administrator agrees to it; see "Bit Apps usage data" in the plugin's readme.txt for what it contains and when it is sent.

---

## Table of Contents

- [Google Services](#google-services)
- [Zoho Services](#zoho-services)
- [Meta (Facebook) Services](#meta-facebook-services)
- [Email Marketing Services](#email-marketing-services)
- [CRM Services](#crm-services)
- [Project Management Services](#project-management-services)
- [Communication Services](#communication-services)
- [Storage Services](#storage-services)
- [Automation Platform Services](#automation-platform-services)
- [Learning Management Systems](#learning-management-systems)
- [E-commerce Services](#e-commerce-services)
- [Marketing Automation Services](#marketing-automation-services)
- [Other Third-Party Services](#other-third-party-services)

---

## Google Services

### Google Sheets

**Service URL**: `https://sheets.googleapis.com/` and `https://oauth2.googleapis.com/`

**What it does**: Enables syncing form submissions, WooCommerce orders, user registrations, and other WordPress data to Google Sheets spreadsheets.

**Data sent**:

- User-configured field mappings (name, email, custom fields, etc.)
- OAuth credentials for authentication
- Spreadsheet IDs and worksheet names
- Data is sent when a configured trigger event occurs (e.g., form submission, new order)

**When data is sent**: When a workflow is triggered based on configured events (form submissions, purchases, registrations, etc.).

**Terms of Service**: [Google Terms of Service](https://policies.google.com/terms)  
**Privacy Policy**: [Google Privacy Policy](https://policies.google.com/privacy)

---

### Google Calendar

**Service URL**: `https://www.googleapis.com/calendar/` and `https://oauth2.googleapis.com/`

**What it does**: Creates calendar events automatically when WordPress actions occur (bookings, registrations, etc.).

**Data sent**:

- Event details (title, description, date/time, location)
- OAuth credentials for authentication
- User email addresses for event invitations
- Data is sent when a configured trigger occurs

**When data is sent**: When a workflow is triggered based on configured events.

**Terms of Service**: [Google Terms of Service](https://policies.google.com/terms)  
**Privacy Policy**: [Google Privacy Policy](https://policies.google.com/privacy)

---

### Google Drive

**Service URL**: `https://www.googleapis.com/drive/` and `https://oauth2.googleapis.com/`

**What it does**: Uploads files from WordPress forms, media library, or other sources to Google Drive folders.

**Data sent**:

- File contents and metadata
- OAuth credentials for authentication
- Folder IDs and file names
- Data is sent when file upload workflows are triggered

**When data is sent**: When a workflow with file upload is triggered.

**Terms of Service**: [Google Terms of Service](https://policies.google.com/terms)  
**Privacy Policy**: [Google Privacy Policy](https://policies.google.com/privacy)

---

### Google Contacts

**Service URL**: `https://people.googleapis.com/` and `https://oauth2.googleapis.com/`

**What it does**: Syncs contact information from WordPress to Google Contacts.

**Data sent**:

- Contact details (names, emails, phone numbers, addresses)
- OAuth credentials for authentication
- Custom fields as configured
- Data is sent when contact-related workflows are triggered

**When data is sent**: When a workflow is triggered based on configured events.

**Terms of Service**: [Google Terms of Service](https://policies.google.com/terms)  
**Privacy Policy**: [Google Privacy Policy](https://policies.google.com/privacy)

---

## Zoho Services

### Zoho CRM

**Service URL**: `https://www.zohoapis.{dataCenter}/crm/`

**What it does**: Syncs leads, contacts, deals, and other CRM data from WordPress to Zoho CRM.

**Data sent**:

- Contact information (name, email, phone, address)
- Custom field data as configured in workflows
- Lead and deal information
- OAuth credentials for authentication
- Data is sent when configured trigger events occur

**When data is sent**: When workflows are triggered based on form submissions, purchases, or other configured events.

**Terms of Service**: [Zoho Terms of Service](https://www.zoho.com/terms.html)  
**Privacy Policy**: [Zoho Privacy Policy](https://www.zoho.com/privacy.html)

---

### Zoho Campaigns

**Service URL**: `https://campaigns.zoho.{dataCenter}/`

**What it does**: Adds subscribers to email marketing lists in Zoho Campaigns.

**Data sent**:

- Subscriber information (email, name, custom fields)
- List IDs and contact preferences
- Authentication tokens
- Data is sent when subscription workflows are triggered

**When data is sent**: When users opt-in via forms or other configured triggers.

**Terms of Service**: [Zoho Terms of Service](https://www.zoho.com/terms.html)  
**Privacy Policy**: [Zoho Privacy Policy](https://www.zoho.com/privacy.html)

---

### Zoho Desk

**Service URL**: `https://desk.zoho.{dataCenter}/`

**What it does**: Creates support tickets in Zoho Desk from WordPress forms or other sources.

**Data sent**:

- Ticket details (subject, description, priority)
- Contact information (name, email)
- File attachments when configured
- Department and organization IDs
- Authentication tokens

**When data is sent**: When ticket creation workflows are triggered.

**Terms of Service**: [Zoho Terms of Service](https://www.zoho.com/terms.html)  
**Privacy Policy**: [Zoho Privacy Policy](https://www.zoho.com/privacy.html)

---

### Zoho Sheet

**Service URL**: `https://sheet.zoho.{dataCenter}/`

**What it does**: Syncs data from WordPress to Zoho Sheet spreadsheets.

**Data sent**:

- User-configured field mappings
- Spreadsheet and worksheet identifiers
- Authentication tokens
- Data records based on trigger events

**When data is sent**: When configured workflow triggers occur.

**Terms of Service**: [Zoho Terms of Service](https://www.zoho.com/terms.html)  
**Privacy Policy**: [Zoho Privacy Policy](https://www.zoho.com/privacy.html)

---

### Zoho Bigin

**Service URL**: `https://www.zohoapis.{dataCenter}/bigin/`

**What it does**: Syncs pipeline and contact data to Zoho Bigin CRM.

**Data sent**:

- Contact and company information
- Pipeline and deal data
- Custom fields as configured
- Authentication tokens

**When data is sent**: When CRM sync workflows are triggered.

**Terms of Service**: [Zoho Terms of Service](https://www.zoho.com/terms.html)  
**Privacy Policy**: [Zoho Privacy Policy](https://www.zoho.com/privacy.html)

---

### Zoho Marketing Hub

**Service URL**: `https://marketinghub.zoho.{dataCenter}/`

**What it does**: Manages leads and email subscribers in Zoho Marketing Hub.

**Data sent**:

- Lead information (name, email, custom fields)
- List subscriptions
- Authentication tokens

**When data is sent**: When lead generation workflows are triggered.

**Terms of Service**: [Zoho Terms of Service](https://www.zoho.com/terms.html)  
**Privacy Policy**: [Zoho Privacy Policy](https://www.zoho.com/privacy.html)

---

### Zoho Recruit

**Service URL**: `https://recruit.zoho.{dataCenter}/`

**What it does**: Manages candidate applications and job postings.

**Data sent**:

- Candidate information (resume, contact details)
- Job application data
- File attachments (resumes, documents)
- Authentication tokens

**When data is sent**: When recruitment workflows are triggered.

**Terms of Service**: [Zoho Terms of Service](https://www.zoho.com/terms.html)  
**Privacy Policy**: [Zoho Privacy Policy](https://www.zoho.com/privacy.html)

---

### Zoho Flow

**Service URL**: `https://flow.zoho.{dataCenter}/`

**What it does**: Triggers automation workflows in Zoho Flow.

**Data sent**:

- Webhook payload data as configured
- Trigger event information
- Authentication data

**When data is sent**: When configured trigger events occur in WordPress.

**Terms of Service**: [Zoho Terms of Service](https://www.zoho.com/terms.html)  
**Privacy Policy**: [Zoho Privacy Policy](https://www.zoho.com/privacy.html)

---

## Meta (Facebook) Services

### WhatsApp Business API

**Service URL**: `https://graph.facebook.com/v20.0/`

**What it does**: Sends WhatsApp messages to users via WhatsApp Business API.

**Data sent**:

- Phone numbers
- Message content and templates
- Business Account IDs
- Access tokens for authentication
- Data is sent when messaging workflows are triggered

**When data is sent**: When configured trigger events occur (form submissions, order confirmations, etc.).

**Terms of Service**: [Meta Terms of Service](https://www.facebook.com/terms.php)  
**Privacy Policy**: [Meta Privacy Policy](https://www.facebook.com/privacy/policy/)  
**WhatsApp Business Terms**: [WhatsApp Business Terms](https://www.whatsapp.com/legal/business-terms)

---

## Email Marketing Services

### Mailchimp

**Service URL**: `https://{{dc}}.api.mailchimp.com/`

**What it does**: Manages email subscribers and audience lists in Mailchimp.

**Data sent**:

- Subscriber information (email, name, custom merge fields)
- List IDs and audience segments
- Tag assignments
- API keys for authentication

**When data is sent**: When users subscribe via forms or other configured triggers.

**Terms of Service**: [Mailchimp Terms of Use](https://mailchimp.com/legal/terms/)  
**Privacy Policy**: [Mailchimp Privacy Policy](https://mailchimp.com/legal/privacy/)

---

### ActiveCampaign

**Service URL**: Account-specific URL (e.g., `https://account.api-us1.com/`)

**What it does**: Manages contacts, lists, and automation in ActiveCampaign.

**Data sent**:

- Contact information (email, name, phone, address)
- Custom field data
- List subscriptions and tags
- API credentials

**When data is sent**: When contact management workflows are triggered.

**Terms of Service**: [ActiveCampaign Terms of Service](https://www.activecampaign.com/legal/terms-of-service)  
**Privacy Policy**: [ActiveCampaign Privacy Policy](https://www.activecampaign.com/legal/privacy-policy)

---

### SendinBlue (Brevo)

**Service URL**: `https://api.sendinblue.com/` or `https://api.brevo.com/`

**What it does**: Manages email contacts and sends transactional emails.

**Data sent**:

- Contact details (email, name, attributes)
- List IDs
- Email content for transactional emails
- API keys

**When data is sent**: When email marketing workflows are triggered.

**Terms of Service**: [Brevo Terms and Conditions](https://www.brevo.com/legal/termsofuse/)  
**Privacy Policy**: [Brevo Privacy Policy](https://www.brevo.com/legal/privacypolicy/)

---

### MailerLite

**Service URL**: `https://api.mailerlite.com/`

**What it does**: Manages subscribers and email campaigns in MailerLite.

**Data sent**:

- Subscriber information (email, name, custom fields)
- Group assignments
- API keys for authentication

**When data is sent**: When subscription workflows are triggered.

**Terms of Service**: [MailerLite Terms of Service](https://www.mailerlite.com/legal/terms-of-service)  
**Privacy Policy**: [MailerLite Privacy Policy](https://www.mailerlite.com/legal/privacy-policy)

---

### ConvertKit

**Service URL**: `https://api.convertkit.com/`

**What it does**: Manages email subscribers and automation sequences.

**Data sent**:

- Subscriber email addresses and names
- Tag and form IDs
- Custom field data
- API keys and secrets

**When data is sent**: When email opt-in workflows are triggered.

**Terms of Service**: [ConvertKit Terms of Service](https://convertkit.com/terms)  
**Privacy Policy**: [ConvertKit Privacy Policy](https://convertkit.com/privacy)

---

### GetResponse

**Service URL**: `https://api.getresponse.com/`

**What it does**: Manages email contacts and marketing campaigns.

**Data sent**:

- Contact information (email, name, custom fields)
- Campaign and list assignments
- API keys

**When data is sent**: When marketing automation workflows are triggered.

**Terms of Service**: [GetResponse Terms of Service](https://www.getresponse.com/legal/terms-of-service)  
**Privacy Policy**: [GetResponse Privacy Policy](https://www.getresponse.com/legal/privacy)

---

### Klaviyo

**Service URL**: `https://a.klaviyo.com/`

**What it does**: Manages customer profiles and email/SMS marketing for e-commerce.

**Data sent**:

- Customer profiles (email, phone, name)
- Purchase history and order data
- Custom properties
- List memberships
- API keys

**When data is sent**: When e-commerce or marketing workflows are triggered.

**Terms of Service**: [Klaviyo Terms of Service](https://www.klaviyo.com/legal/terms-of-service)  
**Privacy Policy**: [Klaviyo Privacy Policy](https://www.klaviyo.com/legal/privacy)

---

### SendGrid

**Service URL**: `https://api.sendgrid.com/`

**What it does**: Sends transactional and marketing emails via SendGrid.

**Data sent**:

- Email addresses (sender and recipients)
- Email content (subject, body, attachments)
- API keys for authentication

**When data is sent**: When email sending workflows are triggered.

**Terms of Service**: [SendGrid Terms of Service](https://www.twilio.com/legal/tos)  
**Privacy Policy**: [SendGrid Privacy Policy](https://www.twilio.com/legal/privacy)

---

### Moosend

**Service URL**: `https://api.moosend.com/`

**What it does**: Manages email subscribers and marketing automation.

**Data sent**:

- Subscriber details (email, name, custom fields)
- Mailing list IDs
- API keys

**When data is sent**: When email marketing workflows are triggered.

**Terms of Service**: [Moosend Terms of Service](https://moosend.com/terms/)  
**Privacy Policy**: [Moosend Privacy Policy](https://moosend.com/privacy-policy/)

---

### Omnisend

**Service URL**: `https://api.omnisend.com/`

**What it does**: Manages e-commerce email and SMS marketing.

**Data sent**:

- Contact information (email, phone)
- Purchase data and order history
- Custom properties
- API keys

**When data is sent**: When e-commerce marketing workflows are triggered.

**Terms of Service**: [Omnisend Terms of Use](https://www.omnisend.com/terms-of-use/)  
**Privacy Policy**: [Omnisend Privacy Policy](https://www.omnisend.com/privacy/)

---

### Drip

**Service URL**: `https://api.getdrip.com/`

**What it does**: Manages subscribers and e-commerce marketing automation.

**Data sent**:

- Subscriber information (email, name, tags)
- E-commerce events and order data
- Custom fields
- API tokens

**When data is sent**: When marketing automation workflows are triggered.

**Terms of Service**: [Drip Terms of Service](https://www.drip.com/terms)  
**Privacy Policy**: [Drip Privacy Policy](https://www.drip.com/privacy)

---

### Sendy

**Service URL**: User's self-hosted installation URL

**What it does**: Manages email subscribers in self-hosted Sendy installations.

**Data sent**:

- Subscriber email addresses and names
- List IDs
- Custom fields
- API keys

**When data is sent**: When subscription workflows are triggered.

**Terms of Service**: Varies by installation  
**Privacy Policy**: Varies by installation

---

### MailPoet

**Service URL**: `https://api.mailpoet.com/` (for sending service)

**What it does**: Manages email subscribers within WordPress using MailPoet plugin.

**Data sent**:

- Subscriber information (email, name, custom fields)
- List subscriptions
- Sending service data (when using MailPoet Sending Service)

**When data is sent**: When subscription workflows are triggered; email content sent when using MailPoet Sending Service.

**Terms of Service**: [MailPoet Terms of Service](https://www.mailpoet.com/terms/)  
**Privacy Policy**: [MailPoet Privacy Policy](https://www.mailpoet.com/privacy-notice/)

---

### SendPulse

**Service URL**: `https://api.sendpulse.com/`

**What it does**: Manages multi-channel marketing (email, SMS, web push).

**Data sent**:

- Contact information (email, phone, name)
- Mailing list data
- Custom variables
- API credentials

**When data is sent**: When multi-channel marketing workflows are triggered.

**Terms of Service**: [SendPulse Terms of Service](https://sendpulse.com/legal/termsofuse)  
**Privacy Policy**: [SendPulse Privacy Policy](https://sendpulse.com/legal/privacy)

---

### Acumbamail

**Service URL**: `https://acumbamail.com/api/`

**What it does**: Manages email marketing campaigns and subscribers.

**Data sent**:

- Subscriber data (email, name, custom fields)
- List assignments
- API authentication tokens

**When data is sent**: When email marketing workflows are triggered.

**Terms of Service**: [Acumbamail Terms](https://acumbamail.com/terminos-condiciones/)  
**Privacy Policy**: [Acumbamail Privacy Policy](https://acumbamail.com/politica-privacidad/)

---

### EmailOctopus

**Service URL**: `https://emailoctopus.com/api/`

**What it does**: Manages email lists and campaigns.

**Data sent**:

- Email addresses and contact details
- List IDs
- Custom fields
- API keys

**When data is sent**: When subscriber management workflows are triggered.

**Terms of Service**: [EmailOctopus Terms of Service](https://emailoctopus.com/legal/terms)  
**Privacy Policy**: [EmailOctopus Privacy Policy](https://emailoctopus.com/legal/privacy)

---

### BenchMark

**Service URL**: `https://clientapi.benchmarkemail.com/`

**What it does**: Manages email contacts and marketing campaigns.

**Data sent**:

- Contact information (email, name, fields)
- List subscriptions
- API credentials

**When data is sent**: When email marketing workflows are triggered.

**Terms of Service**: [Benchmark Terms of Service](https://www.benchmarkemail.com/terms-of-service/)  
**Privacy Policy**: [Benchmark Privacy Policy](https://www.benchmarkemail.com/privacy-policy/)

---

### ElasticEmail

**Service URL**: `https://api.elasticemail.com/`

**What it does**: Sends emails and manages email contacts.

**Data sent**:

- Email content and addresses
- Contact list data
- API keys

**When data is sent**: When email sending workflows are triggered.

**Terms of Service**: [Elastic Email Terms of Service](https://elasticemail.com/resources/usage-policies/terms-of-use/)  
**Privacy Policy**: [Elastic Email Privacy Policy](https://elasticemail.com/resources/usage-policies/privacy-policy/)

---

## CRM Services

### HubSpot

**Service URL**: `https://api.hubapi.com/`

**What it does**: Manages contacts, companies, deals, and tickets in HubSpot CRM.

**Data sent**:

- Contact information (email, name, phone, address)
- Company and deal data
- Custom properties
- Activity and engagement data
- API keys or OAuth tokens

**When data is sent**: When CRM workflows are triggered by form submissions, purchases, or other events.

**Terms of Service**: [HubSpot Terms of Service](https://legal.hubspot.com/terms-of-service)  
**Privacy Policy**: [HubSpot Privacy Policy](https://legal.hubspot.com/privacy-policy)

---

### Salesforce

**Service URL**: Account-specific (e.g., `https://yourinstance.salesforce.com/`)

**What it does**: Manages leads, contacts, opportunities, and custom objects in Salesforce.

**Data sent**:

- Lead and contact information
- Opportunity and account data
- Custom object data
- OAuth credentials

**When data is sent**: When Salesforce integration workflows are triggered.

**Terms of Service**: [Salesforce Terms of Service](https://www.salesforce.com/company/legal/agreements/)  
**Privacy Policy**: [Salesforce Privacy Policy](https://www.salesforce.com/company/privacy/)

---

### Pipedrive

**Service URL**: `https://api.pipedrive.com/`

**What it does**: Manages deals, contacts, and organizations in Pipedrive CRM.

**Data sent**:

- Contact and organization details
- Deal information and pipeline data
- Custom fields
- API tokens

**When data is sent**: When CRM sync workflows are triggered.

**Terms of Service**: [Pipedrive Terms of Service](https://www.pipedrive.com/en/terms-of-service/us)  
**Privacy Policy**: [Pipedrive Privacy Policy](https://www.pipedrive.com/en/privacy)

---

### Insightly

**Service URL**: `https://api.insightly.com/` or regional variants

**What it does**: Manages contacts, organizations, and opportunities in Insightly CRM.

**Data sent**:

- Contact and organization data
- Opportunity information
- Custom fields
- API keys

**When data is sent**: When CRM workflows are triggered.

**Terms of Service**: [Insightly Terms of Service](https://www.insightly.com/terms-of-service)  
**Privacy Policy**: [Insightly Privacy Policy](https://www.insightly.com/privacy-policy)

---

### CapsuleCRM

**Service URL**: `https://api.capsulecrm.com/`

**What it does**: Manages contacts and sales opportunities in Capsule CRM.

**Data sent**:

- Contact information (name, email, address)
- Opportunity and case data
- Tags and custom fields
- API tokens

**When data is sent**: When CRM workflows are triggered.

**Terms of Service**: [Capsule CRM Terms](https://capsulecrm.com/terms/)  
**Privacy Policy**: [Capsule CRM Privacy Policy](https://capsulecrm.com/privacy/)

---

### Copper CRM

**Service URL**: `https://api.copper.com/`

**What it does**: Manages people, companies, and opportunities in Copper CRM.

**Data sent**:

- Person and company information
- Opportunity and project data
- Custom fields
- API keys

**When data is sent**: When CRM workflows are triggered.

**Terms of Service**: [Copper Terms of Service](https://www.copper.com/terms)  
**Privacy Policy**: [Copper Privacy Policy](https://www.copper.com/privacy)

---

### FreshSales (Freshworks CRM)

**Service URL**: Account-specific (e.g., `https://domain.myfreshworks.com/crm/sales/`)

**What it does**: Manages leads, contacts, accounts, and deals in Freshsales CRM.

**Data sent**:

- Lead and contact details
- Account and deal information
- Custom fields
- API keys

**When data is sent**: When CRM workflows are triggered.

**Terms of Service**: [Freshworks Terms of Service](https://www.freshworks.com/terms/)  
**Privacy Policy**: [Freshworks Privacy Policy](https://www.freshworks.com/privacy/)

---

### Salesmate

**Service URL**: `https://apis.salesmate.io/`

**What it does**: Manages contacts, companies, and deals in Salesmate CRM.

**Data sent**:

- Contact and company information
- Deal and activity data
- Custom fields
- API credentials

**When data is sent**: When CRM workflows are triggered.

**Terms of Service**: [Salesmate Terms of Service](https://www.salesmate.io/terms-of-service/)  
**Privacy Policy**: [Salesmate Privacy Policy](https://www.salesmate.io/privacy-policy/)

---

### Salesflare

**Service URL**: `https://api.salesflare.com/`

**What it does**: Manages contacts, accounts, and opportunities in Salesflare CRM.

**Data sent**:

- Contact and account information
- Opportunity data
- API keys

**When data is sent**: When CRM workflows are triggered.

**Terms of Service**: [Salesflare Terms](https://salesflare.com/terms)  
**Privacy Policy**: [Salesflare Privacy](https://salesflare.com/privacy)

---

### Agiled CRM

**Service URL**: `https://app.agiled.app/` and API endpoints

**What it does**: Manages contacts, deals, and projects in Agiled CRM.

**Data sent**:

- Contact and company information
- Deal and project data
- Custom fields
- API tokens

**When data is sent**: When CRM workflows are triggered.

**Terms of Service**: [Agiled Terms](https://agiled.app/terms-and-conditions)  
**Privacy Policy**: [Agiled Privacy Policy](https://agiled.app/privacy-policy)

---

### Nimble

**Service URL**: `https://api.nimble.com/`

**What it does**: Manages contacts and relationships in Nimble CRM.

**Data sent**:

- Contact information
- Notes and activities
- Tags and custom fields
- OAuth credentials

**When data is sent**: When CRM workflows are triggered.

**Terms of Service**: [Nimble Terms of Service](https://www.nimble.com/terms-of-service/)  
**Privacy Policy**: [Nimble Privacy Policy](https://www.nimble.com/privacy-policy/)

---

### OneHashCRM

**Service URL**: User's self-hosted or cloud instance URL

**What it does**: Manages leads, contacts, and deals in OneHash CRM.

**Data sent**:

- Lead and contact data
- Deal information
- Custom fields
- API keys

**When data is sent**: When CRM workflows are triggered.

**Terms of Service**: [OneHash Terms](https://onehash.ai/terms)  
**Privacy Policy**: [OneHash Privacy Policy](https://onehash.ai/privacy-policy)

---

### NutshellCRM

**Service URL**: `https://api.nutshell.com/`

**What it does**: Manages contacts, leads, and sales processes in Nutshell CRM.

**Data sent**:

- Contact and company information
- Lead and opportunity data
- Custom fields
- API credentials

**When data is sent**: When CRM workflows are triggered.

**Terms of Service**: [Nutshell Terms of Service](https://www.nutshell.com/terms)  
**Privacy Policy**: [Nutshell Privacy Policy](https://www.nutshell.com/privacy)

---

### CompanyHub

**Service URL**: `https://api.companyhub.com/`

**What it does**: Manages contacts, companies, and deals in CompanyHub CRM.

**Data sent**:

- Contact and company records
- Deal and pipeline data
- Custom fields
- API tokens

**When data is sent**: When CRM workflows are triggered.

**Terms of Service**: [CompanyHub Terms](https://companyhub.com/terms-of-service/)  
**Privacy Policy**: [CompanyHub Privacy Policy](https://companyhub.com/privacy-policy/)

---

### ClinchPad

**Service URL**: `https://www.clinchpad.com/api/`

**What it does**: Manages leads and sales pipeline in ClinchPad CRM.

**Data sent**:

- Lead information
- Pipeline and deal data
- Contact details
- API keys

**When data is sent**: When leads or deals are created via configured workflows.

**Terms of Service**: [ClinchPad Terms](https://clinchpad.com/terms-of-service)  
**Privacy Policy**: [ClinchPad Privacy Policy](https://clinchpad.com/privacy-policy)

---

### MoxieCRM (PropovoiceCRM)

**Service URL**: Integration via WordPress plugins

**What it does**: Manages customer relationships within WordPress.

**Data sent**:

- Contact information
- Deal and invoice data
- Project details
- Internal to WordPress installation

**When data is sent**: When CRM workflows are triggered.

**Terms of Service**: Based on plugin and hosting  
**Privacy Policy**: Based on plugin and hosting

---

### PerfexCRM

**Service URL**: User's self-hosted installation URL

**What it does**: Manages customers, leads, projects, and invoices in self-hosted Perfex CRM.

**Data sent**:

- Customer and lead information
- Project and task data
- Invoice details
- Custom fields
- API keys

**When data is sent**: When CRM workflows are triggered.

**Terms of Service**: Varies by installation  
**Privacy Policy**: Varies by installation

---

### Flowlu

**Service URL**: `https://api.flowlu.com/`

**What it does**: Manages CRM, projects, and collaboration in Flowlu.

**Data sent**:

- Contact and organization data
- Opportunity information
- Project and task data
- API tokens

**When data is sent**: When CRM or project workflows are triggered.

**Terms of Service**: [Flowlu Terms of Service](https://www.flowlu.com/terms/)  
**Privacy Policy**: [Flowlu Privacy Policy](https://www.flowlu.com/privacy/)

---

### LionDesk

**Service URL**: `https://api.liondesk.com/`

**What it does**: Real estate CRM for managing contacts and transactions.

**Data sent**:

- Contact information
- Transaction details
- Notes and activities
- API credentials

**When data is sent**: When real estate CRM workflows are triggered.

**Terms of Service**: [LionDesk Terms](https://www.liondesk.com/terms-of-service/)  
**Privacy Policy**: [LionDesk Privacy Policy](https://www.liondesk.com/privacy-policy/)

---

### HighLevel (GoHighLevel)

**Service URL**: `https://rest.gohighlevel.com/`

**What it does**: All-in-one marketing and CRM platform for agencies.

**Data sent**:

- Contact information
- Opportunity and pipeline data
- Appointment details
- Custom fields
- API tokens

**When data is sent**: When CRM or marketing workflows are triggered.

**Terms of Service**: [HighLevel Terms of Service](https://www.gohighlevel.com/terms-of-service)  
**Privacy Policy**: [HighLevel Privacy Policy](https://www.gohighlevel.com/privacy-policy)

---

### SuiteDash

**Service URL**: User's SuiteDash instance URL

**What it does**: Manages clients, projects, and business operations.

**Data sent**:

- Client information
- Project and file data
- Invoice details
- API keys

**When data is sent**: When business management workflows are triggered.

**Terms of Service**: [SuiteDash Terms](https://suitedash.com/terms-of-service/)  
**Privacy Policy**: [SuiteDash Privacy Policy](https://suitedash.com/privacy-policy/)

---

### Vbout

**Service URL**: `https://api.vbout.com/`

**What it does**: Marketing automation and CRM platform.

**Data sent**:

- Contact information
- List subscriptions
- Behavioral data
- API credentials

**When data is sent**: When marketing automation workflows are triggered.

**Terms of Service**: [Vbout Terms of Service](https://www.vbout.com/terms/)  
**Privacy Policy**: [Vbout Privacy Policy](https://www.vbout.com/privacy/)

---

## Project Management Services

### Trello

**Service URL**: `https://api.trello.com/`

**What it does**: Creates cards, lists, and manages boards in Trello.

**Data sent**:

- Card details (title, description, due date)
- Board and list IDs
- Member assignments
- Attachment data
- API keys and tokens

**When data is sent**: When project management workflows are triggered.

**Terms of Service**: [Trello Terms of Service](https://www.atlassian.com/legal/customer-agreement)  
**Privacy Policy**: [Atlassian Privacy Policy](https://www.atlassian.com/legal/privacy-policy)

---

### Asana

**Service URL**: `https://app.asana.com/api/`

**What it does**: Creates and manages tasks and projects in Asana.

**Data sent**:

- Task details (name, description, due date)
- Project and workspace IDs
- Assignee information
- API tokens

**When data is sent**: When task management workflows are triggered.

**Terms of Service**: [Asana Terms of Service](https://asana.com/terms)  
**Privacy Policy**: [Asana Privacy Policy](https://asana.com/terms#privacy-policy)

---

### ClickUp

**Service URL**: `https://api.clickup.com/`

**What it does**: Manages tasks, lists, and projects in ClickUp.

**Data sent**:

- Task information (name, description, priority)
- List and folder IDs
- Assignee details
- Custom fields
- API tokens

**When data is sent**: When project workflows are triggered.

**Terms of Service**: [ClickUp Terms](https://clickup.com/terms)  
**Privacy Policy**: [ClickUp Privacy Policy](https://clickup.com/privacy)

---

## Communication Services

### Slack

**Service URL**: `https://slack.com/api/`

**What it does**: Sends messages and notifications to Slack channels.

**Data sent**:

- Message content
- Channel IDs
- User mentions
- File attachments when configured
- Webhook URLs or API tokens

**When data is sent**: When notification workflows are triggered.

**Terms of Service**: [Slack Terms of Service](https://slack.com/terms-of-service)  
**Privacy Policy**: [Slack Privacy Policy](https://slack.com/privacy-policy)

---

### Telegram

**Service URL**: `https://api.telegram.org/`

**What it does**: Sends messages to Telegram chats or channels.

**Data sent**:

- Message text
- Chat IDs
- Bot tokens
- Media files when configured

**When data is sent**: When messaging workflows are triggered.

**Terms of Service**: [Telegram Terms of Service](https://telegram.org/tos)  
**Privacy Policy**: [Telegram Privacy Policy](https://telegram.org/privacy)

---

### Discord

**Service URL**: `https://discord.com/api/`

**What it does**: Sends messages to Discord channels via webhooks or bot.

**Data sent**:

- Message content
- Webhook URLs
- Embed data
- File attachments when configured

**When data is sent**: When Discord notification workflows are triggered.

**Terms of Service**: [Discord Terms of Service](https://discord.com/terms)  
**Privacy Policy**: [Discord Privacy Policy](https://discord.com/privacy)

---

### Twilio

**Service URL**: `https://api.twilio.com/`

**What it does**: Sends SMS messages via Twilio service.

**Data sent**:

- Phone numbers (sender and recipient)
- SMS message content
- Account SID and Auth Token

**When data is sent**: When SMS workflows are triggered.

**Terms of Service**: [Twilio Terms of Service](https://www.twilio.com/legal/tos)  
**Privacy Policy**: [Twilio Privacy Policy](https://www.twilio.com/legal/privacy)

---

## Storage Services

### Dropbox

**Service URL**: `https://api.dropboxapi.com/`

**What it does**: Uploads files to Dropbox folders.

**Data sent**:

- File contents and metadata
- Folder paths
- OAuth tokens

**When data is sent**: When file upload workflows are triggered.

**Terms of Service**: [Dropbox Terms of Service](https://www.dropbox.com/terms)  
**Privacy Policy**: [Dropbox Privacy Policy](https://www.dropbox.com/privacy)

---

### OneDrive

**Service URL**: `https://graph.microsoft.com/` (Microsoft Graph API)

**What it does**: Uploads files to OneDrive storage.

**Data sent**:

- File contents and metadata
- Folder paths
- OAuth tokens

**When data is sent**: When file upload workflows are triggered.

**Terms of Service**: [Microsoft Services Agreement](https://www.microsoft.com/servicesagreement)  
**Privacy Policy**: [Microsoft Privacy Statement](https://privacy.microsoft.com/privacystatement)

---

### pCloud

**Service URL**: `https://api.pcloud.com/`

**What it does**: Uploads files to pCloud storage.

**Data sent**:

- File contents and metadata
- Folder identifiers
- Authentication tokens

**When data is sent**: When file upload workflows are triggered.

**Terms of Service**: [pCloud Terms of Service](https://www.pcloud.com/terms_and_conditions.html)  
**Privacy Policy**: [pCloud Privacy Policy](https://www.pcloud.com/privacy_policy.html)

---

## Automation Platform Services

### Zapier

**Service URL**: Webhook URLs provided by Zapier

**What it does**: Triggers Zapier workflows (Zaps) to connect with 5000+ apps.

**Data sent**:

- Webhook payload data as configured in workflows
- Can include any WordPress data based on user configuration
- Data is sent to user-provided webhook URLs

**When data is sent**: When configured trigger events occur in WordPress.

**Terms of Service**: [Zapier Terms of Service](https://zapier.com/terms)  
**Privacy Policy**: [Zapier Privacy Policy](https://zapier.com/privacy)

---

### Make (Integromat)

**Service URL**: Webhook URLs provided by Make

**What it does**: Triggers Make scenarios to automate workflows across apps.

**Data sent**:

- Webhook payload data as configured
- Can include any WordPress data based on user configuration

**When data is sent**: When configured trigger events occur in WordPress.

**Terms of Service**: [Make Terms of Service](https://www.make.com/en/terms-of-service)  
**Privacy Policy**: [Make Privacy Policy](https://www.make.com/en/privacy-policy)

---

### Pabbly Connect

**Service URL**: Webhook URLs provided by Pabbly

**What it does**: Triggers Pabbly workflows to connect various applications.

**Data sent**:

- Webhook payload data as configured
- User-defined WordPress data

**When data is sent**: When configured trigger events occur in WordPress.

**Terms of Service**: [Pabbly Terms of Service](https://www.pabbly.com/terms-conditions/)  
**Privacy Policy**: [Pabbly Privacy Policy](https://www.pabbly.com/privacy-policy/)

---

### N8N

**Service URL**: User's self-hosted or cloud N8N instance

**What it does**: Triggers N8N workflows for automation.

**Data sent**:

- Webhook payload data as configured
- User-defined data based on workflows

**When data is sent**: When configured trigger events occur in WordPress.

**Terms of Service**: [N8N Terms](https://n8n.io/legal/terms/) (for cloud)  
**Privacy Policy**: [N8N Privacy](https://n8n.io/legal/privacy/) (for cloud)

---

### Integrately

**Service URL**: Webhook URLs provided by Integrately

**What it does**: Triggers Integrately automations.

**Data sent**:

- Webhook payload data
- User-configured WordPress data

**When data is sent**: When configured trigger events occur.

**Terms of Service**: [Integrately Terms](https://integrately.com/terms-of-service)  
**Privacy Policy**: [Integrately Privacy Policy](https://integrately.com/privacy-policy)

---

### KonnectzIT

**Service URL**: Webhook URLs provided by KonnectzIT

**What it does**: Triggers KonnectzIT workflows.

**Data sent**:

- Webhook payload data
- User-configured data

**When data is sent**: When configured triggers occur.

**Terms of Service**: [KonnectzIT Terms](https://www.konnectzit.com/terms-of-service/)  
**Privacy Policy**: [KonnectzIT Privacy Policy](https://www.konnectzit.com/privacy-policy/)

---

### SureTriggers (OttoKit)

**Service URL**: Integration with SureTriggers WordPress plugin

**What it does**: Triggers SureTriggers workflows within WordPress.

**Data sent**:

- Internal WordPress data exchange
- May connect to external services via SureTriggers

**When data is sent**: When configured trigger events occur.

**Terms of Service**: [SureTriggers Terms](https://suretriggers.com/terms-and-conditions/)  
**Privacy Policy**: [SureTriggers Privacy Policy](https://suretriggers.com/privacy-policy/)

---

### SyncSpider

**Service URL**: `https://www.syncspider.com/` API endpoints

**What it does**: Synchronizes data between applications.

**Data sent**:

- Configured WordPress data
- API credentials

**When data is sent**: When sync workflows are triggered.

**Terms of Service**: [SyncSpider Terms](https://syncspider.com/terms-and-conditions/)  
**Privacy Policy**: [SyncSpider Privacy Policy](https://syncspider.com/privacy-policy/)

---

### Albato

**Service URL**: Webhook URLs provided by Albato

**What it does**: Automates workflows between applications.

**Data sent**:

- Webhook payload data
- User-configured data

**When data is sent**: When configured triggers occur.

**Terms of Service**: [Albato Terms](https://albato.com/terms)  
**Privacy Policy**: [Albato Privacy Policy](https://albato.com/privacy)

---

### SperseIO

**Service URL**: Webhook URLs provided by SperseIO

**What it does**: Automates business workflows.

**Data sent**:

- Webhook payload data
- User-configured data

**When data is sent**: When configured triggers occur.

**Terms of Service**: [SperseIO Terms](https://www.sperse.io/terms-conditions/)  
**Privacy Policy**: [SperseIO Privacy Policy](https://www.sperse.io/privacy-policy/)

---

### AntApps

**Service URL**: Webhook URLs provided by AntApps

**What it does**: Triggers AntApps automations.

**Data sent**:

- Webhook payload data
- User-configured data

**When data is sent**: When configured triggers occur.

**Terms of Service**: Check AntApps website  
**Privacy Policy**: Check AntApps website

---

## Learning Management Systems

### LearnDash (via WooCommerce or Direct)

Note: LearnDash is a WordPress plugin. Data stays within WordPress unless connected to external services via other integrations.

---

### TutorLMS (via WooCommerce or Direct)

Note: TutorLMS is a WordPress plugin. Data stays within WordPress unless connected to external services via other integrations.

---

### Academy LMS

Note: Academy LMS is a WordPress plugin. Data stays within WordPress unless connected to external services.

---

### MasterStudy LMS

Note: MasterStudy LMS is a WordPress plugin. Data stays within WordPress unless connected to external services.

---

### LifterLMS

Note: LifterLMS is a WordPress plugin. Data stays within WordPress unless connected to external services.

---

### Zoom (for webinars and meetings)

**Service URL**: `https://api.zoom.us/`

**What it does**: Creates meetings and webinars, manages registrations.

**Data sent**:

- Meeting/webinar details
- Registrant information (name, email)
- OAuth credentials

**When data is sent**: When meeting/webinar workflows are triggered.

**Terms of Service**: [Zoom Terms of Service](https://explore.zoom.us/en/terms/)  
**Privacy Policy**: [Zoom Privacy Statement](https://explore.zoom.us/en/privacy/)

---

## E-commerce Services

Note: WooCommerce, GiveWP, SureCart, and other WordPress plugins process data within WordPress. Data is only sent externally when integrated with other external services through Bit Integrations.

---

## Marketing Automation Services

### Mautic

**Service URL**: User's self-hosted or cloud Mautic instance

**What it does**: Manages contacts and marketing automation campaigns.

**Data sent**:

- Contact information
- Behavioral data
- Campaign assignments
- API credentials

**When data is sent**: When marketing automation workflows are triggered.

**Terms of Service**: [Mautic Terms](https://www.mautic.org/terms-of-service) or per installation  
**Privacy Policy**: [Mautic Privacy](https://www.mautic.org/privacy-policy) or per installation

---

### Encharge

**Service URL**: `https://api.encharge.io/`

**What it does**: Marketing automation for SaaS and digital businesses.

**Data sent**:

- User and contact data
- Event tracking data
- Custom fields
- API keys

**When data is sent**: When user behavior or form submissions trigger workflows.

**Terms of Service**: [Encharge Terms](https://encharge.io/terms)  
**Privacy Policy**: [Encharge Privacy Policy](https://encharge.io/privacy)

---

### Lemlist

**Service URL**: `https://api.lemlist.com/`

**What it does**: Email outreach and campaign management.

**Data sent**:

- Lead information
- Campaign assignments
- Email addresses
- API keys

**When data is sent**: When outreach workflows are triggered.

**Terms of Service**: [Lemlist Terms](https://www.lemlist.com/terms-of-service)  
**Privacy Policy**: [Lemlist Privacy Policy](https://www.lemlist.com/privacy-policy)

---

### Woodpecker

**Service URL**: `https://api.woodpecker.co/`

**What it does**: Cold email automation and follow-ups.

**Data sent**:

- Prospect information
- Email content and campaign data
- API keys

**When data is sent**: When email outreach workflows are triggered.

**Terms of Service**: [Woodpecker Terms](https://woodpecker.co/terms/)  
**Privacy Policy**: [Woodpecker Privacy Policy](https://woodpecker.co/privacy-policy/)

---

### Gravitec

**Service URL**: `https://gravitec.net/` API endpoints

**What it does**: Web push notification service.

**Data sent**:

- Subscriber tokens
- Notification content
- Segmentation data
- API keys

**When data is sent**: When push notification workflows are triggered.

**Terms of Service**: [Gravitec Terms](https://gravitec.net/terms-of-service/)  
**Privacy Policy**: [Gravitec Privacy Policy](https://gravitec.net/privacy-policy/)

---

### SystemeIO

**Service URL**: `https://api.systeme.io/api`

**What it does**: All-in-one marketing platform for course creation, email marketing, and sales funnels.

**Data sent**:

- Contact information (email, name, tags)
- Course enrollment data
- Purchase information
- Custom field data
- API keys

**When data is sent**: When marketing automation or course enrollment workflows are triggered.

**Terms of Service**: [Systeme.io Terms](https://systeme.io/terms-and-conditions)  
**Privacy Policy**: [Systeme.io Privacy Policy](https://systeme.io/privacy-policy)

---

## Other Third-Party Services

### Airtable

**Service URL**: `https://api.airtable.com/`

**What it does**: Syncs data to Airtable databases/tables.

**Data sent**:

- Record data as configured
- Table and base identifiers
- API keys

**When data is sent**: When database sync workflows are triggered.

**Terms of Service**: [Airtable Terms of Service](https://www.airtable.com/company/terms-of-service)  
**Privacy Policy**: [Airtable Privacy Policy](https://www.airtable.com/company/privacy)

---

### Notion

**Service URL**: `https://api.notion.com/`

**What it does**: Creates and updates pages and databases in Notion.

**Data sent**:

- Page content and properties
- Database records
- OAuth tokens

**When data is sent**: When Notion workflows are triggered.

**Terms of Service**: [Notion Terms of Service](https://www.notion.so/Terms-and-Privacy-28ffdd083dc3473e9c2da6ec011b58ac)  
**Privacy Policy**: [Notion Privacy Policy](https://www.notion.so/Privacy-Policy-3468d120cf614d4c9014c09f6adc9091)

---

### SmartSuite

**Service URL**: `https://app.smartsuite.com/api/`

**What it does**: Manages records in SmartSuite collaborative work management platform.

**Data sent**:

- Record data
- App and table identifiers
- API tokens

**When data is sent**: When SmartSuite workflows are triggered.

**Terms of Service**: [SmartSuite Terms](https://www.smartsuite.com/terms-of-service)  
**Privacy Policy**: [SmartSuite Privacy Policy](https://www.smartsuite.com/privacy-policy)

---

### Freshdesk

**Service URL**: Account-specific (e.g., `https://domain.freshdesk.com/api/`)

**What it does**: Creates support tickets and manages contacts in Freshdesk.

**Data sent**:

- Ticket details (subject, description, priority)
- Contact information
- Custom fields
- API keys

**When data is sent**: When support ticket workflows are triggered.

**Terms of Service**: [Freshworks Terms of Service](https://www.freshworks.com/terms/)  
**Privacy Policy**: [Freshworks Privacy Policy](https://www.freshworks.com/privacy/)

---

### Zendesk

**Service URL**: Account-specific (e.g., `https://subdomain.zendesk.com/api/`)

**What it does**: Creates tickets and manages contacts in Zendesk.

**Data sent**:

- Ticket information
- User/contact details
- Custom fields
- API tokens

**When data is sent**: When ticket creation workflows are triggered.

**Terms of Service**: [Zendesk Terms of Service](https://www.zendesk.com/company/agreements-and-terms/master-subscription-agreement/)  
**Privacy Policy**: [Zendesk Privacy Policy](https://www.zendesk.com/company/agreements-and-terms/privacy-policy/)

---

### Keap (Infusionsoft)

**Service URL**: `https://api.infusionsoft.com/`

**What it does**: Manages contacts, sales, and marketing automation.

**Data sent**:

- Contact information
- Tags and custom fields
- Order data
- OAuth credentials

**When data is sent**: When CRM and marketing workflows are triggered.

**Terms of Service**: [Keap Terms of Service](https://keap.com/legal/terms-of-service)  
**Privacy Policy**: [Keap Privacy Policy](https://keap.com/legal/privacy-policy)

---

### Demio

**Service URL**: `https://my.demio.com/api/`

**What it does**: Manages webinar registrations in Demio.

**Data sent**:

- Registrant information (name, email)
- Webinar IDs
- Custom fields
- API keys

**When data is sent**: When webinar registration workflows are triggered.

**Terms of Service**: [Demio Terms of Service](https://demio.com/terms)  
**Privacy Policy**: [Demio Privacy Policy](https://demio.com/privacy)

---

### Livestorm

**Service URL**: `https://api.livestorm.co/`

**What it does**: Manages event registrations for webinars and meetings.

**Data sent**:

- Participant information
- Event IDs
- Custom fields
- API tokens

**When data is sent**: When event registration workflows are triggered.

**Terms of Service**: [Livestorm Terms](https://livestorm.co/terms)  
**Privacy Policy**: [Livestorm Privacy Policy](https://livestorm.co/privacy)

---

### Fabman

**Service URL**: `https://fabman.io/api/`

**What it does**: Manages memberships and resource bookings for makerspaces and coworking spaces.

**Data sent**:

- Member information
- Booking data
- API keys

**When data is sent**: When membership or booking workflows are triggered.

**Terms of Service**: [Fabman Terms](https://fabman.io/terms/)  
**Privacy Policy**: [Fabman Privacy Policy](https://fabman.io/privacy/)

---

### DirectIQ

**Service URL**: `https://www.directiq.com/` API endpoints

**What it does**: Email marketing and newsletter management.

**Data sent**:

- Subscriber information
- List assignments
- API credentials

**When data is sent**: When email marketing workflows are triggered.

**Terms of Service**: [DirectIQ Terms](https://www.directiq.com/terms-of-service)  
**Privacy Policy**: [DirectIQ Privacy Policy](https://www.directiq.com/privacy-policy)

---

### GetGist

**Service URL**: `https://api.getgist.com/`

**What it does**: Marketing automation, live chat, and email marketing.

**Data sent**:

- Contact information
- Event tracking data
- Custom properties
- API keys

**When data is sent**: When marketing workflows are triggered.

**Terms of Service**: [Gist Terms of Service](https://getgist.com/terms/)  
**Privacy Policy**: [Gist Privacy Policy](https://getgist.com/privacy/)

---

### Bento

**Service URL**: `https://app.bentonow.com/api/`

**What it does**: Email marketing and automation platform.

**Data sent**:

- Subscriber data
- Event tracking
- Tags and custom properties
- API keys

**When data is sent**: When email marketing workflows are triggered.

**Terms of Service**: [Bento Terms](https://www.bentonow.com/terms)  
**Privacy Policy**: [Bento Privacy Policy](https://www.bentonow.com/privacy)

---

### Campaign Monitor

**Service URL**: `https://api.createsend.com/`

**What it does**: Email marketing campaign management.

**Data sent**:

- Subscriber information
- List IDs
- Custom fields
- API keys

**When data is sent**: When email marketing workflows are triggered.

**Terms of Service**: [Campaign Monitor Terms](https://www.campaignmonitor.com/policies/)  
**Privacy Policy**: [Campaign Monitor Privacy](https://www.campaignmonitor.com/policies/)

---

### Constant Contact

**Service URL**: `https://api.cc.email/v3/` and `https://authz.constantcontact.com/`

**What it does**: Email marketing platform for managing contacts, lists, and campaigns.

**Data sent**:

- Contact information (email, name, phone, address)
- List memberships
- Tags and custom fields
- OAuth credentials
- API keys

**When data is sent**: When contact and email marketing workflows are triggered.

**Terms of Service**: [Constant Contact Terms of Service](https://www.constantcontact.com/legal/terms-and-conditions)  
**Privacy Policy**: [Constant Contact Privacy Policy](https://www.constantcontact.com/legal/privacy-statement)

---

### MailRelay

**Service URL**: `https://api.mailrelay.com/`

**What it does**: Email marketing and newsletter service.

**Data sent**:

- Subscriber data
- Group assignments
- Custom fields
- API keys

**When data is sent**: When email marketing workflows are triggered.

**Terms of Service**: [MailRelay Terms](https://mailrelay.com/en/terms-and-conditions)  
**Privacy Policy**: [MailRelay Privacy](https://mailrelay.com/en/privacy-policy)

---

### MailUp

**Service URL**: `https://services.mailup.com/`

**What it does**: Email and SMS marketing platform.

**Data sent**:

- Contact information
- List subscriptions
- Custom fields
- API credentials

**When data is sent**: When marketing workflows are triggered.

**Terms of Service**: [MailUp Terms](https://www.mailup.com/terms-of-service/)  
**Privacy Policy**: [MailUp Privacy Policy](https://www.mailup.com/privacy-policy/)

---

### Mailercloud

**Service URL**: `https://cloudapi.mailercloud.com/`

**What it does**: Email marketing automation.

**Data sent**:

- Contact details
- List assignments
- Custom fields
- API keys

**When data is sent**: When email workflows are triggered.

**Terms of Service**: [Mailercloud Terms](https://www.mailercloud.com/terms-of-service)  
**Privacy Policy**: [Mailercloud Privacy](https://www.mailercloud.com/privacy-policy)

---

### Mailify (Sarbacane)

**Service URL**: `https://api.mailify.com/`

**What it does**: Email and SMS marketing platform.

**Data sent**:

- Contact information
- List subscriptions
- API credentials

**When data is sent**: When marketing workflows are triggered.

**Terms of Service**: [Mailify Terms](https://www.mailify.com/en/legal-notice)  
**Privacy Policy**: [Mailify Privacy](https://www.mailify.com/en/privacy-policy)

---

### Mailjet

**Service URL**: `https://api.mailjet.com/`

**What it does**: Email delivery and marketing platform.

**Data sent**:

- Email content and addresses
- Contact list data
- API keys

**When data is sent**: When email sending workflows are triggered.

**Terms of Service**: [Mailjet Terms](https://www.mailjet.com/legal/terms-of-use/)  
**Privacy Policy**: [Mailjet Privacy](https://www.mailjet.com/legal/privacy-policy/)

---

### Mailster

Note: Mailster is a WordPress plugin. Data stays within WordPress unless connected to external email sending services.

---

### MailBluster

**Service URL**: `https://api.mailbluster.com/`

**What it does**: Email marketing service built on Amazon SES.

**Data sent**:

- Contact information
- List data
- Email content
- API keys

**When data is sent**: When email marketing workflows are triggered.

**Terms of Service**: [MailBluster Terms](https://mailbluster.com/terms-of-service)  
**Privacy Policy**: [MailBluster Privacy Policy](https://mailbluster.com/privacy-policy)

---

### MailMint

Note: MailMint is a WordPress-based email marketing plugin. Data stays within WordPress unless connected to external email sending services.

---

### MailerPress

Note: MailerPress is a WordPress plugin. Data stays within WordPress unless using external sending services.

---

### KirimEmail

**Service URL**: `https://api.kirimemail.com/`

**What it does**: Email marketing service (Indonesia focused).

**Data sent**:

- Subscriber information
- List data
- API keys

**When data is sent**: When email marketing workflows are triggered.

**Terms of Service**: [KirimEmail Terms](https://www.kirim.email/terms)  
**Privacy Policy**: [KirimEmail Privacy](https://www.kirim.email/privacy)

---

### Rapidmail

**Service URL**: `https://apiv3.emailsys.net/`

**What it does**: Email marketing service.

**Data sent**:

- Recipient data
- List assignments
- API credentials

**When data is sent**: When email marketing workflows are triggered.

**Terms of Service**: [Rapidmail Terms](https://www.rapidmail.com/terms-and-conditions)  
**Privacy Policy**: [Rapidmail Privacy](https://www.rapidmail.com/privacy-policy)

---

### Selzy

**Service URL**: `https://api.selzy.com/`

**What it does**: Email marketing automation.

**Data sent**:

- Contact information
- List subscriptions
- API keys

**When data is sent**: When email workflows are triggered.

**Terms of Service**: [Selzy Terms](https://selzy.com/en/legal/terms/)  
**Privacy Policy**: [Selzy Privacy](https://selzy.com/en/legal/privacy/)

---

### SendFox

**Service URL**: `https://api.sendfox.com/`

**What it does**: Email marketing for content creators.

**Data sent**:

- Contact information
- List subscriptions
- API tokens

**When data is sent**: When email marketing workflows are triggered.

**Terms of Service**: [SendFox Terms](https://sendfox.com/terms)  
**Privacy Policy**: [SendFox Privacy](https://sendfox.com/privacy)

---

### Smaily

**Service URL**: `https://api.smaily.com/`

**What it does**: Email marketing automation.

**Data sent**:

- Subscriber data
- List assignments
- API credentials

**When data is sent**: When email workflows are triggered.

**Terms of Service**: [Smaily Terms](https://smaily.com/terms/)  
**Privacy Policy**: [Smaily Privacy](https://smaily.com/privacy/)

---

### ZagoMail

**Service URL**: `https://api.zagomail.com/`

**What it does**: Email marketing service.

**Data sent**:

- Contact information
- List data
- API keys

**When data is sent**: When email marketing workflows are triggered.

**Terms of Service**: [ZagoMail Terms](https://www.zagomail.com/terms-of-service)  
**Privacy Policy**: [ZagoMail Privacy](https://www.zagomail.com/privacy-policy)

---

### Line

**Service URL**: `https://api.line.me/`

**What it does**: Sends messages via Line messaging platform.

**Data sent**:

- Message content
- User IDs
- Channel access tokens

**When data is sent**: When Line messaging workflows are triggered.

**Terms of Service**: [Line Terms of Use](https://terms.line.me/line_terms/)  
**Privacy Policy**: [Line Privacy Policy](https://line.me/en/terms/policy/)

---

## Important Notes

1. **User Control**: All external service connections are completely opt-in. Data is never sent to any external service unless you explicitly configure an integration.

2. **API Keys and Credentials**: This plugin stores API keys, OAuth tokens, and credentials in your WordPress database (encrypted where possible). These credentials are used solely to authenticate with the services you choose to integrate.

3. **Data Mapping**: You have complete control over what data is sent to each service through the field mapping interface.

4. **Webhooks**: For webhook-based integrations, data is sent to URLs you provide. You are responsible for ensuring these webhook endpoints are secure and comply with privacy regulations.

5. **Logging**: Integration logs are stored locally in your WordPress database for debugging purposes. You can control log retention in plugin settings.

6. **GDPR and Privacy Compliance**: When using this plugin to send data to external services, you are responsible for:
   - Obtaining appropriate user consent
   - Providing privacy notices to your users
   - Ensuring compliance with GDPR, CCPA, and other applicable regulations
   - Reviewing the privacy policies and terms of service for each external service you use

7. **Data Security**: Always use HTTPS for your WordPress site and ensure WordPress, this plugin, and all other plugins are kept up to date.

8. **Third-Party Responsibility**: This plugin acts as a data processor. The third-party services you connect to have their own data processing practices. Please review their respective privacy policies and terms of service.

---

## Contact and Support

If you have questions about how this plugin uses external services or data privacy:

- **Support**: [https://tawk.to/chat/60eac4b6d6e7610a49aab375/1faah0r3e](https://tawk.to/chat/60eac4b6d6e7610a49aab375/1faah0r3e)
- **Documentation**: [https://bit-integrations.com/wp-docs/](https://bit-integrations.com/wp-docs/)
- **Website**: [https://bit-integrations.com/](https://bit-integrations.com/)

---

**Last Updated**: February 14, 2026
