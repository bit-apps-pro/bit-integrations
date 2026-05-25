// eslint-disable-next-line import/no-extraneous-dependencies
import { useState } from 'react'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import DripActions from './DripActions'
import { fetchDripAccounts, getCustomFields, staticFields } from './DripCommonFunc'
import DripFieldMap from './DripFieldMap'

export default function DripIntegLayout({ formFields, dripConf, setDripConf, loading, setLoading }) {
  const [error, setError] = useState({ name: '', api_token: '' })

  const handleInput = e => {
    const accountId = e.target.value
    const newConf = { ...dripConf }

    if (accountId) {
      newConf.selectedAccountId = accountId
      getCustomFields(newConf, setDripConf, setLoading)
    } else {
      newConf.selectedAccountId = accountId
      newConf.dripFormFields = staticFields
    }

    setDripConf({ ...newConf })
  }

  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Account:', 'bit-integrations')}</b>
      <select
        value={dripConf?.selectedAccountId}
        name="accountId"
        id=""
        className="btcd-paper-inp w-5"
        onChange={handleInput}>
        <option value="">{__('Select an account', 'bit-integrations')}</option>
        {dripConf?.accounts.map(account => (
          <option key={account.accountId} value={account.accountId}>
            {account.accountName}
          </option>
        ))}
      </select>
      <button
        onClick={() =>
          fetchDripAccounts(
            dripConf,
            setDripConf,
            setLoading,
            'refresh'
          )
        }
        className="icn-btn sh-sm ml-2 mr-2 tooltip"
        style={{ '--tooltip-txt': '"Refresh Accounts"' }}
        type="button"
        disabled={loading?.accounts}>
        &#x21BB;
      </button>
      <br />
      <br />

      {(loading.accounts || loading.customFields) && (
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

      <div className="mt-4">
        <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
        {dripConf?.selectedAccountId && (
          <button
            onClick={() => getCustomFields(dripConf, setDripConf, setLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh custom fields', 'bit-integrations')}'` }}
            type="button"
            disabled={loading?.customFields}>
            &#x21BB;
          </button>
        )}
      </div>
      {dripConf?.selectedAccountId && (
        <>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Drip Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {dripConf.field_map.map((itm, i) => (
            <DripFieldMap
              key={`Drip-m-${i + 9}`}
              i={i}
              field={itm}
              dripConf={dripConf}
              formFields={formFields}
              setDripConf={setDripConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(dripConf.field_map.length, dripConf, setDripConf)}
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
          <DripActions
            dripConf={dripConf}
            setDripConf={setDripConf}
            loading={loading}
            setLoading={setLoading}
          />
        </>
      )}
    </>
  )
}
