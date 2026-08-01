import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from './KirimEmailIntegrationHelpers'
import KirimEmailFieldMap from './KirimEmailFieldMap'
import KirimEmailActions from './KirimEmailActions'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { getAllList } from './KirimEmailCommonFunc'

export default function KirimEmailIntegLayout({
  formFields,
  kirimEmailConf,
  setKirimEmailConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const inputHandler = e => {
    const newConf = { ...kirimEmailConf }
    const { name } = e.target
    if (e.target.value !== '') {
      newConf[name] = e.target.value
    } else {
      delete newConf[name]
    }

    newConf[e.target.name] = e.target.value
    setKirimEmailConf({ ...newConf })
  }

  const changeHandler = (val, name) => {
    const newConf = { ...kirimEmailConf }
    if (name === 'listId') {
      if (val !== '') {
        newConf[name] = val
      } else {
        delete newConf[name]
      }
    }

    setKirimEmailConf({ ...newConf })
  }
  return (
    <>
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
      <>
        <br />
        <b className="wdt-200 d-in-b">{__('Actions:', 'bit-integrations')}</b>
        <select
          onChange={inputHandler}
          name="mainAction"
          value={kirimEmailConf?.mainAction}
          className="btcd-paper-inp w-5">
          <option value="">{__('Select Actions', 'bit-integrations')}</option>
          {kirimEmailConf?.allActions &&
            kirimEmailConf.allActions.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
        </select>
        <br />
        <br />
        {kirimEmailConf.mainAction === '1' && (
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select List:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={kirimEmailConf?.listId}
              options={
                kirimEmailConf?.default?.allLists &&
                kirimEmailConf?.default.allLists.map(item => ({
                  label: item.name,
                  value: item.id
                }))
              }
              onChange={val => changeHandler(val, 'listId')}
              singleSelect
            />
            <button
              onClick={() => getAllList(kirimEmailConf, setKirimEmailConf, setIsLoading, setSnackbar)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch All lists', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        )}
        <br />
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
        </div>
        <div className="btcd-hr mt-1" />
        <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
          <div className="txt-dp">
            <b>{__('Form Fields', 'bit-integrations')}</b>
          </div>
          <div className="txt-dp">
            <b>{__('Kirim Email Fields', 'bit-integrations')}</b>
          </div>
        </div>

        {kirimEmailConf.field_map.map((itm, i) => (
          <KirimEmailFieldMap
            key={`keap-m-${i + 9}`}
            i={i}
            field={itm}
            formFields={formFields}
            kirimEmailConf={kirimEmailConf}
            setKirimEmailConf={setKirimEmailConf}
          />
        ))}
        <br />
        <br />

        <div className="txt-center btcbi-field-map-button mt-2">
          <button
            onClick={() =>
              addFieldMap(kirimEmailConf.field_map.length, kirimEmailConf, setKirimEmailConf)
            }
            className="icn-btn sh-sm"
            type="button">
            +
          </button>
        </div>
      </>
    </>
  )
}
