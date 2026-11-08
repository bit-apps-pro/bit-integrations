import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField, refreshOptions } from './BitConnectCommonFunc'
import BitConnectFieldMap from './BitConnectFieldMap'
import {
  actsAsMember,
  CommentFields,
  CreatePostFields,
  groupRoleOptions,
  MemberEmailFields,
  modules,
  needsBadgeSelect,
  needsGroupSelect,
  needsRoleSelect,
  needsStatusSelect,
  needsTagSelect,
  needsTopicTypeSelect,
  PostIdFields,
  requiredGroupActions,
  VoteFields
} from './staticData'

const FIELD_SETS = {
  create_post: CreatePostFields,
  set_post_status: PostIdFields,
  vote_for_post: VoteFields,
  add_comment: CommentFields,
  award_badge: MemberEmailFields,
  add_member_to_group: MemberEmailFields,
  remove_member_from_group: MemberEmailFields
}

const OPTION_SELECTS = [
  {
    actions: needsTopicTypeSelect,
    key: 'selectedTopicType',
    listKey: 'allTopicTypes',
    label: __('Topic Type:', 'bit-integrations'),
    isRequired: () => false
  },
  {
    actions: needsStatusSelect,
    key: 'selectedStatus',
    listKey: 'allStatuses',
    label: __('Status:', 'bit-integrations'),
    isRequired: () => false
  },
  {
    actions: needsStatusSelect,
    key: 'selectedStage',
    listKey: 'allStages',
    label: __('Stage:', 'bit-integrations'),
    isRequired: () => false
  },
  {
    actions: needsBadgeSelect,
    key: 'selectedBadge',
    listKey: 'allBadges',
    label: __('Badge:', 'bit-integrations'),
    isRequired: () => true
  },
  {
    actions: needsGroupSelect,
    key: 'selectedGroup',
    listKey: 'allGroups',
    label: __('Group:', 'bit-integrations'),
    isRequired: action => requiredGroupActions.includes(action)
  },
  {
    actions: needsTagSelect,
    key: 'selectedTags',
    listKey: 'allTags',
    label: __('Tags:', 'bit-integrations'),
    isRequired: () => false,
    multiple: true
  }
]

export default function BitConnectIntegLayout({
  formFields,
  bitConnectConf,
  setBitConnectConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setField = (key, val) => {
    setBitConnectConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = val
      })
    )
  }

  const handleMainAction = value => {
    setBitConnectConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.bitConnectFields = FIELD_SETS[value] || []
        draftConf.field_map = generateMappedField(draftConf.bitConnectFields)

        if (needsRoleSelect.includes(value) && !draftConf.selectedRole) {
          draftConf.selectedRole = 'member'
        }
      })
    )

    if (OPTION_SELECTS.some(select => select.actions.includes(value))) {
      refreshOptions(setBitConnectConf, setIsLoading)
    }
  }

  const { mainAction } = bitConnectConf || {}
  const visibleSelects = OPTION_SELECTS.filter(select => select.actions.includes(mainAction))
  const hasOptionalFields = (bitConnectConf?.bitConnectFields || []).some(field => !field.required)

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={mainAction ?? null}
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

      {visibleSelects.map(select => {
        const options = (bitConnectConf?.[select.listKey] || []).map(item => ({
          label: item.label,
          value: String(item.value)
        }))

        return (
          <div key={select.key}>
            <br />
            <div className="flx">
              <b className="wdt-200 d-in-b">
                {select.label}
                {select.isRequired(mainAction) && <span className="required-icn">*</span>}
              </b>
              <MultiSelect
                key={`${select.key}-${options.length}`}
                title={select.key}
                defaultValue={bitConnectConf?.[select.key] ?? null}
                className="btcd-paper-drpdwn w-5"
                options={options}
                onChange={val => setField(select.key, val)}
                singleSelect={!select.multiple}
                closeOnSelect={!select.multiple}
              />
              <button
                onClick={() => refreshOptions(setBitConnectConf, setIsLoading)}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
                type="button"
                disabled={isLoading}>
                &#x21BB;
              </button>
            </div>
          </div>
        )
      })}

      {needsRoleSelect.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">
              {__('Group Role:', 'bit-integrations')}
              <span className="required-icn">*</span>
            </b>
            <MultiSelect
              title="selectedRole"
              defaultValue={bitConnectConf?.selectedRole ?? 'member'}
              className="btcd-paper-drpdwn w-5"
              options={groupRoleOptions}
              onChange={val => setField('selectedRole', val || 'member')}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

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

      {mainAction && bitConnectConf?.bitConnectFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Bit Connect Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {bitConnectConf?.field_map?.map((itm, i) => (
            <BitConnectFieldMap
              key={`bit-connect-m-${i + 9}`}
              i={i}
              field={itm}
              formFields={formFields}
              bitConnectConf={bitConnectConf}
              setBitConnectConf={setBitConnectConf}
            />
          ))}
          {hasOptionalFields && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(bitConnectConf.field_map.length, bitConnectConf, setBitConnectConf)
                }
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          )}
          <br />
        </div>
      )}

      {mainAction && (
        <Note
          note={`${__('This action needs Bit Connect Pro with an active licence.', 'bit-integrations')}${
            actsAsMember.includes(mainAction)
              ? ` ${__('Bit Connect acts with the rights of the mapped member, admins included. Map only emails that you trust.', 'bit-integrations')}`
              : ''
          }`}
        />
      )}
    </>
  )
}
