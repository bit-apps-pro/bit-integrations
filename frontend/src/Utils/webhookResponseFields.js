import { __, sprintf } from './i18nwrap'

const SEPARATOR = ' › '
const MAX_SAMPLE_LENGTH = 30
const HEADERS_GROUP = '__headers'
const OTHER_GROUP = '__other'

const isObject = value => value !== null && typeof value === 'object'

const isScalarList = value => Array.isArray(value) && value.every(item => !isObject(item))

const humanize = key =>
  String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map(word => (word.toLowerCase() === 'id' ? 'ID' : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')

const truncate = text =>
  text.length > MAX_SAMPLE_LENGTH ? `${text.slice(0, MAX_SAMPLE_LENGTH)}…` : text

const sampleOf = value => {
  if (value === null || value === undefined || value === '') return ''
  if (isScalarList(value)) return truncate(value.join(', '))
  if (!isObject(value)) return truncate(String(value))

  const count = Array.isArray(value) ? value.length : Object.keys(value).length
  if (Array.isArray(value)) {
    if (count === 1) return __('1 item', 'bit-integrations')
    // translators: %s: number of items in a list
    return sprintf(__('%s items', 'bit-integrations'), count)
  }
  if (count === 1) return __('1 field', 'bit-integrations')
  // translators: %s: number of fields in a group
  return sprintf(__('%s fields', 'bit-integrations'), count)
}

const childKeysOf = (name, value, payload) =>
  isObject(value)
    ? Object.keys(value)
        .map(key => ({ key, name: `${name}_${key}` }))
        .filter(child => child.name in payload)
    : []

const labelledNode = (value, payload, name) =>
  isObject(value) &&
  !Array.isArray(value) &&
  typeof value.label === 'string' &&
  value.label !== '' &&
  typeof value.type === 'string' &&
  'value' in value &&
  `${name}_value` in payload

const duplicateLabels = (children, payload) => {
  const counts = new Map()
  children.forEach(child => {
    const value = payload[child.name]
    if (labelledNode(value, payload, child.name)) {
      counts.set(value.label, (counts.get(value.label) || 0) + 1)
    }
  })
  return new Set([...counts].filter(([, count]) => count > 1).map(([label]) => label))
}

const childPathOf = (child, value, ownPath, isLabelled) => {
  if (isLabelled && child.key === 'value') return ownPath
  if (Array.isArray(value)) {
    const last = ownPath[ownPath.length - 1]
    return [...ownPath.slice(0, -1), `${last} #${Number(child.key) + 1}`]
  }
  return [...ownPath, humanize(child.key)]
}

const childTitleOf = (child, value, title) =>
  Array.isArray(value) ? `${title} #${Number(child.key) + 1}` : humanize(child.key)

const buildNode = (name, path, title, payload, claimed, labelSuffix = '') => {
  const value = payload[name]
  const isLabelled = labelledNode(value, payload, name)
  const ownLabel = isLabelled ? `${value.label}${labelSuffix}` : null
  const ownPath = isLabelled ? [ownLabel] : path
  const ownTitle = isLabelled ? ownLabel : title
  const children = childKeysOf(name, value, payload).filter(child => !claimed.has(child.name))
  const duplicates = duplicateLabels(children, payload)

  children.forEach(child => claimed.add(child.name))

  return {
    name,
    value,
    path: ownPath,
    title: ownTitle,
    children: children.map(child =>
      buildNode(
        child.name,
        childPathOf(child, value, ownPath, isLabelled),
        childTitleOf(child, value, ownTitle),
        payload,
        claimed,
        duplicates.has(payload[child.name]?.label) ? ` (${humanize(child.key)})` : ''
      )
    )
  }
}

const buildTree = payload => {
  const visited = new Set()
  Object.keys(payload).forEach(name => {
    childKeysOf(name, payload[name], payload).forEach(child => visited.add(child.name))
  })

  const roots = Object.keys(payload).filter(name => !visited.has(name))
  const body = []
  const headers = []

  const claimed = new Set(roots)

  roots.forEach(name => {
    const value = payload[name]
    const node = buildNode(name, [humanize(name)], humanize(name), payload, claimed)
    const isHeader = isScalarList(value) && value.length > 0 && node.children.length === 0
    if (isHeader) {
      headers.push({ ...node, path: [__('Request', 'bit-integrations'), humanize(name)] })
    } else {
      body.push(node)
    }
  })

  return { body, headers }
}

const flattenNodes = (nodes, depth, group, out) => {
  nodes.forEach(node => {
    out.push({ node, depth, group })
    flattenNodes(node.children, depth + 1, group, out)
  })
  return out
}

const fieldLabel = (path, value) => {
  const label = path.filter(Boolean).join(SEPARATOR)
  const sample = sampleOf(value)
  return sample ? `${label} (${sample})` : label
}

const orderedEntries = payload => {
  const { body, headers } = buildTree(payload)
  return [...flattenNodes(body, 0, null, []), ...flattenNodes(headers, 1, HEADERS_GROUP, [])]
}

export function organizeWebhookFields(fields, payload) {
  if (!Array.isArray(fields) || !isObject(payload) || Array.isArray(payload)) return fields

  const byName = new Map(fields.map(field => [field.name, field]))
  const organized = []

  orderedEntries(payload).forEach(({ node }) => {
    const field = byName.get(node.name)
    if (!field) return
    organized.push({ ...field, label: fieldLabel(node.path, node.value) })
    byName.delete(node.name)
  })

  byName.forEach(field => {
    organized.push({ ...field, label: fieldLabel([humanize(field.name)], payload[field.name]) })
  })

  return organized
}

export function webhookResponseRows(fields, payload) {
  if (!Array.isArray(fields) || !isObject(payload) || Array.isArray(payload)) return null

  const indexByName = new Map(fields.map((field, index) => [field.name, index]))
  const rows = []
  let headersShown = false

  orderedEntries(payload).forEach(({ node, depth, group }) => {
    if (group === HEADERS_GROUP && !headersShown) {
      rows.push({
        kind: 'group',
        key: HEADERS_GROUP,
        label: __('Request', 'bit-integrations'),
        depth: 0
      })
      headersShown = true
    }

    const index = indexByName.get(node.name)
    const { title } = node

    if (node.children.length > 0) {
      rows.push({
        kind: 'group',
        key: node.name,
        label: title,
        depth,
        index,
        sample: sampleOf(node.value)
      })
    } else if (index !== undefined) {
      rows.push({
        kind: 'field',
        key: node.name,
        label: title,
        depth,
        index,
        sample: sampleOf(node.value)
      })
    }
    indexByName.delete(node.name)
  })

  if (indexByName.size > 0) {
    rows.push({ kind: 'group', key: OTHER_GROUP, label: __('Other', 'bit-integrations'), depth: 0 })
    indexByName.forEach((index, name) => {
      rows.push({
        kind: 'field',
        key: name,
        label: humanize(name),
        depth: 1,
        index,
        sample: sampleOf(payload[name])
      })
    })
  }

  return rows
}
