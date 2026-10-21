import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import CustomFieldKey from '../../Utilities/CustomFieldKey'
import TagifyInput from '../../Utilities/TagifyInput'
import {
  addFieldMap,
  delFieldMap,
  handleCustomValue,
  handleFieldMapping
} from '../GlobalIntegrationHelper'
import { getActionFields, getCustomKeys } from './MailerooCommonFunc'

export default function MailerooFieldMap({ i, formFields, field, mailerooConf, setMailerooConf }) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const actionFields = getActionFields(mailerooConf)
  const requiredFlds = actionFields.filter(fld => fld.required === true)
  const nonRequiredFlds = actionFields.filter(fld => fld.required === false)
  const customKeys = getCustomKeys(mailerooConf)
  const customKey = customKeys.find(({ key }) => key === field.mailerooField)

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            value={field.formField || ''}
            onChange={ev => handleFieldMapping(ev, i, mailerooConf, setMailerooConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields?.map(f => (
                <option key={`ff-mr-${f.name}`} value={f.name}>
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
                  <option key={`mr-sc-${f.name}`} value={f.name}>
                    {f.label}
                  </option>
                ))}
            </optgroup>
          </select>

          {field.formField === 'custom' && (
            <TagifyInput
              onChange={e => handleCustomValue(e, i, mailerooConf, setMailerooConf)}
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
            name="mailerooField"
            value={field.mailerooField || ''}
            onChange={ev => handleFieldMapping(ev, i, mailerooConf, setMailerooConf)}>
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
            {i >= requiredFlds.length && customKeys.length > 0 && (
              <optgroup label={__('Custom Keys', 'bit-integrations')}>
                {customKeys.map(({ key, label }) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          {customKey && (
            <CustomFieldKey
              field={field}
              index={i}
              conf={mailerooConf}
              setConf={setMailerooConf}
              fieldValue="customFieldKey"
              fieldLabel={customKey.keyLabel}
              className="ml-2"
            />
          )}
        </div>

        {i >= requiredFlds.length && (
          <>
            <button
              onClick={() => addFieldMap(i, mailerooConf, setMailerooConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button"
              aria-label={__('Add field', 'bit-integrations')}>
              +
            </button>
            <button
              onClick={() => delFieldMap(i, mailerooConf, setMailerooConf)}
              className="icn-btn sh-sm ml-1"
              type="button"
              aria-label={__('Delete field', 'bit-integrations')}>
              <span className="btcd-icn icn-trash-2" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
