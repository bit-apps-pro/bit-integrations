import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import TagifyInput from '../../Utilities/TagifyInput'
import { handleUserEmailCustomValue, handleUserEmailField } from './userSource'

export default function UserEmailFieldMap({ conf, setConf, formFields, actionLabel }) {
  const { isPro } = useRecoilValue($appConfigState)
  const field = conf?.userEmailField || {}

  return (
    <div className="mt-4">
      <b className="wdt-100">{__('Map User Email', 'bit-integrations')}</b>
      <div className="btcd-hr mt-1" />
      <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
        <div className="txt-dp">
          <b>{__('Form Fields', 'bit-integrations')}</b>
        </div>
        <div className="txt-dp">
          <b>{actionLabel}</b>
        </div>
      </div>
      <div className="flx mt-2 mb-2 btcbi-field-map">
        <div className="pos-rel flx">
          <div className="flx integ-fld-wrp">
            <select
              className="btcd-paper-inp mr-2"
              name="userEmailField"
              value={field.formField || ''}
              onChange={ev => handleUserEmailField(ev.target.value, conf, setConf)}>
              <option value="">{__('Select Field', 'bit-integrations')}</option>
              <optgroup label={__('Form Fields', 'bit-integrations')}>
                {formFields?.map(f => (
                  <option key={`ff-usr-${f.name}`} value={f.name}>
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
                    <option key={`st-usr-${f.name}`} value={f.name}>
                      {f.label}
                    </option>
                  ))}
              </optgroup>
            </select>

            {field.formField === 'custom' && (
              <TagifyInput
                onChange={e => handleUserEmailCustomValue(e?.target?.value ?? e, conf, setConf)}
                label={__('Custom Value', 'bit-integrations')}
                className="mr-2"
                type="text"
                value={field.customValue}
                placeholder={__('Custom Value', 'bit-integrations')}
                formFields={formFields}
              />
            )}

            <select className="btcd-paper-inp" value="user_email" disabled>
              <option value="user_email">{__('User Email', 'bit-integrations')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
