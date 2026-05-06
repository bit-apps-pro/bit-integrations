import { lazy, memo, useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useSetRecoilState } from 'recoil'
import { $flowStep, $newFlow } from '../GlobalStates'
import EditTagModal from '../components/AllIntegrations/EditTagModal'
import IntegrationsTableView from '../components/AllIntegrations/IntegrationsTableView'
import TagPickerModal from '../components/AllIntegrations/TagPickerModal'
import {
  buildIntegrationsColumns,
  initialIntegrationsCols
} from '../components/AllIntegrations/integrationsColumns'
import {
  buildTagPickerOptions,
  filterIntegrationsByTags,
  hasCustomNamesInPicker,
  parseTagPickerInput
} from '../components/AllIntegrations/tagUtils'
import Loader from '../components/Loaders/Loader'
import ConfirmModal from '../components/Utilities/ConfirmModal'
import SnackMsg from '../components/Utilities/SnackMsg'
import useCompactBreakpoint from '../hooks/useCompactBreakpoint'
import useFetch from '../hooks/useFetch'
import useIntegrationActions from '../hooks/useIntegrationActions'
import useIntegrationTags from '../hooks/useIntegrationTags'
import useTagPickerSubmit from '../hooks/useTagPickerSubmit'
import { __ } from '../Utils/i18nwrap'

const Welcome = lazy(() => import('./Welcome'))
const preloadFlowBuilder = () => import('./FlowBuilder')

const TAG_NAME_LIMIT = 20
const LOADER_STYLE = {
  display: 'flex',
  height: '82vh',
  justifyContent: 'center',
  alignItems: 'center'
}

