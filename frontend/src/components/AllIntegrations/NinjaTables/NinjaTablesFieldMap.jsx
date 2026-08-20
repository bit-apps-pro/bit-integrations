import { create } from 'mutative'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import TrashIcn from '../../../Icons/TrashIcn'
import { __ } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import TagifyInput from '../../Utilities/TagifyInput'

export default function NinjaTablesFieldMap({
  i,
  formFields,
  field,
  ninjaTablesConf,
  setNinjaTablesConf
}) {
  const { isPro } = useRecoilValue($appConfigState)

  const updateFieldMap = (index, updates) => {
    setNinjaTablesConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.field_map[index]) {
          draftConf.field_map[index] = {}
        }
        Object.assign(draftConf.field_map[index], updates)
      })
    )
  }

  const handleFormFieldChange = (event, index) => {
    const value = event.target.value
    const updates = { formField: value }

    if (value === 'custom') {
      updates.customValue = ''
    } else {
      setNinjaTablesConf(prevConf =>
        create(prevConf, draftConf => {
          draftConf.field_map[index].formField = value
          delete draftConf.field_map[index].customValue
        })
      )
      return
    }

    updateFieldMap(index, updates)
  }

  const handleColumnChange = (event, index) => {
    const value = event.target.value
    const updates = { columnName: value }

    if (value === 'custom') {
      updates.customColumnName = ''
    } else {
      setNinjaTablesConf(prevConf =>
        create(prevConf, draftConf => {
          draftConf.field_map[index].columnName = value
          delete draftConf.field_map[index].customColumnName
        })
      )
      return
    }

    updateFieldMap(index, updates)
  }

  const handleFieldMapping = (event, index, fieldType) => {
    if (fieldType === 'formField') {
      handleFormFieldChange(event, index)
    } else if (fieldType === 'columnName') {
      handleColumnChange(event, index)
    } else {
      updateFieldMap(index, { [fieldType]: event.target.value })
    }
  }

  const handleCustomValue = (event, index) => {
    updateFieldMap(index, { customValue: event.target.value })
  }

  const handleRemoveField = index => {
    setNinjaTablesConf(prevConf =>
      create(prevConf, draftConf => {
        if (draftConf.field_map.length > 1) {
          draftConf.field_map.splice(index, 1)
        }
      })
    )
  }

  const getColumnOptions = () => {
    const columns = ninjaTablesConf?.default?.allColumns
    if (!Array.isArray(columns)) return []

    return columns.map(col => ({
      key: col.key,
      name: col.name
    }))
  }

  const columnOptions = getColumnOptions()

  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="flx integ-fld-wrp">
        <select
          className="btcd-paper-inp mr-2"
          name="formField"
          value={field.formField || ''}
          onChange={event => handleFieldMapping(event, i, 'formField')}>
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
            label={`${__('General Smart Codes', 'bit-integrations')} ${isPro ? '' : `(${__('Pro', 'bit-integrations')})`}`}>
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
            onChange={e => handleCustomValue(e, i)}
            label={__('Custom Value', 'bit-integrations')}
            className="mr-2"
            type="text"
            value={field.customValue || ''}
            placeholder={__('Custom Value', 'bit-integrations')}
            formFields={formFields}
          />
        )}

        <select
          className="btcd-paper-inp mr-2"
          name="columnName"
          value={field.columnName || ''}
          onChange={event => handleFieldMapping(event, i, 'columnName')}>
          <option value="">{__('Select Column', 'bit-integrations')}</option>
          {columnOptions.map(col => (
            <option key={col.key} value={col.key}>
              {col.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => handleRemoveField(i)}
        className="icn-btn sh-sm ml-2"
        type="button"
        title={__('Remove', 'bit-integrations')}
        aria-label="btn">
        <TrashIcn size={16} />
      </button>
    </div>
  )
}
