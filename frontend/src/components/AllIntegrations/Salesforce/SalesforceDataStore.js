import { __ } from '@wordpress/i18n'

export const opportunityStage = [
  { label: __('None', 'bit-integrations'), value: 'None' },
  { label: __('Prospecting', 'bit-integrations'), value: 'Prospecting' },
  { label: __('Qualification', 'bit-integrations'), value: 'Qualification' },
  { label: __('Needs Analysis', 'bit-integrations'), value: 'Needs Analysis' },
  { label: __('Value Proposition', 'bit-integrations'), value: 'Value Proposition' },
  { label: __('Id. Decision Makers', 'bit-integrations'), value: 'Id. Decision Makers' },
  { label: __('Perception Analysis', 'bit-integrations'), value: 'Perception Analysis' },
  { label: __('Proposal/Price Quote', 'bit-integrations'), value: 'Proposal/Price Quote' },
  { label: __('Negotiation/Review', 'bit-integrations'), value: 'Negotiation/Review' },
  { label: __('Closed Won', 'bit-integrations'), value: 'Closed Won' },
  { label: __('Closed Lost', 'bit-integrations'), value: 'Closed Lost' }
]

export const opportunityType = [
  { label: __('None', 'bit-integrations'), value: 'None' },
  {
    label: __('Existing Customer - Upgrade', 'bit-integrations'),
    value: 'ExistingCustomerUpgrade'
  },
  {
    label: __('Existing Customer - Replacement', 'bit-integrations'),
    value: 'ExistingCustomerReplacement'
  },
  {
    label: __('Existing Customer - Downgrade', 'bit-integrations'),
    value: 'ExistingCustomerDowngrade'
  },
  { label: __('New Customer', 'bit-integrations'), value: 'NewCustomer' }
]

export const opportunityLeadSource = [
  { label: __('None', 'bit-integrations'), value: 'None' },
  { label: __('Web', 'bit-integrations'), value: 'Web' },
  { label: __('Phone Inquiry', 'bit-integrations'), value: 'PhoneInquiry' },
  { label: __('Partner Referral', 'bit-integrations'), value: 'PartnerReferral' },
  { label: __('Purchased List', 'bit-integrations'), value: 'PurchasedList' },
  { label: __('Other', 'bit-integrations'), value: 'Other' }
]

export const eventSubject = [
  { label: __('Call', 'bit-integrations'), value: 'Call' },
  { label: __('Email', 'bit-integrations'), value: 'Email' },
  { label: __('Meeting', 'bit-integrations'), value: 'Meeting' },
  { label: __('Send a Letter', 'bit-integrations'), value: 'Send a Letter' },
  { label: __('Other', 'bit-integrations'), value: 'Other' }
]

export const taskSubject = [
  { label: __('Call', 'bit-integrations'), value: 'Call' },
  { label: __('Email', 'bit-integrations'), value: 'Email' },
  { label: __('SendLetter', 'bit-integrations'), value: 'SendLetter' },
  { label: __('SendQuote', 'bit-integrations'), value: 'SendQuote' },
  { label: __('Other', 'bit-integrations'), value: 'Other' }
]
export const taskPriority = [
  { label: __('Low', 'bit-integrations'), value: 'Low' },
  { label: __('Normal', 'bit-integrations'), value: 'Normal' },
  { label: __('High', 'bit-integrations'), value: 'High' }
]

export const taskStatus = [
  { label: __('Not Started', 'bit-integrations'), value: 'Not Started' },
  { label: __('In Progress', 'bit-integrations'), value: 'In Progress' },
  { label: __('Completed', 'bit-integrations'), value: 'Completed' },
  { label: __('Waiting on someone else', 'bit-integrations'), value: 'Waiting on someone else' },
  { label: __('Deferred', 'bit-integrations'), value: 'Deferred' }
]
