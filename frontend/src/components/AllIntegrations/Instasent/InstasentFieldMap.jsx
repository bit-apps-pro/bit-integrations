import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { handleCustomValue } from '../IntegrationHelpers/IntegrationHelpers'
import TagifyInput from '../../Utilities/TagifyInput'
import { addFieldMap, delFieldMap, handleFieldMapping } from './IntegrationHelpers'
import { ACTIONS_WITH_CUSTOM_FIELDS, CUSTOM_FIELD_KEY } from './InstasentCommonFunc'

export default function InstasentFieldMap({ i, formFields, field, instasentConf, setInstasentConf }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const requiredFlds = instasentConf?.instasentFields.filter(fld => fld.required === true) || []
  const nonRequiredFlds = instasentConf?.instasentFields.filter(fld => fld.required === false) || []

  const isExtraRow = i >= requiredFlds.length
  const customCapable = ACTIONS_WITH_CUSTOM_FIELDS.includes(instasentConf?.action)
  const predefinedKeys = (instasentConf?.instasentFields || []).map(fld => fld.key)
  const isCustomKey =
    isExtraRow &&
    customCapable &&
    !!field.instasentFormField &&
    field.instasentFormField !== CUSTOM_FIELD_KEY &&
    !predefinedKeys.includes(field.instasentFormField)
  const showCustomKeyInput = field.instasentFormField === CUSTOM_FIELD_KEY || isCustomKey

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            value={field.formField || ''}
            onChange={ev => handleFieldMapping(ev, i, instasentConf, setInstasentConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields?.map(f => (
                <option key={`ff-rm-${f.name}`} value={f.name}>
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
                  <option key={`ff-rm-${f.name}`} value={f.name}>
                    {f.label}
                  </option>
                ))}
            </optgroup>
          </select>

          {field.formField === 'custom' && (
            <TagifyInput
              onChange={e => handleCustomValue(e, i, instasentConf, setInstasentConf)}
              label={__('Custom Value', 'bit-integrations')}
              className="mr-2"
              type="text"
              value={field.customValue}
              placeholder={__('Custom Value', 'bit-integrations')}
              formFields={formFields}
            />
          )}

          {showCustomKeyInput ? (
            <input
              className="btcd-paper-inp"
              type="text"
              name="instasentFormField"
              value={field.instasentFormField === CUSTOM_FIELD_KEY ? '' : field.instasentFormField || ''}
              placeholder={__('Custom field key...', 'bit-integrations')}
              onChange={ev => handleFieldMapping(ev, i, instasentConf, setInstasentConf)}
            />
          ) : (
            <select
              className="btcd-paper-inp"
              disabled={i < requiredFlds.length}
              name="instasentFormField"
              value={i < requiredFlds.length ? requiredFlds[i].key : field.instasentFormField || ''}
              onChange={ev => handleFieldMapping(ev, i, instasentConf, setInstasentConf)}>
              <option value="">{__('Select Field', 'bit-integrations')}</option>
              {i < requiredFlds.length ? (
                <option key={requiredFlds[i].key} value={requiredFlds[i].key}>
                  {requiredFlds[i].label}
                </option>
              ) : (
                <>
                  {nonRequiredFlds.map(({ key, label }) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                  {customCapable && (
                    <option value={CUSTOM_FIELD_KEY}>{__('Custom Field...', 'bit-integrations')}</option>
                  )}
                </>
              )}
            </select>
          )}
        </div>
        {i >= requiredFlds.length && (
          <>
            <button
              onClick={() => addFieldMap(i, instasentConf, setInstasentConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delFieldMap(i, instasentConf, setInstasentConf)}
              className="icn-btn sh-sm ml-1"
              type="button"
              aria-label="btn">
              <span className="btcd-icn icn-trash-2" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
