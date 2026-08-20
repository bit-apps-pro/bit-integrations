/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-props-no-spreading */

import { memo, useEffect, useRef, useState } from 'react'
import {
  useColumnOrder,
  useFilters,
  useFlexLayout,
  useGlobalFilter,
  usePagination,
  useResizeColumns,
  useRowSelect,
  useSortBy,
  useTable
} from 'react-table'
import { useSticky } from 'react-table-sticky'
import { __ } from '../../Utils/i18nwrap'
import ConfirmModal from './ConfirmModal'
import BulkActionsMenu from './Table/BulkActionsMenu'
import ColumnHide from './Table/ColumnHide'
import GlobalFilter from './Table/GlobalFilter'
import IndeterminateCheckbox from './Table/IndeterminateCheckbox'
import TableContent from './Table/TableContent'
import TablePagination from './Table/TablePagination'

function Table(props) {
  const [confMdl, setconfMdl] = useState({ show: false, btnTxt: '' })
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false)
  const bulkMenuRef = useRef(null)

  const { columns, data, fetchData } = props

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    allColumns,
    setGlobalFilter,
    state: { pageIndex, pageSize, sortBy, filters, globalFilter }
  } = useTable(
    {
      debug: true,
      fetchData,
      columns,
      data,
      manualPagination: typeof props.pageCount !== 'undefined',
      pageCount: props?.pageCount || Math.ceil(data?.length / 10),
      autoResetPage: false,
      autoResetHiddenColumns: false,
      autoResetSortBy: false,
      autoResetFilters: false,
      autoResetGlobalFilter: false
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useSticky,
    useColumnOrder,
    useFlexLayout,
    props.resizable ? useResizeColumns : '',
    props.rowSeletable ? useRowSelect : '',
    props.rowSeletable
      ? hooks => {
          hooks.allColumns.push(cols => [
            {
              id: 'selection',
              width: 50,
              maxWidth: 50,
              minWidth: 67,
              sticky: 'left',
              Header: ({ getToggleAllRowsSelectedProps }) => (
                <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
              ),
              Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            },
            ...cols
          ])
        }
      : ''
  )

  const [search, setSearch] = useState(globalFilter)

  const hasSelectedRows = props.rowSeletable && selectedFlatRows.length > 0
  const hasBulkMenuActions =
    'setBulkStatus' in props ||
    'duplicateData' in props ||
    'setBulkTagAssign' in props ||
    'setBulkDelete' in props

  const queryState = { pageIndex, pageSize, sortBy, filters, globalFilter }
  const bulkQueryState = { ...queryState, globalFilter: search }

  useEffect(() => {
    if (fetchData) {
      fetchData({ pageIndex, pageSize })
    }
  }, [fetchData, pageIndex, pageSize])

  useEffect(() => {
    if (!isBulkMenuOpen) {
      return undefined
    }

    const handleClickOutside = e => {
      if (bulkMenuRef.current && !bulkMenuRef.current.contains(e.target)) {
        setIsBulkMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside, true)

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [isBulkMenuOpen])

  useEffect(() => {
    if (!hasSelectedRows && isBulkMenuOpen) {
      setIsBulkMenuOpen(false)
    }
  }, [hasSelectedRows, isBulkMenuOpen])

  useEffect(() => {
    if (pageIndex > pageCount) {
      gotoPage(0)
    }
  }, [gotoPage, pageCount, pageIndex])

  const closeConfMdl = () => {
    confMdl.show = false
    setconfMdl({ ...confMdl })
  }

  const showBulkDupMdl = () => {
    confMdl.action = () => {
      props.duplicateData(selectedFlatRows, data, {
        fetchData,
        data: bulkQueryState
      })
      closeConfMdl()
    }
    confMdl.btnTxt = __('Clone', 'bit-integrations')
    confMdl.btn2Txt = null
    confMdl.btnClass = 'purple'
    confMdl.body = `${__('Do You want Deplicate these', 'bit-integrations')} ${
      selectedFlatRows.length
    } ${__('item', 'bit-integrations')} ?`
    confMdl.show = true
    setconfMdl({ ...confMdl })
  }

  const showStModal = () => {
    confMdl.action = e => {
      props.setBulkStatus(e, selectedFlatRows)
      closeConfMdl()
    }
    confMdl.btn2Action = e => {
      props.setBulkStatus(e, selectedFlatRows)
      closeConfMdl()
    }
    confMdl.btnTxt = __('Disable', 'bit-integrations')
    confMdl.btn2Txt = __('Enable', 'bit-integrations')
    confMdl.body = `${__('Do you want to change these', 'bit-integrations')} ${
      selectedFlatRows.length
    } ${__('status', 'bit-integrations')} ?`
    confMdl.show = true
    setconfMdl({ ...confMdl })
  }

  const showDelModal = () => {
    confMdl.action = () => {
      props.setBulkDelete(selectedFlatRows, {
        fetchData,
        data: bulkQueryState
      })
      closeConfMdl()
    }
    confMdl.btnTxt = __('Delete', 'bit-integrations')
    confMdl.btn2Txt = null
    confMdl.btnClass = ''
    confMdl.body = `${__('Are you sure to delete these', 'bit-integrations')} ${
      selectedFlatRows.length
    } ${__('items', 'bit-integrations')} ?`
    confMdl.show = true
    setconfMdl({ ...confMdl })
  }

  const showBulkTagAssignModal = () => {
    props.setBulkTagAssign(selectedFlatRows, {
      fetchData,
      data: bulkQueryState
    })
  }

  return (
    <>
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

      <div className="btcd-table-top">
        <div className="btcd-t-actions">{props.topLeftContent || <div />}</div>

        <div className="btcd-t-controls">
          {hasSelectedRows && hasBulkMenuActions && (
            <BulkActionsMenu
              bulkMenuRef={bulkMenuRef}
              isOpen={isBulkMenuOpen}
              onToggle={() => setIsBulkMenuOpen(oldState => !oldState)}
              onClose={() => setIsBulkMenuOpen(false)}
              selectedCount={selectedFlatRows.length}
              onBulkTagAssign={'setBulkTagAssign' in props ? showBulkTagAssignModal : null}
              onBulkDelete={'setBulkDelete' in props ? showDelModal : null}
              onBulkStatus={'setBulkStatus' in props ? showStModal : null}
              onBulkDuplicate={'duplicateData' in props ? showBulkDupMdl : null}
              tagAssignLabel={props.bulkTagAssignLabel}
              deleteLabel={props.bulkDeleteLabel}
            />
          )}

          {props.search && (
            <GlobalFilter
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              setSearch={setSearch}
              placeholder={props.searchPlaceholder}
            />
          )}

          {props.topRightContent || null}

          {props.columnHidable && (
            <ColumnHide
              cols={props.columns}
              setCols={props.setTableCols}
              tableCol={columns}
              tableAllCols={allColumns}
            />
          )}
        </div>
      </div>

      <TableContent
        className={props.className}
        height={props.height}
        rowClickable={props.rowClickable}
        onRowClick={props.onRowClick}
        resizable={props.resizable}
        loading={props.loading}
        getTableProps={getTableProps}
        headerGroups={headerGroups}
        getTableBodyProps={getTableBodyProps}
        page={page}
        prepareRow={prepareRow}
        fetchData={fetchData}
        queryState={queryState}
      />

      <TablePagination
        countEntries={props.countEntries}
        gotoPage={gotoPage}
        canPreviousPage={canPreviousPage}
        previousPage={previousPage}
        nextPage={nextPage}
        canNextPage={canNextPage}
        pageCount={pageCount}
        pageIndex={pageIndex}
        pageOptions={pageOptions}
        pageSize={pageSize}
        setPageSize={setPageSize}
        getPageSize={props.getPageSize}
      />
    </>
  )
}

export default memo(Table)
