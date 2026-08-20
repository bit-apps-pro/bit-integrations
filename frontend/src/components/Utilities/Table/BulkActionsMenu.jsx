import TrashIcn from '../../../Icons/TrashIcn'
import { __ } from '../../../Utils/i18nwrap'

function VerticalDotsIcn({ size = 16 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ pointerEvents: 'none' }}>
      <circle cx="12" cy="5" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="19" r="2" fill="currentColor" />
    </svg>
  )
}

function TagAssignIcn({ size = 15 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ pointerEvents: 'none' }}>
      <path
        className="svg-icn"
        d="M3.5 12.5L12.5 3.5h6l2 2v6l-9 9a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8z"
      />
      <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    </svg>
  )
}

function BulkActionsMenu({
  bulkMenuRef,
  isOpen,
  onToggle,
  onClose,
  selectedCount,
  onBulkTagAssign,
  onBulkDelete,
  onBulkStatus,
  onBulkDuplicate,
  tagAssignLabel,
  deleteLabel
}) {
  const runAction = action => {
    action()
    onClose()
  }

  return (
    <div className="btcd-bulk-top btcd-bulk-top-right">
      <small className="btcd-bulk-selected">
        {selectedCount} {__('selected', 'bit-integrations')}
      </small>
      <div className="btcd-bulk-menu" ref={bulkMenuRef}>
        <button
          type="button"
          className="icn-btn btcd-bulk-menu-btn"
          aria-label={__('Bulk actions', 'bit-integrations')}
          onClick={onToggle}>
          <VerticalDotsIcn size={16} />
        </button>

        <div
          className={`btcd-bulk-menu-list ${isOpen ? 'btcd-bulk-menu-list-open' : ''}`}
          aria-hidden={!isOpen}>
          {onBulkTagAssign && (
            <button
              type="button"
              onClick={() => {
                runAction(onBulkTagAssign)
              }}>
              <span className="btcd-bulk-menu-item-icon">
                <TagAssignIcn size={14} />
              </span>
              <span>{tagAssignLabel || __('Bulk Tag Assign', 'bit-integrations')}</span>
            </button>
          )}

          {onBulkDelete && (
            <button
              type="button"
              onClick={() => {
                runAction(onBulkDelete)
              }}>
              <span className="btcd-bulk-menu-item-icon">
                <TrashIcn size={14} />
              </span>
              <span>{deleteLabel || __('Delete', 'bit-integrations')}</span>
            </button>
          )}

          {onBulkStatus && (
            <button
              type="button"
              onClick={() => {
                runAction(onBulkStatus)
              }}>
              <span className="btcd-bulk-menu-item-icon">
                <span className="btcd-icn icn-toggle_off" />
              </span>
              <span>{__('Change Status', 'bit-integrations')}</span>
            </button>
          )}

          {onBulkDuplicate && (
            <button
              type="button"
              onClick={() => {
                runAction(onBulkDuplicate)
              }}>
              <span className="btcd-bulk-menu-item-icon">
                <span className="btcd-icn icn-file_copy" />
              </span>
              <span>{__('Clone', 'bit-integrations')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BulkActionsMenu
