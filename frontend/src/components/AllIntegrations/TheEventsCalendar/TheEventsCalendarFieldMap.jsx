/* eslint-disable no-console */
import { __ } from '../../../Utils/i18nwrap'
import { addFieldMap, delFieldMap, handleFieldMapping } from './IntegrationHelpers'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import TagifyInput from '../../Utilities/TagifyInput'
import { handleCustomValue } from '../IntegrationHelpers/IntegrationHelpers'

export default function TheEventsCalendarFieldMap({
  i,
  formFields,
  field,
  theEventsCalendarConf,
  setTheEventsCalendarConf
}) {
  const requiredFields = theEventsCalendarConf?.staticFields.filter(fld => fld.required === true) || []
  const customFields = theEventsCalendarConf?.staticFields?.filter(fld => fld.required === false) || []
  const additionalFields = theEventsCalendarConf?.allCustomFields || []

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            value={field.formField || ''}
            onChange={ev => handleFieldMapping(ev, i, theEventsCalendarConf, setTheEventsCalendarConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields?.map(f => (
                <option key={`ff-rm-${f.name}`} value={f.name}>
                  {f.label}
                </option>
              ))}
            </optgroup>
            <option value="custom">{__('Custom...', 'bit-integrations')}</option>
            <optgroup label="General Smart Codes">
              {SmartTagField?.map(f => (
                <option key={`ff-rm-${f.name}`} value={f.name}>
                  {f.label}
                </option>
              ))}
            </optgroup>
          </select>

          {field.formField === 'custom' && (
            <TagifyInput
              onChange={e => handleCustomValue(e, i, theEventsCalendarConf, setTheEventsCalendarConf)}
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
            disabled={i < requiredFields.length}
            name="theEventsCalendarField"
            value={
              i < requiredFields ? requiredFields[i].label || '' : field.theEventsCalendarField || ''
            }
            onChange={ev => handleFieldMapping(ev, i, theEventsCalendarConf, setTheEventsCalendarConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            {i < requiredFields.length ? (
              <option key={requiredFields[i].key} value={requiredFields[i].key}>
                {requiredFields[i].label}
              </option>
            ) : (
              <>
                {customFields.map(({ key, label }) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
                {additionalFields.length > 0 && (
                  <optgroup label={__('Custom Fields', 'bit-integrations')}>
                    {additionalFields.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </>
            )}
          </select>
        </div>
        <div className="flx integ-fld-wrp">
          {i >= requiredFields.length && (
            <>
              <button
                onClick={() => addFieldMap(i, theEventsCalendarConf, setTheEventsCalendarConf)}
                className="icn-btn sh-sm ml-2 mr-1"
                type="button">
                +
              </button>
              <button
                onClick={() => delFieldMap(i, theEventsCalendarConf, setTheEventsCalendarConf)}
                className="icn-btn sh-sm ml-1"
                type="button"
                aria-label="btn">
                <span className="btcd-icn icn-trash-2" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
