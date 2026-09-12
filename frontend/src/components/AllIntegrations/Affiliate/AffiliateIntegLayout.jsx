import { useEffect } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import AffiliateActions from './AffiliateActions'
import { getAllAffiliate } from './AffiliateCommonFunc'
import AffiliateFieldMap from './AffiliateFieldMap'
import Note from '../../Utilities/Note'
import UserEmailFieldMap from '../IntegrationHelpers/UserEmailFieldMap'
import UserSourceSelect from '../IntegrationHelpers/UserSourceSelect'

export default function AffiliateIntegLayout({
  formFields,
  handleInput,
  affiliateConf,
  setAffiliateConf,
  isLoading,
  setIsLoading,
  setSnackbar,
  allIntegURL,
  isInfo,
  edit
}) {
  useEffect(() => {
    if (affiliateConf.mainAction === '1') {
      getAllAffiliate(affiliateConf, setAffiliateConf, setIsLoading, setSnackbar)
    }
  }, [affiliateConf.mainAction])

  const changeHandler = (val, status) => {
    const newConf = { ...affiliateConf }
    newConf[status] = val
    setAffiliateConf({ ...newConf })
  }

  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Actions:', 'bit-integrations')}</b>
      <select
        onChange={handleInput}
        name="mainAction"
        value={affiliateConf?.mainAction}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Actions', 'bit-integrations')}</option>
        {affiliateConf?.allActions &&
          affiliateConf.allActions.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
      </select>
      <br />
      <br />
      {affiliateConf?.mainAction === '1' && (
        <>
          <br />
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Affiliate:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={affiliateConf?.affiliate_id}
              options={
                affiliateConf?.default?.allAffiliate &&
                affiliateConf.default.allAffiliate.map(item => ({
                  label: item.affiliate_name,
                  value: item.affiliate_id.toString()
                }))
              }
              onChange={val => changeHandler(val, 'affiliate_id')}
              singleSelect
            />
            <button
              onClick={() => getAllAffiliate(affiliateConf, setAffiliateConf, setIsLoading, setSnackbar)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch All Affiliate List', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      <br />
      <br />
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
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
        </div>
        <div className="btcd-hr mt-1" />
        <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
          <div className="txt-dp">
            <b>{__('Form Fields', 'bit-integrations')}</b>
          </div>
          <div className="txt-dp">
            <b>{__('Affiliate Fields', 'bit-integrations')}</b>
          </div>
        </div>
        {affiliateConf.field_map.map((itm, i) => (
          <AffiliateFieldMap
            key={`dash-m-${i + 9}`}
            i={i}
            field={itm}
            affiliateConf={affiliateConf}
            formFields={formFields}
            setAffiliateConf={setAffiliateConf}
          />
        ))}
        <div className="txt-center btcbi-field-map-button mt-2">
          <button
            onClick={() => addFieldMap(affiliateConf.field_map.length, affiliateConf, setAffiliateConf)}
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
        <AffiliateActions
          affiliateConf={affiliateConf}
          setAffiliateConf={setAffiliateConf}
          formFields={formFields}
        />
      </>
      <br />
      {affiliateConf?.mainAction && (
        <>
          <br />
          <UserSourceSelect conf={affiliateConf} setConf={setAffiliateConf} />
          {affiliateConf?.userSource === 'email' && (
            <UserEmailFieldMap
              conf={affiliateConf}
              setConf={setAffiliateConf}
              formFields={formFields}
              actionLabel={__('AffiliateWP Fields', 'bit-integrations')}
            />
          )}
          <br />
        </>
      )}
      {affiliateConf?.userSource === 'email' ? (
        <Note
          note={__(
            'This action runs for the user matching the mapped email. The user must already exist on your site, otherwise the action fails.',
            'bit-integrations'
          )}
        />
      ) : (
        <Note note={__('Some integrations will only work for logged-in users.', 'bit-integrations')} />
      )}
    </>
  )
}
