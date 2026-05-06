import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import { __, sprintf } from '../../../Utils/i18nwrap'
import MtInput from '../../Utilities/MtInput'
import {
  addListFieldMap,
  delListFieldMap,
  handleUnsubscribeCustomValue,
  handleUnsubscribeFieldMapping
} from './IntegrationHelpers'

export default function SendFoxUnsubscribeFieldMap({
  i,
  formFields,
  field,
  sendFoxConf,
  setSendFoxConf
}) {
  const requiredFlds = unsubscribeFields.filter(fld => fld.required === true) || []
  const nonRequiredFlds = unsubscribeFields.filter(fld => fld.required === false) || []

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
            onChange={ev => handleUnsubscribeFieldMapping(ev, i, sendFoxConf, setSendFoxConf)}>
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
            <MtInput
              onChange={e => handleUnsubscribeCustomValue(e, i, sendFoxConf, setSendFoxConf)}
              label={__('Custom Value', 'bit-integrations')}
              className="mr-2"
              type="text"
              value={field.customValue}
              placeholder={__('Custom Value', 'bit-integrations')}
            />
          )}

          <select
            className="btcd-paper-inp"
            disabled={i < requiredFlds.length}
            name="sendFoxUnsubscribeFormField"
            value={
              i < requiredFlds.length
                ? requiredFlds[i].key || ''
                : field.sendFoxUnsubscribeFormField || ''
            }
            onChange={ev => handleUnsubscribeFieldMapping(ev, i, sendFoxConf, setSendFoxConf)}>
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
              onClick={() => addListFieldMap(i, sendFoxConf, setSendFoxConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delListFieldMap(i, sendFoxConf, setSendFoxConf)}
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

export const unsubscribeFields = [
  { key: 'email', label: __('Email', 'bit-integrations'), required: true }
]
