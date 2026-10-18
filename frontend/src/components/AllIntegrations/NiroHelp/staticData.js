import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_ticket', label: __('Create Ticket', 'bit-integrations'), is_pro: true },
  { name: 'update_ticket', label: __('Update Ticket', 'bit-integrations'), is_pro: true },
  {
    name: 'change_ticket_status',
    label: __('Change Ticket Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'assign_agent', label: __('Assign Agent', 'bit-integrations'), is_pro: true },
  { name: 'set_sentiment', label: __('Set Sentiment', 'bit-integrations'), is_pro: true },
  { name: 'delete_ticket', label: __('Delete Ticket', 'bit-integrations'), is_pro: true },
  { name: 'add_reply', label: __('Add Reply', 'bit-integrations'), is_pro: true },
  { name: 'add_private_note', label: __('Add Private Note', 'bit-integrations'), is_pro: true },
  { name: 'set_follow_up', label: __('Set Follow-up', 'bit-integrations'), is_pro: true },
  { name: 'clear_follow_up', label: __('Clear Follow-up', 'bit-integrations'), is_pro: true },
  { name: 'create_doc', label: __('Create Doc', 'bit-integrations'), is_pro: true },
  { name: 'update_doc', label: __('Update Doc', 'bit-integrations'), is_pro: true },
  { name: 'trash_doc', label: __('Move Doc to Trash', 'bit-integrations'), is_pro: true },
  { name: 'delete_doc', label: __('Delete Doc', 'bit-integrations'), is_pro: true },
  { name: 'create_product', label: __('Create Product', 'bit-integrations'), is_pro: true },
  { name: 'create_reason', label: __('Create Reason', 'bit-integrations'), is_pro: true },
  { name: 'create_topic', label: __('Create Topic', 'bit-integrations'), is_pro: true },
  { name: 'create_customer', label: __('Create Customer', 'bit-integrations'), is_pro: true },
  { name: 'add_agent', label: __('Add Agent', 'bit-integrations'), is_pro: true }
]

const ticketIdField = { key: 'ticket_id', label: __('Ticket ID', 'bit-integrations'), required: true }
const docIdField = { key: 'doc_id', label: __('Doc ID', 'bit-integrations'), required: true }

const termFields = [
  { key: 'name', label: __('Name', 'bit-integrations'), required: true },
  { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const fieldSets = {
  create_ticket: [
    { key: 'customer_email', label: __('Customer Email', 'bit-integrations'), required: true },
    { key: 'title', label: __('Subject', 'bit-integrations'), required: true },
    { key: 'customer_name', label: __('Customer Name', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'order', label: __('Order ID', 'bit-integrations'), required: false }
  ],
  update_ticket: [
    ticketIdField,
    { key: 'title', label: __('Subject', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'order', label: __('Order ID', 'bit-integrations'), required: false }
  ],
  change_ticket_status: [ticketIdField],
  assign_agent: [ticketIdField],
  set_sentiment: [ticketIdField],
  delete_ticket: [ticketIdField],
  add_reply: [
    ticketIdField,
    { key: 'message', label: __('Message', 'bit-integrations'), required: true }
  ],
  add_private_note: [
    ticketIdField,
    { key: 'note', label: __('Note', 'bit-integrations'), required: true }
  ],
  set_follow_up: [
    ticketIdField,
    { key: 'note', label: __('Note', 'bit-integrations'), required: true },
    { key: 'due_date', label: __('Due Date (Y-m-d)', 'bit-integrations'), required: false },
    { key: 'days', label: __('Due in Days', 'bit-integrations'), required: false }
  ],
  clear_follow_up: [ticketIdField],
  create_doc: [
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'content', label: __('Content', 'bit-integrations'), required: false },
    { key: 'slug', label: __('Slug', 'bit-integrations'), required: false }
  ],
  update_doc: [
    docIdField,
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'content', label: __('Content', 'bit-integrations'), required: false },
    { key: 'slug', label: __('Slug', 'bit-integrations'), required: false }
  ],
  trash_doc: [docIdField],
  delete_doc: [docIdField],
  create_product: termFields,
  create_reason: termFields,
  create_topic: termFields,
  create_customer: [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'name', label: __('Name', 'bit-integrations'), required: false }
  ],
  add_agent: [
    { key: 'user_id', label: __('User ID', 'bit-integrations'), required: true },
    { key: 'max_tickets', label: __('Open Ticket Limit', 'bit-integrations'), required: false }
  ]
}

export const ticketStatusOptions = [
  { label: __('Open', 'bit-integrations'), value: 'open' },
  { label: __('In Progress', 'bit-integrations'), value: 'in-progress' },
  { label: __('Waiting', 'bit-integrations'), value: 'waiting' },
  { label: __('On Hold', 'bit-integrations'), value: 'on-hold' },
  { label: __('Resolved', 'bit-integrations'), value: 'resolved' },
  { label: __('Reopened', 'bit-integrations'), value: 'reopened' },
  { label: __('Cancelled', 'bit-integrations'), value: 'cancelled' },
  { label: __('Closed', 'bit-integrations'), value: 'closed' }
]

export const urgencyOptions = [
  { label: __('Low', 'bit-integrations'), value: 'low' },
  { label: __('Medium', 'bit-integrations'), value: 'medium' },
  { label: __('High', 'bit-integrations'), value: 'high' },
  { label: __('Severe', 'bit-integrations'), value: 'severe' }
]

export const sentimentOptions = [
  { label: __('Positive', 'bit-integrations'), value: 'positive' },
  { label: __('Neutral', 'bit-integrations'), value: 'neutral' },
  { label: __('Negative', 'bit-integrations'), value: 'negative' },
  { label: __('Clear sentiment', 'bit-integrations'), value: 'clear' }
]

export const docStatusOptions = [
  { label: __('Published', 'bit-integrations'), value: 'publish' },
  { label: __('Draft', 'bit-integrations'), value: 'draft' },
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Private', 'bit-integrations'), value: 'private' }
]

export const noAgentOption = { label: __('No agent (unassign)', 'bit-integrations'), value: '0' }

export const customerReplyOption = {
  label: __('The ticket customer', 'bit-integrations'),
  value: 'customer'
}

export const needsTicketStatus = ['change_ticket_status']
export const needsAssignAgent = ['assign_agent']
export const needsSentiment = ['set_sentiment']
export const needsReplyAuthor = ['add_reply']
export const needsDocAuthor = ['create_doc']
export const needsCustomFields = ['create_ticket', 'update_ticket']

const selectUtility = (key, title, subTitle, source) => ({ key, title, subTitle, ...source })

const checkboxUtility = (key, title, subTitle, value = 'true') => ({
  checkbox: true,
  key,
  subTitle,
  title,
  value
})

const ticketUtilities = [
  selectUtility(
    'status',
    __('Status', 'bit-integrations'),
    __('Set the ticket status.', 'bit-integrations'),
    { options: ticketStatusOptions }
  ),
  selectUtility(
    'urgency',
    __('Urgency', 'bit-integrations'),
    __('Set the ticket urgency.', 'bit-integrations'),
    { options: urgencyOptions }
  ),
  selectUtility(
    'product_id',
    __('Product', 'bit-integrations'),
    __('Set the ticket product.', 'bit-integrations'),
    { list: 'allProducts' }
  ),
  selectUtility(
    'reason_id',
    __('Reason', 'bit-integrations'),
    __('Set the ticket reason.', 'bit-integrations'),
    { list: 'allReasons' }
  ),
  selectUtility(
    'agent_id',
    __('Agent', 'bit-integrations'),
    __('Assign the ticket to an agent.', 'bit-integrations'),
    { list: 'allAgents' }
  )
]

const docUtilities = [
  selectUtility(
    'status',
    __('Status', 'bit-integrations'),
    __('Set the doc status. A new doc is published by default.', 'bit-integrations'),
    { options: docStatusOptions }
  ),
  selectUtility(
    'topic_id',
    __('Topic', 'bit-integrations'),
    __('Set the doc topic.', 'bit-integrations'),
    { list: 'allTopics' }
  ),
  selectUtility(
    'product_id',
    __('Product', 'bit-integrations'),
    __('Set the doc product.', 'bit-integrations'),
    { list: 'allProducts' }
  )
]

export const utilitiesByAction = {
  create_ticket: [
    ...ticketUtilities,
    checkboxUtility(
      'send_sign_in_link',
      __('Email Sign-in Link', 'bit-integrations'),
      __('Email the customer a link to sign in and see the ticket.', 'bit-integrations')
    )
  ],
  update_ticket: ticketUtilities,
  add_private_note: [
    selectUtility(
      'agent_id',
      __('Author', 'bit-integrations'),
      __('Select the agent who writes the note.', 'bit-integrations'),
      { list: 'allAgents' }
    )
  ],
  set_follow_up: [
    selectUtility(
      'agent_id',
      __('Set By', 'bit-integrations'),
      __('Select the agent who sets the follow-up.', 'bit-integrations'),
      { list: 'allAgents' }
    )
  ],
  create_doc: docUtilities,
  update_doc: docUtilities,
  create_topic: [
    selectUtility(
      'parent_id',
      __('Parent Topic', 'bit-integrations'),
      __('Put the new topic under a parent topic.', 'bit-integrations'),
      { list: 'allTopics' }
    )
  ]
}

export const listsByAction = {
  create_ticket: ['products', 'reasons', 'agents', 'customFields'],
  update_ticket: ['products', 'reasons', 'agents', 'customFields'],
  assign_agent: ['agents'],
  add_reply: ['agents'],
  add_private_note: ['agents'],
  set_follow_up: ['agents'],
  create_doc: ['users', 'topics', 'products'],
  update_doc: ['topics', 'products'],
  create_topic: ['topics']
}
