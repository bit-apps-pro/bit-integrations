import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import CopyIcn from '../../Icons/CopyIcn'
import noData from '../../resource/img/nodata.svg'
import bitsFetch from '../../Utils/bitsFetch'
import { __ } from '../../Utils/i18nwrap'
import Button from '../Utilities/Button'
import CopyText from '../Utilities/CopyText'
import EyeIcn from '../Utilities/EyeIcn'
import Modal from '../Utilities/Modal'
import Reload from '../Utilities/Reload'
import SnackMsg from '../Utilities/SnackMsg'
import Table from '../Utilities/Table'

const STATUS_FILTERS = [
  { key: 'all', label: __('All', 'bit-integrations') },
  { key: 'success', label: __('Success', 'bit-integrations') },
  { key: 'failed', label: __('Failed', 'bit-integrations') }
]

function Log({ allIntegURL }) {
  const { id, type } = useParams()
  const [snack, setSnackbar] = useState({ show: false })
  const fetchIdRef = useRef(0)
  const [pageCount, setPageCount] = useState(0)
  const [countEntries, setCountEntries] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [reloadIndex, setReloadIndex] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [response, setResponse] = useState(false)
  const [previewTab, setPreviewTab] = useState('output')
  const [previewInput, setPreviewInput] = useState(null)
  const reexecutingRef = useRef(false)
  const previewReqRef = useRef(0)

  const openPreview = useCallback(row => {
    setPreviewTab('output')
    setPreviewInput(null)
    setResponse(row)
    // Bump the token for every open so any in-flight field-data fetch from a prior row is ignored.
    const token = (previewReqRef.current += 1)
    if (row?.has_field_data && row?.id) {
      bitsFetch({ log_id: row.id }, 'log/field-data')
        .then(res => {
          // Ignore a stale response if the user has since opened a different row's preview.
          if (token !== previewReqRef.current) return
          setPreviewInput(res?.success ? res.data ?? '' : '')
        })
        .catch(() => {
          if (token === previewReqRef.current) setPreviewInput('')
        })
    }
  }, [])

  const handleReexecute = useCallback(logId => {
    if (!logId || reexecutingRef.current) return
    reexecutingRef.current = true
    setSnackbar({ show: true, msg: __('Re-executing integration…', 'bit-integrations') })
    bitsFetch({ log_id: logId }, 'log/reexecute')
      .then(res => {
        if (res?.success) {
          setSnackbar({
            show: true,
            msg: res.data || __('Re-execution triggered. See the latest log entry.', 'bit-integrations')
          })
          setReloadIndex(i => i + 1)
        } else {
          setSnackbar({ show: true, msg: res?.data || __('Re-execution failed', 'bit-integrations') })
        }
      })
      .catch(() => {
        setSnackbar({ show: true, msg: __('Error during re-execution', 'bit-integrations') })
      })
      .finally(() => {
        reexecutingRef.current = false
      })
  }, [])

  const [log, setLog] = useState([])
  const [collapsed, setCollapsed] = useState(() => new Set())

  const toggleCollapse = useCallback(parentId => {
    setCollapsed(prev => {
      const next = new Set(prev)
      const key = String(parentId)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const [cols, setCols] = useState([
    {
      width: 150,
      minWidth: 120,
      Header: __('Execution', 'bit-integrations'),
      accessor: 'id',
      Cell: val => {
        const row = val.row.original
        const depth = row.depth || 0
        const isChild = depth > 0
        const childCount = row.child_count || 0
        return (
          <span className="btcd-exec-cell" style={depth ? { paddingLeft: Math.min(depth, 8) * 16 } : undefined}>
            {childCount > 0 ? (
              <button
                type="button"
                className="btcd-exec-toggle"
                onClick={() => toggleCollapse(row.id)}
                title={__('Show / hide re-runs', 'bit-integrations')}>
                {row._collapsed ? '▸' : '▾'}
              </button>
            ) : (
              isChild && <span className="btcd-exec-branch">└</span>
            )}
            <span className="btcd-exec-id">#{row.id}</span>
            {isChild ? (
              <span className="btcd-reexec-badge">{`↻ ${__('re-run', 'bit-integrations')}`}</span>
            ) : (
              childCount > 0 && (
                <span className="btcd-exec-count">
                  {`${childCount} ${
                    childCount === 1 ? __('re-run', 'bit-integrations') : __('re-runs', 'bit-integrations')
                  }`}
                </span>
              )
            )}
            {!isChild && childCount === 0 && row.parent_id && (
              <span className="btcd-reexec-badge">{`↻ ${__('from', 'bit-integrations')} #${row.parent_id}`}</span>
            )}
          </span>
        )
      }
    },
    {
      width: 140,
      minWidth: 110,
      Header: __('Status', 'bit-integrations'),
      accessor: 'response_type',
      Cell: val => {
        const key = statusKey(val.row.original.response_type)
        return (
          <span className={`resp-badge resp-badge--${key} btcd-status-pill`}>
            <span className="btcd-status-ico" aria-hidden="true">
              {key === 'success' ? '✓' : key === 'warn' ? '!' : key === 'error' ? '✕' : '•'}
            </span>
            {val.row.original.response_type || __('unknown', 'bit-integrations')}
          </span>
        )
      }
    },
    {
      width: 230,
      minWidth: 120,
      Header: __('Record Type', 'bit-integrations'),
      accessor: 'api_type',
      Cell: val => (
        <span className="btcd-record-type" title={recordTypeLabel(val.row.original.api_type)}>
          {recordTypeLabel(val.row.original.api_type) || '—'}
        </span>
      )
    },
    {
      width: 200,
      minWidth: 160,
      Header: __('Response', 'bit-integrations'),
      accessor: 'response_obj',
      Cell: val => (
        <>
          <CopyText value={val.row.values.response_obj} setSnackbar={setSnackbar} className="cpyTxt" />
          <Button
            type="button"
            className="icn-btn tooltip"
            style={{ '--tooltip-txt': `'${__('Preview', 'bit-integrations')}'` }}
            onClick={() => openPreview(val.row.original)}>
            <EyeIcn width="40" height="40" strokeColor="#222" />
          </Button>
        </>
      )
    },
    {
      width: 170,
      minWidth: 130,
      Header: __('Date', 'bit-integrations'),
      accessor: 'created_at',
      Cell: val => (
        <span className="btcd-log-date" title={val.row.original.created_at || ''}>
          {relativeTime(val.row.original.created_at)}
        </span>
      )
    },
    {
      width: 150,
      minWidth: 120,
      Header: __('Re-execute', 'bit-integrations'),
      id: 'reexecute',
      accessor: 'id',
      Cell: val =>
        val.row.original.has_field_data ? (
          <Button
            type="button"
            className="btcd-reexec-btn"
            onClick={() => handleReexecute(val.row.original.id)}>
            <Reload width="14" height="14" />
            <span>{__('Re-execute', 'bit-integrations')}</span>
          </Button>
        ) : null
    }
  ])
  const setTableCols = useCallback(newCols => {
    setCols(newCols)
  }, [])

  // Sorting is disabled: rows arrive in server order (originals then their nested re-runs), which a
  // client-side sort would scramble, detaching re-runs from their parent.
  const tableCols = useMemo(() => cols.map(col => ({ ...col, disableSortBy: true })), [cols])

  const setBulkDelete = useCallback((rows, action) => {
    const entries = []
    if (typeof rows[0] === 'object') {
      for (let i = 0; i < rows.length; i += 1) {
        entries.push(rows[i].original.id)
      }
    } else {
      entries.push(rows.original.id)
    }
    bitsFetch({ id: entries }, 'log/delete').then(res => {
      if (res.success) {
        // setReloadIndex triggers a single refetch (via fetchData deps) and resets collapse state.
        setReloadIndex(i => i + 1)
        setSnackbar({ show: true, msg: __('Log deleted successfully', 'bit-integrations') })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = useCallback(
    ({ pageSize, pageIndex }) => {
      // eslint-disable-next-line no-plusplus
      const fetchId = ++fetchIdRef.current
      setIsLoading(true)
      const startRow = pageSize * pageIndex
      bitsFetch(
        { id, offset: startRow, pageSize, status: statusFilter, search: searchQuery },
        'log/get'
      ).then(res => {
        // Ignore out-of-order responses: only the most recent request may commit state.
        if (fetchId !== fetchIdRef.current) return
        if (res?.success) {
          setPageCount(Math.ceil(res.data.count / pageSize))
          setCountEntries(res.data.count)
          setLog(res.data.data)
        }
        setIsLoading(false)
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [id, reloadIndex, statusFilter, searchQuery]
  )

  // Depth-ordered rows from the server (each original followed by its re-runs), with collapse applied.
  const displayRows = useMemo(() => {
    const rows = []
    let hideDeeperThan = null
    log.forEach(entry => {
      const depth = entry.depth || 0
      if (hideDeeperThan !== null) {
        if (depth > hideDeeperThan) return
        hideDeeperThan = null
      }
      rows.push({ ...entry, _collapsed: collapsed.has(String(entry.id)) })
      if ((entry.child_count || 0) > 0 && collapsed.has(String(entry.id))) {
        hideDeeperThan = depth
      }
    })
    return rows
  }, [log, collapsed])

  // Debounce the search box, then let the server filter (correct counts + matches across all pages).
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  // After a refresh / re-execute, expand all groups so a newly created re-run is visible.
  useEffect(() => {
    if (reloadIndex) setCollapsed(new Set())
  }, [reloadIndex])

  const isFiltering = statusFilter !== 'all' || searchQuery !== ''
  const reload = useCallback(() => setReloadIndex(i => i + 1), [])

  return (
    <>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />

      <header className="btcd-log-head">
        <Link to={allIntegURL} className="btn btcd-btn-o-gray btcd-log-head__back">
          <span className="btcd-icn icn-chevron-left" />
          &nbsp;{__('Back', 'bit-integrations')}
        </Link>
        <div className="btcd-log-head__title">
          <b className="f-lg">{type}</b>
          <span className="btcd-log-head__sub">{__('Integration Log', 'bit-integrations')}</span>
        </div>
      </header>

      <div className="forms btcd-log-forms">
        <Table
          key={`${statusFilter}|${searchQuery}`}
          className="f-table btcd-all-frm btcd-log-tbl"
          height={500}
          columns={tableCols}
          data={displayRows}
          loading={isLoading}
          countEntries={countEntries}
          topLeftContent={
            <div className="btcd-log-filters" role="group" aria-label={__('Filter by status', 'bit-integrations')}>
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={statusFilter === f.key}
                  className={`btcd-log-chip${statusFilter === f.key ? ' is-active' : ''}`}
                  onClick={() => setStatusFilter(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>
          }
          topRightContent={
            <div className="btcd-log-controls">
              <div className="btcd-log-search">
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={__('Search…', 'bit-integrations')}
                  aria-label={__('Search logs', 'bit-integrations')}
                />
              </div>
              <button
                type="button"
                className="btcd-log-head__refresh"
                onClick={reload}
                disabled={isLoading}
                title={__('Refresh', 'bit-integrations')}>
                <Reload width="15" height="15" />
                <span>{__('Refresh', 'bit-integrations')}</span>
              </button>
            </div>
          }
          rowSeletable
          resizable
          columnHidable
          setTableCols={setTableCols}
          setBulkDelete={setBulkDelete}
          fetchData={fetchData}
          pageCount={pageCount}
        />

        {!isLoading && log.length === 0 && !isFiltering && (
          <div className="btcd-no-data txt-center">
            <img src={noData} alt={__('No logs', 'bit-integrations')} />
            <div className="mt-2 data-txt">{__('No executions logged yet.', 'bit-integrations')}</div>
          </div>
        )}

        {!isLoading && log.length === 0 && isFiltering && (
          <div className="btcd-log-empty txt-center">
            <img src={noData} alt={__('No matches', 'bit-integrations')} />
            <div className="data-txt">{__('No entries match your filters.', 'bit-integrations')}</div>
            <button
              type="button"
              className="btcd-log-linkbtn"
              onClick={() => {
                setStatusFilter('all')
                setSearch('')
                setSearchQuery('')
              }}>
              {__('Clear filters', 'bit-integrations')}
            </button>
          </div>
        )}
      </div>

      {response && (
        <Modal
          closeIcon
          show={response}
          setModal={setResponse}
          className="resp-modal-shell"
          style={{ width: '600px', maxWidth: '92vw', height: 'auto' }}
          title={__('Execution details', 'bit-integrations')}>
          <div className="resp-mdl">
            <div className="resp-mdl__meta">
              <span className={`resp-badge resp-badge--${statusKey(response.response_type)}`}>
                <span className="resp-badge__dot" />
                {response.response_type || __('Unknown', 'bit-integrations')}
              </span>
              {recordTypeLabel(response.api_type) && (
                <span className="resp-mdl__chip">{recordTypeLabel(response.api_type)}</span>
              )}
              {response.created_at && <span className="resp-mdl__date">{response.created_at}</span>}
            </div>

            {response.has_field_data && (
              <div className="resp-mdl__tabs">
                <button
                  type="button"
                  className={`resp-mdl__tab${previewTab === 'output' ? ' is-active' : ''}`}
                  onClick={() => setPreviewTab('output')}>
                  {__('Response Output', 'bit-integrations')}
                </button>
                <button
                  type="button"
                  className={`resp-mdl__tab${previewTab === 'input' ? ' is-active' : ''}`}
                  onClick={() => setPreviewTab('input')}>
                  {__('Trigger Input', 'bit-integrations')}
                </button>
              </div>
            )}

            {previewTab === 'input' && previewInput === null ? (
              <div className="resp-mdl__loading">{__('Loading input data…', 'bit-integrations')}</div>
            ) : (
              <div className="resp-mdl__code-wrp">
                <div className="resp-mdl__code-bar">
                  <span className="resp-mdl__lang">JSON</span>
                  <button
                    type="button"
                    className="resp-mdl__copy"
                    onClick={() => {
                      const text = jsonPrint(previewTab === 'input' ? previewInput : response.response_obj)
                      if (navigator.clipboard) navigator.clipboard.writeText(text)
                      setSnackbar({ show: true, msg: __('Copied on Clipboard.', 'bit-integrations') })
                    }}>
                    <CopyIcn size="13" />
                    {__('Copy', 'bit-integrations')}
                  </button>
                </div>
                <pre className="resp-mdl__pre">
                  {/* eslint-disable-next-line react/no-danger */}
                  <code
                    dangerouslySetInnerHTML={{
                      __html: syntaxHighlight(previewTab === 'input' ? previewInput : response.response_obj)
                    }}
                  />
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}

export default memo(Log)

// Map a stored response_type to a visual status key.
const statusKey = st => {
  const s = String(st || '').toLowerCase()
  if (s === 'success') return 'success'
  if (s === 'validation') return 'warn'
  if (s === 'error') return 'error'
  return 'neutral'
}

const parseDate = s => (s ? new Date(String(s).replace(' ', 'T')) : null)

// Compact relative time; absolute value stays available via the cell's title attribute.
const relativeTime = s => {
  const d = parseDate(s)
  if (!d || Number.isNaN(d.getTime())) return s || '—'
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 45) return __('just now', 'bit-integrations')
  if (diff < 3600) return `${Math.max(1, Math.round(diff / 60))}${__('m ago', 'bit-integrations')}`
  if (diff < 86400) return `${Math.round(diff / 3600)}${__('h ago', 'bit-integrations')}`
  if (diff < 172800) return __('Yesterday', 'bit-integrations')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const jsonPrint = data => {
  try {
    return JSON.stringify(JSON.parse(data), null, 2)
  } catch (e) {
    return data
  }
}

// Human-readable label for the record type column (stored as JSON string).
const recordTypeLabel = raw => {
  if (!raw) return ''
  try {
    const obj = JSON.parse(raw)
    return [obj.type, obj.type_name].filter(Boolean).join(' · ') || raw
  } catch (e) {
    return raw
  }
}

// Lightweight JSON syntax highlighter → HTML with token classes.
const syntaxHighlight = data => {
  const json = jsonPrint(data).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    match => {
      let cls = 'tok-num'
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'tok-key' : 'tok-str'
      } else if (/true|false/.test(match)) {
        cls = 'tok-bool'
      } else if (/null/.test(match)) {
        cls = 'tok-null'
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}
