import { useEffect } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import MemberpressActions from './MemberpressActions'
import { getAllMemberShip } from './MemberpressCommonFunc'
import MemberpressFieldMap from './MemberpressFieldMap'
import Note from '../../Utilities/Note'
import UserEmailFieldMap from '../IntegrationHelpers/UserEmailFieldMap'
import UserSourceSelect from '../IntegrationHelpers/UserSourceSelect'

export default function MemberpressIntegLayout({
  formFields,
  handleInput,
  memberpressConf,
  setMemberpressConf,
  isLoading,
  setIsLoading,
  setSnackbar,
  allIntegURL,
  isInfo,
  edit
}) {
  const changeHandler = (val, name) => {
    const newConf = { ...memberpressConf }
    if (name === 'selectedMembership') {
      if (val !== '') {
        newConf[name] = val
      } else {
        delete newConf[name]
      }
    }
    setMemberpressConf({ ...newConf })
  }

  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Actions:', 'bit-integrations')}</b>
      <select
        onChange={handleInput}
        name="mainAction"
        value={memberpressConf?.mainAction}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Actions', 'bit-integrations')}</option>
        {memberpressConf?.allActions &&
          memberpressConf.allActions.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
      </select>
      <br />
      <br />
      {['1', '2'].includes(memberpressConf?.mainAction) && (
        <>
          <br />
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Membership:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={memberpressConf?.selectedMembership}
              options={
                memberpressConf?.default?.allMemberShips &&
                memberpressConf.default.allMemberShips.map(item => ({
                  label: item.membershipTitle,
                  value: item.membershipId.toString()
                }))
              }
              onChange={val => changeHandler(val, 'selectedMembership')}
              singleSelect
            />
            <button
              onClick={() =>
                getAllMemberShip(memberpressConf, setMemberpressConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch All Membership', 'bit-integrations')}'` }}
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
        {['1'].includes(memberpressConf?.mainAction) && (
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
                <b>{__('Memberpress Fields', 'bit-integrations')}</b>
              </div>
            </div>
            {memberpressConf.field_map.map((itm, i) => (
              <MemberpressFieldMap
                key={`dash-m-${i + 9}`}
                i={i}
                field={itm}
                memberpressConf={memberpressConf}
                formFields={formFields}
                setMemberpressConf={setMemberpressConf}
              />
            ))}
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(memberpressConf.field_map.length, memberpressConf, setMemberpressConf)
                }
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          </>
        )}
        <br />
        <br />
        {memberpressConf.mainAction === '1' && (
          <>
            <div className="mt-4">
              <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
            </div>
            <div className="btcd-hr mt-1" />
            <MemberpressActions
              memberpressConf={memberpressConf}
              setMemberpressConf={setMemberpressConf}
              formFields={formFields}
            />
          </>
        )}
      </>
      <br />
      {memberpressConf?.mainAction && (
        <>
          <br />
          <UserSourceSelect conf={memberpressConf} setConf={setMemberpressConf} />
          {memberpressConf?.userSource === 'email' && (
            <UserEmailFieldMap
              conf={memberpressConf}
              setConf={setMemberpressConf}
              formFields={formFields}
              actionLabel={__('MemberPress Fields', 'bit-integrations')}
            />
          )}
          <br />
        </>
      )}
      {memberpressConf?.userSource === 'email' ? (
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
