import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_contact', label: __('Create Contact', 'bit-integrations'), is_pro: true },
  { name: 'update_contact', label: __('Update Contact', 'bit-integrations'), is_pro: true },
  {
    name: 'create_or_update_contact',
    label: __('Create or Update Contact', 'bit-integrations'),
    is_pro: true
  },
  { name: 'delete_contact', label: __('Delete Contact', 'bit-integrations'), is_pro: true },
  { name: 'change_contact_owner', label: __('Change Contact Owner', 'bit-integrations'), is_pro: true },
  {
    name: 'subscribe_contact_to_channel',
    label: __('Subscribe Contact to Channel', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'unsubscribe_contact_from_channel',
    label: __('Unsubscribe Contact from Channel', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_tag', label: __('Create Tag', 'bit-integrations'), is_pro: true },
  { name: 'add_tags_to_contact', label: __('Add Tags to Contact', 'bit-integrations'), is_pro: true },
  {
    name: 'remove_tags_from_contact',
    label: __('Remove Tags from Contact', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_list', label: __('Create List', 'bit-integrations'), is_pro: true },
  { name: 'add_contact_to_lists', label: __('Add Contact to Lists', 'bit-integrations'), is_pro: true },
  {
    name: 'remove_contact_from_lists',
    label: __('Remove Contact from Lists', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'unsubscribe_contact_from_list',
    label: __('Unsubscribe Contact from List', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'resubscribe_contact_to_list',
    label: __('Resubscribe Contact to List', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_ticket', label: __('Create Ticket', 'bit-integrations'), is_pro: true },
  { name: 'update_ticket', label: __('Update Ticket', 'bit-integrations'), is_pro: true },
  { name: 'add_ticket_reply', label: __('Add Ticket Reply', 'bit-integrations'), is_pro: true },
  { name: 'add_ticket_note', label: __('Add Ticket Note', 'bit-integrations'), is_pro: true },
  { name: 'delete_ticket', label: __('Delete Ticket', 'bit-integrations'), is_pro: true },
  { name: 'create_invoice', label: __('Create Invoice', 'bit-integrations'), is_pro: true },
  { name: 'update_invoice', label: __('Update Invoice', 'bit-integrations'), is_pro: true },
  {
    name: 'change_invoice_status',
    label: __('Change Invoice Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'send_invoice', label: __('Send Invoice', 'bit-integrations'), is_pro: true },
  {
    name: 'record_invoice_payment',
    label: __('Record Invoice Payment', 'bit-integrations'),
    is_pro: true
  },
  { name: 'delete_invoice', label: __('Delete Invoice', 'bit-integrations'), is_pro: true },
  { name: 'create_proposal', label: __('Create Proposal', 'bit-integrations'), is_pro: true },
  { name: 'update_proposal', label: __('Update Proposal', 'bit-integrations'), is_pro: true },
  { name: 'send_proposal', label: __('Send Proposal', 'bit-integrations'), is_pro: true },
  { name: 'accept_proposal', label: __('Accept Proposal', 'bit-integrations'), is_pro: true },
  { name: 'decline_proposal', label: __('Decline Proposal', 'bit-integrations'), is_pro: true },
  {
    name: 'convert_proposal_to_invoice',
    label: __('Convert Proposal to Invoice', 'bit-integrations'),
    is_pro: true
  },
  { name: 'delete_proposal', label: __('Delete Proposal', 'bit-integrations'), is_pro: true }
]

const contactField = {
  key: 'contact_id',
  label: __('Contact ID or Email', 'bit-integrations'),
  required: true
}

const contactDetailFields = [
  { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
  { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
  { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
  { key: 'whatsapp_phone', label: __('WhatsApp Number', 'bit-integrations'), required: false },
  { key: 'company_name', label: __('Company Name', 'bit-integrations'), required: false },
  { key: 'address_1', label: __('Address Line 1', 'bit-integrations'), required: false },
  { key: 'address_2', label: __('Address Line 2', 'bit-integrations'), required: false },
  { key: 'city', label: __('City', 'bit-integrations'), required: false },
  { key: 'state', label: __('State', 'bit-integrations'), required: false },
  { key: 'country', label: __('Country (2-letter code)', 'bit-integrations'), required: false },
  { key: 'zip', label: __('ZIP Code', 'bit-integrations'), required: false },
  { key: 'source', label: __('Source', 'bit-integrations'), required: false }
]

const optionalEmailField = { key: 'email', label: __('Email', 'bit-integrations'), required: false }

const ticketIdField = { key: 'ticket_id', label: __('Ticket ID', 'bit-integrations'), required: true }
const invoiceIdField = { key: 'invoice_id', label: __('Invoice ID', 'bit-integrations'), required: true }
const proposalIdField = {
  key: 'proposal_id',
  label: __('Proposal ID', 'bit-integrations'),
  required: true
}

const lineItemFields = [
  { key: 'item_description', label: __('Item Description', 'bit-integrations'), required: true },
  { key: 'item_quantity', label: __('Item Quantity', 'bit-integrations'), required: false },
  { key: 'item_rate', label: __('Item Rate', 'bit-integrations'), required: false }
]

const nameFields = [
  { key: 'name', label: __('Name', 'bit-integrations'), required: true },
  { key: 'description', label: __('Description', 'bit-integrations'), required: false }
]

export const fieldsByAction = {
  create_contact: [optionalEmailField, ...contactDetailFields],
  update_contact: [contactField, optionalEmailField, ...contactDetailFields],
  create_or_update_contact: [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    ...contactDetailFields
  ],
  delete_contact: [contactField],
  change_contact_owner: [contactField],
  subscribe_contact_to_channel: [contactField],
  unsubscribe_contact_from_channel: [
    contactField,
    { key: 'reason', label: __('Reason', 'bit-integrations'), required: false }
  ],
  create_tag: nameFields,
  add_tags_to_contact: [contactField],
  remove_tags_from_contact: [contactField],
  create_list: nameFields,
  add_contact_to_lists: [contactField],
  remove_contact_from_lists: [contactField],
  unsubscribe_contact_from_list: [
    contactField,
    { key: 'reason', label: __('Reason', 'bit-integrations'), required: false }
  ],
  resubscribe_contact_to_list: [contactField],
  create_ticket: [
    contactField,
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'content', label: __('Message', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'product', label: __('Product', 'bit-integrations'), required: false }
  ],
  update_ticket: [
    ticketIdField,
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'product', label: __('Product', 'bit-integrations'), required: false }
  ],
  add_ticket_reply: [
    ticketIdField,
    { key: 'content', label: __('Reply', 'bit-integrations'), required: true }
  ],
  add_ticket_note: [
    ticketIdField,
    { key: 'content', label: __('Note', 'bit-integrations'), required: true }
  ],
  delete_ticket: [ticketIdField],
  create_invoice: [
    contactField,
    ...lineItemFields,
    {
      key: 'invoice_date',
      label: __('Invoice Date (YYYY-MM-DD)', 'bit-integrations'),
      required: false
    },
    { key: 'due_date', label: __('Due Date (YYYY-MM-DD)', 'bit-integrations'), required: false },
    { key: 'client_note', label: __('Client Note', 'bit-integrations'), required: false },
    { key: 'terms', label: __('Terms', 'bit-integrations'), required: false }
  ],
  update_invoice: [
    invoiceIdField,
    { key: 'due_date', label: __('Due Date (YYYY-MM-DD)', 'bit-integrations'), required: false },
    { key: 'client_note', label: __('Client Note', 'bit-integrations'), required: false },
    { key: 'terms', label: __('Terms', 'bit-integrations'), required: false }
  ],
  change_invoice_status: [invoiceIdField],
  send_invoice: [
    invoiceIdField,
    { key: 'message', label: __('Message', 'bit-integrations'), required: false }
  ],
  record_invoice_payment: [
    invoiceIdField,
    { key: 'amount', label: __('Amount', 'bit-integrations'), required: true },
    {
      key: 'payment_date',
      label: __('Payment Date (YYYY-MM-DD)', 'bit-integrations'),
      required: false
    },
    { key: 'transaction_id', label: __('Transaction ID', 'bit-integrations'), required: false },
    { key: 'note', label: __('Note', 'bit-integrations'), required: false }
  ],
  delete_invoice: [invoiceIdField],
  create_proposal: [
    contactField,
    { key: 'subject', label: __('Subject', 'bit-integrations'), required: false },
    ...lineItemFields,
    { key: 'open_till', label: __('Open Till (YYYY-MM-DD)', 'bit-integrations'), required: false },
    { key: 'terms', label: __('Terms', 'bit-integrations'), required: false }
  ],
  update_proposal: [
    proposalIdField,
    { key: 'subject', label: __('Subject', 'bit-integrations'), required: false },
    { key: 'open_till', label: __('Open Till (YYYY-MM-DD)', 'bit-integrations'), required: false },
    { key: 'terms', label: __('Terms', 'bit-integrations'), required: false }
  ],
  send_proposal: [
    proposalIdField,
    { key: 'message', label: __('Message', 'bit-integrations'), required: false }
  ],
  accept_proposal: [proposalIdField],
  decline_proposal: [
    proposalIdField,
    { key: 'decline_reason', label: __('Decline Reason', 'bit-integrations'), required: false }
  ],
  convert_proposal_to_invoice: [proposalIdField],
  delete_proposal: [proposalIdField]
}

export const channelOptions = [
  { label: __('Email', 'bit-integrations'), value: 'email' },
  { label: __('SMS', 'bit-integrations'), value: 'sms' },
  { label: __('WhatsApp', 'bit-integrations'), value: 'whatsapp' }
]

export const emailStatusOptions = [
  { label: __('Subscribed', 'bit-integrations'), value: 'subscribed' },
  { label: __('Unsubscribed', 'bit-integrations'), value: 'unsubscribed' },
  { label: __('Unverified', 'bit-integrations'), value: 'unverified' },
  { label: __('Bounced', 'bit-integrations'), value: 'bounced' }
]

export const ticketStatusOptions = [
  { label: __('Open', 'bit-integrations'), value: 'open' },
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Resolved', 'bit-integrations'), value: 'resolved' },
  { label: __('Closed', 'bit-integrations'), value: 'closed' }
]

export const ticketPriorityOptions = [
  { label: __('Low', 'bit-integrations'), value: 'low' },
  { label: __('Normal', 'bit-integrations'), value: 'normal' },
  { label: __('High', 'bit-integrations'), value: 'high' },
  { label: __('Urgent', 'bit-integrations'), value: 'urgent' }
]

export const invoiceStatusOptions = [
  { label: __('Draft', 'bit-integrations'), value: 'draft' },
  { label: __('Unpaid', 'bit-integrations'), value: 'unpaid' },
  { label: __('Overdue', 'bit-integrations'), value: 'overdue' }
]

export const paymentModeOptions = [
  { label: __('Bank Transfer', 'bit-integrations'), value: 'bank_transfer' },
  { label: __('Cash', 'bit-integrations'), value: 'cash' },
  { label: __('Check', 'bit-integrations'), value: 'check' },
  { label: __('Credit Card', 'bit-integrations'), value: 'credit_card' },
  { label: __('Other', 'bit-integrations'), value: 'other' }
]

export const needsOwner = ['change_contact_owner']
export const needsChannel = ['subscribe_contact_to_channel', 'unsubscribe_contact_from_channel']
export const needsTags = ['add_tags_to_contact', 'remove_tags_from_contact']
export const needsLists = ['add_contact_to_lists', 'remove_contact_from_lists']
export const needsList = ['unsubscribe_contact_from_list', 'resubscribe_contact_to_list']
export const needsInvoiceStatus = ['change_invoice_status']

export const utilitiesByAction = {
  create_contact: ['email_status', 'owner_id', 'tag_ids', 'list_ids'],
  update_contact: ['email_status', 'tag_ids', 'list_ids'],
  create_or_update_contact: ['email_status', 'tag_ids', 'list_ids'],
  create_ticket: ['priority', 'status', 'agent_user_id', 'mailbox_id'],
  update_ticket: ['status', 'priority', 'agent_user_id', 'mailbox_id'],
  add_ticket_reply: ['author_user_id'],
  add_ticket_note: ['author_user_id'],
  create_invoice: ['sale_agent_user_id'],
  record_invoice_payment: ['payment_mode'],
  create_proposal: ['assigned_user_id']
}

export const actionNotes = {
  create_contact: __(
    'Map an email or a phone number. DoubleScale CRM needs one of them.',
    'bit-integrations'
  ),
  update_contact: __('Empty fields keep their current values.', 'bit-integrations'),
  create_or_update_contact: __(
    'DoubleScale CRM updates the contact that has this email or phone number. If no contact matches, it creates a new contact.',
    'bit-integrations'
  ),
  delete_contact: __(
    'You cannot restore a deleted contact. A contact that has invoices or bookings is not deleted.',
    'bit-integrations'
  ),
  create_ticket: __(
    'Map a contact ID or email. A new email creates a new contact. Create a support mailbox in DoubleScale CRM first.',
    'bit-integrations'
  ),
  update_ticket: __('Empty fields keep their current values.', 'bit-integrations'),
  add_ticket_reply: __(
    'DoubleScale CRM emails the reply to the customer. Select Reply As if the ticket has no agent.',
    'bit-integrations'
  ),
  create_invoice: __(
    'The invoice is saved as a draft with one line item. Quantity is 1 and rate is 0 when they are empty.',
    'bit-integrations'
  ),
  update_invoice: __('Empty fields keep their current values.', 'bit-integrations'),
  change_invoice_status: __('To set a paid status, use Record Invoice Payment.', 'bit-integrations'),
  record_invoice_payment: __(
    'Send the invoice first. The amount must not be more than the balance due.',
    'bit-integrations'
  ),
  create_proposal: __(
    'The proposal is saved as a draft with one line item. Quantity is 1 and rate is 0 when they are empty.',
    'bit-integrations'
  ),
  update_proposal: __('Empty fields keep their current values.', 'bit-integrations')
}
