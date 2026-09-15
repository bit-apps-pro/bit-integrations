import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { getAllPaidMemberShipProLevel } from './PaidMembershipProCommonFunc'
import Note from '../../Utilities/Note'
import UserEmailFieldMap from '../IntegrationHelpers/UserEmailFieldMap'
import UserSourceSelect from '../IntegrationHelpers/UserSourceSelect'

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
        {paidMembershipProConf?.allActions &&
          paidMembershipProConf.allActions.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
      </select>
      <br />
      {['1', '2'].includes(paidMembershipProConf?.mainAction) && (
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
