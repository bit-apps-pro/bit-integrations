import { __ } from '../i18nwrap'

const hooklist = [
  // { label: 'Bit Form', value: 'bitform_submit_success', logo: 'Bit Form' },
  { label: 'Brizy', value: 'brizy_form_submit_data', logo: 'Brizy' },
  { label: 'Divi', value: 'et_pb_contact_form_submit', logo: 'Divi' },
  {
    label: 'Kadence Blocks Form',
    value: 'kadence_blocks_form_submission',
    logo: 'Kadence Blocks Form'
  },
  {
    label: 'Kadence Advance Blocks Form',
    value: 'kadence_blocks_advanced_form_submission',
    logo: 'Kadence Blocks Form'
  },
  // { label: 'Forminator', value: 'forminator_custom_form_submit_before_set_fields', logo: 'Forminator' },
  // { label: 'Fluent CRM (Add Contact)', value: 'fluentcrm_contact_created', logo: 'Fluent CRM' },
  // { label: 'Fluent CRM (Contact added to lists)', value: 'fluentcrm_contact_added_to_lists', logo: 'Fluent CRM' },
  // { label: 'Fluent CRM (Contact removed from lists)', value: 'fluentcrm_contact_removed_from_lists', logo: 'Fluent CRM' },
  { label: __('Custom Hook', 'bit-integrations'), value: 'custom', logo: '' }
]

export default hooklist
