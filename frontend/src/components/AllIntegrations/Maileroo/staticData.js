import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'send_email', label: __('Send Email', 'bit-integrations'), is_pro: true },
  {
    name: 'send_templated_email',
    label: __('Send Templated Email', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_scheduled_email',
    label: __('Delete Scheduled Email', 'bit-integrations'),
    is_pro: true
  },
  { name: 'resend_email', label: __('Resend Email', 'bit-integrations'), is_pro: true },
  { name: 'add_domain', label: __('Add Domain', 'bit-integrations'), is_pro: true },
  {
    name: 'update_domain_settings',
    label: __('Update Domain Settings', 'bit-integrations'),
    is_pro: true
  },
  { name: 'scan_dns_records', label: __('Scan DNS Records', 'bit-integrations'), is_pro: true },
  { name: 'delete_domain', label: __('Delete Domain', 'bit-integrations'), is_pro: true },
  { name: 'rename_sending_key', label: __('Rename Sending Key', 'bit-integrations'), is_pro: true },
  { name: 'delete_sending_key', label: __('Delete Sending Key', 'bit-integrations'), is_pro: true },
  {
    name: 'delete_smtp_account',
    label: __('Delete SMTP Account', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_inbound_route',
    label: __('Create Inbound Route', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_inbound_route',
    label: __('Update Inbound Route', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_inbound_route',
    label: __('Delete Inbound Route', 'bit-integrations'),
    is_pro: true
  },
  { name: 'add_suppression', label: __('Add Suppression', 'bit-integrations'), is_pro: true },
  { name: 'delete_suppression', label: __('Delete Suppression', 'bit-integrations'), is_pro: true },
  { name: 'create_template', label: __('Create Template', 'bit-integrations'), is_pro: true },
  { name: 'rename_template', label: __('Rename Template', 'bit-integrations'), is_pro: true },
  { name: 'delete_template', label: __('Delete Template', 'bit-integrations'), is_pro: true },
  {
    name: 'update_application',
    label: __('Update Application', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_application',
    label: __('Delete Application', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_webhook', label: __('Create Webhook', 'bit-integrations'), is_pro: true },
  { name: 'update_webhook', label: __('Update Webhook', 'bit-integrations'), is_pro: true },
  { name: 'delete_webhook', label: __('Delete Webhook', 'bit-integrations'), is_pro: true }
]

const enableDisableOptions = [
  { label: __('Enable', 'bit-integrations'), value: 'true' },
  { label: __('Disable', 'bit-integrations'), value: 'false' }
]

const yesNoOptions = [
  { label: __('Yes', 'bit-integrations'), value: 'true' },
  { label: __('No', 'bit-integrations'), value: 'false' }
]

const domainTypeOptions = [
  { label: __('Custom domain', 'bit-integrations'), value: 'custom' },
  { label: __('Free sub-domain', 'bit-integrations'), value: 'free' }
]

const expressionTypeOptions = [
  { label: __('Catch all', 'bit-integrations'), value: 'catch_all' },
  { label: __('Match recipient', 'bit-integrations'), value: 'match_recipient' },
  { label: __('Match header', 'bit-integrations'), value: 'match_header' },
  { label: __('Custom expression', 'bit-integrations'), value: 'custom' }
]

const templateTypeOptions = [
  { label: __('Visual editor (blank)', 'bit-integrations'), value: 'editor' },
  { label: __('HTML', 'bit-integrations'), value: 'html' },
  { label: __('URL', 'bit-integrations'), value: 'url' },
  { label: __('ZIP file', 'bit-integrations'), value: 'zip' }
]

const emailEventOptions = [
  { label: __('Accepted', 'bit-integrations'), value: 'accepted' },
  { label: __('Delivered', 'bit-integrations'), value: 'delivered' },
  { label: __('Opened', 'bit-integrations'), value: 'opened' },
  { label: __('Clicked', 'bit-integrations'), value: 'clicked' },
  { label: __('Deferred', 'bit-integrations'), value: 'deferred' },
  { label: __('Failed', 'bit-integrations'), value: 'failed' },
  { label: __('Complained', 'bit-integrations'), value: 'complained' },
  { label: __('Rejected', 'bit-integrations'), value: 'rejected' }
]

const field = (key, label, required = false, when = null) => ({ key, label, required, when })

const recipientFields = [
  field('from_email', __('From Email', 'bit-integrations'), true),
  field('to', __('To (comma separated)', 'bit-integrations'), true),
  field('subject', __('Subject', 'bit-integrations'), true),
  field('from_name', __('From Name', 'bit-integrations')),
  field('cc', __('CC (comma separated)', 'bit-integrations')),
  field('bcc', __('BCC (comma separated)', 'bit-integrations')),
  field('reply_to', __('Reply To (comma separated)', 'bit-integrations'))
]

const deliveryFields = [
  field('attachments', __('Attachments (URLs or uploads paths, comma separated)', 'bit-integrations')),
  field(
    'inline_images',
    __('Inline Images (URLs or uploads paths, comma separated)', 'bit-integrations')
  ),
  field('scheduled_at', __('Schedule At (up to 21 days ahead)', 'bit-integrations')),
  field('reference_id', __('Reference ID (24 hex characters)', 'bit-integrations'))
]

const inboundRouteFields = isCreate => [
  field('description', __('Description', 'bit-integrations'), isCreate),
  field(
    'forward_list',
    __('Forward To (emails or URLs, comma separated)', 'bit-integrations'),
    isCreate
  ),
  field('priority', __('Priority (1 to 100)', 'bit-integrations'), isCreate),
  field(
    'recipient',
    __('Recipient', 'bit-integrations'),
    isCreate,
    isCreate ? { expression_type: 'match_recipient' } : null
  ),
  field(
    'header_name',
    __('Header Name', 'bit-integrations'),
    isCreate,
    isCreate ? { expression_type: 'match_header' } : null
  ),
  field(
    'header_content',
    __('Header Content', 'bit-integrations'),
    isCreate,
    isCreate ? { expression_type: 'match_header' } : null
  ),
  field(
    'custom_expression',
    __('Custom Expression', 'bit-integrations'),
    isCreate,
    isCreate ? { expression_type: 'custom' } : null
  )
]

const domainIdField = field('domain_id', __('Domain ID or Name', 'bit-integrations'), true)
const sendingKeyIdField = field(
  'sending_key_id',
  __('Sending Key ID or Identifier', 'bit-integrations'),
  true
)
const routeIdField = field('route_id', __('Inbound Route ID or Description', 'bit-integrations'), true)
const templateIdField = field('template_id', __('Template ID or Name', 'bit-integrations'), true)
const applicationIdField = field(
  'application_id',
  __('Application ID or Name', 'bit-integrations'),
  true
)
const webhookIdField = field('webhook_id', __('Webhook ID or Callback URL', 'bit-integrations'), true)

export const fieldsByAction = {
  send_email: [
    ...recipientFields,
    field('html', __('HTML Body', 'bit-integrations')),
    field('plain', __('Plain Text Body', 'bit-integrations')),
    ...deliveryFields
  ],
  send_templated_email: [...recipientFields, ...deliveryFields],
  delete_scheduled_email: [field('reference_id', __('Reference ID', 'bit-integrations'), true)],
  resend_email: [field('message_id', __('Message ID', 'bit-integrations'), true)],
  add_domain: [
    field('domain_name', __('Domain Name', 'bit-integrations'), true, { domain_type: 'custom' }),
    field('sub_domain', __('Sub-domain', 'bit-integrations'), true, { domain_type: 'free' })
  ],
  update_domain_settings: [domainIdField, field('return_path', __('Return Path', 'bit-integrations'))],
  scan_dns_records: [domainIdField],
  delete_domain: [domainIdField],
  rename_sending_key: [sendingKeyIdField, field('name', __('New Name', 'bit-integrations'), true)],
  delete_sending_key: [sendingKeyIdField],
  delete_smtp_account: [
    field('smtp_account_id', __('SMTP Account ID or Email', 'bit-integrations'), true)
  ],
  create_inbound_route: inboundRouteFields(true),
  update_inbound_route: [routeIdField, ...inboundRouteFields(false)],
  delete_inbound_route: [routeIdField],
  add_suppression: [
    field('email_address', __('Email', 'bit-integrations'), true),
    field('reason', __('Reason', 'bit-integrations'))
  ],
  delete_suppression: [
    field('identifier', __('Suppressed Email or Suppression ID', 'bit-integrations'), true)
  ],
  create_template: [
    field('name', __('Template Name', 'bit-integrations'), true),
    field('html', __('HTML (full document)', 'bit-integrations'), true, { template_type: 'html' }),
    field('url', __('Template URL', 'bit-integrations'), true, { template_type: 'url' }),
    field('zip_file', __('ZIP File (URL or uploads path)', 'bit-integrations'), true, {
      template_type: 'zip'
    })
  ],
  rename_template: [templateIdField, field('template_name', __('New Name', 'bit-integrations'), true)],
  delete_template: [templateIdField],
  update_application: [
    applicationIdField,
    field('name', __('Application Name', 'bit-integrations')),
    field('ip_allowlist', __('IP Allowlist (comma separated)', 'bit-integrations')),
    field('local_part_list', __('Allowed From Local Parts (comma separated)', 'bit-integrations')),
    field(
      'allowed_recipient_domains',
      __('Allowed Recipient Domains (comma separated)', 'bit-integrations')
    ),
    field('notes', __('Notes', 'bit-integrations'))
  ],
  delete_application: [applicationIdField],
  create_webhook: [field('callback_url', __('Callback URL', 'bit-integrations'), true)],
  update_webhook: [webhookIdField],
  delete_webhook: [webhookIdField]
}

const customKeys = {
  customHeader: {
    keyLabel: __('Header Name', 'bit-integrations'),
    label: __('Custom Header', 'bit-integrations')
  },
  customTag: {
    keyLabel: __('Tag Name', 'bit-integrations'),
    label: __('Tag', 'bit-integrations')
  },
  customTemplateVariable: {
    keyLabel: __('Variable Name', 'bit-integrations'),
    label: __('Template Variable', 'bit-integrations')
  }
}

export const customKeysByAction = {
  send_email: ['customTag', 'customHeader'].map(key => ({ key, ...customKeys[key] })),
  send_templated_email: ['customTemplateVariable', 'customTag', 'customHeader'].map(key => ({
    key,
    ...customKeys[key]
  }))
}

const domainSelect = {
  key: 'domain_id',
  label: __('Domain', 'bit-integrations'),
  required: true,
  source: 'domains'
}

const expressionTypeSelect = required => ({
  key: 'expression_type',
  label: __('Match Type', 'bit-integrations'),
  options: expressionTypeOptions,
  required
})

const webhookSelects = [
  { key: 'domains', label: __('Domains', 'bit-integrations'), multi: true, source: 'domains' },
  {
    key: 'event_types',
    label: __('Event Types', 'bit-integrations'),
    multi: true,
    options: emailEventOptions
  }
]

export const selectsByAction = {
  send_email: [domainSelect],
  send_templated_email: [
    domainSelect,
    {
      key: 'template_id',
      label: __('Template', 'bit-integrations'),
      required: true,
      source: 'templates'
    }
  ],
  delete_scheduled_email: [domainSelect],
  add_domain: [
    {
      key: 'domain_type',
      label: __('Domain Type', 'bit-integrations'),
      options: domainTypeOptions,
      required: true
    }
  ],
  rename_sending_key: [domainSelect],
  delete_sending_key: [domainSelect],
  delete_smtp_account: [domainSelect],
  create_inbound_route: [domainSelect, expressionTypeSelect(true)],
  update_inbound_route: [domainSelect, expressionTypeSelect(false)],
  delete_inbound_route: [domainSelect],
  create_template: [
    {
      key: 'template_type',
      label: __('Template Type', 'bit-integrations'),
      options: templateTypeOptions,
      required: true
    }
  ],
  update_application: [
    {
      key: 'authorized_domains',
      label: __('Authorized Domains', 'bit-integrations'),
      multi: true,
      source: 'domains'
    },
    {
      key: 'outbound_ips',
      label: __('Outbound IPs', 'bit-integrations'),
      multi: true,
      source: 'dedicatedIps'
    }
  ],
  create_webhook: webhookSelects,
  update_webhook: webhookSelects
}

export const selectKeys = [
  'domain_id',
  'template_id',
  'domain_type',
  'expression_type',
  'template_type',
  'authorized_domains',
  'outbound_ips',
  'domains',
  'event_types'
]

const recipientNote = __(
  'Use an address on the selected domain as the From Email, and map the sender name to From Name. Separate many recipients with commas. To add a recipient name, map a form value such as <b>Jane &lt;jane@example.com&gt;</b>.',
  'bit-integrations'
)

const scheduleNote = __(
  'Leave Schedule At empty to send now. Enter an RFC 3339 time, such as 2026-11-01T09:00:00Z, or plain text, such as in 2 hours.',
  'bit-integrations'
)

const domainIdNote = __(
  'Map the domain ID or the domain name, for example example.com.',
  'bit-integrations'
)

const templateIdNote = __(
  'Map the template ID or the template name. The Templates page of the Maileroo dashboard shows both.',
  'bit-integrations'
)

const controlNote = __(
  '<b>Use values that you control here.</b> If you map a public form field, a visitor can change where Maileroo sends your data.',
  'bit-integrations'
)

const sendingKeyNote = __(
  'Map the sending key ID, or the Identifier that the Sending Keys page of the domain shows.',
  'bit-integrations'
)

const routeIdNote = __(
  'Map the inbound route ID, or the description that the Inbound Routing page of the domain shows.',
  'bit-integrations'
)

const applicationIdNote = __(
  'Map the application ID, or the name of the application.',
  'bit-integrations'
)

const webhookIdNote = __('Map the webhook ID, or the callback URL of the webhook.', 'bit-integrations')

export const notesByAction = {
  send_email: `${recipientNote}<br/>${__(
    'Map an HTML Body, a Plain Text Body or both. To add a tag or an email header, select <b>Tag</b> or <b>Custom Header</b> and type its name.',
    'bit-integrations'
  )}<br/>${__(
    'To show an inline image, add <b>&lt;img src=&quot;cid:logo.png&quot;&gt;</b> to the HTML Body. Use the file name of the image.',
    'bit-integrations'
  )}<br/>${scheduleNote}`,
  send_templated_email: `${recipientNote}<br/>${__(
    'To fill a template variable, select <b>Template Variable</b> and type its name, for example <b>name</b> or <b>order.id</b>.',
    'bit-integrations'
  )}<br/>${__(
    'To show an inline image, add <b>&lt;img src=&quot;cid:logo.png&quot;&gt;</b> to the template. Use the file name of the image.',
    'bit-integrations'
  )}<br/>${scheduleNote}`,
  delete_scheduled_email: __(
    'Map the reference ID that Maileroo returned when it scheduled the email.',
    'bit-integrations'
  ),
  resend_email: __('Map the message ID from a Maileroo email log or webhook event.', 'bit-integrations'),
  add_domain: __(
    'A free sub-domain has 12 characters or less. Use only lowercase letters and numbers.',
    'bit-integrations'
  ),
  update_domain_settings: `${domainIdNote}<br/>${__(
    'Custom Hostname Tracking needs a paid Maileroo plan.',
    'bit-integrations'
  )}`,
  scan_dns_records: `${domainIdNote}<br/>${__(
    'Maileroo scans only custom domains. A free sub-domain from Maileroo needs no scan.',
    'bit-integrations'
  )}`,
  delete_domain: `${domainIdNote}<br/>${__(
    '<b>Deletes the domain and its sending keys from Maileroo.</b> It cannot be undone.',
    'bit-integrations'
  )}`,
  rename_sending_key: sendingKeyNote,
  delete_sending_key: `${sendingKeyNote}<br/>${__(
    '<b>Email actions use the first sending key of the domain.</b> If you delete the last key, email actions stop until you create a new key.',
    'bit-integrations'
  )}`,
  delete_smtp_account: __(
    'Map the SMTP account ID, or the email address that the SMTP Accounts page of the domain shows.',
    'bit-integrations'
  ),
  create_inbound_route: `${__(
    'Priority 1 runs first and 100 runs last. Forward To accepts email addresses and callback URLs.',
    'bit-integrations'
  )}<br/>${controlNote}`,
  update_inbound_route: `${routeIdNote}<br/>${__(
    'Map only the values to change. Maileroo keeps the current values of the fields that you do not map.',
    'bit-integrations'
  )}<br/>${controlNote}`,
  delete_inbound_route: routeIdNote,
  create_template: __(
    'The HTML type needs a full document with &lt;html&gt; and &lt;body&gt; tags. Maileroo needs about 10 seconds to process a new template.',
    'bit-integrations'
  ),
  rename_template: templateIdNote,
  delete_template: templateIdNote,
  update_application: `${applicationIdNote}<br/>${__(
    'Map only the values to change. Maileroo keeps the current values of the fields that you do not map or select.',
    'bit-integrations'
  )}<br/>${controlNote}`,
  delete_application: applicationIdNote,
  create_webhook: `${__(
    'Leave Domains empty to get events from all domains. Leave Event Types empty to get all events. The Webhooks page of the Maileroo dashboard shows the shared secret.',
    'bit-integrations'
  )}<br/>${controlNote}`,
  update_webhook: `${webhookIdNote}<br/>${__(
    'Select domains, event types or both. The selection replaces the current values.',
    'bit-integrations'
  )}`,
  delete_webhook: webhookIdNote
}

const checkboxUtility = (key, title, subTitle, value = 'true') => ({
  checkbox: true,
  key,
  subTitle,
  title,
  value
})

const selectUtility = (key, title, subTitle, options = yesNoOptions) => ({
  key,
  options,
  subTitle,
  title
})

const trackingUtility = selectUtility(
  'tracking',
  __('Open and Click Tracking', 'bit-integrations'),
  __(
    'Turn tracking on or off for this email. Leave it empty to use the domain setting',
    'bit-integrations'
  ),
  enableDisableOptions
)

const routeChecks = [
  [
    'regex_enabled',
    __('Use Regular Expression', 'bit-integrations'),
    __('Read the match value as a regular expression', 'bit-integrations')
  ],
  [
    'dmarc_alignment',
    __('Require DMARC Alignment', 'bit-integrations'),
    __('Accept only emails that pass DMARC alignment', 'bit-integrations')
  ],
  [
    'require_spf',
    __('Require SPF Pass', 'bit-integrations'),
    __('Accept only emails that pass SPF', 'bit-integrations')
  ],
  [
    'require_dkim',
    __('Require DKIM Pass', 'bit-integrations'),
    __('Accept only emails that pass DKIM', 'bit-integrations')
  ],
  [
    'skip_spam_check',
    __('Skip Spam Check', 'bit-integrations'),
    __('Do not check the emails for spam', 'bit-integrations')
  ],
  [
    'stop',
    __('Stop After Match', 'bit-integrations'),
    __('Do not run lower priority routes after this route matches', 'bit-integrations')
  ]
]

export const utilitiesByAction = {
  send_email: [trackingUtility],
  send_templated_email: [trackingUtility],
  update_domain_settings: [
    selectUtility(
      'interaction_tracking',
      __('Open and Click Tracking', 'bit-integrations'),
      __('Turn open and click tracking on or off for the domain', 'bit-integrations'),
      enableDisableOptions
    ),
    selectUtility(
      'custom_hostname_tracking',
      __('Custom Hostname Tracking', 'bit-integrations'),
      __('Turn custom hostname tracking on or off for the domain', 'bit-integrations'),
      enableDisableOptions
    )
  ],
  create_inbound_route: routeChecks.map(([key, title, subTitle]) =>
    checkboxUtility(key, title, subTitle)
  ),
  update_inbound_route: routeChecks.map(([key, title, subTitle]) => selectUtility(key, title, subTitle))
}
