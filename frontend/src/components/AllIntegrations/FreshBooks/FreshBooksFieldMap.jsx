import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { actions, freshBooksStaticData } from './staticData'

export default function FreshBooksFieldMap({
  i,
  formFields,
  field,
  freshBooksConf,
  setFreshBooksConf,
  handleFieldMapping,
  addFieldMap,
  delFieldMap,
  handleCustomValue,
  uploadFields
}) {
  const mainAction = freshBooksConf.mainAction || ''
  const actionFields = freshBooksStaticData[mainAction] || []
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
            onChange={ev => handleFieldMapping(ev, i, freshBooksConf, setFreshBooksConf, uploadFields)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields.map(f => (
                <option key={`ff-fb-${f.name}`} value={f.name}>
                  {f.label}
                </option>
              ))}
            </optgroup>
            <option value="custom">{__('Custom...', 'bit-integrations')}</option>
          </select>

          {field.formField === 'custom' && (
            <input
              className="btcd-paper-inp mr-2"
              type="text"
              name="customValue"
              value={field.customValue || ''}
              onChange={ev => handleCustomValue(ev, i, freshBooksConf, setFreshBooksConf)}
              placeholder={__('Custom Value', 'bit-integrations')}
            />
          )}

          <select
            className="btcd-paper-inp"
            name="freshBooksField"
            value={field.freshBooksField || ''}
            onChange={ev => handleFieldMapping(ev, i, freshBooksConf, setFreshBooksConf, uploadFields)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            {actionFields.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flx integ-fld-wrp">
          <button
            onClick={() => addFieldMap(i, freshBooksConf, setFreshBooksConf, false)}
            className="icn-btn sh-sm ml-2 mr-1"
            type="button">
            +
          </button>
          <button
            onClick={() => delFieldMap(i, freshBooksConf, setFreshBooksConf, false)}
            className="icn-btn sh-sm ml-1"
            type="button"
            aria-label="btn">
            <span className="btcd-icn icn-trash-2" />
          </button>
        </div>
      </div>
    </div>
  )
}
