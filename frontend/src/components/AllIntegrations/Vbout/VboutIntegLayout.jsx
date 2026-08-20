import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from './IntegrationHelpers'
import VboutFieldMap from './VboutFieldMap'
import VboutActions from './VboutActions'
import { getAllLists, VboutRefreshFields } from './VboutCommonFunc'

export default function VboutIntegLayout({
  handleInput,
  formFields,
  vboutConf,
  setVboutConf,
  loading,
  setLoading,
  setSnackbar
}) {
  const handleList = e => {
    const newConf = { ...vboutConf }
    const { name } = e.target
    if (e.target.value !== '') {
      newConf[name] = e.target.value
    } else {
      delete newConf[name]
    }
    if (e.target.value !== '') {
      VboutRefreshFields(newConf, setVboutConf, loading, setLoading)
    }
    setVboutConf({ ...newConf })
  }
  const ContactStatus = [
    {
      label: __('Active', 'bit-integrations'),
      value: 'active'
    },

    // {
    //     label: __('Unsubscribed','bit-integrations'),
    //     value: 'unsubscribed'
    // },
    // {
    //     label: __('Bounced Email','bit-integrations'),
    //     value: 'bounced'
    // },
    {
      label: __('Unconfirmed', 'bit-integrations'),
      value: 'unconfirmed'
    }
  ]

  return (
    <>
      <br />
      <br />
      <b className="wdt-200 d-in-b">{__('List:', 'bit-integrations')}</b>
      <select
        name="list_id"
        value={vboutConf.list_id}
        className="btcd-paper-inp w-5"
        onChange={handleList}>
        <option value="">{__('Select List', 'bit-integrations')}</option>
        {vboutConf?.default?.lists &&
          vboutConf.default.lists.map(list => (
            <option key={list.list_id} value={list.list_id}>
              {list.name}
            </option>
          ))}
      </select>
      <button
        onClick={() => getAllLists(vboutConf, setVboutConf, loading, setLoading)}
        className="icn-btn sh-sm ml-2 mr-2 tooltip"
        style={{ '--tooltip-txt': '"Refresh list"' }}
        type="button"
        disabled={loading.list}>
        &#x21BB;
      </button>
      <br />
      <br />
      {loading.list && (
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
      {vboutConf?.list_id && !loading.field && (
        <>
          <b className="wdt-200 d-in-b">{__('Contact Status:', 'bit-integrations')}</b>
          <select
            onChange={e => handleInput(e, vboutConf, setVboutConf)}
            name="contact_status"
            value={vboutConf.contact_status}
            className="btcd-paper-inp w-5">
            <option value="">{__('Select Status', 'bit-integrations')}</option>
            {ContactStatus.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </>
      )}
      {loading.field && (
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

      {vboutConf?.list_id && vboutConf?.contact_status && !loading.field && (
        <>
          <div className="mt-5">
            <b className="wdt-100">
              {__('Field Map', 'bit-integrations')}
              <button
                onClick={() => VboutRefreshFields(vboutConf, setVboutConf, loading, setLoading)}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': '"Refresh Fields"' }}
                type="button"
                disabled={loading.field}>
                &#x21BB;
              </button>
            </b>
          </div>
          <br />
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Vbout Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {vboutConf?.field_map.map((itm, i) => (
            <VboutFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              vboutConf={vboutConf}
              formFields={formFields}
              setVboutConf={setVboutConf}
              setSnackbar={setSnackbar}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(vboutConf.field_map.length, vboutConf, setVboutConf, false)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
          <br />
        </>
      )}
      {vboutConf?.list_id && vboutConf?.contact_status && (
        <>
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <VboutActions vboutConf={vboutConf} setVboutConf={setVboutConf} formFields={formFields} />
        </>
      )}
    </>
  )
}
