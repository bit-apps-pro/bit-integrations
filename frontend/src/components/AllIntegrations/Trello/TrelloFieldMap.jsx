import { useRecoilValue } from 'recoil'
import { __, sprintf } from '../../../Utils/i18nwrap'
import MtInput from '../../Utilities/MtInput'
import { handleCustomValue, handleFieldMapping } from './IntegrationHelpers'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import { $appConfigState } from '../../../GlobalStates'
import { generateMappedField } from './TrelloCommonFunc'
import TagifyInput from '../../Utilities/TagifyInput'
import Cooltip from '../../Utilities/Cooltip'

export default function TrelloFieldMap({
  i,
  fieldKey,
  mapKey,
  formFields,
  field,
  trelloConf,
  setTrelloConf,
  addFieldMap,
  delFieldMap
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi
  const requiredFlds = trelloConf[fieldKey]?.filter(fld => fld.required === true) || []
  const hideDesc = fieldKey === 'cardFields' && Boolean(trelloConf?.actions?.richTextDesc)
  const nonRequiredFlds =
    trelloConf[fieldKey]?.filter(
      fld => fld.required === false && !(hideDesc && fld.key === 'desc')
    ) || []

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="pos-rel flx">
        <div className="flx integ-fld-wrp">
          <select
            className="btcd-paper-inp mr-2"
            name="formField"
            value={field.formField || ''}
            onChange={ev => handleFieldMapping(ev, i, setTrelloConf, mapKey)}>
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
            <TagifyInput
              onChange={e => handleCustomValue(e, i, setTrelloConf, mapKey)}
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
            name="trelloFormField"
            value={i < requiredFlds.length ? requiredFlds[i].key || '' : field.trelloFormField || ''}
            onChange={ev => handleFieldMapping(ev, i, setTrelloConf, mapKey)}>
            <option value="">{__('Select  Field', 'bit-integrations')}</option>
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
        {trelloConf[mapKey][i]?.options?.length > 0 && (
          <div>
            <Cooltip width={250} icnSize={17} className="ml-2">
              <div className="txt-body">
                <p>{__('Custom field options', 'bit-integrations')}</p>
                {trelloConf[mapKey][i].options.map(option => (
                  <li key={option.id}>{option?.value?.text}</li>
                ))}
              </div>
            </Cooltip>
          </div>
        )}
        {i >= requiredFlds.length && (
          <>
            <button
              onClick={() => addFieldMap(setTrelloConf)}
              className="icn-btn sh-sm ml-2 mr-1"
              type="button">
              +
            </button>
            <button
              onClick={() => delFieldMap(i, setTrelloConf)}
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
