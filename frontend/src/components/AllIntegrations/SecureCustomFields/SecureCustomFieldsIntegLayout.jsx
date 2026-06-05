import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import Note from '../../Utilities/Note'
import { generateMappedField } from './SecureCustomFieldsCommonFunc'
import SecureCustomFieldsFieldMap from './SecureCustomFieldsFieldMap'
import { GroupFields, modules, OptionFields, PostFields, RepeaterFields, UserFields } from './staticData'

export default function SecureCustomFieldsIntegLayout({
  formFields,
  secureCustomFieldsConf,
  setSecureCustomFieldsConf
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setSecureCustomFieldsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

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
          case 'update_group_field_value':
            draftConf.secureCustomFieldsFields = GroupFields
            break
          case 'update_repeater_field_value':
            draftConf.secureCustomFieldsFields = RepeaterFields
            break
          default:
            draftConf.secureCustomFieldsFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.secureCustomFieldsFields)
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

      {secureCustomFieldsConf?.mainAction && secureCustomFieldsConf.secureCustomFieldsFields && (
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

      <Note
        note={__(
          'Field Name accepts the field name or field key. Post ID / User ID must be numeric. Field Value will be saved with update_field().',
          'bit-integrations'
        )}
      />
    </>
  )
}
