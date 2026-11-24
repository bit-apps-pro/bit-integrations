import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { sortByField } from '../../../Utils/Helpers'
import { __, sprintf } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import GoogleDriveFolderSelect from './GoogleDriveFolderSelect'
import { addFieldMap, delFieldMap } from './IntegrationHelpers'

export default function GoogleDriveFieldMap({
  i,
  formFields,
  field,
  googleDriveConf,
  setGoogleDriveConf
}) {
  const { isPro } = useRecoilValue($appConfigState)

  const handleFieldMapping = (event, index) => {
    const newConf = { ...googleDriveConf }
    newConf.field_map[index][event.target.name] = event.target.value
    setGoogleDriveConf({ ...newConf })
  }

  const selectFolder = (folder, index) =>
    setGoogleDriveConf(prevConf => ({
      ...prevConf,
      field_map: prevConf.field_map.map((row, rowIndex) =>
        rowIndex === index ? { ...row, googleDriveFormField: folder.id } : row
      ),
      foldersList:
        folder.id === 'root'
          ? prevConf.foldersList
          : [...(prevConf.foldersList || []).filter(({ id }) => id !== folder.id), folder]
    }))

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
              {formFields
                ?.filter(fld => fld.type === 'file')
                .map(f => (
                  <option key={`ff-rm-${f.name}`} value={f.name}>
                    {f.label}
                  </option>
                ))}
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

          {googleDriveConf?.connection_id ? (
            <GoogleDriveFolderSelect
              value={field.googleDriveFormField}
              onChange={folder => selectFolder(folder, i)}
              googleDriveConf={googleDriveConf}
            />
          ) : (
            <select
              className="btcd-paper-inp"
              name="googleDriveFormField"
              value={field.googleDriveFormField}
              onChange={ev => handleFieldMapping(ev, i)}>
              <option value="">{__('Select Folder', 'bit-integrations')}</option>
              {sortByField(googleDriveConf.foldersList, 'name', 'ASC').map(({ name, id }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={() => addFieldMap(i, googleDriveConf, setGoogleDriveConf)}
          className="icn-btn sh-sm ml-2 mr-1"
          type="button">
          +
        </button>
        <button
          onClick={() => delFieldMap(i, googleDriveConf, setGoogleDriveConf)}
          className="icn-btn sh-sm ml-1"
          type="button"
          aria-label="btn">
          <span className="btcd-icn icn-trash-2" />
        </button>
      </div>
    </div>
  )
}
