import { __ } from '../../../Utils/i18nwrap'

// Fixed-option (enum) lists rendered as single-select dropdowns in Utilities.
export const ZendeskSupportOptions = {
  priority: [
    { label: __('Urgent', 'bit-integrations'), value: 'urgent' },
    { label: __('High', 'bit-integrations'), value: 'high' },
    { label: __('Normal', 'bit-integrations'), value: 'normal' },
    { label: __('Low', 'bit-integrations'), value: 'low' }
  ],
  status: [
    { label: __('New', 'bit-integrations'), value: 'new' },
    { label: __('Open', 'bit-integrations'), value: 'open' },
    { label: __('Pending', 'bit-integrations'), value: 'pending' },
    { label: __('Hold', 'bit-integrations'), value: 'hold' },
    { label: __('Solved', 'bit-integrations'), value: 'solved' },
    { label: __('Closed', 'bit-integrations'), value: 'closed' }
  ],
  type: [
    { label: __('Problem', 'bit-integrations'), value: 'problem' },
    { label: __('Incident', 'bit-integrations'), value: 'incident' },
    { label: __('Question', 'bit-integrations'), value: 'question' },
    { label: __('Task', 'bit-integrations'), value: 'task' }
  ],
  role: [
    { label: __('End User', 'bit-integrations'), value: 'end-user' },
    { label: __('Agent', 'bit-integrations'), value: 'agent' },
    { label: __('Admin', 'bit-integrations'), value: 'admin' }
  ],
  visibility: [
    { label: __('Public', 'bit-integrations'), value: 'public' },
    { label: __('Private', 'bit-integrations'), value: 'private' }
  ],
  isDefault: [
    { label: __('Yes', 'bit-integrations'), value: 'true' },
    { label: __('No', 'bit-integrations'), value: 'false' }
  ]
}

// Utility dropdown definitions. `kind: 'static'` reads ZendeskSupportOptions;
// `kind: 'fetch'` loads conf[listKey] from the matching refresh route.
const staticUtil = (key, label, optionsKey) => ({ key, label, kind: 'static', optionsKey })
const fetchUtil = (key, label, listKey, route) => ({ key, label, kind: 'fetch', listKey, route })

const priority = staticUtil('priority', __('Priority', 'bit-integrations'), 'priority')
const status = staticUtil('status', __('Status', 'bit-integrations'), 'status')
const type = staticUtil('type', __('Type', 'bit-integrations'), 'type')
const role = staticUtil('role', __('Role', 'bit-integrations'), 'role')
const group = fetchUtil(
  'groupId',
  __('Group', 'bit-integrations'),
  'groups',
  'zendesk_support_refresh_groups'
)
const brand = fetchUtil(
  'brandId',
  __('Brand', 'bit-integrations'),
  'brands',
  'zendesk_support_refresh_brands'
)
const ticketForm = fetchUtil(
  'ticketFormId',
  __('Ticket Form', 'bit-integrations'),
  'ticketForms',
  'zendesk_support_refresh_ticket_forms'
)
const assignee = fetchUtil(
  'assigneeId',
  __('Assignee', 'bit-integrations'),
  'agents',
  'zendesk_support_refresh_agents'
)
const organization = fetchUtil(
  'organizationId',
  __('Organization', 'bit-integrations'),
  'organizations',
  'zendesk_support_refresh_organizations'
)

const ticketUtilities = [priority, status, type, group, brand, ticketForm, assignee]
const userUtilities = [role, organization]

export const ZendeskSupportUtilities = {
  createTicket: ticketUtilities,
  updateTicket: ticketUtilities,
  addTicketComment: [
    staticUtil('visibility', __('Visibility', 'bit-integrations'), 'visibility'),
    fetchUtil('authorId', __('Author', 'bit-integrations'), 'agents', 'zendesk_support_refresh_agents')
  ],
  createUser: userUtilities,
  updateUser: userUtilities,
  createOrUpdateUser: userUtilities,
  createGroup: [staticUtil('isDefault', __('Is Default', 'bit-integrations'), 'isDefault')]
}

