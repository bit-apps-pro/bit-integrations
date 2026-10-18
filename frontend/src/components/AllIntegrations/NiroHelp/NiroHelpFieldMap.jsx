import { create } from 'mutative'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import TagifyInput from '../../Utilities/TagifyInput'
import { addFieldMap, delFieldMap, handleFieldMapping } from '../GlobalIntegrationHelper'

export default function NiroHelpFieldMap({ i, formFields, field, niroHelpConf, setNiroHelpConf }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const requiredFlds = niroHelpConf?.niroHelpFields?.filter(fld => fld.required === true) || []
  const nonRequiredFlds = niroHelpConf?.niroHelpFields?.filter(fld => fld.required === false) || []

  const setCustomValue = val =>
    setNiroHelpConf(prevConf =>
      create(prevConf, draftConf => {
        if (draftConf.field_map?.[i]) {
          draftConf.field_map[i].customValue = val?.target?.value || val
        }
      })
    )

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            value={field.formField || ''}
            onChange={ev => handleFieldMapping(ev, i, niroHelpConf, setNiroHelpConf)}>
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
              onChange={setCustomValue}
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
            name="niroHelpField"
            value={i < requiredFlds ? requiredFlds[i].label || '' : field.niroHelpField || ''}
            onChange={ev => handleFieldMapping(ev, i, niroHelpConf, setNiroHelpConf)}>
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
              onClick={() => addFieldMap(i, niroHelpConf, setNiroHelpConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delFieldMap(i, niroHelpConf, setNiroHelpConf)}
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
