import { memo, useCallback, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import CopyIcn from '../../Icons/CopyIcn'
import noData from '../../resource/img/nodata.svg'
import bitsFetch from '../../Utils/bitsFetch'
import { __ } from '../../Utils/i18nwrap'
import Button from '../Utilities/Button'
import CopyText from '../Utilities/CopyText'
import EyeIcn from '../Utilities/EyeIcn'
import Modal from '../Utilities/Modal'
import SnackMsg from '../Utilities/SnackMsg'
import Table from '../Utilities/Table'

function Log({ allIntegURL }) {
  const { id, type } = useParams()
  const [snack, setSnackbar] = useState({ show: false })
  const fetchIdRef = useRef(0)
  const [confMdl, setconfMdl] = useState({ show: false })
  const [pageCount, setPageCount] = useState(0)
  const [countEntries, setCountEntries] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshLog, setRefreshLog] = useState(0)
  const [response, setResponse] = useState(false)

  const [log, setLog] = useState([])
  const [cols, setCols] = useState([
    {
      width: 250,
      minWidth: 80,
      Header: __('Status', 'bit-integrations'),
      accessor: 'response_type'
    },
    {
      width: 250,
      minWidth: 80,
      Header: __('Record Type', 'bit-integrations'),
      accessor: 'api_type'
    },
    {
      width: 220,
      minWidth: 200,
      Header: __('Response', 'bit-integrations'),
      accessor: 'response_obj',
      Cell: val => (
        <>
          <CopyText value={val.row.values.response_obj} setSnackbar={setSnackbar} className="cpyTxt" />
          <Button
            type="button"
            className="icn-btn tooltip"
            style={{ '--tooltip-txt': '"Preview"' }}
            onClick={() => setResponse(val.row.values)}>
            <EyeIcn width="40" height="40" strokeColor="#222" />
          </Button>
        </>
      )
    },
    { width: 220, minWidth: 200, Header: __('Date', 'bit-integrations'), accessor: 'created_at' }
  ])
  const setTableCols = useCallback(newCols => {
    setCols(newCols)
  }, [])
  // route is info/:id but for redirect uri need to make new/:type
  // const location = window.location.toString()

  // const toReplaceInd = location.indexOf('/info')
  // location = window.encodeURI(`${location.slice(0, toReplaceInd)}/new/${integrations[id].type}`)

  const closeConfMdl = useCallback(() => {
    confMdl.show = false
    setconfMdl({ ...confMdl })
  }, [confMdl])

  const setBulkDelete = useCallback((rows, action) => {
    const rowID = []
    const entries = []
    if (typeof rows[0] === 'object') {
      for (let i = 0; i < rows.length; i += 1) {
        rowID.push(rows[i].id)
        entries.push(rows[i].original.id)
      }
    } else {
      rowID.push(rows.id)
      entries.push(rows.original.id)
    }
    const ajaxData = { id: entries }
    bitsFetch(ajaxData, 'log/delete').then(res => {
      if (res.success) {
        if (action && action.fetchData && action.data) {
          action.fetchData(action.data)
        }
        setSnackbar({ show: true, msg: __('Response delete successfully', 'bit-integrations') })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const delConfMdl = useCallback(
    (row, data) => {
      if (row.idx !== undefined) {
        // eslint-disable-next-line no-param-reassign
        row.id = row.idx
        // eslint-disable-next-line no-param-reassign
        row.original = row.data[0].row.original
      }
      confMdl.btnTxt = __('Delete', 'bit-integrations')
      confMdl.body = __('Are you sure to delete this entry', 'bit-integrations')
      confMdl.btnClass = ''

      confMdl.action = () => {
        setBulkDelete(row, data)
        closeConfMdl()
      }
      confMdl.show = true
      setconfMdl({ ...confMdl })
    },
    [closeConfMdl, confMdl, setBulkDelete]
  )

  const fetchData = useCallback(
    ({ pageSize, pageIndex }) => {
      // eslint-disable-next-line no-plusplus
      if (refreshLog) {
        setRefreshLog(0)
        setIsLoading(true)
      }

      // eslint-disable-next-line no-plusplus
      const fetchId = ++fetchIdRef.current
      if (log.length < 1) {
        setIsLoading(true)
      }
      if (fetchId === fetchIdRef.current) {
        const startRow = pageSize * pageIndex
        bitsFetch(
          {
            id,
            offset: startRow,
            pageSize
          },
          'log/get'
        ).then(res => {
          if (res?.success) {
            setPageCount(Math.ceil(res.data.count / pageSize))
            setCountEntries(res.data.count)
            setLog(res.data.data)
          }
          setIsLoading(false)
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [delConfMdl, id, refreshLog]
  )
  return (
    <>
      <SnackMsg snack={snack} setSnackbar={setSnackbar} />
      <div className="flx">
        <div className="ml-2">
          <Link to={allIntegURL} className="btn btcd-btn-o-gray">
            <span className="btcd-icn icn-chevron-left" />
            &nbsp;{__('Back', 'bit-integrations')}
          </Link>
          <button
            onClick={() => setRefreshLog(1)}
            className="icn-btn ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh Log', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
        <div className="w-8 txt-center">
          <b className="f-lg">{type}</b>
          <div>{__('Integration Log', 'bit-integrations')}</div>
        </div>
      </div>

      <div className="forms">
        <Table
          className="f-table btcd-all-frm"
          height={500}
          columns={cols}
          data={log}
          loading={isLoading}
          countEntries={countEntries}
          rowSeletable
          resizable
          columnHidable
          setTableCols={setTableCols}
          setBulkDelete={setBulkDelete}
          fetchData={fetchData}
          pageCount={pageCount}
        />

        {!isLoading && log.length === 0 && (
          <div className="btcd-no-data txt-center">
            <img src={noData} alt="no data found" />
            <div className="mt-2 data-txt">{__('No Log Found.', 'bit-integrations')}</div>
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
          title={__('Response Preview', 'bit-integrations')}>
          <div className="resp-mdl">
            <div className="resp-mdl__meta">
              <span
                className={`resp-badge resp-badge--${
                  String(response.response_type).toLowerCase() === 'success' ? 'success' : 'error'
                }`}>
                <span className="resp-badge__dot" />
                {response.response_type || __('Unknown', 'bit-integrations')}
              </span>
              {recordTypeLabel(response.api_type) && (
                <span className="resp-mdl__chip">{recordTypeLabel(response.api_type)}</span>
              )}
              {response.created_at && <span className="resp-mdl__date">{response.created_at}</span>}
            </div>

            <div className="resp-mdl__code-wrp">
              <div className="resp-mdl__code-bar">
                <span className="resp-mdl__lang">JSON</span>
                <button
                  type="button"
                  className="resp-mdl__copy"
                  onClick={() => {
                    const text = jsonPrint(response.response_obj)
                    if (navigator.clipboard) navigator.clipboard.writeText(text)
                    setSnackbar({ show: true, msg: __('Copied on Clipboard.', 'bit-integrations') })
                  }}>
                  <CopyIcn size="13" />
                  {__('Copy', 'bit-integrations')}
                </button>
              </div>
              <pre className="resp-mdl__pre">
                {/* eslint-disable-next-line react/no-danger */}
                <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(response.response_obj) }} />
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default memo(Log)

const jsonPrint = data => {
  try {
    return JSON.stringify(JSON.parse(data), null, 2)
  } catch (e) {
    return data
  }
}

// Human-readable label for the record type column (stored as JSON string)
const recordTypeLabel = raw => {
  if (!raw) return ''
  try {
    const obj = JSON.parse(raw)
    return [obj.type, obj.type_name].filter(Boolean).join(' · ') || raw
  } catch (e) {
    return raw
  }
}

// Lightweight JSON syntax highlighter → HTML with token classes
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