function AllIntegrations({ isValidUser }) {
  const { data, isLoading, mutate } = useFetch({ payload: {}, action: 'flow/list', method: 'get' })

  const [integrations, setIntegrations] = useState([])
  const [snack, setSnackbar] = useState({ show: false })
  const [confMdl, setconfMdl] = useState({ show: false, btnTxt: '' })

  const setNewFlow = useSetRecoilState($newFlow)
  const setFlowStep = useSetRecoilState($flowStep)

  const { tags, integrationTags, setIntegrationTags, persistTagData } = useIntegrationTags()

  const [selectedTags, setSelectedTags] = useState([])
  const [showTagPickerModal, setShowTagPickerModal] = useState(false)
  const [tagPickerInput, setTagPickerInput] = useState('')
  const [showEditTagModal, setShowEditTagModal] = useState(false)
  const [tagToEdit, setTagToEdit] = useState(null)
  const [editTagName, setEditTagName] = useState('')
  const [editingIntegrationId, setEditingIntegrationId] = useState(null)
  const [bulkTagIntegrationIds, setBulkTagIntegrationIds] = useState([])
  const [tagToDelete, setTagToDelete] = useState(null)

  const isCompactTagColumn = useCompactBreakpoint(1100)

  useEffect(() => {
    setFlowStep(1)
    setNewFlow({})
  }, [setFlowStep, setNewFlow])

  useEffect(() => {
    if (!isLoading) setIntegrations(data?.success ? data.data.integrations : [])
  }, [data, isLoading])

  const { handleStatus, handleDelete, handleClone, setBulkDelete } = useIntegrationActions({
    integrations,
    setIntegrations,
    mutate,
    integrationTags,
    setIntegrationTags,
    tags,
    persistTagData
  })

  const closeConfMdl = useCallback(() => {
    setconfMdl(prev => ({ ...prev, show: false }))
  }, [])

  const showDelModal = useCallback(
    (id, index) => {
      setconfMdl({
        show: true,
        action: () => {
          handleDelete(id, index)
          closeConfMdl()
        },
        btnTxt: __('Delete', 'bit-integrations'),
        btn2Txt: null,
        btnClass: '',
        body: __('Are you sure to delete this Integration?', 'bit-integrations')
      })
    },
    [handleDelete, closeConfMdl]
  )

  const showDupMdl = useCallback(
    formID => {
      setconfMdl({
        show: true,
        action: () => {
          handleClone(formID)
          closeConfMdl()
        },
        btnTxt: __('Clone', 'bit-integration'),
        btn2Txt: null,
        btnClass: 'purple',
        body: __('Are you sure to clone this Integration ?', 'bit-integrations')
      })
    },
    [handleClone, closeConfMdl]
  )

  const closeTagPickerModal = useCallback(() => {
    setShowTagPickerModal(false)
    setTagPickerInput('')
    setEditingIntegrationId(null)
    setBulkTagIntegrationIds([])
  }, [])

  const openTagPickerModal = useCallback(() => {
    setEditingIntegrationId(null)
    setBulkTagIntegrationIds([])
    setTagPickerInput('')
    setShowTagPickerModal(true)
  }, [])

  const openTagPickerForIntegration = useCallback((integrationId, prefillInput) => {
    setEditingIntegrationId(integrationId)
    setBulkTagIntegrationIds([])
    setTagPickerInput(prefillInput || '')
    setShowTagPickerModal(true)
  }, [])

  const removeTagFromIntegration = useCallback(
    (integrationId, tagId) => {
      const integrationKey = String(integrationId)
      const updatedMapping = { ...integrationTags }
      const currentTags = updatedMapping[integrationKey] || []
      const nextTags = currentTags.filter(c => String(c) !== String(tagId))

      if (nextTags.length) updatedMapping[integrationKey] = nextTags
      else delete updatedMapping[integrationKey]

      setIntegrationTags(updatedMapping)
      persistTagData(
        tags,
        updatedMapping,
        __('Tag removed successfully', 'bit-integrations')
      ).catch(() => { })
    },
    [integrationTags, setIntegrationTags, persistTagData, tags]
  )

  const setBulkTagAssign = useCallback(rows => {
    const seen = new Set()
    const ids = []

    rows.forEach(row => {
      const integrationId = row?.original?.id
      if (integrationId === undefined || integrationId === null) return
      const key = String(integrationId)
      if (seen.has(key)) return
      seen.add(key)
      ids.push(integrationId)
    })

    if (!ids.length) {
      toast.error(__('Please select at least one integration', 'bit-integrations'))
      return
    }

    setBulkTagIntegrationIds(ids)
    setEditingIntegrationId(null)
    setTagPickerInput('')
    setShowTagPickerModal(true)
  }, [])

  const handleCreateIntegrationIntent = useCallback(() => {
    void preloadFlowBuilder()
  }, [])

  const [cols, setCols] = useState(initialIntegrationsCols)

  useEffect(() => {
    setCols(prevCols =>
      buildIntegrationsColumns({
        prevCols,
        isCompactTagColumn,
        tags,
        integrationTags,
        isValidUser,
        onRemoveTag: removeTagFromIntegration,
        onOpenTagPicker: openTagPickerForIntegration,
        onToggleStatus: handleStatus,
        onShowDelModal: showDelModal,
        onShowDupMdl: showDupMdl
      })
    )
  }, [
    isCompactTagColumn,
    tags,
    integrationTags,
    isValidUser,
    removeTagFromIntegration,
    openTagPickerForIntegration,
    handleStatus,
    showDelModal,
    showDupMdl
  ])

  const saveTagFromPicker = useTagPickerSubmit({
    tags,
    integrationTags,
    persistTagData,
    editingIntegrationId,
    bulkTagIntegrationIds,
    tagPickerInput,
    setSelectedTags,
    closeTagPickerModal
  })

  const deleteTag = useCallback(
    tagId => {
      const updatedTags = tags.filter(tag => String(tag.id) !== String(tagId))
      const updatedMapping = { ...integrationTags }

      Object.keys(updatedMapping).forEach(integrationId => {
        const remaining = updatedMapping[integrationId].filter(c => c !== tagId)
        if (remaining.length) updatedMapping[integrationId] = remaining
        else delete updatedMapping[integrationId]
      })

      setSelectedTags(prev => prev.filter(s => s !== tagId))
      setTagToDelete(null)

      persistTagData(
        updatedTags,
        updatedMapping,
        __('Tag deleted successfully', 'bit-integrations')
      ).catch(() => { })
    },
    [tags, integrationTags, persistTagData]
  )

  const confirmDeleteTag = useCallback(tagId => setTagToDelete(tagId), [])

  const openEditTagModal = useCallback(tag => {
    setTagToEdit(tag.id)
    setEditTagName(tag.name)
    setShowEditTagModal(true)
  }, [])

  const closeEditTagModal = useCallback(() => {
    setShowEditTagModal(false)
    setTagToEdit(null)
    setEditTagName('')
  }, [])

  const updateTag = useCallback(() => {
    const trimmed = editTagName.trim()

    if (!trimmed) {
      toast.error(__('Please enter a tag name', 'bit-integrations'))
      return Promise.resolve(false)
    }
    if (trimmed.length > TAG_NAME_LIMIT) {
      toast.error(__('Tag name must be 20 characters or less', 'bit-integrations'))
      return Promise.resolve(false)
    }

    const lower = trimmed.toLowerCase()
    if (
      tags.some(
        tag => String(tag.id) !== String(tagToEdit) && tag.name.toLowerCase() === lower
      )
    ) {
      toast.error(__('Tag already exists', 'bit-integrations'))
      return Promise.resolve(false)
    }

    const updatedTags = tags.map(tag =>
      String(tag.id) === String(tagToEdit) ? { ...tag, name: trimmed } : tag
    )

    return persistTagData(
      updatedTags,
      integrationTags,
      __('Tag updated successfully', 'bit-integrations')
    )
      .then(() => {
        closeEditTagModal()
        return true
      })
      .catch(() => false)
  }, [editTagName, tags, tagToEdit, integrationTags, persistTagData, closeEditTagModal])

  const toggleTagFilter = useCallback(tagId => {
    if (tagId === 'ALL') {
      setSelectedTags([])
      return
    }
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }, [])

  const clearTagFilters = useCallback(() => setSelectedTags([]), [])

  const filteredIntegrations = useMemo(
    () => filterIntegrationsByTags(integrations, integrationTags, selectedTags),
    [integrations, integrationTags, selectedTags]
  )

  const tagPickerOptions = useMemo(() => buildTagPickerOptions(tags), [tags])

  const tagPickerPrimaryBtnLabel = useMemo(() => {
    const pickerNames = parseTagPickerInput(tagPickerInput)
    const hasCustom = hasCustomNamesInPicker(pickerNames, tags)

    if (bulkTagIntegrationIds.length > 0) {
      return hasCustom
        ? __('Create & Assign', 'bit-integrations')
        : __('Assign Tags', 'bit-integrations')
    }
    if (editingIntegrationId) {
      return hasCustom
        ? __('Create & Assign', 'bit-integrations')
        : __('Save Tags', 'bit-integrations')
    }
    if (hasCustom) return __('Create Tag', 'bit-integrations')
    return __('Select Tag', 'bit-integrations')
  }, [tagPickerInput, tags, bulkTagIntegrationIds, editingIntegrationId])

  if (isLoading) return <Loader style={LOADER_STYLE} />

  return (
    <div id="all-forms">
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <ConfirmModal
        show={confMdl.show}
        body={confMdl.body}
        action={confMdl.action}
        close={closeConfMdl}
        btnTxt={confMdl.btnTxt}
        btn2Txt={confMdl.btn2Txt}
        btn2Action={confMdl.btn2Action}
        btnClass={confMdl.btnClass}
      />

      {tagToDelete && (
        <ConfirmModal
          show={tagToDelete !== null}
          close={() => setTagToDelete(null)}
          action={() => deleteTag(tagToDelete)}
          body={__(
            'Are you sure you want to delete this tag? It will be removed from all integrations.',
            'bit-integrations'
          )}
          btnTxt={__('Delete', 'bit-integrations')}
          btnClass=""
        />
      )}

      <TagPickerModal
        show={showTagPickerModal}
        onClose={closeTagPickerModal}
        bulkTagIntegrationIds={bulkTagIntegrationIds}
        editingIntegrationId={editingIntegrationId}
        tagPickerInput={tagPickerInput}
        tagPickerOptions={tagPickerOptions}
        onTagPickerInputChange={setTagPickerInput}
        onSubmit={saveTagFromPicker}
        primaryBtnLabel={tagPickerPrimaryBtnLabel}
      />

      <EditTagModal
        show={showEditTagModal}
        editTagName={editTagName}
        onEditTagNameChange={setEditTagName}
        onClose={closeEditTagModal}
        onSubmit={updateTag}
      />

      {integrations?.length ? (
        <IntegrationsTableView
          cols={cols}
          filteredIntegrations={filteredIntegrations}
          setTableCols={setCols}
          setBulkDelete={setBulkDelete}
          setBulkTagAssign={setBulkTagAssign}
          selectedTags={selectedTags}
          tags={tags}
          onToggleTagFilter={toggleTagFilter}
          onOpenEditTagModal={openEditTagModal}
          onConfirmDeleteTag={confirmDeleteTag}
          onOpenTagPicker={openTagPickerModal}
          onClearTagFilters={clearTagFilters}
          onPreloadFlowBuilder={handleCreateIntegrationIntent}
        />
      ) : (
        <Welcome isValidUser={isValidUser} integrations={integrations} />
      )}
    </div>
  )
}

export default memo(AllIntegrations)
