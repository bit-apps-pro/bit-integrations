import { Scrollbars } from 'react-custom-scrollbars'
import TableLoader2 from '../../Loaders/TableLoader2'

function TableContent({
  className,
  height,
  rowClickable,
  onRowClick,
  resizable,
  loading,
  getTableProps,
  headerGroups,
  getTableBodyProps,
  page,
  prepareRow,
  fetchData,
  queryState
}) {
  const handleRowCellClick = (e, row, cell) => {
    if (!rowClickable || typeof cell.column.Header !== 'string' || typeof onRowClick !== 'function') {
      return
    }

    onRowClick(e, row.cells, cell.row.index, {
      fetchData,
      data: queryState
    })
  }

  return (
    <div className="mt-2">
      <Scrollbars className="btcd-scroll" style={{ height }}>
        <div {...getTableProps()} className={`${className} ${rowClickable && 'rowClickable'}`}>
          <div className="thead">
            {headerGroups.map((headerGroup, i) => (
              <div key={`t-th-${i + 8}`} className="tr" {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <div key={column.id} className="th flx" {...column.getHeaderProps()}>
                    <div {...(column.id !== 't_action' && column.getSortByToggleProps())}>
                      {column.render('Header')}{' '}
                      {column.id !== 't_action' && column.id !== 'selection' && column.canSort && (
                        <span>
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              String.fromCharCode(9662)
                            ) : (
                              String.fromCharCode(9652)
                            )
                          ) : (
                            <span
                              className="btcd-icn icn-sort"
                              style={{ fontSize: 10, marginLeft: 5 }}
                            />
                          )}
                        </span>
                      )}
                    </div>
                    {resizable && (
                      <div
                        {...column.getResizerProps()}
                        className={`btcd-t-resizer ${column.isResizing ? 'isResizing' : ''}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {loading ? (
            <TableLoader2 />
          ) : (
            <div className="tbody" {...getTableBodyProps()}>
              {page.map(row => {
                prepareRow(row)
                return (
                  <div
                    key={`t-r-${row.index}`}
                    className={`tr ${row.isSelected ? 'btcd-row-selected' : ''}`}
                    {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <div
                        key={`t-d-${cell.row.index}`}
                        className={`td flx ${cell.column.className || ''}`}
                        {...cell.getCellProps()}
                        onClick={e => handleRowCellClick(e, row, cell)}
                        onKeyPress={e => handleRowCellClick(e, row, cell)}
                        role="button"
                        tabIndex={0}
                        aria-label="cell">
                        {cell.render('Cell')}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Scrollbars>
    </div>
  )
}

export default TableContent
