import { useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  dedupeIds,
  findTagByName,
  parseTagPickerInput
} from '../components/AllIntegrations/tagUtils'
import { __ } from '../Utils/i18nwrap'

const TAG_NAME_LIMIT = 20
const NEW_TAG_COLOR = '#6f42c1'

export default function useTagPickerSubmit({
  tags,
  integrationTags,
  persistTagData,
  editingIntegrationId,
  bulkTagIntegrationIds,
  tagPickerInput,
  setSelectedTags,
  closeTagPickerModal
}) {
  return useCallback(() => {
    const normalizedTagNames = parseTagPickerInput(tagPickerInput)

    if (!normalizedTagNames.length && !editingIntegrationId) {
      toast.error(__('Please select or create at least one tag', 'bit-integrations'))
      return Promise.resolve(false)
    }

    if (normalizedTagNames.find(t => t.length > TAG_NAME_LIMIT)) {
      toast.error(__('Tag name must be 20 characters or less', 'bit-integrations'))
      return Promise.resolve(false)
    }

    const updatedTags = [...tags]
    const resolvedTagIds = []
    let createdTagCount = 0

    normalizedTagNames.forEach((tagName, index) => {
      const existing = findTagByName(updatedTags, tagName)
      if (existing) {
        resolvedTagIds.push(existing.id)
        return
      }
      const newTag = { id: `${Date.now()}-${index}`, name: tagName, color: NEW_TAG_COLOR }
      updatedTags.push(newTag)
      resolvedTagIds.push(newTag.id)
      createdTagCount += 1
    })

    const uniqueResolvedTagIds = dedupeIds(resolvedTagIds)
    const successMsg =
      createdTagCount > 0
        ? __('Tags created and assigned successfully', 'bit-integrations')
        : __('Tags assigned successfully', 'bit-integrations')

    if (editingIntegrationId) {
      const key = String(editingIntegrationId)
      const updatedMapping = { ...integrationTags }
      const currentTagIds = (updatedMapping[key] || []).map(String)
      const nextTagIds = uniqueResolvedTagIds.map(String)
      const isAssignmentChanged =
        currentTagIds.length !== nextTagIds.length ||
        currentTagIds.some(id => !nextTagIds.includes(id))

      if (!isAssignmentChanged && createdTagCount === 0) {
        toast.success(__('No changes found', 'bit-integrations'))
        closeTagPickerModal()
        return Promise.resolve(true)
      }

      if (uniqueResolvedTagIds.length) updatedMapping[key] = uniqueResolvedTagIds
      else delete updatedMapping[key]

      return persistTagData(updatedTags, updatedMapping, successMsg)
        .then(() => {
          closeTagPickerModal()
          return true
        })
        .catch(() => false)
    }

    if (bulkTagIntegrationIds.length > 0) {
      const updatedMapping = { ...integrationTags }
      let hasAssignmentChange = false

      bulkTagIntegrationIds.forEach(integrationId => {
        const key = String(integrationId)
        const currentTagIds = updatedMapping[key] || []
        const merged = [...currentTagIds]

        uniqueResolvedTagIds.forEach(tagId => {
          if (!merged.some(c => String(c) === String(tagId))) merged.push(tagId)
        })

        if (merged.length !== currentTagIds.length) hasAssignmentChange = true
        if (merged.length) updatedMapping[key] = merged
      })

      if (!hasAssignmentChange && createdTagCount === 0) {
        toast.success(__('No changes found', 'bit-integrations'))
        closeTagPickerModal()
        return Promise.resolve(true)
      }

      return persistTagData(updatedTags, updatedMapping, successMsg)
        .then(() => {
          closeTagPickerModal()
          return true
        })
        .catch(() => false)
    }

    const mergeSelected = prev => {
      const next = [...prev]
      uniqueResolvedTagIds.forEach(tagId => {
        if (!next.some(s => String(s) === String(tagId))) next.push(tagId)
      })
      return next
    }

    if (createdTagCount === 0) {
      setSelectedTags(mergeSelected)
      toast.success(__('Tag selected successfully', 'bit-integrations'))
      closeTagPickerModal()
      return Promise.resolve(true)
    }

    return persistTagData(
      updatedTags,
      integrationTags,
      __('Tags created successfully', 'bit-integrations')
    )
      .then(() => {
        setSelectedTags(mergeSelected)
        closeTagPickerModal()
        return true
      })
      .catch(() => false)
  }, [
    tags,
    integrationTags,
    persistTagData,
    editingIntegrationId,
    bulkTagIntegrationIds,
    tagPickerInput,
    setSelectedTags,
    closeTagPickerModal
  ])
}
