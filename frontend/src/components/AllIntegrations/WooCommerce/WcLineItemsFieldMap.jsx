/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-unused-expressions */
import TrashIcn from '../../../Icons/TrashIcn'
import { deepCopy } from '../../../Utils/Helpers'
import { __ } from '../../../Utils/i18nwrap'
import MtInput from '../../Utilities/MtInput'

export default function WcLineItemsFieldMap({ i, formFields, field, wcConf, setWcConf }) {
  const isRequired = field.required === true

  const addFieldMap = indx => {
    const newConf = { ...wcConf }
    newConf.line_item.field_map.splice(indx, 0, {})
    setWcConf(newConf)
  }

  const delFieldMap = indx => {
    const newConf = deepCopy(wcConf)

    newConf.line_item.field_map.splice(indx, 1)

    setWcConf(newConf)
  }

  const handleFieldMapping = (event, indx) => {
    const newConf = deepCopy(wcConf)

    newConf.line_item.field_map[indx][event.target.name] = event.target.value

    if (event.target.value === 'custom') {
      newConf.line_item.field_map[indx].customValue = ''
    }

    setWcConf(newConf)
  }

  const handleCustomValue = (event, indx) => {
    const newConf = deepCopy(wcConf)
    newConf.line_item.field_map[indx].customValue = event.target.value
    setWcConf(newConf)
  }

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="flx integ-fld-wrp">
        <select
          className="btcd-paper-inp mr-2"
          name="formField"
          value={field.formField || ''}
          onChange={ev => handleFieldMapping(ev, i)}>
          <option value="">{__('Select Field', 'bit-integrations')}</option>
          {formFields.map(
            f =>
              f.type !== 'file' && (
                <option key={`ff-zhcrm-${f.name}`} value={f.name}>
                  {f.label}
                </option>
              )
          )}
          <option value="custom">{__('Custom...', 'bit-integrations')}</option>
        </select>

        {field.formField === 'custom' && (
          <MtInput
            onChange={e => handleCustomValue(e, i)}
            label={__('Custom Value', 'bit-integrations')}
            className="mr-2"
            type="text"
            value={field.customValue}
            placeholder={__('Custom Value', 'bit-integrations')}
          />
        )}

        <select
          className="btcd-paper-inp"
          name="wcField"
          value={field.wcField || ''}
          onChange={ev => handleFieldMapping(ev, i)}
          disabled={isRequired}>
          <option value="">{__('Select Field', 'bit-integrations')}</option>
          {Object.values(wcConf.default.fields.line_item.fields).map(fld => {
            if (isRequired) {
              if (fld.required && fld.fieldKey === field.wcField) {
                return (
                  <option key={`${fld.fieldKey}-1`} value={fld.fieldKey}>
                    {fld.fieldName}
                  </option>
                )
              }
            } else if (!fld.required) {
              return (
                <option key={`${fld.fieldKey}-1`} value={fld.fieldKey}>
                  {fld.fieldName}
                </option>
              )
            }
          })}
        </select>
      </div>
      {!isRequired && (
        <>
          <button onClick={() => addFieldMap(i)} className="icn-btn sh-sm ml-2 mr-1" type="button">
            +
          </button>
          <button
            onClick={() => delFieldMap(i)}
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
