/* eslint-disable no-console */
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { generateMappedField } from './ClinchPadCommonFunc'
import CustomField from './CustomField'
import { addFieldMap, delFieldMap, handleFieldMapping } from './IntegrationHelpers'

export default function ClinchPadFieldMap({ i, formFields, field, clinchPadConf, setClinchPadConf }) {
  let allFields = []
  let newFields = []
  if (clinchPadConf.actionName === 'organization') {
    allFields = clinchPadConf?.organizationFields
  } else if (clinchPadConf.actionName === 'contact') {
    allFields = clinchPadConf?.contactFields
  } else if (clinchPadConf.actionName === 'lead') {
    allFields = clinchPadConf?.leadFields
  }
  const requiredFields = allFields.filter(fld => fld.required === true) || []
  const nonRequiredFields = allFields.filter(fld => fld.required === false) || []
  const allNonRequiredFields = [...nonRequiredFields, ...(clinchPadConf?.customFields || [])]

  if (clinchPadConf?.field_map?.length === 1 && field.clinchPadFormField === '') {
    const newConf = { ...clinchPadConf }
    const tmp = generateMappedField(newConf)
    newConf.field_map = tmp
    setClinchPadConf(newConf)
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
            onChange={ev => handleFieldMapping(ev, i, clinchPadConf, setClinchPadConf)}>
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
              conf={clinchPadConf}
              setConf={setClinchPadConf}
              fieldValue="customValue"
              fieldLabel="Custom Value"
              className="mr-2"
            />
          )}

          <select
            className="btcd-paper-inp"
            disabled={i < requiredFields.length}
            name="clinchPadFormField"
            value={i < requiredFields ? requiredFields[i].label || '' : field.clinchPadFormField || ''}
            onChange={ev => handleFieldMapping(ev, i, clinchPadConf, setClinchPadConf)}>
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
          </select>
        </div>
        {i >= requiredFields.length && (
          <>
            <button
              onClick={() => addFieldMap(i, clinchPadConf, setClinchPadConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delFieldMap(i, clinchPadConf, setClinchPadConf)}
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
