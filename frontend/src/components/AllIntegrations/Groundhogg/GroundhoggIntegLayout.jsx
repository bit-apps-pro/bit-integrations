import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import { SmartTagField } from '../../../Utils/StaticData/SmartTagField'
import Loader from '../../Loaders/Loader'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import GroundhoggActions from './GroundhoggActions'
import { fetchAllTags } from './GroundhoggCommonFunc'
import GroundhoggFieldMap from './GroundhoggFieldMap'
import GroundhoggMetaFieldMap from './GroundhoggMetaFieldMap'
import { addMetaFieldMap } from './IntegrationHelpers'

export default function GroundhoggIntegLayout({
  formFields,
  handleInput,
  groundhoggConf,
  setGroundhoggConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const actionHandler = (e, type) => {
    const newConf = { ...groundhoggConf }
    if (type === 'showMeta') {
      if (e.target?.checked) {
        newConf.showMeta = true
      } else {
        delete newConf.showMeta
      }
    }
    setGroundhoggConf({ ...newConf })
  }

  const onSelectHandler = val => {
    const newConf = { ...groundhoggConf }
    if (val) {
      newConf.addTagToUser = val
    } else {
      newConf.addTagToUser = ''
    }
    setGroundhoggConf({ ...newConf })
  }
  const onEmailHandler = val => {
    const newConf = { ...groundhoggConf }
    if (val) {
      newConf.emailAddress = val
    } else {
      newConf.emailAddress = ''
    }
    setGroundhoggConf({ ...newConf })
  }

  const organizedTags = (groundhoggConf?.default?.tags || []).map(({ tag_name }) => ({
    label: tag_name,
    value: `ground-${tag_name}`
  }))
  const allFormFields = formFields.map(itm => ({ label: itm.label, value: itm.name }))

  const options = [
    { type: 'group', title: __('Groundhogg Tags', 'bit-integrations'), childs: organizedTags },
    { type: 'group', title: __('Form Fields', 'bit-integrations'), childs: allFormFields },
    {
      type: 'group',
      title: __('Special Tags', 'bit-integrations'),
      childs: SmartTagField?.map(fld => ({ label: fld.label, value: fld.name }))
    }
  ]

  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Actions:', 'bit-integrations')}</b>
      <select
        onChange={handleInput}
        name="mainAction"
        value={groundhoggConf.mainAction}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Actions', 'bit-integrations')}</option>
        {groundhoggConf.allActions &&
          groundhoggConf.allActions.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
      </select>
      <br />
      <br />
      {groundhoggConf.mainAction === '2' && (
        <div className="d-flx">
          <b className="wdt-200 d-in-b mt-3 mt-i-3">{__('Email:', 'bit-integrations')}</b>
          <MultiSelect
            options={allFormFields}
            className="btcd-paper-drpdwn w-5"
            defaultValue={groundhoggConf.emailAddress}
            onChange={val => onEmailHandler(val)}
            singleSelect
            closeOnSelect
          />
        </div>
      )}
      {isLoading && (
        <Loader
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            transform: 'scale(0.7)'
          }}
        />
      )}
      <br />
      {groundhoggConf.mainAction === '1' && (
        <>
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Groundhogg Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {groundhoggConf?.field_map.map((itm, i) => (
            <GroundhoggFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              groundhoggConf={groundhoggConf}
              formFields={formFields}
              setGroundhoggConf={setGroundhoggConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(groundhoggConf.field_map.length, groundhoggConf, setGroundhoggConf, false)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <TableCheckBox
            checked={groundhoggConf?.showMeta || false}
            onChange={e => actionHandler(e, 'showMeta')}
            className="wdt-200 mt-4 mr-2"
            value="showMeta"
            title={__('Add Meta field', 'bit-integrations')}
          />
        </>
      )}
      <br />

      {groundhoggConf.mainAction === '1' && groundhoggConf.showMeta && (
        <>
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Groundhogg Meta Fields', 'bit-integrations')}</b>
            </div>
          </div>
          {groundhoggConf?.field_map_meta.map((itm, i) => (
            <GroundhoggMetaFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              groundhoggConf={groundhoggConf}
              formFields={formFields}
              setGroundhoggConf={setGroundhoggConf}
            />
          ))}
        </>
      )}

      {groundhoggConf.mainAction === '1' && groundhoggConf.showMeta && (
        <div className="txt-center btcbi-field-map-button mt-2">
          <button
            onClick={() =>
              addMetaFieldMap(
                groundhoggConf.field_map_meta.length,
                groundhoggConf,
                setGroundhoggConf,
                false
              )
            }
            className="icn-btn sh-sm"
            type="button">
            +
          </button>
        </div>
      )}
      {groundhoggConf.mainAction === '2' && (
        <div className="d-flx">
          <b className="wdt-200 d-in-b mt-3 mt-i-3">{__('All Tags:', 'bit-integrations')}</b>
          <MultiSelect
            options={options}
            className="btcd-paper-drpdwn w-5"
            defaultValue={groundhoggConf.addTagToUser}
            onChange={val => onSelectHandler(val)}
            customValue
          />
          <button
            onClick={() => fetchAllTags(groundhoggConf, setGroundhoggConf, setIsLoading, null)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh Groundhogg Tags', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}

      <br />
      <br />
      {groundhoggConf.mainAction === '1' && (
        <>
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <GroundhoggActions
            groundhoggConf={groundhoggConf}
            setGroundhoggConf={setGroundhoggConf}
            formFields={formFields}
          />
        </>
      )}
    </>
  )
}
