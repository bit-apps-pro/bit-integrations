export const parseTagPickerInput = input => {
  const seen = new Set()
  const out = []
  String(input || '')
    .split(',')
    .map(t => t.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .forEach(name => {
      const key = name.toLowerCase()
      if (seen.has(key)) return
      seen.add(key)
      out.push(name)
    })
  return out
}

export const buildTagPickerOptions = tags => {
  const seen = new Set()
  const opts = []
  tags.forEach(tag => {
    const name = tag?.name?.trim()
    if (!name) return
    const key = name.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    opts.push({ label: name, value: name })
  })
  return opts
}

export const dedupeIds = ids => {
  const seen = new Set()
  const out = []
  ids.forEach(id => {
    const key = String(id)
    if (seen.has(key)) return
    seen.add(key)
    out.push(id)
  })
  return out
}

export const findTagByName = (tags, name) => {
  const target = name.toLowerCase()
  return tags.find(tag => tag.name.trim().toLowerCase() === target)
}

export const filterIntegrationsByTags = (integrations, integrationTags, selectedTags) => {
  if (!selectedTags.length) return integrations
  return integrations.filter(integration => {
    const assigned = integrationTags[String(integration.id)] || []
    return selectedTags.some(tagId => assigned.includes(tagId))
  })
}

export const hasCustomNamesInPicker = (pickerNames, tags) =>
  pickerNames.some(name => !findTagByName(tags, name))
