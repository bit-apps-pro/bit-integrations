import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import MailBlusterActions from './MailBlusterActions'
import { fetchCustomFields } from './MailBlusterCommonFunc'
import MailBlusterFieldMap from './MailBlusterFieldMap'
import { addFieldMap } from './IntegrationHelpers'

export default function MailBlusterIntegLayout({
  formFields,
  handleInput,
  mailBlusterConf,
  setMailBlusterConf,
  loading,
  setLoading,
  setSnackbar
}) {
  return (
    <>
      <br />

      <b className="wdt-200 d-in-b">{__('Type:', 'bit-integrations')}</b>
      <select
        onChange={handleInput}
        name="subscribed"
        value={mailBlusterConf.subscribed}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select subscription type', 'bit-integrations')}</option>
        <option value="true">{__('Subscribed', 'bit-integrations')}</option>
        <option value="false">{__('Unsubscribed', 'bit-integrations')}</option>
      </select>
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
      {mailBlusterConf.subscribed && (
        <div>
          <br />
          <div className="mt-5">
            <b className="wdt-100">
              {__('Field Map', 'bit-integrations')}
              <button
                onClick={() =>
                  fetchCustomFields(
                    mailBlusterConf,
                    setMailBlusterConf,
                    undefined,
                    undefined,
                    loading,
                    setLoading,
                    'refreshCustomFields'
                  )
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh custom fields', 'bit-integrations')}'` }}
                type="button"
                disabled={loading.customFields}>
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
              <b>{__('MailBluster Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {mailBlusterConf?.field_map.map((itm, i) => (
            <MailBlusterFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              mailBlusterConf={mailBlusterConf}
              formFields={formFields}
              setMailBlusterConf={setMailBlusterConf}
              setSnackbar={setSnackbar}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(mailBlusterConf.field_map.length, mailBlusterConf, setMailBlusterConf, false)
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
          <MailBlusterActions
            mailBlusterConf={mailBlusterConf}
            setMailBlusterConf={setMailBlusterConf}
            formFields={formFields}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      )}
    </>
  )
}