export const ZendeskSupportStaticData = {
  modules: [
    { label: __('Create Ticket', 'bit-integrations'), value: 'createTicket', is_pro: true },
    { label: __('Update Ticket', 'bit-integrations'), value: 'updateTicket', is_pro: true },
    { label: __('Delete Ticket', 'bit-integrations'), value: 'deleteTicket', is_pro: true },
    { label: __('Add Ticket Comment', 'bit-integrations'), value: 'addTicketComment', is_pro: true },
    { label: __('Add Tags to Ticket', 'bit-integrations'), value: 'addTagsToTicket', is_pro: true },
    {
      label: __('Remove Tags from Ticket', 'bit-integrations'),
      value: 'removeTagsFromTicket',
      is_pro: true
    },
    { label: __('Create User', 'bit-integrations'), value: 'createUser', is_pro: true },
    { label: __('Update User', 'bit-integrations'), value: 'updateUser', is_pro: true },
    {
      label: __('Create or Update User', 'bit-integrations'),
      value: 'createOrUpdateUser',
      is_pro: true
    },
    { label: __('Delete User', 'bit-integrations'), value: 'deleteUser', is_pro: true },
    { label: __('Suspend User', 'bit-integrations'), value: 'suspendUser', is_pro: true },
    { label: __('Create Organization', 'bit-integrations'), value: 'createOrganization', is_pro: true },
    { label: __('Update Organization', 'bit-integrations'), value: 'updateOrganization', is_pro: true },
    { label: __('Delete Organization', 'bit-integrations'), value: 'deleteOrganization', is_pro: true },
    { label: __('Create Group', 'bit-integrations'), value: 'createGroup', is_pro: true },
    { label: __('Update Group', 'bit-integrations'), value: 'updateGroup', is_pro: true },
    { label: __('Delete Group', 'bit-integrations'), value: 'deleteGroup', is_pro: true }
  ],

  createTicket: [
    { key: 'subject', label: __('Subject', 'bit-integrations'), required: true },
    { key: 'description', label: __('Description', 'bit-integrations'), required: true },
    { key: 'requesterEmail', label: __('Requester Email', 'bit-integrations'), required: false },
    { key: 'requesterName', label: __('Requester Name', 'bit-integrations'), required: false },
    { key: 'externalId', label: __('External ID', 'bit-integrations'), required: false },
    { key: 'tags', label: __('Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  updateTicket: [
    { key: 'ticketId', label: __('Ticket ID', 'bit-integrations'), required: true },
    { key: 'subject', label: __('Subject', 'bit-integrations'), required: false },
    { key: 'commentBody', label: __('Comment Body', 'bit-integrations'), required: false },
    { key: 'externalId', label: __('External ID', 'bit-integrations'), required: false },
    { key: 'tags', label: __('Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  deleteTicket: [{ key: 'ticketId', label: __('Ticket ID', 'bit-integrations'), required: true }],
  addTicketComment: [
    { key: 'ticketId', label: __('Ticket ID', 'bit-integrations'), required: true },
    { key: 'commentBody', label: __('Comment Body', 'bit-integrations'), required: true }
  ],
  addTagsToTicket: [
    { key: 'ticketId', label: __('Ticket ID', 'bit-integrations'), required: true },
    { key: 'tags', label: __('Tags (comma separated)', 'bit-integrations'), required: true }
  ],
  removeTagsFromTicket: [
    { key: 'ticketId', label: __('Ticket ID', 'bit-integrations'), required: true },
    { key: 'tags', label: __('Tags (comma separated)', 'bit-integrations'), required: true }
  ],

  createUser: [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'externalId', label: __('External ID', 'bit-integrations'), required: false },
    { key: 'tags', label: __('Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  updateUser: [
    { key: 'userId', label: __('User ID', 'bit-integrations'), required: true },
    { key: 'name', label: __('Name', 'bit-integrations'), required: false },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'externalId', label: __('External ID', 'bit-integrations'), required: false },
    { key: 'tags', label: __('Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  createOrUpdateUser: [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'externalId', label: __('External ID', 'bit-integrations'), required: false },
    { key: 'tags', label: __('Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  deleteUser: [{ key: 'userId', label: __('User ID', 'bit-integrations'), required: true }],
  suspendUser: [{ key: 'userId', label: __('User ID', 'bit-integrations'), required: true }],

  createOrganization: [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'details', label: __('Details', 'bit-integrations'), required: false },
    { key: 'notes', label: __('Notes', 'bit-integrations'), required: false },
    { key: 'externalId', label: __('External ID', 'bit-integrations'), required: false },
    {
      key: 'domainNames',
      label: __('Domain Names (comma separated)', 'bit-integrations'),
      required: false
    },
    { key: 'tags', label: __('Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  updateOrganization: [
    { key: 'organizationId', label: __('Organization ID', 'bit-integrations'), required: true },
    { key: 'name', label: __('Name', 'bit-integrations'), required: false },
    { key: 'details', label: __('Details', 'bit-integrations'), required: false },
    { key: 'notes', label: __('Notes', 'bit-integrations'), required: false },
    { key: 'externalId', label: __('External ID', 'bit-integrations'), required: false },
    {
      key: 'domainNames',
      label: __('Domain Names (comma separated)', 'bit-integrations'),
      required: false
    },
    { key: 'tags', label: __('Tags (comma separated)', 'bit-integrations'), required: false }
  ],
  deleteOrganization: [
    { key: 'organizationId', label: __('Organization ID', 'bit-integrations'), required: true }
  ],

  createGroup: [
    { key: 'name', label: __('Name', 'bit-integrations'), required: true },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false }
  ],
  updateGroup: [
    { key: 'groupId', label: __('Group ID', 'bit-integrations'), required: true },
    { key: 'name', label: __('Name', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false }
  ],
  deleteGroup: [{ key: 'groupId', label: __('Group ID', 'bit-integrations'), required: true }]
}
