/* eslint-disable no-console */
import { useRecoilValue } from 'recoil'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { addFieldMap, delFieldMap, handleFieldMapping } from './IntegrationHelpers'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import { $appConfigState } from '../../../GlobalStates'
import { generateMappedField } from './ZendeskCommonFunc'
import CustomField from './CustomField'

export default function ZendeskFieldMap({ i, formFields, field, zendeskConf, setZendeskConf }) {
  let allFields = []
  let newFields = []
  if (zendeskConf.actionName === 'organization') {
    allFields = zendeskConf?.organizationFields
  } else if (zendeskConf.actionName === 'contact') {
    allFields = zendeskConf?.contactFields
  } else if (zendeskConf.actionName === 'lead') {
    allFields = zendeskConf?.leadFields
  } else if (zendeskConf.actionName === 'deal') {
    allFields = zendeskConf?.dealFields
  }
  const requiredFields = allFields.filter(fld => fld.required === true) || []
  const nonRequiredFields = allFields.filter(fld => fld.required === false) || []
  const allNonRequiredFields = [...nonRequiredFields, ...(zendeskConf?.customFields || [])]

  if (zendeskConf?.field_map?.length === 1 && field.zendeskFormField === '') {
    const newConf = { ...zendeskConf }
    const tmp = generateMappedField(newConf)
    newConf.field_map = tmp
    setZendeskConf(newConf)
  }

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
            onChange={ev => handleFieldMapping(ev, i, zendeskConf, setZendeskConf)}>
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
            <CustomField
              field={field}
              index={i}
              conf={zendeskConf}
              setConf={setZendeskConf}
              fieldValue="customValue"
              fieldLabel="Custom Value"
              className="mr-2"
            />
          )}

          <select
            className="btcd-paper-inp"
            disabled={i < requiredFields.length}
            name="zendeskFormField"
            value={i < requiredFields ? requiredFields[i].label || '' : field.zendeskFormField || ''}
            onChange={ev => handleFieldMapping(ev, i, zendeskConf, setZendeskConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            {i < requiredFields.length ? (
              <option key={requiredFields[i].key} value={requiredFields[i].key}>
                {requiredFields[i].label}
              </option>
            ) : (
              allNonRequiredFields.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))
            )}
            {(zendeskConf.actionName === 'organization' ||
              zendeskConf.actionName === 'contact' ||
              zendeskConf.actionName === 'lead' ||
              zendeskConf.actionName === 'deal') && (
              <option value="customFieldKey">{__('Custom Field', 'bit-integrations')}</option>
            )}
          </select>
          {field.zendeskFormField === 'customFieldKey' && (
            <CustomField
              field={field}
              index={i}
              conf={zendeskConf}
              setConf={setZendeskConf}
              fieldValue="customFieldKey"
              fieldLabel="Custom Field Key"
              className="ml-2"
            />
          )}
        </div>
        {i >= requiredFields.length && (
          <>
            <button
              onClick={() => addFieldMap(i, zendeskConf, setZendeskConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delFieldMap(i, zendeskConf, setZendeskConf)}
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
