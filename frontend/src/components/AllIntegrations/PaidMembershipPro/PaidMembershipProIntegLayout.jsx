import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import {
  getAllPaidMemberShipProLevel,
  getPaidMembershipProActions,
  getPaidMembershipProProfileFields,
  MEMBERSHIP_ACTIONS,
  PMPRO_ACTIONS
} from './PaidMembershipProCommonFunc'
import Note from '../../Utilities/Note'
import { addFieldMap } from '../IntegrationHelpers/FieldMapHelper'
import UserEmailFieldMap from '../IntegrationHelpers/UserEmailFieldMap'
import UserSourceSelect from '../IntegrationHelpers/UserSourceSelect'
import PaidMembershipProFieldMap from './PaidMembershipProFieldMap'

export default function PaidMembershipProIntegLayout({
  formFields,
  handleInput,
  paidMembershipProConf,
  setPaidMembershipProConf,
  isLoading,
  setIsLoading,
  setSnackbar,
  allIntegURL,
  isInfo,
  edit
}) {
  const changeHandler = (val, name) => {
    const newConf = { ...paidMembershipProConf }
    if (name === 'selectedMembership') {
      if (val !== '') {
        newConf[name] = val
      } else {
        delete newConf[name]
      }
    }
    setPaidMembershipProConf({ ...newConf })
  }

  return (
    <>
      <br />
      <b className="wdt-200 d-in-b">{__('Actions:', 'bit-integrations')}</b>
      <select
        onChange={handleInput}
        name="mainAction"
        value={paidMembershipProConf?.mainAction}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select Actions', 'bit-integrations')}</option>
        {getPaidMembershipProActions().map(({ key, label }) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <br />
      {MEMBERSHIP_ACTIONS.includes(paidMembershipProConf?.mainAction) && (
        <>
          <br />
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Membership:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={paidMembershipProConf?.selectedMembership}
              options={
                paidMembershipProConf?.default?.allMemberShipLevel &&
                paidMembershipProConf.default.allMemberShipLevel.map(item => ({
                  label: item.membershipTitle,
                  value: item.membershipId.toString()
                }))
              }
              onChange={val => changeHandler(val, 'selectedMembership')}
              singleSelect
            />
            <button
              onClick={() =>
                getAllPaidMemberShipProLevel(
                  paidMembershipProConf,
                  setPaidMembershipProConf,
                  setIsLoading,
                  setSnackbar
                )
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

      {paidMembershipProConf?.mainAction === PMPRO_ACTIONS.DIRECTORY_VISIBILITY && (
        <>
          <br />
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Directory Visibility:', 'bit-integrations')}</b>
            <select
              onChange={handleInput}
              name="directoryVisibility"
              value={paidMembershipProConf?.directoryVisibility || ''}
              className="btcd-paper-inp w-5">
              <option value="">{__('Select Visibility', 'bit-integrations')}</option>
              <option value="show">{__('Show the user in the directory', 'bit-integrations')}</option>
              <option value="hide">{__('Hide the user from the directory', 'bit-integrations')}</option>
            </select>
          </div>
          <Note
            note={__(
              'Requires the Paid Memberships Pro - Member Directory Add On. The directory lists only users with an active membership level.',
              'bit-integrations'
            )}
          />
        </>
      )}

      {paidMembershipProConf?.mainAction === PMPRO_ACTIONS.UPDATE_PROFILE && !isLoading && (
        <div className="mt-4">
          <div className="flx">
            <b className="wdt-100">{__('Map Profile Fields', 'bit-integrations')}</b>
            <button
              onClick={() =>
                getPaidMembershipProProfileFields(
                  paidMembershipProConf,
                  setPaidMembershipProConf,
                  setIsLoading
                )
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Profile Fields', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Paid Memberships Pro Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {paidMembershipProConf?.field_map?.map((itm, i) => (
            <PaidMembershipProFieldMap
              key={`pmpro-m-${i + 9}`}
              i={i}
              field={itm}
              paidMembershipProConf={paidMembershipProConf}
              formFields={formFields}
              setPaidMembershipProConf={setPaidMembershipProConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(
                  paidMembershipProConf?.field_map?.length || 0,
                  paidMembershipProConf,
                  setPaidMembershipProConf
                )
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <Note
            note={__(
              'Only mapped fields are changed. Custom user fields come from Memberships > Settings > User Fields; file fields are not supported.',
              'bit-integrations'
            )}
          />
        </div>
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
      <br />
      {paidMembershipProConf?.mainAction && (
        <>
          <br />
          <UserSourceSelect conf={paidMembershipProConf} setConf={setPaidMembershipProConf} />
          {paidMembershipProConf?.userSource === 'email' && (
            <UserEmailFieldMap
              conf={paidMembershipProConf}
              setConf={setPaidMembershipProConf}
              formFields={formFields}
              actionLabel={__('Paid Memberships Pro Fields', 'bit-integrations')}
            />
          )}
          <br />
        </>
      )}
      {paidMembershipProConf?.userSource === 'email' ? (
        <Note
          note={__(
            'This action runs for the user matching the mapped email. The user must already exist on your site, otherwise the action fails.',
            'bit-integrations'
          )}
        />
      ) : (
        <Note note={__('This integration will only work for logged-in users.', 'bit-integrations')} />
      )}
    </>
  )
}
