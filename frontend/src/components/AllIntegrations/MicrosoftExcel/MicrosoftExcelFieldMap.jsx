import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import TagifyInput from '../../Utilities/TagifyInput'
import { addFieldMap, delFieldMap, handleFieldMapping } from '../GlobalIntegrationHelper'
import { actionFields, setCustomValue } from './MicrosoftExcelCommonFunc'

export default function MicrosoftExcelFieldMap({
  i,
  formFields,
  field,
  microsoftExcelConf,
  setMicrosoftExcelConf
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const fields = actionFields(microsoftExcelConf)
  const requiredFlds = fields.filter(fld => fld.required === true)
  const nonRequiredFlds = fields.filter(fld => fld.required === false)

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            value={field.formField || ''}
            onChange={ev => handleFieldMapping(ev, i, microsoftExcelConf, setMicrosoftExcelConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields?.map(f => (
                <option key={`ff-mse-${f.name}`} value={f.name}>
                  {f.label}
                </option>
              ))}
            </optgroup>
            <option value="custom">{__('Custom...', 'bit-integrations')}</option>
            <optgroup
              label={sprintf(
                // translators: %s: "(Pro)" badge shown to free users
                __('General Smart Codes %s', 'bit-integrations'),
                isPro ? '' : `(${__('Pro', 'bit-integrations')})`
              )}>
              {isPro &&
                SmartTagField?.map(f => (
                  <option key={`mse-sc-${f.name}`} value={f.name}>
                    {f.label}
                  </option>
                ))}
            </optgroup>
          </select>

          {field.formField === 'custom' && (
            <TagifyInput
              onChange={e => setCustomValue(e, i, setMicrosoftExcelConf)}
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
            name="microsoftExcelField"
            value={field.microsoftExcelField || ''}
            onChange={ev => handleFieldMapping(ev, i, microsoftExcelConf, setMicrosoftExcelConf)}>
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
          </select>
        </div>

        {i >= requiredFlds.length && (
          <>
            <button
              onClick={() => addFieldMap(i, microsoftExcelConf, setMicrosoftExcelConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delFieldMap(i, microsoftExcelConf, setMicrosoftExcelConf)}
              className="icn-btn sh-sm ml-1"
              type="button"
              aria-label={__('Remove field', 'bit-integrations')}>
              <span className="btcd-icn icn-trash-2" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
