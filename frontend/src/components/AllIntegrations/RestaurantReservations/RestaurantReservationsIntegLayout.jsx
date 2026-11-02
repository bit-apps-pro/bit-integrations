import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import RestaurantReservationsActions from './RestaurantReservationsActions'
import {
  generateMappedField,
  refreshRestaurantReservationsLocations,
  refreshRestaurantReservationsStatuses,
  refreshRestaurantReservationsTables
} from './RestaurantReservationsCommonFunc'
import RestaurantReservationsFieldMap from './RestaurantReservationsFieldMap'
import {
  actionNotes,
  fieldsByAction,
  hasBookingOptions,
  hasUtilities,
  modules,
  needsStatus,
  needsTables
} from './staticData'

export default function RestaurantReservationsIntegLayout({
  formFields,
  restaurantReservationsConf,
  setRestaurantReservationsConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setRestaurantReservationsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.restaurantReservationsFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.restaurantReservationsFields)
        draftConf.utilities = {}
        delete draftConf.selectedStatus
        delete draftConf.selectedTables
        delete draftConf.selectedLocation
      })
    )

    const loaders = []

    if (needsStatus.includes(value) || hasBookingOptions.includes(value)) {
      loaders.push(refreshRestaurantReservationsStatuses)
    }

    if (needsTables.includes(value) || hasBookingOptions.includes(value)) {
      loaders.push(refreshRestaurantReservationsTables)
    }

    if (hasBookingOptions.includes(value)) {
      loaders.push(refreshRestaurantReservationsLocations)
    }

    if (loaders.length > 0) {
      setIsLoading(true)
      Promise.all(loaders.map(load => load(setRestaurantReservationsConf, null, false))).finally(() =>
        setIsLoading(false)
      )
    }
  }

  const setConfValue = (key, value) => {
    setRestaurantReservationsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const toOptions = items =>
    (items || []).map(item => ({ label: item.label, value: item.value?.toString() }))

  const { mainAction } = restaurantReservationsConf || {}
  const hasFields = (restaurantReservationsConf?.restaurantReservationsFields || []).length > 0
  const hasOptionalFields = (restaurantReservationsConf?.restaurantReservationsFields || []).some(
    field => !field.required
  )
  const isBookingForm = hasBookingOptions.includes(mainAction)
  const showStatus = needsStatus.includes(mainAction) || isBookingForm
  const showTables =
    needsTables.includes(mainAction) ||
    (isBookingForm && (restaurantReservationsConf?.allTables || []).length > 0)
  const showLocations = isBookingForm && (restaurantReservationsConf?.allLocations || []).length > 0
  const isLocationRequired = mainAction === 'create_booking'
  const optionalLabel = label => `${label} ${__('(optional)', 'bit-integrations')}:`

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={mainAction ?? null}
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

      {showStatus && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">
              {isBookingForm
                ? optionalLabel(__('Status', 'bit-integrations'))
                : __('Status:', 'bit-integrations')}
            </b>
            <MultiSelect
              title="selectedStatus"
              defaultValue={restaurantReservationsConf?.selectedStatus ?? null}
              className="btcd-paper-drpdwn w-5"
              options={toOptions(restaurantReservationsConf?.allStatuses)}
              onChange={val => setConfValue('selectedStatus', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() =>
                refreshRestaurantReservationsStatuses(setRestaurantReservationsConf, setIsLoading)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Statuses', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          {isBookingForm && (
            <>
              <br />
              <Note
                note={
                  mainAction === 'create_booking'
                    ? __(
                        'Leave Status empty to let the plugin set the status from its booking rules.',
                        'bit-integrations'
                      )
                    : __('Leave Status empty to keep the current status.', 'bit-integrations')
                }
              />
            </>
          )}
        </>
      )}

      {showLocations && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">
              {isLocationRequired
                ? __('Location:', 'bit-integrations')
                : optionalLabel(__('Location', 'bit-integrations'))}
            </b>
            <MultiSelect
              title="selectedLocation"
              defaultValue={restaurantReservationsConf?.selectedLocation ?? null}
              className="btcd-paper-drpdwn w-5"
              options={toOptions(restaurantReservationsConf?.allLocations)}
              onChange={val => setConfValue('selectedLocation', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() =>
                refreshRestaurantReservationsLocations(setRestaurantReservationsConf, setIsLoading)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Locations', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {showTables && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">
              {isBookingForm
                ? optionalLabel(__('Tables', 'bit-integrations'))
                : __('Tables:', 'bit-integrations')}
            </b>
            <MultiSelect
              title="selectedTables"
              defaultValue={restaurantReservationsConf?.selectedTables ?? null}
              className="btcd-paper-drpdwn w-5"
              options={toOptions(restaurantReservationsConf?.allTables)}
              onChange={val => setConfValue('selectedTables', val)}
            />
            <button
              onClick={() =>
                refreshRestaurantReservationsTables(setRestaurantReservationsConf, setIsLoading)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Tables', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          {needsTables.includes(mainAction) && (
            <>
              <br />
              <Note
                note={__(
                  'The selected tables replace the current tables of the booking.',
                  'bit-integrations'
                )}
              />
            </>
          )}
        </>
      )}

      {actionNotes[mainAction] && (
        <>
          <br />
          <Note note={actionNotes[mainAction]} />
        </>
      )}

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

      {mainAction && hasFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Five Star Restaurant Reservations Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {restaurantReservationsConf?.field_map?.map((itm, i) => (
            <RestaurantReservationsFieldMap
              key={`restaurant-reservations-m-${i + 9}`}
              i={i}
              field={itm}
              restaurantReservationsConf={restaurantReservationsConf}
              formFields={formFields}
              setRestaurantReservationsConf={setRestaurantReservationsConf}
            />
          ))}
          {hasOptionalFields && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(
                    restaurantReservationsConf.field_map.length,
                    restaurantReservationsConf,
                    setRestaurantReservationsConf
                  )
                }
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          )}
          <br />
        </div>
      )}

      {mainAction && hasUtilities.includes(mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <RestaurantReservationsActions
            restaurantReservationsConf={restaurantReservationsConf}
            setRestaurantReservationsConf={setRestaurantReservationsConf}
          />
        </div>
      )}
    </>
  )
}
