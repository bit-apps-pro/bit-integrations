import { __ } from '../../../Utils/i18nwrap'

export const modules = [
  {
    name: 'delete_abandoned_cart',
    label: __('Delete Abandoned Cart', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'reschedule_recovery_emails',
    label: __('Reschedule Recovery Emails', 'bit-integrations'),
    is_pro: true
  },
  {
    name: 'update_cart_status',
    label: __('Update Cart Status', 'bit-integrations'),
    is_pro: true
  }
]

export const cartStatusOptions = [
  { label: __('Normal', 'bit-integrations'), value: 'normal' },
  { label: __('Abandoned', 'bit-integrations'), value: 'abandoned' },
  { label: __('Completed', 'bit-integrations'), value: 'completed' },
  { label: __('Lost', 'bit-integrations'), value: 'lost' }
]
