/* eslint-disable no-console */
import { useRecoilValue } from 'recoil'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { addFieldMap, delFieldMap, handleFieldMapping } from './IntegrationHelpers'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import { $appConfigState } from '../../../GlobalStates'
import { generateMappedField } from './MoxieCRMCommonFunc'
import CustomField from './CustomField'

export default function MoxieCRMFieldMap({ i, formFields, field, moxiecrmConf, setMoxieCRMConf }) {
  let allFields = []
  let newFields = []
  if (moxiecrmConf.actionName === 'client') {
    allFields = moxiecrmConf?.clientFields
  } else if (moxiecrmConf.actionName === 'contact') {
    allFields = moxiecrmConf?.contactFields
  } else if (moxiecrmConf.actionName === 'opportunity') {
    allFields = moxiecrmConf?.opportunityFields
  }
  const requiredFields = allFields.filter(fld => fld.required === true) || []
  const nonRequiredFields = allFields.filter(fld => fld.required === false) || []
  const allNonRequiredFields = moxiecrmConf.customFields
    ? [...nonRequiredFields, ...moxiecrmConf?.customFields]
    : nonRequiredFields

  if (moxiecrmConf?.field_map?.length === 1 && field.moxiecrmFormField === '') {
    const newConf = { ...moxiecrmConf }
    const tmp = generateMappedField(newConf)
    newConf.field_map = tmp
    setMoxieCRMConf(newConf)
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
            onChange={ev => handleFieldMapping(ev, i, moxiecrmConf, setMoxieCRMConf)}>
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
              conf={moxiecrmConf}
              setConf={setMoxieCRMConf}
              fieldValue="customValue"
              fieldLabel="Custom Value"
              className="mr-2"
            />
          )}

          <select
            className="btcd-paper-inp"
            disabled={i < requiredFields.length}
            name="moxiecrmFormField"
            value={i < requiredFields ? requiredFields[i].label || '' : field.moxiecrmFormField || ''}
            onChange={ev => handleFieldMapping(ev, i, moxiecrmConf, setMoxieCRMConf)}>
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
              onClick={() => addFieldMap(i, moxiecrmConf, setMoxieCRMConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delFieldMap(i, moxiecrmConf, setMoxieCRMConf)}
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
