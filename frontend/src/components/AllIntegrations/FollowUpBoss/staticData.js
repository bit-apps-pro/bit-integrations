import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'create_person', label: __('Create Person', 'bit-integrations'), is_pro: true },
  { name: 'update_person', label: __('Update Person', 'bit-integrations'), is_pro: true },
  { name: 'delete_person', label: __('Delete Person', 'bit-integrations'), is_pro: true },
  { name: 'create_event', label: __('Create Event', 'bit-integrations'), is_pro: true },
  { name: 'create_relationship', label: __('Create Relationship', 'bit-integrations'), is_pro: true },
  { name: 'update_relationship', label: __('Update Relationship', 'bit-integrations'), is_pro: true },
  { name: 'delete_relationship', label: __('Delete Relationship', 'bit-integrations'), is_pro: true },
  { name: 'create_note', label: __('Create Note', 'bit-integrations'), is_pro: true },
  { name: 'update_note', label: __('Update Note', 'bit-integrations'), is_pro: true },
  { name: 'delete_note', label: __('Delete Note', 'bit-integrations'), is_pro: true },
  { name: 'log_call', label: __('Log Call', 'bit-integrations'), is_pro: true },
  { name: 'update_call', label: __('Update Call', 'bit-integrations'), is_pro: true },
  { name: 'delete_user', label: __('Delete User', 'bit-integrations'), is_pro: true },
  { name: 'apply_action_plan', label: __('Apply Action Plan', 'bit-integrations'), is_pro: true },
  {
    name: 'update_action_plan_status',
    label: __('Update Action Plan Status', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_email_template',
    label: __('Create Email Template', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_email_template',
    label: __('Update Email Template', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_email_template',
    label: __('Delete Email Template', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_text_message_template',
    label: __('Create Text Message Template', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_text_message_template',
    label: __('Update Text Message Template', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_text_message_template',
    label: __('Delete Text Message Template', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'log_email_marketing_event',
    label: __('Log Email Marketing Event', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_email_campaign',
    label: __('Create Email Campaign', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_email_campaign',
    label: __('Update Email Campaign', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_custom_field', label: __('Create Custom Field', 'bit-integrations'), is_pro: true },
  { name: 'update_custom_field', label: __('Update Custom Field', 'bit-integrations'), is_pro: true },
  { name: 'delete_custom_field', label: __('Delete Custom Field', 'bit-integrations'), is_pro: true },
  { name: 'create_stage', label: __('Create Stage', 'bit-integrations'), is_pro: true },
  { name: 'update_stage', label: __('Update Stage', 'bit-integrations'), is_pro: true },
  { name: 'delete_stage', label: __('Delete Stage', 'bit-integrations'), is_pro: true },
  { name: 'create_task', label: __('Create Task', 'bit-integrations'), is_pro: true },
  { name: 'update_task', label: __('Update Task', 'bit-integrations'), is_pro: true },
  { name: 'delete_task', label: __('Delete Task', 'bit-integrations'), is_pro: true },
  { name: 'create_appointment', label: __('Create Appointment', 'bit-integrations'), is_pro: true },
  { name: 'update_appointment', label: __('Update Appointment', 'bit-integrations'), is_pro: true },
  { name: 'delete_appointment', label: __('Delete Appointment', 'bit-integrations'), is_pro: true },
  {
    name: 'create_appointment_type',
    label: __('Create Appointment Type', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_appointment_type',
    label: __('Update Appointment Type', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_appointment_type',
    label: __('Delete Appointment Type', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'create_appointment_outcome',
    label: __('Create Appointment Outcome', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_appointment_outcome',
    label: __('Update Appointment Outcome', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_appointment_outcome',
    label: __('Delete Appointment Outcome', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_pipeline', label: __('Create Pipeline', 'bit-integrations'), is_pro: true },
  { name: 'update_pipeline', label: __('Update Pipeline', 'bit-integrations'), is_pro: true },
  { name: 'delete_pipeline', label: __('Delete Pipeline', 'bit-integrations'), is_pro: true },
  { name: 'create_deal', label: __('Create Deal', 'bit-integrations'), is_pro: true },
  { name: 'update_deal', label: __('Update Deal', 'bit-integrations'), is_pro: true },
  { name: 'delete_deal', label: __('Delete Deal', 'bit-integrations'), is_pro: true },
  {
    name: 'create_deal_custom_field',
    label: __('Create Deal Custom Field', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_deal_custom_field',
    label: __('Update Deal Custom Field', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'delete_deal_custom_field',
    label: __('Delete Deal Custom Field', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_group', label: __('Create Group', 'bit-integrations'), is_pro: true },
  { name: 'update_group', label: __('Update Group', 'bit-integrations'), is_pro: true },
  { name: 'delete_group', label: __('Delete Group', 'bit-integrations'), is_pro: true },
  { name: 'create_team', label: __('Create Team', 'bit-integrations'), is_pro: true },
  { name: 'update_team', label: __('Update Team', 'bit-integrations'), is_pro: true },
  { name: 'delete_team', label: __('Delete Team', 'bit-integrations'), is_pro: true },
  { name: 'create_pond', label: __('Create Pond', 'bit-integrations'), is_pro: true },
  { name: 'update_pond', label: __('Update Pond', 'bit-integrations'), is_pro: true },
  { name: 'delete_pond', label: __('Delete Pond', 'bit-integrations'), is_pro: true },
  { name: 'add_reaction', label: __('Add Reaction', 'bit-integrations'), is_pro: true },
  { name: 'remove_reaction', label: __('Remove Reaction', 'bit-integrations'), is_pro: true }
]

const field = (key, label, required = false) => ({ key, label, required })

export const fieldsByAction = {
  create_person: [
    field('first_name', __('First Name', 'bit-integrations')),
    field('last_name', __('Last Name', 'bit-integrations')),
    field('email', __('Email', 'bit-integrations')),
    field('phone', __('Phone', 'bit-integrations')),
    field('street', __('Street', 'bit-integrations')),
    field('city', __('City', 'bit-integrations')),
    field('state', __('State', 'bit-integrations')),
    field('code', __('Postal Code', 'bit-integrations')),
    field('country', __('Country', 'bit-integrations')),
    field('source', __('Source', 'bit-integrations')),
    field('source_url', __('Source URL', 'bit-integrations')),
    field('price', __('Price', 'bit-integrations')),
    field('tags', __('Tags', 'bit-integrations')),
    field('background', __('Background', 'bit-integrations')),
    field('created_at', __('Created At', 'bit-integrations'))
  ],
  update_person: [
    field('person_id', __('Person ID', 'bit-integrations'), true),
    field('first_name', __('First Name', 'bit-integrations')),
    field('last_name', __('Last Name', 'bit-integrations')),
    field('email', __('Email', 'bit-integrations')),
    field('phone', __('Phone', 'bit-integrations')),
    field('street', __('Street', 'bit-integrations')),
    field('city', __('City', 'bit-integrations')),
    field('state', __('State', 'bit-integrations')),
    field('code', __('Postal Code', 'bit-integrations')),
    field('country', __('Country', 'bit-integrations')),
    field('price', __('Price', 'bit-integrations')),
    field('tags', __('Tags', 'bit-integrations')),
    field('background', __('Background', 'bit-integrations'))
  ],
  delete_person: [field('person_id', __('Person ID', 'bit-integrations'), true)],
  create_event: [
    field('source', __('Source', 'bit-integrations')),
    field('system', __('System', 'bit-integrations')),
    field('message', __('Message', 'bit-integrations')),
    field('description', __('Description', 'bit-integrations')),
    field('occurred_at', __('Occurred At', 'bit-integrations')),
    field('person_id', __('Existing Person ID', 'bit-integrations')),
    field('person_first_name', __('Person First Name', 'bit-integrations')),
    field('person_last_name', __('Person Last Name', 'bit-integrations')),
    field('person_email', __('Person Email', 'bit-integrations')),
    field('person_phone', __('Person Phone', 'bit-integrations')),
    field('person_tags', __('Person Tags', 'bit-integrations')),
    field('property_street', __('Property Street', 'bit-integrations')),
    field('property_city', __('Property City', 'bit-integrations')),
    field('property_state', __('Property State', 'bit-integrations')),
    field('property_code', __('Property Postal Code', 'bit-integrations')),
    field('property_mls_number', __('Property MLS Number', 'bit-integrations')),
    field('property_price', __('Property Price', 'bit-integrations')),
    field('property_url', __('Property URL', 'bit-integrations')),
    field('property_type', __('Property Type', 'bit-integrations')),
    field('property_bedrooms', __('Property Bedrooms', 'bit-integrations')),
    field('property_bathrooms', __('Property Bathrooms', 'bit-integrations')),
    field('property_area', __('Property Area', 'bit-integrations')),
    field('property_lot', __('Property Lot Size', 'bit-integrations')),
    field('search_type', __('Search Property Type', 'bit-integrations')),
    field('search_neighborhood', __('Search Neighborhood', 'bit-integrations')),
    field('search_city', __('Search City', 'bit-integrations')),
    field('search_state', __('Search State', 'bit-integrations')),
    field('search_code', __('Search Postal Code', 'bit-integrations')),
    field('search_min_price', __('Search Minimum Price', 'bit-integrations')),
    field('search_max_price', __('Search Maximum Price', 'bit-integrations')),
    field('search_min_bedrooms', __('Search Minimum Bedrooms', 'bit-integrations')),
    field('search_max_bedrooms', __('Search Maximum Bedrooms', 'bit-integrations')),
    field('search_min_bathrooms', __('Search Minimum Bathrooms', 'bit-integrations')),
    field('search_max_bathrooms', __('Search Maximum Bathrooms', 'bit-integrations')),
    field('campaign_source', __('Campaign Source', 'bit-integrations')),
    field('campaign_medium', __('Campaign Medium', 'bit-integrations')),
    field('campaign_term', __('Campaign Term', 'bit-integrations')),
    field('campaign_content', __('Campaign Content', 'bit-integrations')),
    field('campaign_name', __('Campaign Name', 'bit-integrations')),
    field('page_title', __('Page Title', 'bit-integrations')),
    field('page_url', __('Page URL', 'bit-integrations')),
    field('page_referrer', __('Page Referrer', 'bit-integrations')),
    field('page_duration', __('Page Duration', 'bit-integrations'))
  ],
  create_relationship: [
    field('person_id', __('Person ID', 'bit-integrations'), true),
    field('first_name', __('First Name', 'bit-integrations')),
    field('last_name', __('Last Name', 'bit-integrations')),
    field('type', __('Relationship Type', 'bit-integrations')),
    field('email', __('Email', 'bit-integrations')),
    field('phone', __('Phone', 'bit-integrations')),
    field('street', __('Street', 'bit-integrations')),
    field('city', __('City', 'bit-integrations')),
    field('state', __('State', 'bit-integrations')),
    field('code', __('Postal Code', 'bit-integrations')),
    field('country', __('Country', 'bit-integrations'))
  ],
  update_relationship: [
    field('relationship_id', __('Relationship ID', 'bit-integrations'), true),
    field('first_name', __('First Name', 'bit-integrations')),
    field('last_name', __('Last Name', 'bit-integrations')),
    field('type', __('Relationship Type', 'bit-integrations')),
    field('email', __('Email', 'bit-integrations')),
    field('phone', __('Phone', 'bit-integrations')),
    field('street', __('Street', 'bit-integrations')),
    field('city', __('City', 'bit-integrations')),
    field('state', __('State', 'bit-integrations')),
    field('code', __('Postal Code', 'bit-integrations')),
    field('country', __('Country', 'bit-integrations'))
  ],
  delete_relationship: [field('relationship_id', __('Relationship ID', 'bit-integrations'), true)],
  create_note: [
    field('person_id', __('Person ID', 'bit-integrations'), true),
    field('subject', __('Subject', 'bit-integrations')),
    field('body', __('Body', 'bit-integrations'), true)
  ],
  update_note: [
    field('note_id', __('Note ID', 'bit-integrations'), true),
    field('subject', __('Subject', 'bit-integrations')),
    field('body', __('Body', 'bit-integrations'))
  ],
  delete_note: [field('note_id', __('Note ID', 'bit-integrations'), true)],
  log_call: [
    field('person_id', __('Person ID', 'bit-integrations'), true),
    field('phone', __('Phone', 'bit-integrations'), true),
    field('note', __('Note', 'bit-integrations')),
    field('duration', __('Duration', 'bit-integrations')),
    field('to_number', __('To Number', 'bit-integrations')),
    field('from_number', __('From Number', 'bit-integrations')),
    field('recording_url', __('Recording URL', 'bit-integrations'))
  ],
  update_call: [
    field('call_id', __('Call ID', 'bit-integrations'), true),
    field('person_id', __('Person ID', 'bit-integrations')),
    field('phone', __('Phone', 'bit-integrations')),
    field('note', __('Note', 'bit-integrations')),
    field('duration', __('Duration', 'bit-integrations')),
    field('to_number', __('To Number', 'bit-integrations')),
    field('from_number', __('From Number', 'bit-integrations')),
    field('recording_url', __('Recording URL', 'bit-integrations'))
  ],
  delete_user: [field('user_id', __('User ID', 'bit-integrations'), true)],
  apply_action_plan: [field('person_id', __('Person ID', 'bit-integrations'), true)],
  update_action_plan_status: [
    field('action_plan_person_id', __('Applied Action Plan ID', 'bit-integrations'), true)
  ],
  create_email_template: [
    field('name', __('Template Name', 'bit-integrations'), true),
    field('subject', __('Subject', 'bit-integrations'), true),
    field('body', __('Body', 'bit-integrations'), true)
  ],
  update_email_template: [
    field('template_id', __('Email Template ID', 'bit-integrations'), true),
    field('name', __('Template Name', 'bit-integrations')),
    field('subject', __('Subject', 'bit-integrations')),
    field('body', __('Body', 'bit-integrations'))
  ],
  delete_email_template: [field('template_id', __('Email Template ID', 'bit-integrations'), true)],
  create_text_message_template: [
    field('name', __('Template Name', 'bit-integrations'), true),
    field('message', __('Message', 'bit-integrations'), true)
  ],
  update_text_message_template: [
    field('template_id', __('Text Message Template ID', 'bit-integrations'), true),
    field('name', __('Template Name', 'bit-integrations')),
    field('message', __('Message', 'bit-integrations'))
  ],
  delete_text_message_template: [
    field('template_id', __('Text Message Template ID', 'bit-integrations'), true)
  ],
  log_email_marketing_event: [
    field('recipient', __('Recipient Email', 'bit-integrations'), true),
    field('occurred', __('Occurred At', 'bit-integrations')),
    field('person_id', __('Person ID', 'bit-integrations')),
    field('url', __('Clicked URL', 'bit-integrations'))
  ],
  create_email_campaign: [
    field('origin', __('Source System', 'bit-integrations')),
    field('origin_id', __('Source System Campaign ID', 'bit-integrations')),
    field('name', __('Campaign Name', 'bit-integrations')),
    field('subject', __('Subject', 'bit-integrations')),
    field('body_html', __('Body', 'bit-integrations'))
  ],
  update_email_campaign: [
    field('campaign_id', __('Email Campaign ID', 'bit-integrations'), true),
    field('name', __('Campaign Name', 'bit-integrations')),
    field('subject', __('Subject', 'bit-integrations')),
    field('body_html', __('Body', 'bit-integrations'))
  ],
  create_custom_field: [
    field('label', __('Label', 'bit-integrations'), true),
    field('choices', __('Choices', 'bit-integrations')),
    field('order_weight', __('Sort Order', 'bit-integrations'))
  ],
  update_custom_field: [
    field('custom_field_id', __('Custom Field ID', 'bit-integrations'), true),
    field('label', __('Label', 'bit-integrations')),
    field('choices', __('Choices', 'bit-integrations')),
    field('order_weight', __('Sort Order', 'bit-integrations'))
  ],
  delete_custom_field: [field('custom_field_id', __('Custom Field ID', 'bit-integrations'), true)],
  create_stage: [
    field('name', __('Name', 'bit-integrations'), true),
    field('order_weight', __('Sort Order', 'bit-integrations'))
  ],
  update_stage: [
    field('stage_id', __('Stage ID', 'bit-integrations'), true),
    field('name', __('Name', 'bit-integrations')),
    field('order_weight', __('Sort Order', 'bit-integrations'))
  ],
  delete_stage: [field('stage_id', __('Stage ID', 'bit-integrations'), true)],
  create_task: [
    field('person_id', __('Person ID', 'bit-integrations'), true),
    field('name', __('Task Name', 'bit-integrations')),
    field('due_date', __('Due Date', 'bit-integrations')),
    field('due_date_time', __('Due Date and Time', 'bit-integrations')),
    field('remind_seconds_before', __('Reminder', 'bit-integrations'))
  ],
  update_task: [
    field('task_id', __('Task ID', 'bit-integrations'), true),
    field('person_id', __('Person ID', 'bit-integrations')),
    field('name', __('Task Name', 'bit-integrations')),
    field('due_date', __('Due Date', 'bit-integrations')),
    field('due_date_time', __('Due Date and Time', 'bit-integrations')),
    field('remind_seconds_before', __('Reminder', 'bit-integrations'))
  ],
  delete_task: [field('task_id', __('Task ID', 'bit-integrations'), true)],
  create_appointment: [
    field('title', __('Title', 'bit-integrations'), true),
    field('start', __('Start', 'bit-integrations'), true),
    field('end', __('End', 'bit-integrations'), true),
    field('description', __('Description', 'bit-integrations')),
    field('location', __('Location', 'bit-integrations')),
    field('invited_person_ids', __('Invited People IDs', 'bit-integrations'))
  ],
  update_appointment: [
    field('appointment_id', __('Appointment ID', 'bit-integrations'), true),
    field('title', __('Title', 'bit-integrations')),
    field('start', __('Start', 'bit-integrations')),
    field('end', __('End', 'bit-integrations')),
    field('description', __('Description', 'bit-integrations')),
    field('location', __('Location', 'bit-integrations')),
    field('invited_person_ids', __('Invited People IDs', 'bit-integrations'))
  ],
  delete_appointment: [field('appointment_id', __('Appointment ID', 'bit-integrations'), true)],
  create_appointment_type: [
    field('name', __('Name', 'bit-integrations'), true),
    field('order_weight', __('Sort Order', 'bit-integrations'))
  ],
  update_appointment_type: [
    field('type_id', __('Appointment Type ID', 'bit-integrations'), true),
    field('name', __('Name', 'bit-integrations')),
    field('order_weight', __('Sort Order', 'bit-integrations'))
  ],
  delete_appointment_type: [field('type_id', __('Appointment Type ID', 'bit-integrations'), true)],
  create_appointment_outcome: [
    field('name', __('Name', 'bit-integrations'), true),
    field('order_weight', __('Sort Order', 'bit-integrations'))
  ],
  update_appointment_outcome: [
    field('outcome_id', __('Appointment Outcome ID', 'bit-integrations'), true),
    field('name', __('Name', 'bit-integrations')),
    field('order_weight', __('Sort Order', 'bit-integrations'))
  ],
  delete_appointment_outcome: [
    field('outcome_id', __('Appointment Outcome ID', 'bit-integrations'), true)
  ],
  create_pipeline: [
    field('name', __('Pipeline Name', 'bit-integrations'), true),
    field('description', __('Description', 'bit-integrations')),
    field('stages', __('Stages', 'bit-integrations')),
    field('order_weight', __('Sort Order', 'bit-integrations'))
  ],
  update_pipeline: [
    field('pipeline_id', __('Pipeline ID', 'bit-integrations'), true),
    field('name', __('Pipeline Name', 'bit-integrations')),
    field('description', __('Description', 'bit-integrations')),
    field('order_weight', __('Sort Order', 'bit-integrations'))
  ],
  delete_pipeline: [field('pipeline_id', __('Pipeline ID', 'bit-integrations'), true)],
  create_deal: [
    field('name', __('Deal Name', 'bit-integrations'), true),
    field('description', __('Description', 'bit-integrations')),
    field('people_ids', __('People IDs', 'bit-integrations')),
    field('price', __('Price', 'bit-integrations')),
    field('projected_close_date', __('Projected Close Date', 'bit-integrations')),
    field('commission_value', __('Commission Value', 'bit-integrations')),
    field('agent_commission', __('Agent Commission', 'bit-integrations')),
    field('team_commission', __('Team Commission', 'bit-integrations')),
    field('earnest_money_due_date', __('Earnest Money Due Date', 'bit-integrations')),
    field('mutual_acceptance_date', __('Mutual Acceptance Date', 'bit-integrations')),
    field('due_diligence_date', __('Due Diligence Date', 'bit-integrations')),
    field('final_walk_through_date', __('Final Walk-Through Date', 'bit-integrations')),
    field('possession_date', __('Possession Date', 'bit-integrations')),
    field('order_weight', __('Sort Order', 'bit-integrations'))
  ],
  update_deal: [
    field('deal_id', __('Deal ID', 'bit-integrations'), true),
    field('name', __('Deal Name', 'bit-integrations')),
    field('description', __('Description', 'bit-integrations')),
    field('people_ids', __('People IDs', 'bit-integrations')),
    field('price', __('Price', 'bit-integrations')),
    field('projected_close_date', __('Projected Close Date', 'bit-integrations')),
    field('commission_value', __('Commission Value', 'bit-integrations')),
    field('agent_commission', __('Agent Commission', 'bit-integrations')),
    field('team_commission', __('Team Commission', 'bit-integrations')),
    field('earnest_money_due_date', __('Earnest Money Due Date', 'bit-integrations')),
    field('mutual_acceptance_date', __('Mutual Acceptance Date', 'bit-integrations')),
    field('due_diligence_date', __('Due Diligence Date', 'bit-integrations')),
    field('final_walk_through_date', __('Final Walk-Through Date', 'bit-integrations')),
    field('possession_date', __('Possession Date', 'bit-integrations')),
    field('order_weight', __('Sort Order', 'bit-integrations'))
  ],
  delete_deal: [field('deal_id', __('Deal ID', 'bit-integrations'), true)],
  create_deal_custom_field: [
    field('label', __('Label', 'bit-integrations'), true),
    field('choices', __('Choices', 'bit-integrations')),
    field('order_weight', __('Sort Order', 'bit-integrations'))
  ],
  update_deal_custom_field: [
    field('custom_field_id', __('Custom Field ID', 'bit-integrations'), true),
    field('label', __('Label', 'bit-integrations')),
    field('choices', __('Choices', 'bit-integrations')),
    field('order_weight', __('Sort Order', 'bit-integrations'))
  ],
  delete_deal_custom_field: [field('custom_field_id', __('Custom Field ID', 'bit-integrations'), true)],
  create_group: [
    field('name', __('Group Name', 'bit-integrations'), true),
    field('claim_window', __('Claim Window', 'bit-integrations'))
  ],
  update_group: [
    field('group_id', __('Group ID', 'bit-integrations'), true),
    field('name', __('Group Name', 'bit-integrations')),
    field('claim_window', __('Claim Window', 'bit-integrations'))
  ],
  delete_group: [field('group_id', __('Group ID', 'bit-integrations'), true)],
  create_team: [field('name', __('Team Name', 'bit-integrations'), true)],
  update_team: [
    field('team_id', __('Team ID', 'bit-integrations'), true),
    field('name', __('Team Name', 'bit-integrations'))
  ],
  delete_team: [field('team_id', __('Team ID', 'bit-integrations'), true)],
  create_pond: [field('name', __('Pond Name', 'bit-integrations'), true)],
  update_pond: [
    field('pond_id', __('Pond ID', 'bit-integrations'), true),
    field('name', __('Pond Name', 'bit-integrations'))
  ],
  delete_pond: [field('pond_id', __('Pond ID', 'bit-integrations'), true)],
  add_reaction: [
    field('ref_id', __('Note, Call or Reply ID', 'bit-integrations'), true),
    field('body', __('Emoji', 'bit-integrations'), true)
  ],
  remove_reaction: [
    field('ref_id', __('Note, Call or Reply ID', 'bit-integrations'), true),
    field('emoji', __('Emoji', 'bit-integrations'), true)
  ]
}

export const customFieldActions = ['create_person', 'update_person']

const actionPlanPersonStatusOptions = [
  { label: __('Running', 'bit-integrations'), value: 'Running' },
  { label: __('Paused', 'bit-integrations'), value: 'Paused' }
]

const callDirectionOptions = [
  { label: __('Incoming', 'bit-integrations'), value: 'true' },
  { label: __('Outgoing', 'bit-integrations'), value: 'false' }
]

const callOutcomeOptions = [
  { label: __('Interested', 'bit-integrations'), value: 'Interested' },
  { label: __('Not Interested', 'bit-integrations'), value: 'Not Interested' },
  { label: __('Left Message', 'bit-integrations'), value: 'Left Message' },
  { label: __('No Answer', 'bit-integrations'), value: 'No Answer' },
  { label: __('Busy', 'bit-integrations'), value: 'Busy' },
  { label: __('Bad Number', 'bit-integrations'), value: 'Bad Number' }
]

const customFieldTypeOptions = [
  { label: __('Text', 'bit-integrations'), value: 'text' },
  { label: __('Date', 'bit-integrations'), value: 'date' },
  { label: __('Number', 'bit-integrations'), value: 'number' },
  { label: __('Dropdown', 'bit-integrations'), value: 'dropdown' }
]

const emEventTypeOptions = [
  { label: __('Delivered', 'bit-integrations'), value: 'delivered' },
  { label: __('Open', 'bit-integrations'), value: 'open' },
  { label: __('Click', 'bit-integrations'), value: 'click' },
  { label: __('Bounced', 'bit-integrations'), value: 'bounced' },
  { label: __('Soft Bounce', 'bit-integrations'), value: 'soft-bounce' },
  { label: __('Hard Bounce', 'bit-integrations'), value: 'hard-bounce' },
  { label: __('Unsubscribe', 'bit-integrations'), value: 'unsubscribe' },
  { label: __('Spam Report', 'bit-integrations'), value: 'spamreport' },
  { label: __('Dropped', 'bit-integrations'), value: 'dropped' }
]

const eventTypeOptions = [
  { label: __('Registration', 'bit-integrations'), value: 'Registration' },
  { label: __('Inquiry', 'bit-integrations'), value: 'Inquiry' },
  { label: __('Seller Inquiry', 'bit-integrations'), value: 'Seller Inquiry' },
  { label: __('Property Inquiry', 'bit-integrations'), value: 'Property Inquiry' },
  { label: __('General Inquiry', 'bit-integrations'), value: 'General Inquiry' },
  { label: __('Viewed Property', 'bit-integrations'), value: 'Viewed Property' },
  { label: __('Saved Property', 'bit-integrations'), value: 'Saved Property' },
  { label: __('Visited Website', 'bit-integrations'), value: 'Visited Website' },
  { label: __('Incoming Call', 'bit-integrations'), value: 'Incoming Call' },
  { label: __('Unsubscribed', 'bit-integrations'), value: 'Unsubscribed' },
  { label: __('Property Search', 'bit-integrations'), value: 'Property Search' },
  { label: __('Saved Property Search', 'bit-integrations'), value: 'Saved Property Search' },
  { label: __('Visited Open House', 'bit-integrations'), value: 'Visited Open House' },
  { label: __('Viewed Page', 'bit-integrations'), value: 'Viewed Page' }
]

const groupDistributionOptions = [
  { label: __('Round robin', 'bit-integrations'), value: 'round-robin' },
  { label: __('First to claim', 'bit-integrations'), value: 'first-to-claim' }
]

const groupTypeOptions = [
  { label: __('Agent', 'bit-integrations'), value: 'Agent' },
  { label: __('Lender', 'bit-integrations'), value: 'Lender' }
]

const reactionRecordTypeOptions = [
  { label: __('Note', 'bit-integrations'), value: 'Note' },
  { label: __('Call', 'bit-integrations'), value: 'Call' },
  { label: __('Threaded Reply', 'bit-integrations'), value: 'ThreadedReply' }
]

const taskTypeOptions = [
  { label: __('Follow Up', 'bit-integrations'), value: 'Follow Up' },
  { label: __('Call', 'bit-integrations'), value: 'Call' },
  { label: __('Text', 'bit-integrations'), value: 'Text' },
  { label: __('Email', 'bit-integrations'), value: 'Email' },
  { label: __('Appointment', 'bit-integrations'), value: 'Appointment' },
  { label: __('Showing', 'bit-integrations'), value: 'Showing' },
  { label: __('Closing', 'bit-integrations'), value: 'Closing' },
  { label: __('Open House', 'bit-integrations'), value: 'Open House' },
  { label: __('Thank You', 'bit-integrations'), value: 'Thank You' }
]

const select = (key, label, source, required = false, multi = false) => ({
  key,
  label,
  multi,
  required,
  source
})

const enumSelect = (key, label, options, required = false) => ({ key, label, options, required })

export const selectsByAction = {
  create_person: [
    select('stage', __('Stage', 'bit-integrations'), 'stageNames'),
    select('assigned_user_id', __('Assigned User', 'bit-integrations'), 'users'),
    select('assigned_lender_id', __('Assigned Lender', 'bit-integrations'), 'users'),
    select('assigned_pond_id', __('Assigned Pond', 'bit-integrations'), 'ponds'),
    select('collaborators', __('Collaborators', 'bit-integrations'), 'users', false, true),
    select('timeframe_id', __('Timeframe', 'bit-integrations'), 'timeframes')
  ],
  update_person: [
    select('stage', __('Stage', 'bit-integrations'), 'stageNames'),
    select('assigned_user_id', __('Assigned User', 'bit-integrations'), 'users'),
    select('assigned_lender_id', __('Assigned Lender', 'bit-integrations'), 'users'),
    select('assigned_pond_id', __('Assigned Pond', 'bit-integrations'), 'ponds'),
    select('collaborators', __('Collaborators', 'bit-integrations'), 'users', false, true),
    select('timeframe_id', __('Timeframe', 'bit-integrations'), 'timeframes')
  ],
  create_event: [
    enumSelect('event_type', __('Event Type', 'bit-integrations'), eventTypeOptions, true),
    select('person_stage', __('Person Stage', 'bit-integrations'), 'stageNames'),
    select('person_assigned_user_id', __('Assigned User', 'bit-integrations'), 'users')
  ],
  log_call: [
    enumSelect('is_incoming', __('Call Direction', 'bit-integrations'), callDirectionOptions, true),
    enumSelect('outcome', __('Outcome', 'bit-integrations'), callOutcomeOptions),
    select('user_id', __('User', 'bit-integrations'), 'users')
  ],
  update_call: [
    enumSelect('is_incoming', __('Call Direction', 'bit-integrations'), callDirectionOptions),
    enumSelect('outcome', __('Outcome', 'bit-integrations'), callOutcomeOptions),
    select('user_id', __('User', 'bit-integrations'), 'users')
  ],
  delete_user: [select('assign_to_user_id', __('Move People To', 'bit-integrations'), 'users', true)],
  apply_action_plan: [
    select('action_plan_id', __('Action Plan', 'bit-integrations'), 'actionPlans', true)
  ],
  update_action_plan_status: [
    enumSelect('plan_status', __('Status', 'bit-integrations'), actionPlanPersonStatusOptions, true)
  ],
  log_email_marketing_event: [
    enumSelect('event_type', __('Event Type', 'bit-integrations'), emEventTypeOptions, true),
    select('campaign_id', __('Email Campaign', 'bit-integrations'), 'emailCampaigns'),
    select('user_id', __('User', 'bit-integrations'), 'users')
  ],
  create_custom_field: [
    enumSelect('field_type', __('Field Type', 'bit-integrations'), customFieldTypeOptions, true)
  ],
  delete_stage: [
    select('assign_stage_id', __('Stage for Action Plans', 'bit-integrations'), 'stages', true)
  ],
  create_task: [
    enumSelect('task_type', __('Task Type', 'bit-integrations'), taskTypeOptions),
    select('assigned_user_id', __('Assigned User', 'bit-integrations'), 'users')
  ],
  update_task: [
    enumSelect('task_type', __('Task Type', 'bit-integrations'), taskTypeOptions),
    select('assigned_user_id', __('Assigned User', 'bit-integrations'), 'users')
  ],
  create_appointment: [
    select('invited_user_ids', __('Invited Users', 'bit-integrations'), 'users', false, true),
    select('type_id', __('Appointment Type', 'bit-integrations'), 'appointmentTypes'),
    select('outcome_id', __('Appointment Outcome', 'bit-integrations'), 'appointmentOutcomes'),
    select('created_by_id', __('Created By', 'bit-integrations'), 'users')
  ],
  update_appointment: [
    select('invited_user_ids', __('Invited Users', 'bit-integrations'), 'users', false, true),
    select('type_id', __('Appointment Type', 'bit-integrations'), 'appointmentTypes'),
    select('outcome_id', __('Appointment Outcome', 'bit-integrations'), 'appointmentOutcomes'),
    select('created_by_id', __('Created By', 'bit-integrations'), 'users')
  ],
  delete_appointment_type: [
    select('assign_type_id', __('Move Appointments To', 'bit-integrations'), 'appointmentTypes', true)
  ],
  delete_appointment_outcome: [
    select(
      'assign_outcome_id',
      __('Move Appointments To', 'bit-integrations'),
      'appointmentOutcomes',
      true
    )
  ],
  create_deal: [
    select('stage_id', __('Stage', 'bit-integrations'), 'dealStages', true),
    select('user_ids', __('Users', 'bit-integrations'), 'users', false, true)
  ],
  update_deal: [
    select('stage_id', __('Stage', 'bit-integrations'), 'dealStages'),
    select('user_ids', __('Users', 'bit-integrations'), 'users', false, true)
  ],
  create_deal_custom_field: [
    enumSelect('field_type', __('Field Type', 'bit-integrations'), customFieldTypeOptions, true)
  ],
  update_deal_custom_field: [
    enumSelect('field_type', __('Field Type', 'bit-integrations'), customFieldTypeOptions)
  ],
  create_group: [
    select('users', __('Members', 'bit-integrations'), 'users', true, true),
    enumSelect('group_type', __('Group Type', 'bit-integrations'), groupTypeOptions),
    enumSelect('distribution', __('Distribution', 'bit-integrations'), groupDistributionOptions),
    select('default_group_id', __('Default Group', 'bit-integrations'), 'groups'),
    select('default_pond_id', __('Default Pond', 'bit-integrations'), 'ponds'),
    select('default_user_id', __('Default User', 'bit-integrations'), 'users')
  ],
  update_group: [
    select('users', __('Members', 'bit-integrations'), 'users', false, true),
    enumSelect('group_type', __('Group Type', 'bit-integrations'), groupTypeOptions),
    enumSelect('distribution', __('Distribution', 'bit-integrations'), groupDistributionOptions),
    select('default_group_id', __('Default Group', 'bit-integrations'), 'groups'),
    select('default_pond_id', __('Default Pond', 'bit-integrations'), 'ponds'),
    select('default_user_id', __('Default User', 'bit-integrations'), 'users')
  ],
  create_team: [
    select('user_ids', __('Members', 'bit-integrations'), 'users', true, true),
    select('leader_ids', __('Leaders', 'bit-integrations'), 'users', false, true)
  ],
  update_team: [
    select('user_ids', __('Members', 'bit-integrations'), 'users', false, true),
    select('leader_ids', __('Leaders', 'bit-integrations'), 'users', false, true)
  ],
  delete_team: [select('move_to_team_id', __('Move Members To', 'bit-integrations'), 'teams')],
  create_pond: [
    select('user_id', __('Pond Lead User', 'bit-integrations'), 'users', true),
    select('user_ids', __('Members', 'bit-integrations'), 'users', true, true)
  ],
  update_pond: [
    select('user_id', __('Pond Lead User', 'bit-integrations'), 'users'),
    select('user_ids', __('Members', 'bit-integrations'), 'users', false, true)
  ],
  delete_pond: [select('assign_to_user_id', __('Move People To', 'bit-integrations'), 'users', true)],
  add_reaction: [
    enumSelect('ref_type', __('Record Type', 'bit-integrations'), reactionRecordTypeOptions, true)
  ],
  remove_reaction: [
    enumSelect('ref_type', __('Record Type', 'bit-integrations'), reactionRecordTypeOptions, true)
  ]
}

export const selectKeys = [
  ...new Set(Object.values(selectsByAction).flatMap(selects => selects.map(({ key }) => key)))
]

export const notesByAction = {
  create_person: __(
    '<ul><li><b>Email</b>: Separate more than one email with commas. The first email is the primary email.</li><li><b>Phone</b>: Separate more than one phone number with commas. The first number is the primary number.</li><li><b>Source</b>: Enter the name of the lead source. You can set it only when you create the person.</li><li><b>Price</b>: Enter the property price as a whole number.</li><li><b>Tags</b>: Separate more than one tag with commas.</li><li><b>Created At</b>: Enter a date and time to add a historical lead, for example 2026-01-15T10:00:00Z.</li></ul>',
    'bit-integrations'
  ),
  update_person: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li>Emails, phone numbers and addresses that you enter replace the current values.</li><li><b>Email</b>: Separate more than one email with commas. The first email is the primary email.</li><li><b>Phone</b>: Separate more than one phone number with commas. The first number is the primary number.</li><li><b>Price</b>: Enter the property price as a whole number.</li><li><b>Tags</b>: Separate more than one tag with commas.</li></ul>',
    'bit-integrations'
  ),
  create_event: __(
    '<ul><li><b>Source</b>: Enter the name of the lead source, for example your website name.</li><li><b>System</b>: Enter the name of the system that sends the lead.</li><li><b>Message</b>: Enter the message from the person about this inquiry.</li><li><b>Occurred At</b>: Enter a date older than one day to add a historical event. Historical events do not start action plans.</li><li><b>Person Email</b>: Follow Up Boss uses the email or phone to find a person that already exists.</li><li><b>Person Tags</b>: Separate more than one tag with commas.</li><li><b>Property Type</b>: Enter the property type, for example Single-Family Home.</li><li><b>Property Area</b>: Enter the area in square feet.</li><li><b>Property Lot Size</b>: Enter the lot size in acres.</li><li><b>Page Title</b>: Use this field with the Viewed Page event type.</li><li><b>Page URL</b>: Use this field with the Viewed Page event type.</li><li><b>Page Referrer</b>: Use this field with the Viewed Page event type.</li><li><b>Page Duration</b>: Enter the time on the page in seconds.</li></ul>',
    'bit-integrations'
  ),
  create_relationship: __(
    '<ul><li><b>Relationship Type</b>: Enter the relationship type, for example Spouse or Partner.</li><li><b>Email</b>: Separate more than one email with commas. The first email is the primary email.</li><li><b>Phone</b>: Separate more than one phone number with commas. The first number is the primary number.</li></ul>',
    'bit-integrations'
  ),
  update_relationship: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li>Emails, phone numbers and addresses that you enter replace the current values.</li><li><b>Relationship Type</b>: Enter the relationship type, for example Spouse or Partner.</li><li><b>Email</b>: Separate more than one email with commas. The first email is the primary email.</li><li><b>Phone</b>: Separate more than one phone number with commas. The first number is the primary number.</li></ul>',
    'bit-integrations'
  ),
  update_note: __(
    '<ul><li>Fields that you leave empty keep their current value.</li></ul>',
    'bit-integrations'
  ),
  log_call: __(
    '<ul><li><b>Phone</b>: Enter the phone number of the person.</li><li><b>Duration</b>: Enter the length of the call in seconds.</li></ul>',
    'bit-integrations'
  ),
  update_call: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li>You can only update calls that this connection created.</li><li><b>Phone</b>: Enter the phone number of the person.</li><li><b>Duration</b>: Enter the length of the call in seconds.</li></ul>',
    'bit-integrations'
  ),
  create_email_template: __(
    '<ul><li><b>Body</b>: Enter the HTML body. You can use merge fields, for example %contact_name%.</li></ul>',
    'bit-integrations'
  ),
  update_email_template: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li><b>Body</b>: Enter the HTML body. You can use merge fields, for example %contact_name%.</li></ul>',
    'bit-integrations'
  ),
  create_text_message_template: __(
    '<ul><li><b>Message</b>: You can use merge fields, for example %contact_first_name%.</li></ul>',
    'bit-integrations'
  ),
  update_text_message_template: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li><b>Message</b>: You can use merge fields, for example %contact_first_name%.</li></ul>',
    'bit-integrations'
  ),
  log_email_marketing_event: __(
    '<ul><li><b>Recipient Email</b>: Enter the email address that got the marketing email.</li><li><b>Occurred At</b>: Enter the date and time of the event, for example 2026-01-15T10:00:00Z.</li><li><b>Clicked URL</b>: Enter the link that the person clicked. Use it with the Click type.</li></ul>',
    'bit-integrations'
  ),
  create_email_campaign: __(
    '<ul><li><b>Source System</b>: Enter the name of the email marketing system that sends the campaign.</li><li><b>Source System Campaign ID</b>: Enter the ID of the campaign in the email marketing system.</li><li><b>Body</b>: Enter the HTML body of the email.</li></ul>',
    'bit-integrations'
  ),
  update_email_campaign: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li><b>Body</b>: Enter the HTML body of the email.</li></ul>',
    'bit-integrations'
  ),
  create_custom_field: __(
    '<ul><li><b>Label</b>: Enter the name of the custom field, for example Anniversary.</li><li><b>Choices</b>: Separate the choices with commas. Use this field with the Dropdown type.</li><li><b>Sort Order</b>: Enter a number to set the position in the list. A lower number shows first.</li></ul>',
    'bit-integrations'
  ),
  update_custom_field: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li><b>Label</b>: Enter the name of the custom field, for example Anniversary.</li><li><b>Choices</b>: Separate the choices with commas. Use this field with the Dropdown type.</li><li><b>Sort Order</b>: Enter a number to set the position in the list. A lower number shows first.</li></ul>',
    'bit-integrations'
  ),
  create_stage: __(
    '<ul><li><b>Sort Order</b>: Enter a number to set the position in the list. A lower number shows first.</li></ul>',
    'bit-integrations'
  ),
  update_stage: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li><b>Sort Order</b>: Enter a number to set the position in the list. A lower number shows first.</li></ul>',
    'bit-integrations'
  ),
  create_task: __(
    '<ul><li><b>Due Date</b>: Enter the due date in YYYY-MM-DD format.</li><li><b>Due Date and Time</b>: Enter the due date and time, for example 2026-01-15T10:00:00-05:00.</li><li><b>Reminder</b>: Enter the number of seconds before the due time to send a reminder. Use it with Due Date and Time.</li></ul>',
    'bit-integrations'
  ),
  update_task: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li><b>Due Date</b>: Enter the due date in YYYY-MM-DD format.</li><li><b>Due Date and Time</b>: Enter the due date and time, for example 2026-01-15T10:00:00-05:00.</li><li><b>Reminder</b>: Enter the number of seconds before the due time to send a reminder. Use it with Due Date and Time.</li></ul>',
    'bit-integrations'
  ),
  create_appointment: __(
    '<ul><li><b>Start</b>: Enter the start date and time in UTC, for example 2026-01-15T10:00:00Z.</li><li><b>End</b>: Enter the end date and time in UTC, for example 2026-01-15T11:00:00Z.</li></ul>',
    'bit-integrations'
  ),
  update_appointment: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li>Invited users and people that you select replace all current invitees.</li><li><b>Start</b>: Enter the start date and time in UTC, for example 2026-01-15T10:00:00Z.</li><li><b>End</b>: Enter the end date and time in UTC, for example 2026-01-15T11:00:00Z.</li></ul>',
    'bit-integrations'
  ),
  create_appointment_type: __(
    '<ul><li><b>Sort Order</b>: Enter a number to set the position in the list. A lower number shows first.</li></ul>',
    'bit-integrations'
  ),
  update_appointment_type: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li><b>Sort Order</b>: Enter a number to set the position in the list. A lower number shows first.</li></ul>',
    'bit-integrations'
  ),
  create_appointment_outcome: __(
    '<ul><li><b>Sort Order</b>: Enter a number to set the position in the list. A lower number shows first.</li></ul>',
    'bit-integrations'
  ),
  update_appointment_outcome: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li><b>Sort Order</b>: Enter a number to set the position in the list. A lower number shows first.</li></ul>',
    'bit-integrations'
  ),
  create_pipeline: __(
    '<ul><li><b>Stages</b>: Separate the stage names with commas, in pipeline order. The last stage is the closed stage.</li><li><b>Sort Order</b>: Enter a number to set the position in the list. A lower number shows first.</li></ul>',
    'bit-integrations'
  ),
  update_pipeline: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li><b>Sort Order</b>: Enter a number to set the position in the list. A lower number shows first.</li></ul>',
    'bit-integrations'
  ),
  create_deal: __(
    '<ul><li><b>Price</b>: Enter the price as a whole number.</li><li><b>Projected Close Date</b>: Enter a date, for example 2026-01-15.</li><li><b>Commission Value</b>: Enter the amount as a whole number.</li><li><b>Agent Commission</b>: Enter the amount as a whole number.</li><li><b>Team Commission</b>: Enter the amount as a whole number.</li><li><b>Sort Order</b>: Enter a number to set the position in the list. A lower number shows first.</li></ul>',
    'bit-integrations'
  ),
  update_deal: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li>People and users that you select replace the current values.</li><li><b>Price</b>: Enter the price as a whole number.</li><li><b>Projected Close Date</b>: Enter a date, for example 2026-01-15.</li><li><b>Commission Value</b>: Enter the amount as a whole number.</li><li><b>Agent Commission</b>: Enter the amount as a whole number.</li><li><b>Team Commission</b>: Enter the amount as a whole number.</li><li><b>Sort Order</b>: Enter a number to set the position in the list. A lower number shows first.</li></ul>',
    'bit-integrations'
  ),
  create_deal_custom_field: __(
    '<ul><li><b>Label</b>: Enter the name of the custom field, for example Anniversary.</li><li><b>Choices</b>: Separate the choices with commas. Use this field with the Dropdown type.</li><li><b>Sort Order</b>: Enter a number to set the position in the list. A lower number shows first.</li></ul>',
    'bit-integrations'
  ),
  update_deal_custom_field: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li><b>Label</b>: Enter the name of the custom field, for example Anniversary.</li><li><b>Choices</b>: Separate the choices with commas. Use this field with the Dropdown type.</li><li><b>Sort Order</b>: Enter a number to set the position in the list. A lower number shows first.</li></ul>',
    'bit-integrations'
  ),
  create_group: __(
    '<ul><li><b>Claim Window</b>: Enter the seconds that members have to claim a lead, from 60 to 1800. The default is 1800.</li></ul>',
    'bit-integrations'
  ),
  update_group: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li>Users that you select replace the current members.</li><li><b>Claim Window</b>: Enter the seconds that members have to claim a lead, from 60 to 1800. The default is 1800.</li></ul>',
    'bit-integrations'
  ),
  update_team: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li>Users that you select replace the current members and leaders.</li></ul>',
    'bit-integrations'
  ),
  update_pond: __(
    '<ul><li>Fields that you leave empty keep their current value.</li><li>Users that you select replace the current members.</li></ul>',
    'bit-integrations'
  ),
  add_reaction: __(
    '<ul><li><b>Note, Call or Reply ID</b>: Enter or map the ID of the note, call or threaded reply.</li><li><b>Emoji</b>: Enter one emoji, for example 👍.</li></ul>',
    'bit-integrations'
  ),
  remove_reaction: __(
    '<ul><li><b>Note, Call or Reply ID</b>: Enter or map the ID of the note, call or threaded reply.</li><li><b>Emoji</b>: Enter the emoji to remove, for example 👍.</li></ul>',
    'bit-integrations'
  )
}

const checkboxUtility = (key, title, subTitle, value = 'true') => ({ key, subTitle, title, value })

export const utilitiesByAction = {
  create_person: [
    checkboxUtility(
      'contacted',
      __('Contacted', 'bit-integrations'),
      __('Mark the person as contacted.', 'bit-integrations')
    ),
    checkboxUtility(
      'deduplicate',
      __('Prevent Duplicates', 'bit-integrations'),
      __('Return the current person when the email or phone already exists.', 'bit-integrations')
    )
  ],
  update_person: [
    checkboxUtility(
      'contacted',
      __('Contacted', 'bit-integrations'),
      __('Mark the person as contacted.', 'bit-integrations')
    ),
    checkboxUtility(
      'merge_tags',
      __('Keep Current Tags', 'bit-integrations'),
      __('Add the tags to the current tags. Do not replace them.', 'bit-integrations')
    )
  ],
  create_event: [
    checkboxUtility(
      'property_for_rent',
      __('Property for Rent', 'bit-integrations'),
      __('Mark the property as a rental.', 'bit-integrations')
    )
  ],
  create_note: [
    checkboxUtility(
      'is_html',
      __('HTML Body', 'bit-integrations'),
      __('Show the HTML tags in the note body as formatted text.', 'bit-integrations')
    )
  ],
  update_note: [
    checkboxUtility(
      'is_html',
      __('HTML Body', 'bit-integrations'),
      __('Show the HTML tags in the note body as formatted text.', 'bit-integrations')
    )
  ],
  create_email_template: [
    checkboxUtility(
      'is_shared',
      __('Shared', 'bit-integrations'),
      __('Share the template with the other users.', 'bit-integrations')
    )
  ],
  update_email_template: [
    checkboxUtility(
      'is_shared',
      __('Shared', 'bit-integrations'),
      __('Share the template with the other users.', 'bit-integrations')
    )
  ],
  create_text_message_template: [
    checkboxUtility(
      'is_shared',
      __('Shared', 'bit-integrations'),
      __('Share the template with the other users.', 'bit-integrations')
    )
  ],
  update_text_message_template: [
    checkboxUtility(
      'is_shared',
      __('Shared', 'bit-integrations'),
      __('Share the template with the other users.', 'bit-integrations')
    )
  ],
  create_custom_field: [
    checkboxUtility(
      'is_recurring',
      __('Recurring Date', 'bit-integrations'),
      __('Repeat a date field every year, for example a birthday.', 'bit-integrations')
    ),
    checkboxUtility(
      'hide_if_empty',
      __('Hide If Empty', 'bit-integrations'),
      __('Hide the field on a person when it has no value.', 'bit-integrations')
    )
  ],
  update_custom_field: [
    checkboxUtility(
      'is_recurring',
      __('Recurring Date', 'bit-integrations'),
      __('Repeat a date field every year, for example a birthday.', 'bit-integrations')
    ),
    checkboxUtility(
      'hide_if_empty',
      __('Hide If Empty', 'bit-integrations'),
      __('Hide the field on a person when it has no value.', 'bit-integrations')
    )
  ],
  create_task: [
    checkboxUtility(
      'is_completed',
      __('Completed', 'bit-integrations'),
      __('Mark the task as completed.', 'bit-integrations')
    )
  ],
  update_task: [
    checkboxUtility(
      'is_completed',
      __('Completed', 'bit-integrations'),
      __('Mark the task as completed.', 'bit-integrations')
    )
  ],
  create_appointment: [
    checkboxUtility(
      'all_day',
      __('All Day', 'bit-integrations'),
      __('Make the appointment an all-day event.', 'bit-integrations')
    ),
    checkboxUtility(
      'send_invitation',
      __('Send Invitation', 'bit-integrations'),
      __('Send an invitation email to the invitees.', 'bit-integrations')
    )
  ],
  update_appointment: [
    checkboxUtility(
      'all_day',
      __('All Day', 'bit-integrations'),
      __('Make the appointment an all-day event.', 'bit-integrations')
    ),
    checkboxUtility(
      'send_invitation',
      __('Send Invitation', 'bit-integrations'),
      __('Send an invitation email to the invitees.', 'bit-integrations')
    )
  ],
  create_deal_custom_field: [
    checkboxUtility(
      'is_recurring',
      __('Recurring Date', 'bit-integrations'),
      __('Repeat a date field every year, for example a birthday.', 'bit-integrations')
    ),
    checkboxUtility(
      'hide_if_empty',
      __('Hide If Empty', 'bit-integrations'),
      __('Hide the field on a person when it has no value.', 'bit-integrations')
    ),
    checkboxUtility(
      'read_only',
      __('Read Only', 'bit-integrations'),
      __('Do not allow users to change the field value.', 'bit-integrations')
    )
  ],
  update_deal_custom_field: [
    checkboxUtility(
      'is_recurring',
      __('Recurring Date', 'bit-integrations'),
      __('Repeat a date field every year, for example a birthday.', 'bit-integrations')
    ),
    checkboxUtility(
      'hide_if_empty',
      __('Hide If Empty', 'bit-integrations'),
      __('Hide the field on a person when it has no value.', 'bit-integrations')
    ),
    checkboxUtility(
      'read_only',
      __('Read Only', 'bit-integrations'),
      __('Do not allow users to change the field value.', 'bit-integrations')
    )
  ]
}
