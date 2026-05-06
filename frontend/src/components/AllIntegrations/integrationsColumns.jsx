/* eslint-disable react/no-unstable-nested-components */
import MenuBtn from '../Utilities/MenuBtn'
import SingleToggle2 from '../Utilities/SingleToggle2'
import { __ } from '../../Utils/i18nwrap'

export const initialIntegrationsCols = [
  {
    width: 250,
    minWidth: 80,
    Header: __('Trigger', 'bit-integrations'),
    accessor: 'triggered_entity'
  },
  { width: 250, minWidth: 80, Header: __('Action Name', 'bit-integrations'), accessor: 'name' },
  {
    width: 200,
    minWidth: 200,
    Header: __('Created At', 'bit-integrations'),
    accessor: 'created_at'
  }
]

const TagsCell = ({
  value,
  tags,
  integrationTags,
  isCompactTagColumn,
  onRemoveTag,
  onOpenTagPicker
}) => {
  const integrationId = String(value.row.original.id)
  const assignedTagIds = integrationTags[integrationId] || []
  const assignedTags = assignedTagIds
    .map(tagId => tags.find(currentTag => String(currentTag.id) === String(tagId)))
    .filter(Boolean)
  const visibleAssignedTags = assignedTags.slice(0, isCompactTagColumn ? 1 : 2)
  const hiddenAssignedTagsCount = Math.max(assignedTags.length - visibleAssignedTags.length, 0)

  return (
    <div className="table-tags-container">
      {visibleAssignedTags.map(tag => (
        <span key={`${integrationId}-${tag.id}`} className="table-tag-badge" title={tag.name}>
          <span className="table-tag-badge-label">{tag.name}</span>
          <button
            type="button"
            className="table-tag-remove-btn"
            onClick={e => {
              e.stopPropagation()
              onRemoveTag(integrationId, tag.id)
            }}
            title={__('Remove tag', 'bit-integrations')}>
            <span className="btcd-icn icn-clear" />
          </button>
        </span>
      ))}
      {hiddenAssignedTagsCount > 0 && (
        <span className="table-tag-more-badge" title={__('More tags', 'bit-integrations')}>
          +{hiddenAssignedTagsCount}
        </span>
      )}
      <button
        type="button"
        onClick={() => {
          const assignedTagNames = assignedTagIds
            .map(tagId => tags.find(currentTag => String(currentTag.id) === String(tagId))?.name)
            .filter(Boolean)
          onOpenTagPicker(value.row.original.id, assignedTagNames.join(','))
        }}
        className="table-tag-add-btn"
        title={__('Manage tags', 'bit-integrations')}>
        +
      </button>
    </div>
  )
}

export const buildIntegrationsColumns = ({
  prevCols,
  isCompactTagColumn,
  tags,
  integrationTags,
  isValidUser,
  onRemoveTag,
  onOpenTagPicker,
  onToggleStatus,
  onShowDelModal,
  onShowDupMdl
}) => {
  const ncols = (prevCols || initialIntegrationsCols).filter(
    itm => itm.accessor !== 't_action' && itm.accessor !== 'status' && itm.accessor !== 'tags'
  )

  ncols.push({
    width: isCompactTagColumn ? 170 : 220,
    minWidth: isCompactTagColumn ? 140 : 180,
    Header: __('Tags', 'bit-integrations'),
    accessor: 'tags',
    className: 'table-tags-cell',
    Cell: value => (
      <TagsCell
        value={value}
        tags={tags}
        integrationTags={integrationTags}
        isCompactTagColumn={isCompactTagColumn}
        onRemoveTag={onRemoveTag}
        onOpenTagPicker={onOpenTagPicker}
      />
    )
  })

  ncols.push({
    width: 70,
    minWidth: 60,
    Header: __('Status', 'bit-integrations'),
    accessor: 'status',
    Cell: value => (
      <SingleToggle2
        className="flx"
        action={e => onToggleStatus(e, value.row.original.id)}
        checked={Number(value.row.original.status) === 1}
      />
    )
  })

  ncols.push({
    sticky: 'right',
    width: 64,
    minWidth: 52,
    Header: '',
    accessor: 't_action',
    Cell: val => (
      <div className="table-actions-cell">
        <MenuBtn
          isValidUser={isValidUser}
          id={val.row.original.id}
          name={val.row.original.name}
          index={val.row.id}
          del={() => onShowDelModal(val.row.original.id, val.row.index)}
          dup={() => onShowDupMdl(val.row.original.id, val.row.index)}
        />
      </div>
    )
  })

  return ncols
}
