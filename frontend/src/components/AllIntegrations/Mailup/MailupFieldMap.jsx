import { useRecoilValue } from 'recoil'
import { __, sprintf } from '../../../Utils/i18nwrap'
import MtInput from '../../Utilities/MtInput'
import { addFieldMap, delFieldMap, handleFieldMapping } from './IntegrationHelpers'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import { $appConfigState } from '../../../GlobalStates'
import { generateMappedField } from './MailupCommonFunc'
import TagifyInput from '../../Utilities/TagifyInput'
import { handleCustomValue } from '../IntegrationHelpers/IntegrationHelpers'

export default function MailupFieldMap({ i, formFields, field, mailupConf, setMailupConf }) {
  // if (mailupConf?.field_map?.length === 1 && field.mailupFormField === '') {
  //   const newConf = { ...mailupConf }
  //   const tmp = generateMappedField(newConf)
  //   newConf.field_map = tmp
  //   setMailupConf(newConf)
  // }

  const requiredFlds = mailupConf?.staticFields.filter(fld => fld.required === true) || []
  const nonRequiredFlds = mailupConf?.staticFields.filter(fld => fld.required === false) || []

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
            onChange={ev => handleFieldMapping(ev, i, mailupConf, setMailupConf)}>
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
              onChange={e => handleCustomValue(e, i, mailupConf, setMailupConf)}
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
            name="mailupFormField"
            value={i < requiredFlds.length ? requiredFlds[i].key || '' : field.mailupFormField || ''}
            onChange={ev => handleFieldMapping(ev, i, mailupConf, setMailupConf)}>
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
              onClick={() => addFieldMap(i, mailupConf, setMailupConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delFieldMap(i, mailupConf, setMailupConf)}
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
