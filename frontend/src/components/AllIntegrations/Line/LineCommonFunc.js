import { __ } from '../../../Utils/i18nwrap'

export const handleInput = (e, lineConf, setLineConf) => {
  const { name, value } = e.target
  setLineConf(prev => ({ ...prev, [name]: value }))
}

const updateFieldMap = (prevConf, type, index, updater) => {
  const newConf = { ...prevConf }

  if (!Array.isArray(newConf[type])) newConf[type] = []

  if (!newConf[type][index]) newConf[type][index] = {}
  newConf[type][index] = { ...newConf[type][index], ...updater(newConf[type][index]) }
  return newConf
}

export const handleFieldMapping = (event, index, setConf, type) => {
  const updateFunction = () => ({
    [event.target.name]: event.target.value,
    ...(event.target.value === 'custom' ? { customValue: '' } : { customValue: undefined })
  })

  setConf(prev => updateFieldMap(prev, type, index, updateFunction))
}

export const handleCustomValue = (event, index, _, setConf, type) => {
  const value = event?.target?.value ?? event
  setConf(prev => updateFieldMap(prev, type, index, () => ({ customValue: value })))
}

export const delFieldMap = (index, _, setConf, type) => {
  setConf(prev => {
    const fieldMap = prev[type] || []

    if (fieldMap.length <= 1) return prev

    const updatedFieldMap = fieldMap[index]?.groupId
      ? fieldMap.filter(f => f.groupId !== fieldMap[index].groupId)
      : fieldMap.filter((_, i) => i !== index)

    return { ...prev, [type]: updatedFieldMap }
  })
}

const FIELD_CATEGORIES = {
  sticker: ['sticker_id', 'package_id'],
  image: ['originalContentUrl', 'previewImageUrl'],
  audio: ['originalContentUrl', 'duration'],
  video: ['originalContentUrl', 'previewImageUrl'],
  location: ['title', 'address', 'latitude', 'longitude'],
  emoji: ['emojis_id', 'product_id', 'index']
}

const getFieldCategory = lineFormField => {
  for (const [type, fields] of Object.entries(FIELD_CATEGORIES)) {
    if (fields.includes(lineFormField)) {
      return type
    }
  }
  return 'default'
}

const generateGroupId = (fieldType, existingFieldMap) => {
  if (fieldType === 'audio') {
    const existingAudioGroups = [
      ...new Set(
        existingFieldMap.filter(field => field.fieldType === 'audio').map(field => field.groupId)
      )
    ]
    return `audio_${existingAudioGroups.length + 1}`
  }
  const existingGroups = [
    ...new Set(
      existingFieldMap
        .filter(field => getFieldCategory(field.lineFormField) === fieldType)
        .map(field => field.groupId)
    )
  ]
  return `${fieldType}_${existingGroups.length + 1}`
}

export const addFieldMap = (i, confTmp, setConf, FieldMappings, mapKey) => {
  setConf(prev => {
    const newConf = { ...prev }
    if (!Array.isArray(newConf[mapKey])) newConf[mapKey] = []
    if (mapKey === 'audio_field_map') {
      const fieldType = 'audio'
      const groupId = generateGroupId('audio', newConf[mapKey])
      const newFieldMap = FieldMappings.map(field => ({
        formField: '',
        lineFormField: field.value,
        groupId,
        fieldType: 'audio'
      }))
      newConf[mapKey].splice(i, 0, ...newFieldMap)
      return newConf
    }
    let fieldType = getFieldCategory(FieldMappings[0].value)
    let groupId = generateGroupId(fieldType, newConf[mapKey])
    const newFieldMap = FieldMappings.map(field => ({
      formField: '',
      lineFormField: field.value,
      groupId,
      fieldType
    }))
    newConf[mapKey].splice(i, 0, ...newFieldMap)
    return newConf
  })
}

