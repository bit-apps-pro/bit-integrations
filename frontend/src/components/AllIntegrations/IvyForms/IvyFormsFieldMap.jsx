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

export default function IvyFormsFieldMap({ i, formFields, field, ivyFormsConf, setIvyFormsConf, allFields }) {
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
            onChange={ev => handleFieldMapping(ev, i, ivyFormsConf, setIvyFormsConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields?.map(f => (
                <option key={`ff-iv-${f.name}`} value={f.name}>{f.label}</option>
              ))}
            </optgroup>
            <option value="custom">{__('Custom...', 'bit-integrations')}</option>
            <optgroup
              label={sprintf(
                __('General Smart Codes %s', 'bit-integrations'),
                isPro ? '' : `(${__('Pro', 'bit-integrations')})`
              )}>
              {isPro && SmartTagField?.map(f => (
                <option key={`st-iv-${f.name}`} value={f.name}>{f.label}</option>
              ))}
            </optgroup>
          </select>

          {field.formField === 'custom' && (
            <TagifyInput
              onChange={e => handleCustomValue(e, i, ivyFormsConf, setIvyFormsConf)}
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
            name="ivyFormsField"
            value={field.ivyFormsField || ''}
            onChange={ev => handleFieldMapping(ev, i, ivyFormsConf, setIvyFormsConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            {allFields.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <>
          <button
            onClick={() => addFieldMap(i, ivyFormsConf, setIvyFormsConf)}
            className="icn-btn sh-sm ml-2 mr-1"
            type="button">
            +
          </button>
          <button
            onClick={() => delFieldMap(i, ivyFormsConf, setIvyFormsConf)}
            className="icn-btn sh-sm ml-1"
            type="button"
            aria-label="btn">
            <span className="btcd-icn icn-trash-2" />
          </button>
        </>
      </div>
    </div>
  )
}
