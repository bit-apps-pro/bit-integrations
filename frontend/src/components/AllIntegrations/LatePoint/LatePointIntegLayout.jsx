import { useEffect, useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import LatePointActions from './LatePointActions'
import {
  generateMappedField,
  listsForAction,
  refreshLatePointAgents,
  refreshLatePointBundles,
  refreshLatePointLocations,
  refreshLatePointLists,
  refreshLatePointServices
} from './LatePointCommonFunc'
import LatePointFieldMap from './LatePointFieldMap'
import {
  CancelBookingFields,
  CreateAgentFields,
  CreateBookingFields,
  CreateCouponFields,
  CreateCustomerFields,
  CreateOrderFields,
  couponStatusOptions,
  customerTypeOptions,
  discountTypeOptions,
  hasUtilities,
  modules,
  needsAgentAndLocation,
  needsAgentServices,
  needsBundle,
  needsCouponStatus,
  needsCustomerType,
  needsDiscountType,
  needsService,
  UpdateBookingFields,
  UpdateCouponFields
} from './staticData'

const fieldsByAction = {
  create_booking: CreateBookingFields,
  update_booking: UpdateBookingFields,
  cancel_booking: CancelBookingFields,
  create_agent: CreateAgentFields,
  create_customer: CreateCustomerFields,
  create_order: CreateOrderFields,
  create_coupon: CreateCouponFields,
  update_coupon: UpdateCouponFields
}

export default function LatePointIntegLayout({
  formID,
  formFields,
  latePointConf,
  setLatePointConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  // Option lists live here rather than on conf so they are not persisted into
  // flow_details every time the flow is saved.
  const [lists, setLists] = useState({})

  const mainAction = latePointConf?.mainAction

  // Populate the dropdowns for whatever action is already selected. Matters most on
  // the edit screen, where handleMainAction never runs.
  useEffect(() => {
    const keys = listsForAction(mainAction)

    if (keys.length > 0) {
      refreshLatePointLists(setLists, setIsLoading, keys)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainAction])

  const setField = (key, val) =>
    setLatePointConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = val
      })
    )

  const handleMainAction = value => {
    setLatePointConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.latePointFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.latePointFields)
      })
    )
    // The effect above fetches the lists this action needs.
  }

  const renderFetchedSelect = (label, confKey, listKey, refresher, tooltip, multi = false) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={confKey}
          defaultValue={latePointConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={
            Array.isArray(lists?.[listKey])
              ? lists[listKey].map(item => ({
                label: item.label,
                value: item.value?.toString()
              }))
              : []
          }
          onChange={val => setField(confKey, val)}
          singleSelect={!multi}
          closeOnSelect={!multi}
        />
        <button
          onClick={() => refresher(setLists, setIsLoading)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${tooltip}'` }}
          type="button"
          disabled={isLoading}>
          &#x21BB;
        </button>
      </div>
    </>
  )

  const renderEnumSelect = (label, confKey, options) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={confKey}
          defaultValue={latePointConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={options}
          onChange={val => setField(confKey, val)}
          singleSelect
          closeOnSelect
        />
      </div>
    </>
  )

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

      {needsService.includes(mainAction) &&
        renderFetchedSelect(
          __('Service:', 'bit-integrations'),
          'selectedService',
          'services',
          refreshLatePointServices,
          __('Refresh Services', 'bit-integrations')
        )}

      {needsAgentAndLocation.includes(mainAction) && (
        <>
          {renderFetchedSelect(
            __('Agent:', 'bit-integrations'),
            'selectedAgent',
            'agents',
            refreshLatePointAgents,
            __('Refresh Agents', 'bit-integrations')
          )}
          {renderFetchedSelect(
            __('Location:', 'bit-integrations'),
            'selectedLocation',
            'locations',
            refreshLatePointLocations,
            __('Refresh Locations', 'bit-integrations')
          )}
        </>
      )}

      {needsAgentServices.includes(mainAction) &&
        renderFetchedSelect(
          __('Assign Services:', 'bit-integrations'),
          'selectedServices',
          'services',
          refreshLatePointServices,
          __('Refresh Services', 'bit-integrations'),
          true
        )}

      {needsBundle.includes(mainAction) &&
        renderFetchedSelect(
          __('Bundle:', 'bit-integrations'),
          'selectedBundle',
          'bundles',
          refreshLatePointBundles,
          __('Refresh Bundles', 'bit-integrations')
        )}

      {needsCustomerType.includes(mainAction) &&
        renderEnumSelect(__('Customer:', 'bit-integrations'), 'customerType', customerTypeOptions)}

      {needsDiscountType.includes(mainAction) &&
        renderEnumSelect(__('Discount Type:', 'bit-integrations'), 'discountType', discountTypeOptions)}

      {needsCouponStatus.includes(mainAction) &&
        renderEnumSelect(__('Coupon Status:', 'bit-integrations'), 'couponStatus', couponStatusOptions)}

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

      {mainAction && latePointConf.latePointFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('LatePoint Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {latePointConf?.field_map?.map((itm, i) => (
            <LatePointFieldMap
              key={`latepoint-m-${i + 9}`}
              i={i}
              field={itm}
              latePointConf={latePointConf}
              formFields={formFields}
              setLatePointConf={setLatePointConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(latePointConf.field_map.length, latePointConf, setLatePointConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {needsCustomerType.includes(mainAction) && latePointConf?.customerType === 'existing' && (
        <Note
          note={__(
            'Map the Customer ID field so the existing LatePoint customer can be located.',
            'bit-integrations'
          )}
        />
      )}

      {needsCustomerType.includes(mainAction) && latePointConf?.customerType !== 'existing' && (
        <Note
          note={__(
            'Customer first name, last name and email are required. An existing customer with the same email is reused instead of being duplicated.',
            'bit-integrations'
          )}
        />
      )}

      {mainAction === 'create_booking' && (
        <Note
          note={__(
            'Start and end time must be in 24-hour HH:MM format, for example 14:30.',
            'bit-integrations'
          )}
        />
      )}

      {hasUtilities.includes(mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <LatePointActions latePointConf={latePointConf} setLatePointConf={setLatePointConf} />
        </div>
      )}
    </>
  )
}
