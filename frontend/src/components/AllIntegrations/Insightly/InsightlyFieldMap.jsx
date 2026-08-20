/* eslint-disable no-console */
import { useRecoilValue } from 'recoil'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { addFieldMap, delFieldMap, handleFieldMapping } from './IntegrationHelpers'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import { $appConfigState } from '../../../GlobalStates'
import { generateMappedField } from './InsightlyCommonFunc'
import CustomField from './CustomField'

export default function InsightlyFieldMap({ i, formFields, field, insightlyConf, setInsightlyConf }) {
  let allFields = []
  if (insightlyConf.actionName === 'organisation') {
    allFields = insightlyConf?.organisationFields
  } else if (insightlyConf.actionName === 'contact') {
    allFields = insightlyConf?.contactFields
  } else if (insightlyConf.actionName === 'opportunity') {
    allFields = insightlyConf?.opportunityFields
  } else if (insightlyConf.actionName === 'project') {
    allFields = insightlyConf?.projectFields
  } else if (insightlyConf.actionName === 'task') {
    allFields = insightlyConf?.taskFields
  } else if (insightlyConf.actionName === 'lead') {
    allFields = insightlyConf?.leadFields
  }

  const requiredFields = allFields.filter(fld => fld.required === true) || []
  const allNonRequiredFields = allFields.filter(fld => fld.required === false) || []

  if (insightlyConf?.field_map?.length === 1 && field.insightlyFormField === '') {
    const newConf = { ...insightlyConf }
    const tmp = generateMappedField(newConf)
    newConf.field_map = tmp
    setInsightlyConf(newConf)
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
            onChange={ev => handleFieldMapping(ev, i, insightlyConf, setInsightlyConf)}>
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
              conf={insightlyConf}
              setConf={setInsightlyConf}
              fieldValue="customValue"
              fieldLabel="Custom Value"
              className="mr-2"
            />
          )}

          <select
            className="btcd-paper-inp"
            disabled={i < requiredFields.length}
            name="insightlyFormField"
            value={i < requiredFields ? requiredFields[i].label || '' : field.insightlyFormField || ''}
            onChange={ev => handleFieldMapping(ev, i, insightlyConf, setInsightlyConf)}>
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
          {field.insightlyFormField === 'customFieldKey' && (
            <CustomField
              field={field}
              index={i}
              conf={insightlyConf}
              setConf={setInsightlyConf}
              fieldValue="customFieldKey"
              fieldLabel="Custom Field Key"
              className="ml-2"
            />
          )}
        </div>
        {i >= requiredFields.length && (
          <>
            <button
              onClick={() => addFieldMap(i, insightlyConf, setInsightlyConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delFieldMap(i, insightlyConf, setInsightlyConf)}
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
