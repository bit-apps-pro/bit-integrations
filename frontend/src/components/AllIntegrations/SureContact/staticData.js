import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  { name: 'add_contacts_to_list', label: __('Add Contacts To List', 'bit-integrations'), is_pro: true },
  { name: 'add_contacts_to_tag', label: __('Add Contacts To Tag', 'bit-integrations'), is_pro: true },
  { name: 'archive_company', label: __('Archive Company', 'bit-integrations'), is_pro: true },
  {
    name: 'attach_companies_to_contact',
    label: __('Attach Companies To Contact', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'attach_companies_to_deal',
    label: __('Attach Companies To Deal', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'attach_companies_to_task',
    label: __('Attach Companies To Task', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'attach_contacts_to_deal',
    label: __('Attach Contacts To Deal', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'attach_contacts_to_task',
    label: __('Attach Contacts To Task', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'attach_lists_to_contact',
    label: __('Attach Lists To Contact', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'attach_tags_to_contact',
    label: __('Attach Tags To Contact', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'bulk_attach_contacts_to_company',
    label: __('Bulk Attach Contacts To Company', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'bulk_delete_campaigns',
    label: __('Bulk Delete Campaigns', 'bit-integrations'),
    is_pro: true
  },
  { name: 'cancel_purchase', label: __('Cancel Purchase', 'bit-integrations'), is_pro: true },
  { name: 'copy_list', label: __('Copy List', 'bit-integrations'), is_pro: true },
  { name: 'create_campaign', label: __('Create Campaign', 'bit-integrations'), is_pro: true },
  { name: 'create_company', label: __('Create Company', 'bit-integrations'), is_pro: true },
  { name: 'create_company_note', label: __('Create Company Note', 'bit-integrations'), is_pro: true },
  { name: 'create_contact', label: __('Create Contact', 'bit-integrations'), is_pro: true },
  {
    name: 'create_contact_activity',
    label: __('Create Contact Activity', 'bit-integrations'),
    is_pro: true
  },
  { name: 'create_contact_note', label: __('Create Contact Note', 'bit-integrations'), is_pro: true },
  { name: 'create_deal', label: __('Create Deal', 'bit-integrations'), is_pro: true },
  { name: 'create_deal_note', label: __('Create Deal Note', 'bit-integrations'), is_pro: true },
  { name: 'create_list', label: __('Create List', 'bit-integrations'), is_pro: true },
  { name: 'create_page', label: __('Create Landing Page', 'bit-integrations'), is_pro: true },
  { name: 'create_pipeline', label: __('Create Pipeline', 'bit-integrations'), is_pro: true },
  { name: 'create_pipeline_stage', label: __('Create Stage', 'bit-integrations'), is_pro: true },
  { name: 'create_purchase', label: __('Create Purchase', 'bit-integrations'), is_pro: true },
  { name: 'create_tag', label: __('Create Tag', 'bit-integrations'), is_pro: true },
  { name: 'create_task', label: __('Create Task', 'bit-integrations'), is_pro: true },
  { name: 'delete_campaign', label: __('Delete Campaign', 'bit-integrations'), is_pro: true },
  { name: 'delete_company', label: __('Delete Company', 'bit-integrations'), is_pro: true },
  { name: 'delete_company_note', label: __('Delete Company Note', 'bit-integrations'), is_pro: true },
  { name: 'delete_contact', label: __('Delete Contact', 'bit-integrations'), is_pro: true },
  { name: 'delete_deal', label: __('Delete Deal', 'bit-integrations'), is_pro: true },
  { name: 'delete_deal_note', label: __('Delete Deal Note', 'bit-integrations'), is_pro: true },
  { name: 'delete_list', label: __('Delete List', 'bit-integrations'), is_pro: true },
  { name: 'delete_note', label: __('Delete Contact Note', 'bit-integrations'), is_pro: true },
  { name: 'delete_page', label: __('Delete Landing Page', 'bit-integrations'), is_pro: true },
  { name: 'delete_pipeline', label: __('Delete Pipeline', 'bit-integrations'), is_pro: true },
  { name: 'delete_pipeline_stage', label: __('Delete Stage', 'bit-integrations'), is_pro: true },
  { name: 'delete_tag', label: __('Delete Tag', 'bit-integrations'), is_pro: true },
  { name: 'delete_task', label: __('Delete Task', 'bit-integrations'), is_pro: true },
  {
    name: 'detach_companies_from_deal',
    label: __('Detach Companies From Deal', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'detach_companies_from_task',
    label: __('Detach Companies From Task', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'detach_contacts_from_deal',
    label: __('Detach Contacts From Deal', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'detach_contacts_from_task',
    label: __('Detach Contacts From Task', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'detach_lists_from_contact',
    label: __('Detach Lists From Contact', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'detach_tags_from_contact',
    label: __('Detach Tags From Contact', 'bit-integrations'),
    is_pro: true
  },
  { name: 'duplicate_campaign', label: __('Duplicate Campaign', 'bit-integrations'), is_pro: true },
  {
    name: 'enroll_contact_in_sequence',
    label: __('Enroll Contact In Sequence', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'link_contact_to_company',
    label: __('Link Contact To Company', 'bit-integrations'),
    is_pro: true
  },
  { name: 'mark_deal_lost', label: __('Mark Deal Lost', 'bit-integrations'), is_pro: true },
  { name: 'mark_deal_won', label: __('Mark Deal Won', 'bit-integrations'), is_pro: true },
  { name: 'mark_task_done', label: __('Mark Task Done', 'bit-integrations'), is_pro: true },
  { name: 'mark_task_undone', label: __('Mark Task Undone', 'bit-integrations'), is_pro: true },
  { name: 'move_deal_to_stage', label: __('Move Deal To Stage', 'bit-integrations'), is_pro: true },
  { name: 'refresh_list', label: __('Refresh Dynamic List', 'bit-integrations'), is_pro: true },
  { name: 'refund_purchase', label: __('Refund Purchase', 'bit-integrations'), is_pro: true },
  {
    name: 'remove_contacts_from_list',
    label: __('Remove Contacts From List', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'remove_contacts_from_tag',
    label: __('Remove Contacts From Tag', 'bit-integrations'),
    is_pro: true
  },
  { name: 'reopen_deal', label: __('Reopen Deal', 'bit-integrations'), is_pro: true },
  { name: 'reorder_pipeline_stages', label: __('Reorder Stages', 'bit-integrations'), is_pro: true },
  { name: 'resend_double_opt_in', label: __('Resend Double Opt-In', 'bit-integrations'), is_pro: true },
  { name: 'send_email', label: __('Send Email', 'bit-integrations'), is_pro: true },
  {
    name: 'set_primary_company',
    label: __("Set Contact's Primary Company", 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'start_automation_for_contact',
    label: __('Start Automation For Contact', 'bit-integrations'),
    is_pro: true
  },
  { name: 'unarchive_company', label: __('Unarchive Company', 'bit-integrations'), is_pro: true },
  {
    name: 'unenroll_contact_from_sequence',
    label: __('Unenroll Contact From Sequence', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'unlink_contact_from_company',
    label: __('Unlink Contact From Company', 'bit-integrations'),
    is_pro: true
  },
  { name: 'update_campaign', label: __('Update Campaign', 'bit-integrations'), is_pro: true },
  { name: 'update_company', label: __('Update Company', 'bit-integrations'), is_pro: true },
  { name: 'update_company_note', label: __('Update Company Note', 'bit-integrations'), is_pro: true },
  { name: 'update_contact', label: __('Update Contact', 'bit-integrations'), is_pro: true },
  {
    name: 'update_contact_status',
    label: __('Update Contact Status', 'bit-integrations'),
    is_pro: true
  },
  { name: 'update_deal', label: __('Update Deal', 'bit-integrations'), is_pro: true },
  { name: 'update_deal_note', label: __('Update Deal Note', 'bit-integrations'), is_pro: true },
  { name: 'update_list', label: __('Update List', 'bit-integrations'), is_pro: true },
  { name: 'update_note', label: __('Update Contact Note', 'bit-integrations'), is_pro: true },
  { name: 'update_page', label: __('Update Landing Page', 'bit-integrations'), is_pro: true },
  { name: 'update_pipeline', label: __('Update Pipeline', 'bit-integrations'), is_pro: true },
  { name: 'update_pipeline_stage', label: __('Update Stage', 'bit-integrations'), is_pro: true },
  { name: 'update_tag', label: __('Update Tag', 'bit-integrations'), is_pro: true },
  { name: 'update_task', label: __('Update Task', 'bit-integrations'), is_pro: true },
  { name: 'upsert_contact', label: __('Create Or Update Contact', 'bit-integrations'), is_pro: true }
]

/**
 * Field map per action. Holds the required identifier of the record the action targets —
 * so it stays mappable from trigger data — plus free text. Fetchable config values are
 * dropdowns instead (see the needs* lists below).
 */
export const fieldsByAction = {
  add_contacts_to_list: [
    { key: 'list_uuid', label: __('List', 'bit-integrations'), required: true },
    {
      key: 'contact_uuids',
      label: __('Contact UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  add_contacts_to_tag: [
    { key: 'tag_uuid', label: __('Tag', 'bit-integrations'), required: true },
    {
      key: 'contact_uuids',
      label: __('Contact UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  archive_company: [{ key: 'company_uuid', label: __('Company', 'bit-integrations'), required: true }],
  attach_companies_to_contact: [
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    },
    { key: 'companies', label: __('Companies', 'bit-integrations'), required: true },
    {
      key: 'company_uuids',
      label: __('Company UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  attach_companies_to_deal: [
    { key: 'deal_uuid', label: __('Deal', 'bit-integrations'), required: true },
    { key: 'companies', label: __('Companies', 'bit-integrations'), required: true },
    {
      key: 'company_uuids',
      label: __('Company UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  attach_companies_to_task: [
    { key: 'task_uuid', label: __('Task', 'bit-integrations'), required: true },
    { key: 'companies', label: __('Companies', 'bit-integrations'), required: true },
    {
      key: 'company_uuids',
      label: __('Company UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  attach_contacts_to_deal: [
    { key: 'deal_uuid', label: __('Deal', 'bit-integrations'), required: true },
    { key: 'contacts', label: __('Contacts', 'bit-integrations'), required: true },
    {
      key: 'contact_uuids',
      label: __('Contact UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  attach_contacts_to_task: [
    { key: 'task_uuid', label: __('Task', 'bit-integrations'), required: true },
    { key: 'contacts', label: __('Contacts', 'bit-integrations'), required: true },
    {
      key: 'contact_uuids',
      label: __('Contact UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  attach_lists_to_contact: [
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    },
    { key: 'list_uuids', label: __('List UUIDs (comma separated)', 'bit-integrations'), required: true }
  ],
  attach_tags_to_contact: [
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    },
    { key: 'tag_uuids', label: __('Tag UUIDs (comma separated)', 'bit-integrations'), required: true }
  ],
  bulk_attach_contacts_to_company: [
    { key: 'company_uuid', label: __('Company', 'bit-integrations'), required: true },
    { key: 'contacts', label: __('Contacts', 'bit-integrations'), required: true },
    {
      key: 'contact_uuids',
      label: __('Contact UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  bulk_delete_campaigns: [
    {
      key: 'campaign_uuids',
      label: __('Campaign UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  cancel_purchase: [{ key: 'purchase_uuid', label: __('Purchase', 'bit-integrations'), required: true }],
  copy_list: [
    { key: 'list_uuid', label: __('List', 'bit-integrations'), required: true },
    { key: 'name', label: __('New List Name', 'bit-integrations'), required: true }
  ],
  create_campaign: [
    { key: 'name', label: __('Campaign Name', 'bit-integrations'), required: true },
    { key: 'subject', label: __('Subject', 'bit-integrations'), required: false },
    { key: 'preview_text', label: __('Preview Text', 'bit-integrations'), required: false },
    { key: 'from_name', label: __('From Name', 'bit-integrations'), required: false },
    { key: 'from_email', label: __('From Email', 'bit-integrations'), required: false },
    { key: 'reply_to', label: __('Reply To', 'bit-integrations'), required: false },
    { key: 'html_content', label: __('HTML Content', 'bit-integrations'), required: false },
    { key: 'text_content', label: __('Text Content', 'bit-integrations'), required: false },
    { key: 'filters', label: __('Recipient Filters (JSON)', 'bit-integrations'), required: false }
  ],
  create_company: [
    { key: 'name', label: __('Company Name', 'bit-integrations'), required: true },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'logo_url', label: __('Logo URL', 'bit-integrations'), required: false },
    { key: 'industry', label: __('Industry', 'bit-integrations'), required: false },
    { key: 'linkedin_url', label: __('LinkedIn URL', 'bit-integrations'), required: false },
    { key: 'facebook_url', label: __('Facebook URL', 'bit-integrations'), required: false },
    { key: 'twitter_handle', label: __('Twitter Handle', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'year_founded', label: __('Year Founded', 'bit-integrations'), required: false },
    { key: 'street', label: __('Street', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'postal_code', label: __('Postal Code', 'bit-integrations'), required: false }
  ],
  create_company_note: [
    { key: 'company_uuid', label: __('Company', 'bit-integrations'), required: true },
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'content', label: __('Content', 'bit-integrations'), required: false },
    { key: 'type', label: __('Type', 'bit-integrations'), required: false }
  ],
  create_contact: [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'company', label: __('Company', 'bit-integrations'), required: false },
    { key: 'job_title', label: __('Job Title', 'bit-integrations'), required: false },
    { key: 'birthdate', label: __('Birthdate', 'bit-integrations'), required: false },
    { key: 'anniversary', label: __('Anniversary', 'bit-integrations'), required: false },
    { key: 'prefix', label: __('Prefix', 'bit-integrations'), required: false },
    { key: 'suffix', label: __('Suffix', 'bit-integrations'), required: false },
    { key: 'timezone', label: __('Timezone', 'bit-integrations'), required: false },
    { key: 'language', label: __('Language', 'bit-integrations'), required: false }
  ],
  create_contact_activity: [
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false }
  ],
  create_contact_note: [
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    },
    { key: 'content', label: __('Content', 'bit-integrations'), required: true }
  ],
  create_deal: [
    { key: 'name', label: __('Deal Name', 'bit-integrations'), required: true },
    { key: 'value', label: __('Value', 'bit-integrations'), required: false },
    { key: 'currency', label: __('Currency', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'expected_close_date', label: __('Expected Close Date', 'bit-integrations'), required: false }
  ],
  create_deal_note: [
    { key: 'deal_uuid', label: __('Deal', 'bit-integrations'), required: true },
    { key: 'content', label: __('Content', 'bit-integrations'), required: true }
  ],
  create_list: [
    { key: 'name', label: __('List Name', 'bit-integrations'), required: true },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false }
  ],
  create_page: [
    { key: 'name', label: __('Page Name', 'bit-integrations'), required: true },
    { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
    { key: 'status', label: __('Status', 'bit-integrations'), required: false },
    { key: 'design_json', label: __('Design JSON', 'bit-integrations'), required: false }
  ],
  create_pipeline: [{ key: 'name', label: __('Pipeline Name', 'bit-integrations'), required: true }],
  create_pipeline_stage: [
    { key: 'pipeline_uuid', label: __('Pipeline', 'bit-integrations'), required: true },
    { key: 'name', label: __('Stage Name', 'bit-integrations'), required: true },
    { key: 'probability', label: __('Probability', 'bit-integrations'), required: false },
    { key: 'color', label: __('Color', 'bit-integrations'), required: false }
  ],
  create_purchase: [
    { key: 'order_id', label: __('Order ID', 'bit-integrations'), required: true },
    { key: 'total_amount', label: __('Total Amount', 'bit-integrations'), required: true },
    { key: 'currency', label: __('Currency', 'bit-integrations'), required: false },
    { key: 'products', label: __('Products (JSON array)', 'bit-integrations'), required: false },
    { key: 'contact_uuid', label: __('Contact', 'bit-integrations'), required: false },
    { key: 'contact_email', label: __('Contact Email', 'bit-integrations'), required: false },
    { key: 'purchased_at', label: __('Purchased At', 'bit-integrations'), required: false },
    { key: 'coupon_code', label: __('Coupon Code', 'bit-integrations'), required: false },
    { key: 'shipping_amount', label: __('Shipping Amount', 'bit-integrations'), required: false }
  ],
  create_tag: [{ key: 'name', label: __('Tag Name', 'bit-integrations'), required: true }],
  create_task: [
    {
      key: 'contact_uuids',
      label: __('Contact UUIDs (comma separated, links the task)', 'bit-integrations'),
      required: true
    },
    { key: 'title', label: __('Title', 'bit-integrations'), required: true },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'due_date', label: __('Due Date', 'bit-integrations'), required: false },
    { key: 'priority', label: __('Priority', 'bit-integrations'), required: false },
    { key: 'assignee_uuid', label: __('Assignee UUID', 'bit-integrations'), required: false }
  ],
  delete_campaign: [{ key: 'campaign_uuid', label: __('Campaign', 'bit-integrations'), required: true }],
  delete_company: [{ key: 'company_uuid', label: __('Company', 'bit-integrations'), required: true }],
  delete_company_note: [
    { key: 'company_note_uuid', label: __('Company Note UUID', 'bit-integrations'), required: true }
  ],
  delete_contact: [
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    }
  ],
  delete_deal: [{ key: 'deal_uuid', label: __('Deal', 'bit-integrations'), required: true }],
  delete_deal_note: [
    { key: 'deal_note_uuid', label: __('Deal Note UUID', 'bit-integrations'), required: true }
  ],
  delete_list: [{ key: 'list_uuid', label: __('List', 'bit-integrations'), required: true }],
  delete_note: [{ key: 'note_uuid', label: __('Note UUID', 'bit-integrations'), required: true }],
  delete_page: [{ key: 'page_uuid', label: __('Landing Page', 'bit-integrations'), required: true }],
  delete_pipeline: [{ key: 'pipeline_uuid', label: __('Pipeline', 'bit-integrations'), required: true }],
  delete_pipeline_stage: [
    { key: 'pipeline_uuid', label: __('Pipeline', 'bit-integrations'), required: true },
    { key: 'stage_uuid', label: __('Stage', 'bit-integrations'), required: true }
  ],
  delete_tag: [{ key: 'tag_uuid', label: __('Tag', 'bit-integrations'), required: true }],
  delete_task: [{ key: 'task_uuid', label: __('Task', 'bit-integrations'), required: true }],
  detach_companies_from_deal: [
    { key: 'deal_uuid', label: __('Deal', 'bit-integrations'), required: true },
    { key: 'companies', label: __('Companies', 'bit-integrations'), required: true },
    {
      key: 'company_uuids',
      label: __('Company UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  detach_companies_from_task: [
    { key: 'task_uuid', label: __('Task', 'bit-integrations'), required: true },
    { key: 'companies', label: __('Companies', 'bit-integrations'), required: true },
    {
      key: 'company_uuids',
      label: __('Company UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  detach_contacts_from_deal: [
    { key: 'deal_uuid', label: __('Deal', 'bit-integrations'), required: true },
    { key: 'contacts', label: __('Contacts', 'bit-integrations'), required: true },
    {
      key: 'contact_uuids',
      label: __('Contact UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  detach_contacts_from_task: [
    { key: 'task_uuid', label: __('Task', 'bit-integrations'), required: true },
    { key: 'contacts', label: __('Contacts', 'bit-integrations'), required: true },
    {
      key: 'contact_uuids',
      label: __('Contact UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  detach_lists_from_contact: [
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    },
    { key: 'list_uuids', label: __('List UUIDs (comma separated)', 'bit-integrations'), required: true }
  ],
  detach_tags_from_contact: [
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    },
    { key: 'tag_uuids', label: __('Tag UUIDs (comma separated)', 'bit-integrations'), required: true }
  ],
  duplicate_campaign: [
    { key: 'campaign_uuid', label: __('Campaign', 'bit-integrations'), required: true }
  ],
  enroll_contact_in_sequence: [
    { key: 'automation_uuid', label: __('Sequence', 'bit-integrations'), required: true },
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    }
  ],
  link_contact_to_company: [
    { key: 'company_uuid', label: __('Company', 'bit-integrations'), required: true },
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    }
  ],
  mark_deal_lost: [{ key: 'deal_uuid', label: __('Deal', 'bit-integrations'), required: true }],
  mark_deal_won: [{ key: 'deal_uuid', label: __('Deal', 'bit-integrations'), required: true }],
  mark_task_done: [{ key: 'task_uuid', label: __('Task', 'bit-integrations'), required: true }],
  mark_task_undone: [{ key: 'task_uuid', label: __('Task', 'bit-integrations'), required: true }],
  move_deal_to_stage: [
    { key: 'deal_uuid', label: __('Deal', 'bit-integrations'), required: true },
    { key: 'stage_uuid', label: __('Stage', 'bit-integrations'), required: true }
  ],
  refresh_list: [{ key: 'list_uuid', label: __('List', 'bit-integrations'), required: true }],
  refund_purchase: [{ key: 'purchase_uuid', label: __('Purchase', 'bit-integrations'), required: true }],
  remove_contacts_from_list: [
    { key: 'list_uuid', label: __('List', 'bit-integrations'), required: true },
    {
      key: 'contact_uuids',
      label: __('Contact UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  remove_contacts_from_tag: [
    { key: 'tag_uuid', label: __('Tag', 'bit-integrations'), required: true },
    {
      key: 'contact_uuids',
      label: __('Contact UUIDs (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  reopen_deal: [{ key: 'deal_uuid', label: __('Deal', 'bit-integrations'), required: true }],
  reorder_pipeline_stages: [
    { key: 'pipeline_uuid', label: __('Pipeline', 'bit-integrations'), required: true },
    {
      key: 'stages',
      label: __('Stage UUIDs in order (comma separated)', 'bit-integrations'),
      required: true
    }
  ],
  resend_double_opt_in: [
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    }
  ],
  send_email: [
    { key: 'to', label: __('To', 'bit-integrations'), required: true },
    { key: 'subject', label: __('Subject', 'bit-integrations'), required: true },
    { key: 'html', label: __('HTML Body', 'bit-integrations'), required: true },
    { key: 'text', label: __('Text Body', 'bit-integrations'), required: false },
    { key: 'from_name', label: __('From Name', 'bit-integrations'), required: false },
    { key: 'from_email', label: __('From Email', 'bit-integrations'), required: false },
    { key: 'reply_to', label: __('Reply To', 'bit-integrations'), required: false }
  ],
  set_primary_company: [
    { key: 'company_uuid', label: __('Company', 'bit-integrations'), required: true },
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    }
  ],
  start_automation_for_contact: [
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    },
    { key: 'automation_uuid', label: __('Automation', 'bit-integrations'), required: true }
  ],
  unarchive_company: [{ key: 'company_uuid', label: __('Company', 'bit-integrations'), required: true }],
  unenroll_contact_from_sequence: [
    { key: 'automation_uuid', label: __('Sequence', 'bit-integrations'), required: true },
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    }
  ],
  unlink_contact_from_company: [
    { key: 'company_uuid', label: __('Company', 'bit-integrations'), required: true },
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    }
  ],
  update_campaign: [
    { key: 'campaign_uuid', label: __('Campaign', 'bit-integrations'), required: true },
    { key: 'name', label: __('Campaign Name', 'bit-integrations'), required: false },
    { key: 'subject', label: __('Subject', 'bit-integrations'), required: false },
    { key: 'preview_text', label: __('Preview Text', 'bit-integrations'), required: false },
    { key: 'from_name', label: __('From Name', 'bit-integrations'), required: false },
    { key: 'from_email', label: __('From Email', 'bit-integrations'), required: false },
    { key: 'reply_to', label: __('Reply To', 'bit-integrations'), required: false },
    { key: 'html_content', label: __('HTML Content', 'bit-integrations'), required: false },
    { key: 'text_content', label: __('Text Content', 'bit-integrations'), required: false },
    { key: 'filters', label: __('Recipient Filters (JSON)', 'bit-integrations'), required: false }
  ],
  update_company: [
    { key: 'company_uuid', label: __('Company', 'bit-integrations'), required: true },
    { key: 'name', label: __('Company Name', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'website', label: __('Website', 'bit-integrations'), required: false },
    { key: 'logo_url', label: __('Logo URL', 'bit-integrations'), required: false },
    { key: 'industry', label: __('Industry', 'bit-integrations'), required: false },
    { key: 'linkedin_url', label: __('LinkedIn URL', 'bit-integrations'), required: false },
    { key: 'facebook_url', label: __('Facebook URL', 'bit-integrations'), required: false },
    { key: 'twitter_handle', label: __('Twitter Handle', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'year_founded', label: __('Year Founded', 'bit-integrations'), required: false },
    { key: 'street', label: __('Street', 'bit-integrations'), required: false },
    { key: 'city', label: __('City', 'bit-integrations'), required: false },
    { key: 'state', label: __('State', 'bit-integrations'), required: false },
    { key: 'country', label: __('Country', 'bit-integrations'), required: false },
    { key: 'postal_code', label: __('Postal Code', 'bit-integrations'), required: false }
  ],
  update_company_note: [
    { key: 'company_note_uuid', label: __('Company Note UUID', 'bit-integrations'), required: true },
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'content', label: __('Content', 'bit-integrations'), required: false },
    { key: 'type', label: __('Type', 'bit-integrations'), required: false }
  ],
  update_contact: [
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    },
    { key: 'email', label: __('Email', 'bit-integrations'), required: false },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'company', label: __('Company', 'bit-integrations'), required: false },
    { key: 'job_title', label: __('Job Title', 'bit-integrations'), required: false },
    { key: 'birthdate', label: __('Birthdate', 'bit-integrations'), required: false },
    { key: 'anniversary', label: __('Anniversary', 'bit-integrations'), required: false },
    { key: 'prefix', label: __('Prefix', 'bit-integrations'), required: false },
    { key: 'suffix', label: __('Suffix', 'bit-integrations'), required: false },
    { key: 'timezone', label: __('Timezone', 'bit-integrations'), required: false },
    { key: 'language', label: __('Language', 'bit-integrations'), required: false }
  ],
  update_contact_status: [
    {
      key: 'contact_email',
      label: __('Contact Email (identifies the contact)', 'bit-integrations'),
      required: true
    },
    {
      key: 'contact_uuid',
      label: __('Contact UUID (optional, overrides email)', 'bit-integrations'),
      required: false
    }
  ],
  update_deal: [
    { key: 'deal_uuid', label: __('Deal', 'bit-integrations'), required: true },
    { key: 'name', label: __('Deal Name', 'bit-integrations'), required: false },
    { key: 'pipeline_uuid', label: __('Pipeline', 'bit-integrations'), required: false },
    { key: 'stage_uuid', label: __('Stage', 'bit-integrations'), required: false },
    { key: 'value', label: __('Value', 'bit-integrations'), required: false },
    { key: 'currency', label: __('Currency', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'expected_close_date', label: __('Expected Close Date', 'bit-integrations'), required: false }
  ],
  update_deal_note: [
    { key: 'deal_note_uuid', label: __('Deal Note UUID', 'bit-integrations'), required: true },
    { key: 'content', label: __('Content', 'bit-integrations'), required: true }
  ],
  update_list: [
    { key: 'list_uuid', label: __('List', 'bit-integrations'), required: true },
    { key: 'name', label: __('List Name', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false }
  ],
  update_note: [
    { key: 'note_uuid', label: __('Note UUID', 'bit-integrations'), required: true },
    { key: 'content', label: __('Content', 'bit-integrations'), required: true }
  ],
  update_page: [
    { key: 'page_uuid', label: __('Landing Page', 'bit-integrations'), required: true },
    { key: 'name', label: __('Page Name', 'bit-integrations'), required: false },
    { key: 'slug', label: __('Slug', 'bit-integrations'), required: false },
    { key: 'status', label: __('Status', 'bit-integrations'), required: false },
    { key: 'design_json', label: __('Design JSON', 'bit-integrations'), required: false }
  ],
  update_pipeline: [
    { key: 'pipeline_uuid', label: __('Pipeline', 'bit-integrations'), required: true },
    { key: 'name', label: __('Pipeline Name', 'bit-integrations'), required: false }
  ],
  update_pipeline_stage: [
    { key: 'pipeline_uuid', label: __('Pipeline', 'bit-integrations'), required: true },
    { key: 'stage_uuid', label: __('Stage', 'bit-integrations'), required: true },
    { key: 'name', label: __('Stage Name', 'bit-integrations'), required: false },
    { key: 'probability', label: __('Probability', 'bit-integrations'), required: false },
    { key: 'color', label: __('Color', 'bit-integrations'), required: false }
  ],
  update_tag: [
    { key: 'tag_uuid', label: __('Tag', 'bit-integrations'), required: true },
    { key: 'name', label: __('Tag Name', 'bit-integrations'), required: true }
  ],
  update_task: [
    { key: 'task_uuid', label: __('Task', 'bit-integrations'), required: true },
    { key: 'title', label: __('Title', 'bit-integrations'), required: false },
    { key: 'description', label: __('Description', 'bit-integrations'), required: false },
    { key: 'due_date', label: __('Due Date', 'bit-integrations'), required: false },
    { key: 'priority', label: __('Priority', 'bit-integrations'), required: false },
    { key: 'assignee_uuid', label: __('Assignee UUID', 'bit-integrations'), required: false }
  ],
  upsert_contact: [
    { key: 'email', label: __('Email', 'bit-integrations'), required: true },
    { key: 'first_name', label: __('First Name', 'bit-integrations'), required: false },
    { key: 'last_name', label: __('Last Name', 'bit-integrations'), required: false },
    { key: 'phone', label: __('Phone', 'bit-integrations'), required: false },
    { key: 'company', label: __('Company', 'bit-integrations'), required: false },
    { key: 'job_title', label: __('Job Title', 'bit-integrations'), required: false },
    { key: 'birthdate', label: __('Birthdate', 'bit-integrations'), required: false },
    { key: 'anniversary', label: __('Anniversary', 'bit-integrations'), required: false },
    { key: 'prefix', label: __('Prefix', 'bit-integrations'), required: false },
    { key: 'suffix', label: __('Suffix', 'bit-integrations'), required: false },
    { key: 'timezone', label: __('Timezone', 'bit-integrations'), required: false },
    { key: 'language', label: __('Language', 'bit-integrations'), required: false }
  ]
}

// Fetchable config choices, not target identifiers — rendered as dropdowns.
export const needsList = ['create_contact', 'upsert_contact']
export const needsTag = ['create_contact', 'upsert_contact']
export const needsPipeline = ['create_deal']
export const needsStage = ['create_deal']

// Fixed option sets — rendered as selects, never mapped (skill Rule 16).
export const genderOptions = [
  { label: __('Male', 'bit-integrations'), value: 'male' },
  { label: __('Female', 'bit-integrations'), value: 'female' },
  { label: __('Other', 'bit-integrations'), value: 'other' },
  { label: __('Prefer Not To Say', 'bit-integrations'), value: 'prefer_not_to_say' }
]

export const companyTypeOptions = [
  { label: __('Prospect', 'bit-integrations'), value: 'prospect' },
  { label: __('Customer', 'bit-integrations'), value: 'customer' },
  { label: __('Partner', 'bit-integrations'), value: 'partner' },
  { label: __('Reseller', 'bit-integrations'), value: 'reseller' },
  { label: __('Vendor', 'bit-integrations'), value: 'vendor' },
  { label: __('Other', 'bit-integrations'), value: 'other' }
]

export const employeeRangeOptions = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5001-10000',
  '10001+'
].map(range => ({ label: range, value: range }))

export const needsGender = ['create_contact', 'upsert_contact', 'update_contact']
export const needsCompanyType = ['create_company', 'update_company']

// Actions that render the Utilities section.
export const hasUtilities = [...new Set([...needsGender, ...needsCompanyType])]

// Verified against the API: PATCH /contacts/{uuid}/status rejects anything else.
export const contactStatusOptions = [
  { label: __('Active', 'bit-integrations'), value: 'active' },
  { label: __('Unsubscribed', 'bit-integrations'), value: 'unsubscribed' },
  { label: __('Bounced', 'bit-integrations'), value: 'bounced' },
  { label: __('Invalid', 'bit-integrations'), value: 'invalid' },
  { label: __('Complained', 'bit-integrations'), value: 'complained' }
]

// The activity feed uses the platform's own event vocabulary; anything else is
// rejected with "Invalid activity type".
export const activityTypeOptions = [
  'contact_created',
  'contact_updated',
  'tag_added',
  'tag_removed',
  'list_added',
  'list_removed',
  'email_sent',
  'email_opened',
  'email_clicked',
  'note_added',
  'note_updated',
  'purchase_cancelled',
  'purchase_refunded',
  'deal_created',
  'deal_won',
  'deal_lost',
  'task_created',
  'form_submitted'
].map(value => ({ label: value.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase()), value }))

export const needsContactStatus = ['update_contact_status']
export const needsActivityType = ['create_contact_activity']
