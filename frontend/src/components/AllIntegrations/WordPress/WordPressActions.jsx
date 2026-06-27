import { create } from 'mutative'
import { __ } from '../../../Utils/i18nwrap'
import TableCheckBox from '../../Utilities/TableCheckBox'

const appendOptionMeta = {
  addTaxonomyToPost: {
    title: __('Append Terms', 'bit-integrations'),
    subTitle: __('Append taxonomy terms instead of replacing existing terms.', 'bit-integrations')
  },
  addTagsToPost: {
    title: __('Append Tags', 'bit-integrations'),
    subTitle: __('Append tags instead of replacing existing tags on the post.', 'bit-integrations')
  },
  addCategoryToPost: {
    title: __('Append Categories', 'bit-integrations'),
    subTitle: __(
      'Append categories instead of replacing existing categories on the post.',
      'bit-integrations'
    )
  }
}

const registerPostTypeUtilityOptions = [
  {
    key: 'public',
    title: __('Public', 'bit-integrations'),
    subTitle: __('Make this post type publicly queryable.', 'bit-integrations')
  },
  {
    key: 'hierarchy',
    title: __('Hierarchical', 'bit-integrations'),
    subTitle: __('Enable hierarchical behavior for this post type.', 'bit-integrations')
  },
  {
    key: 'showUI',
    title: __('Show UI', 'bit-integrations'),
    subTitle: __('Show admin UI for managing this post type.', 'bit-integrations')
  },
  {
    key: 'showInMenu',
    title: __('Show In Menu', 'bit-integrations'),
    subTitle: __('Show this post type in the WordPress admin menu.', 'bit-integrations')
  },
  {
    key: 'showInNavMenu',
    title: __('Show In Nav Menu', 'bit-integrations'),
    subTitle: __('Allow this post type in navigation menu selection.', 'bit-integrations')
  },
  {
    key: 'showInAdminBar',
    title: __('Show In Admin Bar', 'bit-integrations'),
    subTitle: __('Show this post type in the WordPress admin bar.', 'bit-integrations')
  }
]

const registerTaxonomyUtilityOptions = [
  {
    key: 'public',
    title: __('Public', 'bit-integrations'),
    subTitle: __('Make this taxonomy publicly queryable.', 'bit-integrations')
  },
  {
    key: 'adminUI',
    title: __('Admin UI', 'bit-integrations'),
    subTitle: __('Show admin UI for managing this taxonomy.', 'bit-integrations')
  },
  {
    key: 'hierarchy',
    title: __('Hierarchical', 'bit-integrations'),
    subTitle: __('Enable hierarchical taxonomy behavior.', 'bit-integrations')
  },
  {
    key: 'restApi',
    title: __('Show In REST API', 'bit-integrations'),
    subTitle: __('Expose taxonomy in WordPress REST API.', 'bit-integrations')
  }
]

export default function WordPressActions({ wordPressConf, setWordPressConf }) {
  const mainAction = wordPressConf?.mainAction
  const appendMeta = appendOptionMeta[mainAction]
  const isRegisterPostTypeAction = mainAction === 'registerPostType'
  const isRegisterTaxonomyAction = mainAction === 'registerTaxonomy'
  const utilityOptions = isRegisterPostTypeAction
    ? registerPostTypeUtilityOptions
    : isRegisterTaxonomyAction
      ? registerTaxonomyUtilityOptions
      : []

  if (!appendMeta && mainAction !== 'deleteMedia' && utilityOptions.length === 0) {
    return null
  }

  const handleOptionChange = (event, type) => {
    setWordPressConf(prevConf =>
      create(prevConf, draftConf => {
        if (event.target.checked) {
          draftConf[type] = true
        } else {
          delete draftConf[type]
        }
      })
    )
  }

  return (
    <>
      <div className="mt-1">
        <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
      </div>
      <div className="btcd-hr mt-1" />
      <div className="pos-rel d-flx flx-wrp">
        {appendMeta && (
          <TableCheckBox
            checked={wordPressConf?.append || false}
            onChange={event => handleOptionChange(event, 'append')}
            className="wdt-200 mt-4 mr-2"
            value="append"
            title={appendMeta.title}
            subTitle={appendMeta.subTitle}
          />
        )}
        {mainAction === 'deleteMedia' && (
          <TableCheckBox
            checked={wordPressConf?.forceDelete || false}
            onChange={event => handleOptionChange(event, 'forceDelete')}
            className="wdt-200 mt-4 mr-2"
            value="forceDelete"
            title={__('Force Delete', 'bit-integrations')}
            subTitle={__('Permanently delete media instead of moving it to trash.', 'bit-integrations')}
          />
        )}
        {utilityOptions.map(utility => (
          <TableCheckBox
            key={utility.key}
            checked={wordPressConf?.[utility.key] || false}
            onChange={event => handleOptionChange(event, utility.key)}
            className="wdt-200 mt-4 mr-2"
            value={utility.key}
            title={utility.title}
            subTitle={utility.subTitle}
          />
        ))}
      </div>
    </>
  )
}
