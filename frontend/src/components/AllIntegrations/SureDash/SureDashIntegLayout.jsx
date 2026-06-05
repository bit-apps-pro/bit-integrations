import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  generateMappedField,
  refreshSureDashPosts,
  refreshSureDashSpaces
} from './SureDashCommonFunc'
import SureDashFieldMap from './SureDashFieldMap'
import {
  BookmarkItemFields,
  CreateCommentFields,
  CreatePostFields,
  DeleteCommentFields,
  DeletePostFields,
  modules,
  ReactToEntityFields,
  UpdateUserProfileFields
} from './staticData'

export default function SureDashIntegLayout({
  formID,
  formFields,
  sureDashConf,
  setSureDashConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setSureDashConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.selectedSpaceId = ''
        draftConf.selectedPostId = ''

        switch (value) {
          case 'create_post':
            draftConf.sureDashFields = CreatePostFields
            break
          case 'delete_post':
            draftConf.sureDashFields = DeletePostFields
            break
          case 'create_comment':
            draftConf.sureDashFields = CreateCommentFields
            break
          case 'delete_comment':
            draftConf.sureDashFields = DeleteCommentFields
            break
          case 'update_user_profile':
            draftConf.sureDashFields = UpdateUserProfileFields
            break
          case 'bookmark_item':
            draftConf.sureDashFields = BookmarkItemFields
            break
          case 'react_to_entity':
            draftConf.sureDashFields = ReactToEntityFields
            break
          default:
            draftConf.sureDashFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.sureDashFields)
      })
    )

    if (value === 'create_post') {
      refreshSureDashSpaces(setSureDashConf, setIsLoading)
    }

    if (value === 'create_comment') {
      refreshSureDashPosts(setSureDashConf, setIsLoading)
    }
  }

  const handleSelectSpace = value => {
    setSureDashConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.selectedSpaceId = value
      })
    )
  }

  const handleSelectPost = value => {
    setSureDashConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.selectedPostId = value
      })
    )
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={sureDashConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: !checkIsPro(isPro, action.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {sureDashConf?.mainAction === 'create_post' && (
        <div className="flx mt-3">
          <b className="wdt-200 d-in-b">{__('Space:', 'bit-integrations')}</b>
          <div className="flx flx-center">
            <MultiSelect
              defaultValue={sureDashConf?.selectedSpaceId ?? null}
              style={{ minWidth: '440px' }}
              onChange={handleSelectSpace}
              options={sureDashConf?.allSpaces?.map(s => ({ label: s.label, value: String(s.value) })) || []}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshSureDashSpaces(setSureDashConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Spaces', 'bit-integrations')}'` }}
              type="button">
              &#x21BB;
            </button>
          </div>
        </div>
      )}

      {sureDashConf?.mainAction === 'create_comment' && (
        <div className="flx mt-3">
          <b className="wdt-200 d-in-b">{__('Post:', 'bit-integrations')}</b>
          <div className="flx flx-center">
            <MultiSelect
              defaultValue={sureDashConf?.selectedPostId ?? null}
              style={{ minWidth: '440px' }}
              onChange={handleSelectPost}
              options={sureDashConf?.allPosts?.map(p => ({ label: p.label, value: String(p.value) })) || []}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshSureDashPosts(setSureDashConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Posts', 'bit-integrations')}'` }}
              type="button">
              &#x21BB;
            </button>
          </div>
        </div>
      )}

      {sureDashConf?.mainAction && sureDashConf.sureDashFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('SureDash Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {sureDashConf?.field_map?.map((itm, i) => (
            <SureDashFieldMap
              key={`suredash-m-${i + 9}`}
              i={i}
              field={itm}
              sureDashConf={sureDashConf}
              formFields={formFields}
              setSureDashConf={setSureDashConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(sureDashConf.field_map.length, sureDashConf, setSureDashConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}
    </>
  )
}