const isFieldMapConfigured = fieldMap =>
  Array.isArray(fieldMap) &&
  fieldMap.length > 0 &&
  fieldMap.every(f => f && (f.formField !== 'custom' ? f.formField?.trim() : f.customValue?.trim()))

const isMessageFieldConfigured = lineConf =>
  lineConf.message_field_map?.[0] &&
  (lineConf.message_field_map[0].formField !== 'custom'
    ? lineConf.message_field_map[0].formField?.trim()
    : lineConf.message_field_map[0].customValue?.trim())

export const validateLineConfiguration = lineConf => {
  let baseTypeValid = false

  switch (lineConf.messageType) {
    case 'sendPushMessage':
      baseTypeValid = lineConf.recipientId?.trim() && isMessageFieldConfigured(lineConf)
      break
    case 'sendReplyMessage':
      baseTypeValid = lineConf.replyToken?.trim() && isMessageFieldConfigured(lineConf)
      break
    case 'sendBroadcastMessage':
      baseTypeValid = isMessageFieldConfigured(lineConf)
      break
  }

  const attachmentsValid = [
    !lineConf.sendEmojis || isFieldMapConfigured(lineConf.emojis_field_map),
    !lineConf.sendSticker || isFieldMapConfigured(lineConf.sticker_field_map),
    !lineConf.sendImage || isFieldMapConfigured(lineConf.image_field_map),
    !lineConf.sendAudio || isFieldMapConfigured(lineConf.audio_field_map),
    !lineConf.sendVideo || isFieldMapConfigured(lineConf.video_field_map),
    !lineConf.sendLocation || isFieldMapConfigured(lineConf.location_field_map)
  ].every(Boolean)

  return baseTypeValid && attachmentsValid
}

export const getLineValidationMessages = lineConf => {
  const messages = []

  const fieldMappingChecks = [
    ['sendEmojis', 'emojis_field_map', 'Emojis'],
    ['sendSticker', 'sticker_field_map', 'Sticker'],
    ['sendImage', 'image_field_map', 'Image'],
    ['sendAudio', 'audio_field_map', 'Audio'],
    ['sendVideo', 'video_field_map', 'Video'],
    ['sendLocation', 'location_field_map', 'Location']
  ]

  switch (lineConf.messageType) {
    case 'sendPushMessage':
      if (!lineConf.recipientId?.trim())
        messages.push(__('Recipient ID is required', 'bit-integrations'))
      if (!isMessageFieldConfigured(lineConf))
        messages.push(__('Message field mapping is required', 'bit-integrations'))
      break
    case 'sendReplyMessage':
      if (!lineConf.replyToken?.trim()) messages.push(__('Reply Token is required', 'bit-integrations'))
      if (!isMessageFieldConfigured(lineConf))
        messages.push(__('Message field mapping is required', 'bit-integrations'))
      break
    case 'sendBroadcastMessage':
      if (!isMessageFieldConfigured(lineConf))
        messages.push(__('Message field mapping is required', 'bit-integrations'))
      break
    default:
      messages.push(__('Please select a message type', 'bit-integrations'))
  }

  fieldMappingChecks.forEach(([flag, mapKey, name]) => {
    if (lineConf[flag] && !isFieldMapConfigured(lineConf[mapKey])) {
      messages.push(`${name} field mapping is required`)
    }
  })

  return messages
}

export const generateMappedField = (fields, fieldType = null) => {
  const requiredFlds = fields.filter(f => f.required)
  if (requiredFlds.length) {
    const typeToGroupId = {}
    return requiredFlds.map(f => {
      const actualFieldType = fieldType || getFieldCategory(f.value)
      if (!typeToGroupId[actualFieldType]) {
        typeToGroupId[actualFieldType] = `${actualFieldType}_1`
      }
      return {
        formField: '',
        lineFormField: f.value,
        groupId: typeToGroupId[actualFieldType],
        fieldType: actualFieldType
      }
    })
  }
  return [{ formField: '', lineFormField: '' }]
}
