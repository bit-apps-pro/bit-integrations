import { useRecoilValue } from 'recoil'
import TrashIcn from '../../../Icons/TrashIcn'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'

import { addFieldMap, delFieldMap, handleFieldMapping } from './PostHelperFunction'
import { $appConfigState } from '../../../GlobalStates'
import TagifyInput from '../../Utilities/TagifyInput'

export default function CustomFieldMap({
  i,
  type,
  formFields,
  field,
  postConf,
  setPostConf,
  customFields,
  fieldType
}) {
  const fldType = {
    acf: {
      propName: 'acf_map',
      fldName: 'acfField'
    },
    acfFile: {
      propName: 'acf_file_map',
      fldName: 'acfFileUpload'
    },
    metabox: {
      propName: 'metabox_map',
      fldName: 'metaboxField'
    },
    metaboxFile: {
      propName: 'metabox_file_map',
      fldName: 'metaboxFileUpload'
    },
    jeCPTFields: {
      propName: 'je_cpt_meta_map',
      fldName: 'jeCPTField'
    },
    jeCPTFiles: {
      propName: 'je_cpt_file_map',
      fldName: 'jeCPTFile'
    }
  }

  const { propName, fldName } = fldType[type]

  const handleCustomValue = (event, index, conftTmp, setConf) => {
    const newConf = { ...conftTmp }
    newConf[propName][index].customValue = event
    setConf({ ...newConf })
  }

  const isRequired =
    customFields.length > 0 && !!customFields.find(fl => fl.key === field[fldName] && fl.required)
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi
  return (
    <div className="flx mt-2 mb-2 btcbi-field-map">
      <div className="flx integ-fld-wrp">
        <select
          className="btcd-paper-inp mr-2"
          name="formField"
          value={field.formField || ''}
          onChange={ev => handleFieldMapping(propName, ev, i, postConf, setPostConf)}>
          <option value="">{__('Select Field', 'bit-integrations')}</option>
          {fieldType === 'fields' ? (
            <>
              <optgroup label={__('Form Fields', 'bit-integrations')}>
                {formFields?.map(
                  f =>
                    f.type !== 'file' && (
                      <option key={`ff-zhcrm-${f.name}`} value={f.name}>
                        {f.label}
                      </option>
                    )
                )}
              </optgroup>
              <option value="custom">{__('Custom...', 'bit-integrations')}</option>
              <optgroup
                label={sprintf(
                  __('General Smart Codes %s', 'bit-integrations'),
                  isPro ? '' : `(${__('Pro', 'bit-integrations')})`
                )}>
                {isPro &&
                  SmartTagField?.map(f => (
                    <option key={`ff-zhcrm-${f.name}`} value={f.name}>
                      {f.label}
                    </option>
                  ))}
              </optgroup>
            </>
          ) : (
            formFields?.map(
              f =>
                f.type === 'file' && (
                  <option key={`ff-zhcrm-${f.name}`} value={f.name}>
                    {f.label}
                  </option>
                )
            )
          )}
        </select>
        {field.formField === 'custom' && (
          <TagifyInput
            onChange={e => handleCustomValue(e, i, postConf, setPostConf)}
            label={__('Custom Value', 'bit-integrations')}
            className="mr-2"
            type="text"
            value={field.customValue || ''}
            placeholder={__('Custom Value', 'bit-integrations')}
            formFields={formFields}
          />
        )}
        <select
          className="btcd-paper-inp"
          name={fldName}
          value={field[fldName] || ''}
          onChange={ev => handleFieldMapping(propName, ev, i, postConf, setPostConf)}
          disabled={isRequired}>
          <option value="">{__('Select Field', 'bit-integrations')}</option>
          {customFields.length > 0 &&
            customFields?.map(header => (
              <option key={`${header.key}-1`} value={header.key}>
                {`${header.name}`}
              </option>
            ))}
        </select>
      </div>

      {!isRequired && (
        <>
          <button
            onClick={() => addFieldMap(propName, i, postConf, setPostConf)}
            className="icn-btn sh-sm ml-2 mr-1"
            type="button">
            +
          </button>
          <button
            onClick={() => delFieldMap(propName, i, postConf, setPostConf)}
            className="icn-btn sh-sm ml-1"
            type="button"
            aria-label="btn">
            <TrashIcn />
          </button>
        </>
      )}
    </div>
  )
}
