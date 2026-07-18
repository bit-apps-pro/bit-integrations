import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import FluentPlayerActions from './FluentPlayerActions'
import {
  generateMappedField,
  refreshFluentPlayerAttachments,
  refreshFluentPlayerMedia,
  refreshFluentPlayerPlaylists,
  refreshFluentPlayerPresets,
  refreshFluentPlayerTags,
  refreshFluentPlayerUsers
} from './FluentPlayerCommonFunc'
import FluentPlayerFieldMap from './FluentPlayerFieldMap'
import {
  FluentPlayerStaticData,
  hasUtilities,
  modules,
  needsAttachment,
  needsMedia,
  needsMultipleMedia,
  needsPlaylist,
  needsPostStatus,
  needsPreset,
  needsProvider,
  needsSingleTag,
  needsTags,
  needsUser,
  postStatusOptions,
  providerOptions
} from './staticData'

export default function FluentPlayerIntegLayout({
  formFields,
  fluentPlayerConf,
  setFluentPlayerConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const action = fluentPlayerConf?.mainAction

  const setField = (key, value) =>
    setFluentPlayerConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )

  const handleMainAction = value => {
    setFluentPlayerConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.fluentPlayerFields = FluentPlayerStaticData[value] || []
        draftConf.field_map = generateMappedField(draftConf.fluentPlayerFields)
      })
    )

    if (needsMedia.includes(value)) refreshFluentPlayerMedia(setFluentPlayerConf, setIsLoading)
    if (needsPlaylist.includes(value)) refreshFluentPlayerPlaylists(setFluentPlayerConf, setIsLoading)
    if (needsPreset.includes(value)) refreshFluentPlayerPresets(setFluentPlayerConf, setIsLoading)
    if (needsTags.includes(value) || needsSingleTag.includes(value)) {
      refreshFluentPlayerTags(setFluentPlayerConf, setIsLoading)
    }
    if (needsUser.includes(value)) refreshFluentPlayerUsers(setFluentPlayerConf, setIsLoading)
    if (needsAttachment.includes(value)) refreshFluentPlayerAttachments(setFluentPlayerConf, setIsLoading)
  }

  // Static option select — no fetch, no refresh button.
  const renderOptionSelect = (label, confKey, options, multiple = false) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={confKey}
          defaultValue={fluentPlayerConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={options}
          onChange={val => setField(confKey, val)}
          singleSelect={!multiple}
          closeOnSelect={!multiple}
        />
      </div>
    </>
  )

  // Fetched record select — options come from conf[listKey] with a refresh button.
  const renderFetchedSelect = (label, confKey, listKey, onRefresh, multiple = false) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={confKey}
          defaultValue={fluentPlayerConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={(Array.isArray(fluentPlayerConf?.[listKey]) ? fluentPlayerConf[listKey] : []).map(
            item => ({ label: item.label, value: item.value?.toString() })
          )}
          onChange={val => setField(confKey, val)}
          singleSelect={!multiple}
          closeOnSelect={!multiple}
        />
        <button
          onClick={() => onRefresh(setFluentPlayerConf, setIsLoading)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
          type="button"
          disabled={isLoading}>
          &#x21BB;
        </button>
      </div>
    </>
  )

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={action ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(a => ({
            label: checkIsPro(isPro, a.is_pro) ? a.label : getProLabel(a.label),
            value: a.name,
            disabled: !checkIsPro(isPro, a.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {needsMedia.includes(action) &&
        renderFetchedSelect(
          needsMultipleMedia.includes(action)
            ? __('Media Items:', 'bit-integrations')
            : __('Media:', 'bit-integrations'),
          'selectedMedia',
          'allMedia',
          refreshFluentPlayerMedia,
          needsMultipleMedia.includes(action)
        )}

      {needsPlaylist.includes(action) &&
        renderFetchedSelect(
          __('Playlist:', 'bit-integrations'),
          'selectedPlaylist',
          'allPlaylists',
          refreshFluentPlayerPlaylists
        )}

      {needsPreset.includes(action) &&
        renderFetchedSelect(
          __('Preset:', 'bit-integrations'),
          'selectedPreset',
          'allPresets',
          refreshFluentPlayerPresets
        )}

      {needsSingleTag.includes(action) &&
        renderFetchedSelect(
          __('Tag:', 'bit-integrations'),
          'selectedTag',
          'allTags',
          refreshFluentPlayerTags
        )}

      {needsTags.includes(action) &&
        renderFetchedSelect(
          __('Tags:', 'bit-integrations'),
          'selectedTags',
          'allTags',
          refreshFluentPlayerTags,
          true
        )}

      {needsUser.includes(action) &&
        renderFetchedSelect(
          __('User:', 'bit-integrations'),
          'selectedUser',
          'allUsers',
          refreshFluentPlayerUsers
        )}

      {needsAttachment.includes(action) &&
        renderFetchedSelect(
          __('Attachment:', 'bit-integrations'),
          'selectedAttachment',
          'allAttachments',
          refreshFluentPlayerAttachments
        )}

      {needsProvider.includes(action) &&
        renderOptionSelect(__('Provider:', 'bit-integrations'), 'provider', providerOptions)}

      {needsPostStatus.includes(action) &&
        renderOptionSelect(__('Status:', 'bit-integrations'), 'postStatus', postStatusOptions)}

      {isLoading && (
        <Loader
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            transform: 'scale(0.7)'
          }}
        />
      )}

      {action && fluentPlayerConf.fluentPlayerFields?.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('FluentPlayer Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {fluentPlayerConf?.field_map?.map((itm, i) => (
            <FluentPlayerFieldMap
              key={`fp-m-${i + 9}`}
              i={i}
              field={itm}
              fluentPlayerConf={fluentPlayerConf}
              formFields={formFields}
              setFluentPlayerConf={setFluentPlayerConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(fluentPlayerConf.field_map.length, fluentPlayerConf, setFluentPlayerConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {hasUtilities.includes(action) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <FluentPlayerActions
            fluentPlayerConf={fluentPlayerConf}
            setFluentPlayerConf={setFluentPlayerConf}
            formFields={formFields}
            setSnackbar={setSnackbar}
          />
        </div>
      )}
    </>
  )
}
