
export const resolveTemplate = (template, data) => {
  if (!template) return ''
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = data[key]
    if (val == null) return ''
    return typeof val === 'string' ? val.replace(/\/+$/, '') : String(val)
  })
}

export const normalizeAdditionalHeaders = headers => {
  if (!headers || typeof headers !== 'object') {
    return {}
  }

  return Object.entries(headers).reduce((acc, [key, value]) => {
    const normalizedKey = String(key || '').trim()
    const normalizedValue = value == null ? '' : String(value).trim()

    if (normalizedKey && normalizedValue) {
      acc[normalizedKey] = normalizedValue
    }

    return acc
  }, {})
}

export const resolveHeaderTemplates = (headers, data) => {
  if (!headers || typeof headers !== 'object') {
    return {}
  }

  return Object.entries(headers).reduce((acc, [key, value]) => {
    acc[key] = typeof value === 'string' ? resolveTemplate(value, data) : value
    return acc
  }, {})
}

export const resolvePayloadTemplates = (payload, data) => {
  if (Array.isArray(payload)) {
    return payload.map(item => resolvePayloadTemplates(item, data))
  }

  if (payload && typeof payload === 'object') {
    return Object.entries(payload).reduce((acc, [key, value]) => {
      acc[key] = resolvePayloadTemplates(value, data)
      return acc
    }, {})
  }

  if (typeof payload === 'string') {
    return resolveTemplate(payload, data)
  }

  return payload
}

export const resolveConfigValue = (value, data) => {
  if (typeof value === 'function') {
    return value(data)
  }

  return value
}
