import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { handleCustomValue } from '../IntegrationHelpers/IntegrationHelpers'
import { addFieldMap, delFieldMap } from './IntegrationHelpers'
import TagifyInput from '../../Utilities/TagifyInput'

export default function GoogleCalendarFieldMap({
  i,
  formFields,
  field,
  googleCalendarConf,
  setGoogleCalendarConf
}) {
  const isRequired = field.required
  const hideDesc = Boolean(googleCalendarConf?.actions?.richTextDesc)
  const notRequiredField =
    googleCalendarConf?.default &&
    Object.values(googleCalendarConf?.default).filter(
      f => !f.required && !(hideDesc && f.key === 'description')
    )
  const { isPro } = useRecoilValue($appConfigState)

  const handleFieldMapping = (event, index) => {
    const newConf = { ...googleCalendarConf }
    newConf.field_map[index][event.target.name] = event.target.value
    if (event.target.value === 'custom') {
      newConf.field_map[index].customValue = ''
    }
    setGoogleCalendarConf({ ...newConf })
  }

  if (googleCalendarConf?.field_map?.length === 1 && field.googleCalendarFormField === '') {
    const newConf = { ...googleCalendarConf }
    newConf.field_map = newConf.default
      .filter(f => f.required)
      .map(f => ({ formField: '', googleCalendarFormField: f.key, required: true }))
    setGoogleCalendarConf(newConf)
  }

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            value={field.formField || ''}
            onChange={ev => handleFieldMapping(ev, i)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields?.map(f => (
                <option key={`ff-rm-${f.name}`} value={f.name}>
                  {f.label}
                </option>
              ))}
              <option value="custom">{__('Custom...', 'bit-integrations')}</option>
            </optgroup>
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
              onChange={e => handleCustomValue(e, i, googleCalendarConf, setGoogleCalendarConf)}
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
            name="googleCalendarFormField"
            value={field.googleCalendarFormField}
            onChange={ev => handleFieldMapping(ev, i)}
            disabled={isRequired}>
            <option value="">{__('Select Fields', 'bit-integrations')}</option>
            {isRequired
              ? googleCalendarConf?.default &&
                Object.values(googleCalendarConf.default).map(fld => (
                  <option key={`${fld.key}-1`} value={fld.key}>
                    {fld.label}
                  </option>
                ))
              : notRequiredField &&
                notRequiredField.map(fld => (
                  <option key={`${fld.key}-1`} value={fld.key}>
                    {fld.label}
                  </option>
                ))}
          </select>
        </div>
        {!isRequired && (
          <>
            <button
              onClick={() => addFieldMap(i, googleCalendarConf, setGoogleCalendarConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delFieldMap(i, googleCalendarConf, setGoogleCalendarConf)}
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
