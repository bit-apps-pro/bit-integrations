/* eslint-disable no-console */
import { useRecoilValue } from 'recoil'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { addFieldMap, delFieldMap, handleFieldMapping } from './IntegrationHelpers'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import { $appConfigState } from '../../../GlobalStates'
import { generateMappedField } from './CapsuleCRMCommonFunc'
import CustomField from './CustomField'

export default function CapsuleCRMFieldMap({ i, formFields, field, capsulecrmConf, setCapsuleCRMConf }) {
  let allFields = []
  let newFields = []
  if (capsulecrmConf.actionName === 'organisation') {
    allFields = capsulecrmConf?.organisationFields
  } else if (capsulecrmConf.actionName === 'person') {
    allFields = capsulecrmConf?.personFields
  } else if (capsulecrmConf.actionName === 'opportunity') {
    allFields = capsulecrmConf?.opportunityFields
  } else if (capsulecrmConf.actionName === 'project') {
    allFields = capsulecrmConf?.projectFields
  }
  const requiredFields = allFields.filter(fld => fld.required === true) || []
  const nonRequiredFields = allFields.filter(fld => fld.required === false) || []
  const allNonRequiredFields = capsulecrmConf.customFields
    ? [...nonRequiredFields, ...capsulecrmConf?.customFields]
    : nonRequiredFields

  if (capsulecrmConf?.field_map?.length === 1 && field.capsulecrmFormField === '') {
    const newConf = { ...capsulecrmConf }
    const tmp = generateMappedField(newConf)
    newConf.field_map = tmp
    setCapsuleCRMConf(newConf)
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
            onChange={ev => handleFieldMapping(ev, i, capsulecrmConf, setCapsuleCRMConf)}>
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
              conf={capsulecrmConf}
              setConf={setCapsuleCRMConf}
              fieldValue="customValue"
              fieldLabel="Custom Value"
              className="mr-2"
            />
          )}

          <select
            className="btcd-paper-inp"
            disabled={i < requiredFields.length}
            name="capsulecrmFormField"
            value={i < requiredFields ? requiredFields[i].label || '' : field.capsulecrmFormField || ''}
            onChange={ev => handleFieldMapping(ev, i, capsulecrmConf, setCapsuleCRMConf)}>
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
            {(capsulecrmConf.actionName === 'organisation' ||
              capsulecrmConf.actionName === 'person' ||
              capsulecrmConf.actionName === 'opportunity' ||
              capsulecrmConf.actionName === 'project') && (
              <option value="customFieldKey">{__('Custom Field', 'bit-integrations')}</option>
            )}
          </select>
          {field.capsulecrmFormField === 'customFieldKey' && (
            <CustomField
              field={field}
              index={i}
              conf={capsulecrmConf}
              setConf={setCapsuleCRMConf}
              fieldValue="customFieldKey"
              fieldLabel="Custom Field Key"
              className="ml-2"
            />
          )}
        </div>
        {i >= requiredFields.length && (
          <>
            <button
              onClick={() => addFieldMap(i, capsulecrmConf, setCapsuleCRMConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delFieldMap(i, capsulecrmConf, setCapsuleCRMConf)}
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
