// eslint-disable-next-line import/no-extraneous-dependencies
import { __ } from '../../../Utils/i18nwrap'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import TrashIcn from '../../../Icons/TrashIcn'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import MtInput from '../../Utilities/MtInput'
import { addFieldMap, delFieldMap, handleFieldMapping } from '../IntegrationHelpers/FieldMapHelper'
import { handleCustomValue } from './SendPulseCommonFunc'

export default function SendPulseFieldMap({ i, formFields, field, sendPulseConf, setSendPulseConf }) {
  const isRequired = field.required
  const notResquiredField =
    sendPulseConf?.default?.fields &&
    Object.values(sendPulseConf?.default?.fields).filter(f => !f.required)
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="flx integ-fld-wrp">
        <select
          className="btcd-paper-inp mr-2"
          name="formField"
          value={field.formField || ''}
          onChange={ev => handleFieldMapping(ev, i, sendPulseConf, setSendPulseConf)}>
          <option value="">{__('Select Field', 'bit-integrations')}</option>
          <optgroup label={__('List Fields', 'bit-integrations')}>
            {formFields?.map(f => (
              <option key={`ff-rm-${f.name}`} value={f.name}>
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
                <option key={`ff-rm-${f.name}`} value={f.name}>
                  {f.label}
                </option>
              ))}
          </optgroup>
        </select>

        {field.formField === 'custom' && (
          <MtInput
            onChange={e => handleCustomValue(e, i, sendPulseConf, setSendPulseConf)}
            label={__('Custom Value', 'bit-integrations')}
            className="mr-2"
            type="text"
            value={field.customValue || ''}
            placeholder={__('Custom Value', 'bit-integrations')}
          />
        )}

        <select
          className="btcd-paper-inp"
          name="sendPulseField"
          value={field.sendPulseField || ''}
          onChange={ev => handleFieldMapping(ev, i, sendPulseConf, setSendPulseConf)}
          disabled={isRequired}>
          <option value="">{__('Select Field', 'bit-integrations')}</option>
          {isRequired
            ? sendPulseConf?.default?.fields &&
              Object.values(sendPulseConf.default.fields).map(fld => (
                <option key={`${fld.fieldValue}`} value={fld.fieldValue}>
                  {fld.fieldName}
                </option>
              ))
            : notResquiredField &&
              notResquiredField.map(fld => (
                <option key={`${fld.fieldValue}`} value={fld.fieldValue}>
                  {fld.fieldName}
                </option>
              ))}
        </select>
      </div>
      {!isRequired && (
        <>
          <button onClick={() => addFieldMap(i, sendPulseConf, setSendPulseConf)} className="icn-btn sh-sm ml-2" type="button">
            +
          </button>
          <button
            onClick={() => delFieldMap(i, sendPulseConf, setSendPulseConf)}
            className="icn-btn sh-sm ml-2"
            type="button"
            aria-label="btn">
            <TrashIcn />
          </button>
        </>
      )}
    </div>
  )
}
