import { create } from 'mutative'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import TagifyInput from '../../Utilities/TagifyInput'

const SESSION_ID_FIELD = {
  formField: '',
  cartAbandonmentRecoveryField: 'session_id'
}

export default function CartAbandonmentRecoveryFieldMap({
  formFields,
  cartAbandonmentRecoveryConf,
  setCartAbandonmentRecoveryConf
}) {
  const { isPro } = useRecoilValue($appConfigState)
  const field = cartAbandonmentRecoveryConf?.field_map?.[0] || SESSION_ID_FIELD

  const handleFieldMapping = event => {
    const { name, value } = event.target

    setCartAbandonmentRecoveryConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.field_map = draftConf.field_map?.length ? draftConf.field_map : [{ ...SESSION_ID_FIELD }]
        draftConf.field_map[0].cartAbandonmentRecoveryField = 'session_id'
        draftConf.field_map[0][name] = value

        if (value === 'custom') {
          draftConf.field_map[0].customValue = ''
        }
      })
    )
  }

  const handleCustomValue = event => {
    setCartAbandonmentRecoveryConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.field_map = draftConf.field_map?.length ? draftConf.field_map : [{ ...SESSION_ID_FIELD }]
        draftConf.field_map[0].customValue = event?.target?.value || event
      })
    )
  }

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            value={field.formField || ''}
            onChange={handleFieldMapping}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields?.map(formField => (
                <option key={`ff-car-session-${formField.name}`} value={formField.name}>
                  {formField.label}
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
                SmartTagField?.map(smartField => (
                  <option key={`ff-car-smart-${smartField.name}`} value={smartField.name}>
                    {smartField.label}
                  </option>
                ))}
            </optgroup>
          </select>

          {field.formField === 'custom' && (
            <TagifyInput
              onChange={handleCustomValue}
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
            disabled
            name="cartAbandonmentRecoveryField"
            value="session_id"
            onChange={handleFieldMapping}>
            <option value="session_id">{__('Session ID', 'bit-integrations')}</option>
          </select>
        </div>
      </div>
    </div>
  )
}
