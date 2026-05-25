import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import CloseIcn from '../Icons/CloseIcn'
import EditIcn from '../Icons/EditIcn'
import TrashIcn from '../Icons/TrashIcn'
import Table from '../components/Utilities/Table'
import ConfirmModal from '../components/Utilities/ConfirmModal'
import {
  deleteConnection,
  listConnections,
  updateConnection
} from '../Utils/connectionApi'
import { __, sprintf } from '../Utils/i18nwrap'

export default function Connections() {
  const getDeleteErrorMessage = useCallback(res => {
    const linkedCount = Number(res?.data?.linked_count || 0)

    if (linkedCount > 0) {
      return sprintf(
        __('Connection is used in %d integrations. Unlink first, then delete.', 'bit-integrations'),
        linkedCount
      )
    }

    if (typeof res?.data?.message === 'string' && res.data.message.trim() !== '') {
      return res.data.message
    }

    if (typeof res?.data === 'string' && res.data.trim() !== '') {
      return res.data
    }

    return __('Failed to delete', 'bit-integrations')
  }, [])

  const [connections, setConnections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterApp, setFilterApp] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [isConfirmPending, setIsConfirmPending] = useState(false)
  const inputRef = useRef(null)
  const editValueRef = useRef('')

  const fetchConnections = useCallback(() => {
    setIsLoading(true)
    listConnections('', { includeLinkedIntegrations: true })
      .then(res => {
        if (res?.success && Array.isArray(res.data?.data)) {
          setConnections(res.data.data)
        } else {
          setConnections([])
        }
      })
      .catch(() => toast.error(__('Failed to load connections', 'bit-integrations')))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    fetchConnections()
  }, [fetchConnections])

  useEffect(() => {
    if (editingId !== null && inputRef.current) inputRef.current.focus()
  }, [editingId])

  const apps = useMemo(() => {
    const set = new Set(connections.map(c => c.app_slug).filter(Boolean))
    return Array.from(set).sort()
  }, [connections])

  const filteredConnections = useMemo(
    () => connections.filter(conn => !filterApp || conn.app_slug === filterApp),
    [connections, filterApp]
  )

  const startEdit = useCallback(conn => {
    setEditingId(conn.id)
    editValueRef.current = conn.connection_name || ''
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    editValueRef.current = ''
  }, [])

  const saveRename = useCallback(
    (id, rawName = editValueRef.current) => {
      const next = (rawName || '').trim()
      if (!next) {
        toast.error(__('Connection name cannot be empty', 'bit-integrations'))
        return
      }

      const previous = connections.find(c => c.id === id)
      if (previous && previous.connection_name === next) {
        cancelEdit()
        return
      }

      setSavingId(id)
      const promise = updateConnection({ id, connection_name: next }).then(res => {
        if (!res?.success) throw new Error('rename_failed')
        const row = res.data?.data
        setConnections(prev =>
          prev.map(item => (item.id === id ? { ...item, ...(row || { connection_name: next }) } : item))
        )
        cancelEdit()
        return __('Renamed', 'bit-integrations')
      })

      toast
        .promise(promise, {
          success: msg => msg,
          error: __('Failed to rename', 'bit-integrations'),
          loading: __('Saving...', 'bit-integrations')
        })
        .finally(() => setSavingId(null))
    },
    [connections, cancelEdit]
  )

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveRename(id, e.currentTarget.value)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  const confirmDelete = useCallback(() => {
    const id = deletingId
    if (!id || isConfirmPending) return

    setDeletingId(null)
    setIsConfirmPending(true)

    const promise = deleteConnection(id).then(res => {
      if (!res?.success) {
        throw new Error(getDeleteErrorMessage(res))
      }
      setConnections(prev => prev.filter(c => c.id !== id))
      return __('Connection deleted', 'bit-integrations')
    })

    toast
      .promise(promise, {
        success: msg => msg,
        error: error => error?.message || __('Failed to delete', 'bit-integrations'),
        loading: __('Deleting...', 'bit-integrations')
      })
      .finally(() => setIsConfirmPending(false))
  }, [deletingId, isConfirmPending, getDeleteErrorMessage])

  const setBulkDelete = useCallback(rows => {
    const ids = []

    if (Array.isArray(rows)) {
      rows.forEach(row => {
        if (row?.original?.id) {
          ids.push(row.original.id)
        }
      })
    } else if (rows?.original?.id) {
      ids.push(rows.original.id)
    }

    if (ids.length < 1) {
      return
    }

    const promise = Promise.allSettled(
      ids.map(id =>
        deleteConnection(id).then(res => {
          if (!res?.success) {
            throw new Error(getDeleteErrorMessage(res))
          }
          return id
        })
      )
    ).then(results => {
      const deletedIds = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)

      if (deletedIds.length > 0) {
        setConnections(prev => prev.filter(item => !deletedIds.includes(item.id)))
      }

      const failedCount = results.filter(r => r.status === 'rejected').length

      if (failedCount > 0) {
        const uniqueFailureMessages = [
          ...new Set(
            results
              .filter(r => r.status === 'rejected')
              .map(r => r.reason?.message)
              .filter(Boolean)
          )
        ]

        if (failedCount === ids.length && uniqueFailureMessages.length === 1) {
          throw new Error(uniqueFailureMessages[0])
        }

        throw new Error(
          failedCount === ids.length ? 'bulk_delete_failed' : 'bulk_delete_partial'
        )
      }

      return deletedIds.length > 1
        ? __('Connections deleted', 'bit-integrations')
        : __('Connection deleted', 'bit-integrations')
    })

    toast.promise(promise, {
      success: msg => msg,
      error: error => {
        if (error?.message === 'bulk_delete_partial') {
          return __('Some selected connections could not be deleted.', 'bit-integrations')
        }

        if (error?.message === 'bulk_delete_failed') {
          return __('Failed to delete', 'bit-integrations')
        }

        return error?.message || __('Failed to delete', 'bit-integrations')
      },
      loading: __('Deleting...', 'bit-integrations')
    })
  }, [getDeleteErrorMessage])

  const columns = useMemo(
    () => [
      {
        Header: __('Action', 'bit-integrations'),
        accessor: 'app_slug',
        width: 130,
        minWidth: 90,
        Cell: ({ value }) => <span className="connections-app-tag">{value || '—'}</span>
      },
      {
        Header: __('Connection Name', 'bit-integrations'),
        accessor: 'connection_name',
        width: 250,
        minWidth: 170,
        className: 'connections-name-cell',
        Cell: ({ row, value }) => {
          const conn = row.original

          if (editingId === conn.id) {
            return (
              <div className="connections-edit-row">
                <input
                  ref={inputRef}
                  type="text"
                  className="btcd-paper-inp connections-edit-input"
                  defaultValue={editValueRef.current}
                  onChange={e => {
                    editValueRef.current = e.target.value
                  }}
                  onKeyDown={e => handleKeyDown(e, conn.id)}
                  disabled={savingId === conn.id}
                />
                <button
                  type="button"
                  className="btn purple connections-edit-btn"
                  onClick={() => saveRename(conn.id, inputRef.current?.value ?? editValueRef.current)}
                  disabled={savingId === conn.id}>
                  {__('Save', 'bit-integrations')}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={savingId === conn.id}
                  className="icn-btn icn-btn-sm connections-edit-cancel-btn tooltip"
                  style={{ '--tooltip-txt': `'${__('Cancel', 'bit-integrations')}'` }}
                  title={__('Cancel', 'bit-integrations')}>
                  <CloseIcn size={10} stroke={3} className="connections-edit-cancel-icn" />
                </button>
              </div>
            )
          }

          return (
            <div className="flx connections-name-row">
              <span className="connections-name-txt">{value || '—'}</span>
              <button
                type="button"
                className="icn-btn tooltip"
                style={{ '--tooltip-txt': `'${__('Rename Connection', 'bit-integrations')}'` }}
                onClick={() => startEdit(conn)}>
                <EditIcn size={14} />
              </button>
            </div>
          )
        }
      },
      {
        Header: __('Linked Integrations', 'bit-integrations'),
        accessor: 'linked_count',
        width: 250,
        minWidth: 180,
        Cell: ({ row }) => {
          const linkedIntegrations = Array.isArray(row?.original?.linked_integrations)
            ? row.original.linked_integrations
            : []

          if (linkedIntegrations.length < 1) {
            return '—'
          }

          const previewLimit = 3
          const previewNames = linkedIntegrations
            .slice(0, previewLimit)
            .map(item => item?.name || `#${item?.id || ''}`)
            .filter(Boolean)

          const extraCount = linkedIntegrations.length - previewNames.length
          const linkedText = extraCount > 0 ? `${previewNames.join(', ')} +${extraCount}` : previewNames.join(', ')
          const tooltipText = linkedIntegrations
            .map(item => item?.name || `#${item?.id || ''}`)
            .filter(Boolean)
            .join(', ')

          return (
            <span className="connections-name-txt" title={tooltipText}>
              {linkedText}
            </span>
          )
        }
      },
      {
        Header: __('Auth Type', 'bit-integrations'),
        accessor: 'auth_type',
        width: 120,
        minWidth: 95,
        Cell: ({ value }) => <span className="connections-auth-tag">{value || '—'}</span>
      },
      {
        Header: __('Created', 'bit-integrations'),
        accessor: 'created_at',
        width: 140,
        minWidth: 110,
        Cell: ({ value }) => value || '—'
      },
      {
        id: 't_action',
        Header: '',
        accessor: 'id',
        width: 70,
        minWidth: 60,
        maxWidth: 80,
        disableSortBy: true,
        Cell: ({ row }) => (
          <div className="flx connections-action-cell">
            <button
              type="button"
              className="icn-btn tooltip"
              style={{ '--tooltip-txt': `'${__('Delete', 'bit-integrations')}'` }}
              onClick={() => setDeletingId(row.original.id)}>
              <TrashIcn size={18} />
            </button>
          </div>
        )
      }
    ],
    [editingId, savingId, cancelEdit, saveRename, startEdit]
  )

  return (
    <div id="connections-page">
      <ConfirmModal
        show={deletingId !== null}
        body={__(
          'Delete this connection? Linked connections cannot be deleted until removed from integrations.',
          'bit-integrations'
        )}
        action={confirmDelete}
        close={() => setDeletingId(null)}
        btnTxt={__('Delete', 'bit-integrations')}
        btnClass=""
      />

      <div className="af-header flx flx-between">
        <h2>{__('Connections', 'bit-integrations')}</h2>
      </div>

      <div className="forms">
        <Table
          className="f-table btcd-all-frm"
          height="60vh"
          columns={columns}
          data={filteredConnections}
          loading={isLoading}
          countEntries={filteredConnections.length}
          rowSeletable
          resizable
          search
          searchPlaceholder={__('Search connections...', 'bit-integrations')}
          setBulkDelete={setBulkDelete}
          bulkDeleteLabel={__('Delete Connection', 'bit-integrations')}
          topLeftContent={
            <div className="connections-toolbar flx">
              <div className="connections-table-filters flx">
                <select
                  className="btcd-paper-inp connections-filter-select"
                  value={filterApp}
                  onChange={e => setFilterApp(e.target.value)}>
                  <option value="">{__('All apps', 'bit-integrations')}</option>
                  {apps.map(app => (
                    <option key={app} value={app}>
                      {app}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flx connections-toolbar-meta">
                <button
                  type="button"
                  className="icn-btn sh-sm tooltip"
                  style={{ '--tooltip-txt': `'${__('Refresh connections', 'bit-integrations')}'` }}
                  onClick={fetchConnections}
                  disabled={isLoading}
                  aria-label={__('Refresh connections', 'bit-integrations')}>
                  &#x21BB;
                </button>
              </div>
            </div>
          }
        />

        {!isLoading && filteredConnections.length === 0 && (
          <p className="txt-center mt-3 connections-empty-note">
            {connections.length === 0
              ? __('No connections saved yet. Authorize an app from any integration to add one.', 'bit-integrations')
              : __('No connections match the current filters.', 'bit-integrations')}
          </p>
        )}
      </div>
    </div>
  )
}
