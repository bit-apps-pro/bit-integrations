import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import TagifyInput from '../../Utilities/TagifyInput'
import {
  addFieldMap,
  delFieldMap,
  handleCustomValue,
  handleFieldMapping
} from '../GlobalIntegrationHelper'

export default function SecureCustomFieldsSubFieldMap({
  i,
  formFields,
  field,
  isRepeater,
  secureCustomFieldsConf,
  setSecureCustomFieldsConf
}) {
  const { isPro } = useRecoilValue($appConfigState)

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp"
            name="formField"
            value={field.formField || ''}
            onChange={ev =>
              handleFieldMapping(ev, i, secureCustomFieldsConf, setSecureCustomFieldsConf)
            }>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields?.map(f => (
                <option key={`ff-sub-${f.name}`} value={f.name}>
                  {f.label}
                </option>
              ))}
            </optgroup>
            <option value="custom">{__('Custom...', 'bit-integrations')}</option>
            <optgroup
              label={sprintf(
                __('General Smart Codes %s', 'bit-integrations'),
                isPro ? '' : `(${__('Pro', 'bit-integrations')})`
              )}>
              {isPro &&
                SmartTagField?.map(f => (
                  <option key={`sc-sub-${f.name}`} value={f.name}>
                    {f.label}
                  </option>
                ))}
            </optgroup>
          </select>

          {field.formField === 'custom' && (
            <TagifyInput
              onChange={e => handleCustomValue(e, i, secureCustomFieldsConf, setSecureCustomFieldsConf)}
              label={__('Custom Value', 'bit-integrations')}
              className="ml-2"
              type="text"
              value={field.customValue}
              placeholder={__('Custom Value', 'bit-integrations')}
              formFields={formFields}
            />
          )}

          <input
            className="btcd-paper-inp mr-2"
            type="text"
            name="subFieldName"
            value={field.subFieldName || ''}
            placeholder={__('Sub-field name', 'bit-integrations')}
            onChange={ev => handleFieldMapping(ev, i, secureCustomFieldsConf, setSecureCustomFieldsConf)}
          />

          {isRepeater && (
            <input
              className="btcd-paper-inp mr-2"
              style={{ width: 90 }}
              type="text"
              name="rowIndex"
              value={field.rowIndex || ''}
              placeholder={__('Row #', 'bit-integrations')}
              onChange={ev =>
                handleFieldMapping(ev, i, secureCustomFieldsConf, setSecureCustomFieldsConf)
              }
            />
          )}
        </div>
        <button
          onClick={() => addFieldMap(i, secureCustomFieldsConf, setSecureCustomFieldsConf)}
          className="icn-btn sh-sm ml-2 mr-1"
          type="button">
          +
        </button>
        <button
          onClick={() => delFieldMap(i, secureCustomFieldsConf, setSecureCustomFieldsConf)}
          className="icn-btn sh-sm ml-1"
          type="button"
          aria-label="btn">
          <span className="btcd-icn icn-trash-2" />
        </button>
      </div>
    </div>
  )
}
