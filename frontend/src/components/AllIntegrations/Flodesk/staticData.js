import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  {
    name: 'create_or_update_subscriber',
    label: __('Create or Update Subscriber', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'batch_create_or_update_subscribers',
    label: __('Batch Create or Update Subscribers', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'unsubscribe_subscriber',
    label: __('Unsubscribe Subscriber', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'add_subscriber_to_segments',
    label: __('Add Subscriber to Segments', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'remove_subscriber_from_segments',
    label: __('Remove Subscriber from Segments', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_segment', label: __('Create Segment', 'bit-integrations'), is_pro: true },
  {
    name: 'create_custom_field',
    label: __('Create Custom Field', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'add_subscriber_to_workflow',
    label: __('Add Subscriber to Workflow', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'remove_subscriber_from_workflow',
    label: __('Remove Subscriber from Workflow', 'bit-integrations'),
    is_pro: true
  }
]

const subscriberIdField = {
  key: 'subscriber_id',
  label: __('Subscriber Id or Email', 'bit-integrations'),
  required: true
}

/**
 * Field maps hold only the identifier of the record an action targets and free text.
 * Segments, the segment colour and the workflow are fetched dropdowns instead, because
 * they are configuration choices rather than the target of the action.
 */
export const fieldsByAction = {
  create_or_update_subscriber: [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false }
  ],
  batch_create_or_update_subscribers: [
    {
      key: 'subscribers',
      label: __('Subscribers (JSON array)', 'bit-integrations'),
      required: true
    }
  ],
  unsubscribe_subscriber: [subscriberIdField],
  add_subscriber_to_segments: [subscriberIdField],
  remove_subscriber_from_segments: [subscriberIdField],
  create_segment: [{ key: 'name', label: __('Segment Name', 'bit-integrations'), required: true }],
  create_custom_field: [
    { key: 'label', label: __('Field Label', 'bit-integrations'), required: true }
  ],
  add_subscriber_to_workflow: [subscriberIdField],
  remove_subscriber_from_workflow: [subscriberIdField]
}

// Actions whose field map also accepts arbitrary custom-field keys fetched from Flodesk.
export const supportsCustomFields = ['create_or_update_subscriber']

// Required dropdowns -> rendered in IntegLayout, always visible.
export const needsSegments = [
  'add_subscriber_to_segments',
  'remove_subscriber_from_segments'
]
export const needsSegmentColor = ['create_segment']
export const needsWorkflow = ['add_subscriber_to_workflow', 'remove_subscriber_from_workflow']

// Optional dropdowns -> rendered in Utilities, opt-in behind a checkbox.
export const optionalSegments = ['create_or_update_subscriber']
export const hasUtilities = ['create_or_update_subscriber']
