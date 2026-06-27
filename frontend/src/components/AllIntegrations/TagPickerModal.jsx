import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { __ } from '../../Utils/i18nwrap'

function TagPickerModal({
  show,
  onClose,
  bulkTagIntegrationIds,
  editingIntegrationId,
  tagPickerInput,
  tagPickerOptions,
  onTagPickerInputChange,
  onSubmit,
  primaryBtnLabel
}) {
  if (!show) {
    return null
  }

  return (
    <div className="tag-modal-overlay" onClick={onClose}>
      <div className="tag-modal-content tag-picker-modal-content" onClick={e => e.stopPropagation()}>
        <div className="tag-picker-header">
          <h4 className="tag-modal-title">
            {bulkTagIntegrationIds.length > 0
              ? __('Bulk Assign Tags', 'bit-integrations')
              : editingIntegrationId
                ? __('Assign Tags', 'bit-integrations')
                : __('Create Tags', 'bit-integrations')}
          </h4>
          <p className="tag-picker-subtitle">
            {bulkTagIntegrationIds.length > 0
              ? __(
                  'Search existing tags or create new tags, then assign them to all selected integrations.',
                  'bit-integrations'
                )
              : editingIntegrationId
                ? __(
                    'Search existing tags or create new tags, then save assignment.',
                    'bit-integrations'
                  )
                : __('Search existing tags or create new ones for filtering.', 'bit-integrations')}
          </p>
        </div>

        <div className="tag-picker-field-wrap">
          <label className="tag-modal-label">{__('Tags', 'bit-integrations')}</label>
          <MultiSelect
            className="tag-picker-multiselect msl-wrp-options w-10"
            defaultValue={tagPickerInput}
            options={tagPickerOptions}
            onChange={value => {
              onTagPickerInputChange(Array.isArray(value) ? value.join(',') : value || '')
            }}
            placeholder={__('Search or create new tag', 'bit-integrations')}
            customValue
            closeOnSelect={false}
          />
          <p className="tag-picker-counter">
            {bulkTagIntegrationIds.length > 0
              ? __(
                  'Tip: selected tags will be added to all selected integrations (20 characters max).',
                  'bit-integrations'
                )
              : __('Tip: press Enter to create a new tag (20 characters max).', 'bit-integrations')}
          </p>
        </div>

        <div className="tag-modal-actions tag-picker-actions">
          <button type="button" onClick={onClose} className="tag-modal-btn-cancel tag-picker-btn-cancel">
            {__('Cancel', 'bit-integrations')}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="tag-modal-btn-create tag-picker-btn-primary">
            {primaryBtnLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TagPickerModal
