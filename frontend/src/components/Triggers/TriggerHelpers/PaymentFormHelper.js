import { __, sprintf } from '../../../Utils/i18nwrap'

const PAYLOAD_KEY = /^(id|event|occurredAt|(form|submission|payment|subscription)_.+)$/
const SUBMISSION_FIELD = /^submission_fields_(field-\d+)_value(?:_(.+))?$/
const SUBMISSION_FIELD_META = /^submission_fields_field-\d+_(label|type)$/
const ORDER_FIELD = /^submission_orders_(\d+)_(variants_)?(.+)$/
const MAX_SAMPLE_LENGTH = 30

const humanize = key =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map(word => (word.toLowerCase() === 'id' ? 'ID' : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')

const isMappable = (name, value) =>
  PAYLOAD_KEY.test(name) &&
  !SUBMISSION_FIELD_META.test(name) &&
  (value === null || typeof value !== 'object')

const fieldLabel = (name, payload) => {
  if (name === 'id') return __('Delivery ID', 'bit-integrations')

  const submissionField = name.match(SUBMISSION_FIELD)
  if (submissionField) {
    const [, fieldKey, part] = submissionField
    const label = payload[`submission_fields_${fieldKey}_label`] || humanize(fieldKey)
    return part ? `${label} - ${humanize(part)}` : label
  }

  const orderField = name.match(ORDER_FIELD)
  if (orderField) {
    const [, index, variant, part] = orderField
    if (variant) {
      // translators: 1: order line number, 2: product variant name
      return sprintf(__('Order %1$s Variant - %2$s', 'bit-integrations'), Number(index) + 1, part)
    }
    // translators: 1: order line number, 2: order line property
    return sprintf(__('Order %1$s - %2$s', 'bit-integrations'), Number(index) + 1, humanize(part))
  }

  return humanize(name)
}

const withSample = (label, value) => {
  if (value === null || value === undefined || value === '') return label

  const sample = String(value)
  return `${label} (${sample.length > MAX_SAMPLE_LENGTH ? `${sample.slice(0, MAX_SAMPLE_LENGTH)}…` : sample})`
}

export default function paymentFormWebhookFields(payload) {
  return Object.entries(payload || {})
    .filter(([name, value]) => isMappable(name, value))
    .map(([name, value]) => ({
      name,
      label: withSample(fieldLabel(name, payload), value),
      type: 'text'
    }))
}
