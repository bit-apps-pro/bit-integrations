import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import GetResponseActions from './GetResponseActions'
import { fetchCampaigns, fetchCustomFields } from './GetResponseCommonFunc'
import GetResponseFieldMap from './GetResponseFieldMap'
import { addFieldMap } from './IntegrationHelpers'

export default function GetResponseIntegLayout({
  formFields,
  handleInput,
  getResponseConf,
  setGetResponseConf,
  loading,
  setLoading,
  setSnackbar
}) {
  return (
    <>
      <br />

      <b className="wdt-200 d-in-b">{__('Campaigns:', 'bit-integrations')}</b>
      <select
        onChange={handleInput}
        name="campaignId"
        value={getResponseConf.campaignId}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Campaign', 'bit-integrations')}</option>
        {getResponseConf?.campaigns &&
          getResponseConf.campaigns.map(({ campaignId, name }) => (
            <option key={campaignId} value={campaignId}>
              {name}
            </option>
          ))}
      </select>
      <button
        onClick={() =>
          fetchCampaigns(
            getResponseConf,
            setGetResponseConf,
            undefined,
            undefined,
            loading,
            setLoading,
            'refreshCampaigns'
          )
        }
        className="icn-btn sh-sm ml-2 mr-2 tooltip"
        style={{ '--tooltip-txt': `'${__('Fetch All Campaigns', 'bit-integrations')}'` }}
        type="button"
        disabled={loading.customFields}>
        &#x21BB;
      </button>
      {(loading.customFields || loading.field) && (
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
      {getResponseConf?.campaignId && (
        <div>
          <br />
          <div className="mt-5">
            <b className="wdt-100">
              {__('Field Map', 'bit-integrations')}
              <button
                onClick={() =>
                  fetchCustomFields(getResponseConf, setGetResponseConf, setLoading, 'manual')
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh custom fields', 'bit-integrations')}'` }}
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
              <b>{__('GetResponse Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {getResponseConf?.campaignId &&
            getResponseConf?.field_map.map((itm, i) => (
              <GetResponseFieldMap
                key={`rp-m-${i + 9}`}
                i={i}
                field={itm}
                getResponseConf={getResponseConf}
                formFields={formFields}
                setGetResponseConf={setGetResponseConf}
                setSnackbar={setSnackbar}
              />
            ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(getResponseConf.field_map.length, getResponseConf, setGetResponseConf, false)
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
          <GetResponseActions
            getResponseConf={getResponseConf}
            setGetResponseConf={setGetResponseConf}
            formFields={formFields}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      )}
    </>
  )
}
