import { useRecoilValue } from 'recoil'
import { __, sprintf } from '../../../Utils/i18nwrap'
import MtInput from '../../Utilities/MtInput'
import { addFieldMap, delFieldMap, handleFieldMapping } from './IntegrationHelpers'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import { $appConfigState } from '../../../GlobalStates'
import { generateMappedField, mappableFields } from './SendyCommonFunc'
import { getAction, supportsCustomFields } from './staticData'
import TagifyInput from '../../Utilities/TagifyInput'
import { handleCustomValue } from '../IntegrationHelpers/IntegrationHelpers'
import CustomFieldKey from '../../Utilities/CustomFieldKey'

export default function SendyFieldMap({ i, formFields, field, sendyConf, setSendyConf }) {
  if (sendyConf?.field_map?.length === 1 && field.sendyField === '') {
    const newConf = { ...sendyConf }
    const tmp = generateMappedField(newConf)
    newConf.field_map = tmp
    setSendyConf(newConf)
  }
  const actionFields = mappableFields(sendyConf)
  const requiredFlds = actionFields.filter(fld => fld.required === true)
  const nonRequiredFlds = actionFields.filter(fld => fld.required === false)
  const allowCustomFieldKey = supportsCustomFields.includes(getAction(sendyConf))

  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            value={field.formField || ''}
            onChange={ev => handleFieldMapping(ev, i, sendyConf, setSendyConf)}>
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
              onChange={e => handleCustomValue(e, i, sendyConf, setSendyConf)}
              label={__('Custom Value', 'bit-integrations')}
              className="mr-2"
              type="text"
              value={field.customValue}
              placeholder={__('Custom Value', 'bit-integrations')}
              formFields={formFields}
            />
          )}

          <select
            className="btcd-paper-inp"
            disabled={i < requiredFlds.length}
            name="sendyField"
            value={i < requiredFlds ? requiredFlds[i].label || '' : field.sendyField || ''}
            onChange={ev => handleFieldMapping(ev, i, sendyConf, setSendyConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            {i < requiredFlds.length ? (
              <option key={requiredFlds[i].key} value={requiredFlds[i].key}>
                {requiredFlds[i].label}
              </option>
            ) : (
              nonRequiredFlds.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))
            )}
            {allowCustomFieldKey && (
              <option value="customFieldKey">{__('Custom Field', 'bit-integrations')}</option>
            )}
          </select>
          {field.sendyField === 'customFieldKey' && (
            <CustomFieldKey
              field={field}
              index={i}
              conf={sendyConf}
              setConf={setSendyConf}
              fieldValue="customFieldKey"
              fieldLabel="Custom Field Key"
              className="ml-2"
            />
          )}
        </div>
        {i >= requiredFlds.length && (
          <>
            <button
              onClick={() => addFieldMap(i, sendyConf, setSendyConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delFieldMap(i, sendyConf, setSendyConf)}
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
