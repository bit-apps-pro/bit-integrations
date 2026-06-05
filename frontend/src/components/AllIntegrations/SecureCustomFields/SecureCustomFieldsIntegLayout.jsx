import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import Note from '../../Utilities/Note'
import TagifyInput from '../../Utilities/TagifyInput'
import { generateMappedField } from './SecureCustomFieldsCommonFunc'
import SecureCustomFieldsFieldMap from './SecureCustomFieldsFieldMap'
import SecureCustomFieldsSubFieldMap from './SecureCustomFieldsSubFieldMap'
import {
  dynamicActions,
  emptySubFieldMap,
  modules,
  OptionFields,
  PostFields,
  UserFields
} from './staticData'

export default function SecureCustomFieldsIntegLayout({
  formFields,
  secureCustomFieldsConf,
  setSecureCustomFieldsConf
}) {
  const { isPro } = useRecoilValue($appConfigState)

  const mainAction = secureCustomFieldsConf?.mainAction
  const isDynamic = dynamicActions.includes(mainAction)
  const isRepeater = mainAction === 'update_repeater_field_value'
  const nameKey = mainAction === 'update_group_field_value' ? 'groupName' : 'repeaterName'
  const nameLabel = isRepeater
    ? __('Repeater Field Name:', 'bit-integrations')
    : __('Group Field Name:', 'bit-integrations')

  const handleMainAction = value => {
    setSecureCustomFieldsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        if (dynamicActions.includes(value)) {
          draftConf.secureCustomFieldsFields = []
          draftConf.field_map = emptySubFieldMap()
          draftConf.postId = ''
          draftConf.groupName = ''
          draftConf.repeaterName = ''

          return
        }

        switch (value) {
          case 'update_post_acf_value':
            draftConf.secureCustomFieldsFields = PostFields
            break
          case 'update_user_acf_value':
            draftConf.secureCustomFieldsFields = UserFields
            break
          case 'update_option_acf_value':
            draftConf.secureCustomFieldsFields = OptionFields
            break
          default:
            draftConf.secureCustomFieldsFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.secureCustomFieldsFields)
      })
    )
  }

  const handleConfValue = (key, val) => {
    setSecureCustomFieldsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = val?.target?.value ?? val
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
          defaultValue={secureCustomFieldsConf?.mainAction ?? null}
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

      {!isDynamic && mainAction && secureCustomFieldsConf.secureCustomFieldsFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Secure Custom Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {secureCustomFieldsConf?.field_map?.map((itm, i) => (
            <SecureCustomFieldsFieldMap
              key={`scf-m-${i + 9}`}
              i={i}
              field={itm}
              secureCustomFieldsConf={secureCustomFieldsConf}
              formFields={formFields}
              setSecureCustomFieldsConf={setSecureCustomFieldsConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(
                  secureCustomFieldsConf.field_map.length,
                  secureCustomFieldsConf,
                  setSecureCustomFieldsConf
                )
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {isDynamic && (
        <div className="mt-4">
          <div className="flx mt-3">
            <b className="wdt-200 d-in-b">{__('Post ID:', 'bit-integrations')}</b>
            <TagifyInput
              key={`scf-postid-${mainAction}`}
              onChange={val => handleConfValue('postId', val)}
              label={__('Post ID', 'bit-integrations')}
              className="w-5"
              type="text"
              value={secureCustomFieldsConf?.postId || ''}
              placeholder={__('Post ID...', 'bit-integrations')}
              formFields={formFields}
            />
          </div>

          <div className="flx mt-3">
            <b className="wdt-200 d-in-b">{nameLabel}</b>
            <TagifyInput
              key={`scf-name-${mainAction}`}
              onChange={val => handleConfValue(nameKey, val)}
              label={nameLabel}
              className="w-5"
              type="text"
              value={secureCustomFieldsConf?.[nameKey] || ''}
              placeholder={__('Field name or key...', 'bit-integrations')}
              formFields={formFields}
            />
          </div>

          <div className="mt-4">
            <b className="wdt-100">{__('Map Sub-Fields', 'bit-integrations')}</b>
            <div className="btcd-hr mt-1" />
            <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
              <div className="txt-dp" style={{ padding: "0 100px" }}>
                <b>{__('Form Field', 'bit-integrations')}</b>
              </div>
              <div className="txt-dp" style={{ padding: "0 50px" }}>
                <b>{__('Sub-field Name', 'bit-integrations')}</b>
              </div>
              {isRepeater && (
                <div className="txt-dp">
                  <b>{__('Row #', 'bit-integrations')}</b>
                </div>
              )}
            </div>

            {secureCustomFieldsConf?.field_map?.map((itm, i) => (
              <SecureCustomFieldsSubFieldMap
                key={`scf-sub-${i + 9}`}
                i={i}
                field={itm}
                isRepeater={isRepeater}
                secureCustomFieldsConf={secureCustomFieldsConf}
                formFields={formFields}
                setSecureCustomFieldsConf={setSecureCustomFieldsConf}
              />
            ))}
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(
                    secureCustomFieldsConf.field_map.length,
                    secureCustomFieldsConf,
                    setSecureCustomFieldsConf
                  )
                }
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
            <br />
          </div>
        </div>
      )}

      <Note
        note={
          isRepeater
            ? __(
              'Map each sub-field of the repeater with its Row # (0 based). Add a row per sub-field; reuse the same Row # to fill multiple sub-fields of one row.',
              'bit-integrations'
            )
            : __(
              'Field Name accepts the field name or field key. Post ID / User ID must be numeric. Values are saved with update_field().',
              'bit-integrations'
            )
        }
      />
    </>
  )
}
