import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import TagifyInput from '../../Utilities/TagifyInput'
import { addMetaFieldMap, delMetaFieldMap, handleMetaMapping } from './FormyChatCommonFunc'

export default function FormyChatMetaFieldMap({ i, formFields, field, formyChatConf, setFormyChatConf }) {
  const { isPro } = useRecoilValue($appConfigState)

  const handleCustomValue = (val, index) => {
    const newConf = { ...formyChatConf }
    newConf.meta_map[index].customValue = val?.target?.value || val
    setFormyChatConf({ ...newConf })
  }

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            value={field.formField || ''}
            onChange={ev => handleMetaMapping(ev, i, formyChatConf, setFormyChatConf)}>
            <option value="">{__('Select Field', 'bit-integrations')}</option>
            <optgroup label={__('Form Fields', 'bit-integrations')}>
              {formFields?.map(f => (
                <option key={`ff-fcm-${f.name}`} value={f.name}>{f.label}</option>
              ))}
            </optgroup>
            <option value="custom">{__('Custom...', 'bit-integrations')}</option>
            <optgroup
              label={sprintf(
                __('General Smart Codes %s', 'bit-integrations'),
                isPro ? '' : `(${__('Pro', 'bit-integrations')})`
              )}>
              {isPro && SmartTagField?.map(f => (
                <option key={`ff-fcm-st-${f.name}`} value={f.name}>{f.label}</option>
              ))}
            </optgroup>
          </select>

          {field.formField === 'custom' && (
            <TagifyInput
              onChange={e => handleCustomValue(e, i)}
              label={__('Custom Value', 'bit-integrations')}
              className="mr-2"
              type="text"
              value={field.customValue || ''}
              placeholder={__('Custom Value', 'bit-integrations')}
              formFields={formFields}
            />
          )}

          <input
            className="btcd-paper-inp"
            name="metaKey"
            value={field.metaKey || ''}
            onChange={ev => handleMetaMapping(ev, i, formyChatConf, setFormyChatConf)}
            type="text"
            placeholder={__('Meta Key...', 'bit-integrations')}
          />
        </div>

        <>
          <button
            onClick={() => addMetaFieldMap(i, formyChatConf, setFormyChatConf)}
            className="icn-btn sh-sm ml-2 mr-1"
            type="button">
            +
          </button>
          <button
            onClick={() => delMetaFieldMap(i, formyChatConf, setFormyChatConf)}
            className="icn-btn sh-sm ml-1"
            type="button"
            aria-label="btn">
            <span className="btcd-icn icn-trash-2" />
          </button>
        </>
      </div>
    </div>
  )
}
