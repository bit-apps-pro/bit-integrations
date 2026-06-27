import { create } from 'mutative'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import TrashIcn from '../../../Icons/TrashIcn'
import TagifyInput from '../../Utilities/TagifyInput'

export default function NotificationXEntryFieldMap({
  i,
  field,
  formFields,
  notificationXConf,
  setNotificationXConf
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleChange = e => {
    setNotificationXConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.entry_map[i][e.target.name] = e.target.value
      })
    )
  }

  const handleCustomValue = val => {
    setNotificationXConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.entry_map[i].customValue = val
      })
    )
  }

  const addRow = () => {
    setNotificationXConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.entry_map.splice(i + 1, 0, { formField: '', entryKey: '' })
      })
    )
  }

  const delRow = () => {
    setNotificationXConf(prevConf =>
      create(prevConf, draftConf => {
        if (draftConf.entry_map.length > 1) {
          draftConf.entry_map.splice(i, 1)
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
          onChange={handleChange}>
          <option value="">{__('Select Field', 'bit-integrations')}</option>
          <optgroup label={__('Form Fields', 'bit-integrations')}>
            {formFields?.map(f => (
              <option key={`ff-nx-entry-${f.name}`} value={f.name}>
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
                <option key={`ff-nx-entry-smart-${f.name}`} value={f.name}>
                  {f.label}
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
            value={field.customValue || ''}
            placeholder={__('Custom Value', 'bit-integrations')}
            formFields={formFields}
          />
        )}

        <input
          className="btcd-paper-inp"
          name="entryKey"
          value={field.entryKey || ''}
          onChange={handleChange}
          type="text"
          placeholder={__('Entry Fields Key', 'bit-integrations')}
        />
      </div>

      <button onClick={addRow} className="icn-btn sh-sm ml-2 mr-1" type="button">
        +
      </button>
      <button onClick={delRow} className="icn-btn sh-sm ml-1" type="button" aria-label="btn">
        <TrashIcn />
      </button>
    </div>
  )
}
