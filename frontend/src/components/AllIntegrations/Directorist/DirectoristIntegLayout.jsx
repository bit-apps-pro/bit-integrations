import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import DirectoristActions from './DirectoristActions'
import {
  generateMappedField,
  refreshDirectoristDirectories,
  refreshDirectoristListingStatuses,
  refreshDirectoristOrderStatuses
} from './DirectoristCommonFunc'
import DirectoristFieldMap from './DirectoristFieldMap'
import {
  CreateListingFields,
  FavoriteFields,
  hasUtilities,
  ListingExpiryFields,
  ListingIdField,
  modules,
  needsDirectory,
  needsFeatured,
  needsListingStatus,
  needsOrderStatus,
  OrderIdField,
  ReviewFields,
  ReviewIdField,
  TermFields,
  UpdateListingFields,
  UserProfileFields,
  yesNoOptions
} from './staticData'

export default function DirectoristIntegLayout({
  formID,
  formFields,
  directoristConf,
  setDirectoristConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setField = (key, value) => {
    setDirectoristConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const handleMainAction = value => {
    setDirectoristConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        switch (value) {
          case 'create_listing':
            draftConf.directoristFields = CreateListingFields
            break
          case 'update_listing':
            draftConf.directoristFields = UpdateListingFields
            break
          case 'delete_listing':
          case 'change_listing_status':
          case 'set_listing_featured':
          case 'assign_listing_terms':
            draftConf.directoristFields = ListingIdField
            break
          case 'set_listing_expiry':
            draftConf.directoristFields = ListingExpiryFields
            break
          case 'create_category':
          case 'create_location':
          case 'create_tag':
            draftConf.directoristFields = TermFields
            break
          case 'add_favorite_listing':
          case 'remove_favorite_listing':
            draftConf.directoristFields = FavoriteFields
            break
          case 'update_user_profile':
            draftConf.directoristFields = UserProfileFields
            break
          case 'add_review':
            draftConf.directoristFields = ReviewFields
            break
          case 'delete_review':
            draftConf.directoristFields = ReviewIdField
            break
          case 'update_order_status':
            draftConf.directoristFields = OrderIdField
            break
          default:
            draftConf.directoristFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.directoristFields)
      })
    )

    if (needsDirectory.includes(value)) {
      refreshDirectoristDirectories(setDirectoristConf, setIsLoading)
    }
    if (needsListingStatus.includes(value)) {
      refreshDirectoristListingStatuses(setDirectoristConf, setIsLoading)
    }
    if (needsOrderStatus.includes(value)) {
      refreshDirectoristOrderStatuses(setDirectoristConf, setIsLoading)
    }
  }

  const optionsOf = list => (list ?? []).map(item => ({ label: item.label, value: String(item.value) }))

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={directoristConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: !checkIsPro(isPro, action.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {needsDirectory.includes(directoristConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Directory:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedDirectory"
              defaultValue={directoristConf?.selectedDirectory ?? null}
              className="btcd-paper-drpdwn w-5"
              onChange={value => setField('selectedDirectory', value)}
              options={optionsOf(directoristConf?.allDirectories)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshDirectoristDirectories(setDirectoristConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh directories', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {needsListingStatus.includes(directoristConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Listing Status:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedListingStatus"
              defaultValue={directoristConf?.selectedListingStatus ?? null}
              className="btcd-paper-drpdwn w-5"
              onChange={value => setField('selectedListingStatus', value)}
              options={optionsOf(directoristConf?.allListingStatuses)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshDirectoristListingStatuses(setDirectoristConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh statuses', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {needsFeatured.includes(directoristConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Featured:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedFeatured"
              defaultValue={directoristConf?.selectedFeatured ?? null}
              className="btcd-paper-drpdwn w-5"
              onChange={value => setField('selectedFeatured', value)}
              options={yesNoOptions}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {needsOrderStatus.includes(directoristConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Payment Status:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedOrderStatus"
              defaultValue={directoristConf?.selectedOrderStatus ?? null}
              className="btcd-paper-drpdwn w-5"
              onChange={value => setField('selectedOrderStatus', value)}
              options={optionsOf(directoristConf?.allOrderStatuses)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshDirectoristOrderStatuses(setDirectoristConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh statuses', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {directoristConf?.mainAction && directoristConf?.directoristFields?.length > 0 && (
        <>
          <br />
          <div className="mt-5">
            <b className="wdt-100 d-in-b">{__('Field Map', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx mt-2">
            <div className="txt-dp"> {__('Form Fields', 'bit-integrations')}</div>
            <div className="txt-dp ml-4"> {__('Directorist Fields', 'bit-integrations')}</div>
          </div>

          {directoristConf?.field_map?.map((itm, i) => (
            <DirectoristFieldMap
              key={`directorist-field-${i + 1}`}
              i={i}
              formFields={formFields}
              field={itm}
              directoristConf={directoristConf}
              setDirectoristConf={setDirectoristConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(directoristConf.field_map.length, directoristConf, setDirectoristConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </>
      )}

      {hasUtilities.includes(directoristConf?.mainAction) && (
        <>
          <br />
          <div className="mt-5">
            <b className="wdt-100 d-in-b">{__('Utilities', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <DirectoristActions
            formID={formID}
            formFields={formFields}
            directoristConf={directoristConf}
            setDirectoristConf={setDirectoristConf}
            setSnackbar={setSnackbar}
          />
        </>
      )}

      {isLoading && <Loader className="pos-btm-rt" style={{ height: 30, width: 30 }} />}
    </>
  )
}
