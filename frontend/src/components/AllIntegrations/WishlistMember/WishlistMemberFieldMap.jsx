import { create } from 'mutative'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import TrashIcn from '../../../Icons/TrashIcn'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import TagifyInput from '../../Utilities/TagifyInput'
import { handleCustomValue } from '../IntegrationHelpers/IntegrationHelpers'
import { addFieldMap, deleteFieldMap } from './WishlistMemberCommonFunc'

export default function WishlistMemberFieldMap({
  i,
  formFields,
  field,
  wishlistMemberConf,
  wishlistFields,
  setWishlistMemberConf
}) {
  const requiredFlds = wishlistFields.filter(fld => fld.required === true) || []
  const nonRequiredFlds = wishlistFields.filter(fld => fld.required === false) || []

  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleFieldMapping = (event, indx) => {
    setWishlistMemberConf(prevConf =>
      create(prevConf, draftConf => {
        const { name, value } = event.target
        draftConf.field_map[indx][name] = value

        if (value === 'custom') {
          draftConf.field_map[indx].customValue = ''
        }
      })
    )
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
            onChange={e => handleCustomValue(e, i, wishlistMemberConf, setWishlistMemberConf)}
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
          name="wishlistMemberField"
          value={i < requiredFlds.length ? requiredFlds[i].key || '' : field.wishlistMemberField || ''}
          onChange={ev => handleFieldMapping(ev, i)}>
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

      {wishlistFields?.length > 1 && (
        <>
          <button
            onClick={() => addFieldMap(i + 1, setWishlistMemberConf)}
            className="icn-btn sh-sm ml-2 mr-1"
            type="button">
            +
          </button>
          <button
            onClick={() => deleteFieldMap(i, setWishlistMemberConf)}
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
