/* eslint-disable no-console */
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import EmailOctopusActions from './EmailOctopusActions'
import { fetchAllLists, getAllFields } from './EmailOctopusCommonFunc'
import EmailOctopusFieldMap from './EmailOctopusFieldMap'
import { addFieldMap } from './IntegrationHelpers'

export default function EmailOctopusIntegLayout({
  formFields,
  handleInput,
  emailOctopusConf,
  setEmailOctopusConf,
  loading,
  setLoading,
  setSnackbar
}) {
  const setChanges = val => {
    const newConf = { ...emailOctopusConf }
    newConf.selectedList = val
    setEmailOctopusConf({ ...newConf })
    getAllFields(newConf, setEmailOctopusConf, loading, setLoading)
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Select List:', 'bit-integrations')}</b>
        <MultiSelect
          singleSelect
          options={emailOctopusConf.lists?.map(list => ({ label: list.name, value: list.id }))}
          className="msl-wrp-options"
          defaultValue={emailOctopusConf?.selectedList}
          onChange={val => setChanges(val)}
        />
        <button
          onClick={() =>
            fetchAllLists(emailOctopusConf, setEmailOctopusConf, loading, setLoading, 'refresh')
          }
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh  Lists', 'bit-integrations')}'` }}
          type="button"
          disabled={loading.lists}>
          &#x21BB;
        </button>
      </div>

      {(loading.lists || loading.customFields) && (
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
      <div>
        <br />
        <div className="mt-5">
          <b className="wdt-100">
            {__('Field Map', 'bit-integrations')}
            <button
              onClick={() =>
                getAllFields(emailOctopusConf, setEmailOctopusConf, loading, setLoading)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh custom fields', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.customFields || !emailOctopusConf.selectedList}>
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
            <b>{__('EmailOctopus Fields', 'bit-integrations')}</b>
          </div>
        </div>

        {loading.emailOctopusFields && (
          <div>
            {' '}
            {emailOctopusConf?.field_map.map((itm, i) => (
              <EmailOctopusFieldMap
                key={`rp-m-${i + 9}`}
                i={i}
                field={itm}
                emailOctopusConf={emailOctopusConf}
                formFields={formFields}
                setEmailOctopusConf={setEmailOctopusConf}
                setSnackbar={setSnackbar}
              />
            ))}
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(
                    emailOctopusConf.field_map.length,
                    emailOctopusConf,
                    setEmailOctopusConf,
                    false
                  )
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
            <EmailOctopusActions
              emailOctopusConf={emailOctopusConf}
              setEmailOctopusConf={setEmailOctopusConf}
              formFields={formFields}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
        )}
      </div>
    </>
  )
}
