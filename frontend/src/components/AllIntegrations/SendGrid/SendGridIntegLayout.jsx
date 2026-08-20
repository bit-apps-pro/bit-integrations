/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import SendGridActions from './SendGridActions'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { fetchSendGridCustomFields } from './SendGridCommonFunc'
import SendGridFieldMap from './SendGridFieldMap'
import { addFieldMap } from './IntegrationHelpers'

export default function SendGridIntegLayout({
  formFields,
  sendGridConf,
  setSendGridConf,
  loading,
  setLoading,
  setSnackbar
}) {
  const setChanges = val => {
    const newConf = { ...sendGridConf }
    newConf.selectedLists = val
    setSendGridConf({ ...newConf })
  }

  return (
    <div>
      <div className="mt-5">
        <b className="wdt-100">
          {__('Field Map', 'bit-integrations')}
          <button
            onClick={() => fetchSendGridCustomFields(sendGridConf, setSendGridConf, loading, setLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh custom fields', 'bit-integrations')}'` }}
            type="button"
            disabled={loading.customFields}>
            &#x21BB;
          </button>
        </b>
      </div>
      {loading.customFields && (
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
      <div className="btcd-hr mt-1" />
      <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
        <div className="txt-dp">
          <b>{__('Form Fields', 'bit-integrations')}</b>
        </div>
        <div className="txt-dp">
          <b>{__('SendGrid Fields', 'bit-integrations')}</b>
        </div>
      </div>

      {sendGridConf?.field_map.map((itm, i) => (
        <SendGridFieldMap
          key={`rp-m-${i + 9}`}
          i={i}
          field={itm}
          sendGridConf={sendGridConf}
          formFields={formFields}
          setSendGridConf={setSendGridConf}
          setSnackbar={setSnackbar}
        />
      ))}
      <div>
        <div className="txt-center btcbi-field-map-button mt-2">
          <button
            onClick={() =>
              addFieldMap(sendGridConf.field_map.length, sendGridConf, setSendGridConf, false)
            }
            className="icn-btn sh-sm"
            type="button">
            +
          </button>
        </div>
        <br />
        <br />
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
        </div>
        <div className="btcd-hr mt-1" />
        <SendGridActions
          sendGridConf={sendGridConf}
          setSendGridConf={setSendGridConf}
          loading={loading}
          setLoading={setLoading}
        />
      </div>
    </div>
  )
}
