import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import TrashIcn from '../../../Icons/TrashIcn'
import { __ } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import TagifyInput from '../../Utilities/TagifyInput'
import {
  addFieldMap,
  delFieldMap,
  handleCustomValue,
  handleFieldMapping
} from '../IntegrationHelpers/GoogleIntegrationHelpers'

export default function GoogleSheetProFieldMap({
  i,
  formFields,
  field,
  targetFields,
  sheetConf,
  setSheetConf
}) {
  const { isPro } = useRecoilValue($appConfigState)

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="flx integ-fld-wrp">
        <select
          className="btcd-paper-inp mr-2"
          name="formField"
          value={field.formField || ''}
          onChange={ev => handleFieldMapping(ev, i, sheetConf, setSheetConf)}>
          <option value="">{__('Select Field', 'bit-integrations')}</option>
          <optgroup label={__('Form Fields', 'bit-integrations')}>
            {formFields.map(f => (
              <option key={`ff-gsheet-${f.name}`} value={f.name}>
                {f.label}
              </option>
            ))}
          </optgroup>
          <option value="custom">{__('Custom...', 'bit-integrations')}</option>

          <optgroup
            label={`${__('General Smart Codes', 'bit-integrations')} ${
              isPro ? '' : `(${__('Pro', 'bit-integrations')})`
            }`}>
            {isPro &&
              SmartTagField?.map(f => (
                <option key={`st-gsheet-${f.name}`} value={f.name}>
                  {f.label}
                </option>
              ))}
          </optgroup>
        </select>

        {field.formField === 'custom' && (
          <TagifyInput
            onChange={e => handleCustomValue(e, i, sheetConf, setSheetConf)}
            label={__('Custom Value', 'bit-integrations')}
            className="mr-2"
            type="text"
            value={field.customValue || ''}
            placeholder={__('Custom Value', 'bit-integrations')}
            formFields={formFields}
          />
        )}

        <select
          className="btcd-paper-inp"
          name="googleSheetField"
          value={field.googleSheetField || ''}
          onChange={ev => handleFieldMapping(ev, i, sheetConf, setSheetConf)}>
          <option value="">{__('Select Field', 'bit-integrations')}</option>
          {targetFields.map(target => (
            <option key={`gsheet-t-${target.value}`} value={target.value}>
              {target.required ? `${target.label} (${__('required', 'bit-integrations')})` : target.label}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => addFieldMap(i, sheetConf, setSheetConf)}
        className="icn-btn sh-sm ml-2 mr-1"
        type="button">
        +
      </button>
      <button
        onClick={() => delFieldMap(i, sheetConf, setSheetConf)}
        className="icn-btn sh-sm ml-1"
        type="button"
        aria-label="btn">
        <TrashIcn />
      </button>
    </div>
  )
}
