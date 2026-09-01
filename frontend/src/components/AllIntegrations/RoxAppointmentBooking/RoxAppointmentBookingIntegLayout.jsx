import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import RoxAppointmentBookingActions from './RoxAppointmentBookingActions'
import {
  generateMappedField,
  refreshAgents,
  refreshCategories,
  refreshLocations,
  refreshServices
} from './RoxAppointmentBookingCommonFunc'
import RoxAppointmentBookingFieldMap from './RoxAppointmentBookingFieldMap'
import {
  activeStatusOptions,
  AgentFields,
  AgentIdField,
  AgentUpdateFields,
  AppointmentFields,
  AppointmentIdField,
  appointmentStatusOptions,
  AppointmentUpdateFields,
  CategoryFields,
  CategoryIdField,
  CategoryUpdateFields,
  CustomerFields,
  CustomerIdField,
  CustomerUpdateFields,
  hasUtilities,
  modules,
  needsAgentSelect,
  needsCategorySelect,
  needsLocationSelect,
  needsServiceSelect,
  requiredEitherFields,
  NotificationFields,
  OrderFields,
  OrderIdField,
  orderStatusOptions,
  OrderUpdateFields,
  PaymentFields,
  PaymentIdField,
  paymentStatusOptions,
  RefundOrderFields,
  ServiceFields,
  ServiceIdField,
  ServiceUpdateFields
} from './staticData'

const CATALOG_SELECTS = [
  {
    actions: needsServiceSelect,
    key: 'selectedService',
    listKey: 'allServices',
    label: __('Service:', 'bit-integrations'),
    refresh: refreshServices,
    required: true
  },
  {
    actions: needsAgentSelect,
    key: 'selectedAgent',
    listKey: 'allAgents',
    label: __('Agent:', 'bit-integrations'),
    refresh: refreshAgents,
    required: false
  },
  {
    actions: needsCategorySelect,
    key: 'selectedCategory',
    listKey: 'allCategories',
    label: __('Category:', 'bit-integrations'),
    refresh: refreshCategories,
    required: false
  },
  {
    actions: needsLocationSelect,
    key: 'selectedLocation',
    listKey: 'allLocations',
    label: __('Location:', 'bit-integrations'),
    refresh: refreshLocations,
    required: false
  }
]

const FIELD_SETS = {
  create_customer: CustomerFields,
  update_customer: CustomerUpdateFields,
  delete_customer: CustomerIdField,
  create_agent: AgentFields,
  update_agent: AgentUpdateFields,
  delete_agent: AgentIdField,
  create_service: ServiceFields,
  update_service: ServiceUpdateFields,
  update_service_status: ServiceIdField,
  delete_service: ServiceIdField,
  create_category: CategoryFields,
  update_category: CategoryUpdateFields,
  delete_category: CategoryIdField,
  create_appointment: AppointmentFields,
  update_appointment: AppointmentUpdateFields,
  update_appointment_status: AppointmentIdField,
  delete_appointment: AppointmentIdField,
  create_order: OrderFields,
  update_order: OrderUpdateFields,
  update_order_status: OrderIdField,
  refund_order: RefundOrderFields,
  delete_order: OrderIdField,
  create_payment: PaymentFields,
  update_payment_status: PaymentIdField,
  create_notification: NotificationFields
}

const REQUIRED_SELECTS = {
  update_service_status: {
    key: 'selectedServiceStatus',
    label: __('Status:', 'bit-integrations'),
    options: activeStatusOptions
  },
  update_appointment_status: {
    key: 'selectedAppointmentStatus',
    label: __('Appointment Status:', 'bit-integrations'),
    options: appointmentStatusOptions
  },
  update_order_status: {
    key: 'selectedOrderStatus',
    label: __('Order Status:', 'bit-integrations'),
    options: orderStatusOptions
  },
  update_payment_status: {
    key: 'selectedPaymentStatus',
    label: __('Payment Status:', 'bit-integrations'),
    options: paymentStatusOptions
  }
}

export default function RoxAppointmentBookingIntegLayout({
  formFields,
  roxAppointmentBookingConf,
  setRoxAppointmentBookingConf,
  setSnackbar,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setField = (key, val) => {
    setRoxAppointmentBookingConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = val
      })
    )
  }

  const handleMainAction = value => {
    setRoxAppointmentBookingConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.roxAppointmentBookingFields = FIELD_SETS[value] || []
        draftConf.field_map = generateMappedField(
          draftConf.roxAppointmentBookingFields,
          requiredEitherFields[value] || []
        )
      })
    )

    CATALOG_SELECTS.filter(select => select.actions.includes(value)).forEach(select =>
      select.refresh(setRoxAppointmentBookingConf, setIsLoading)
    )
  }

  const { mainAction } = roxAppointmentBookingConf || {}
  const requiredSelect = REQUIRED_SELECTS[mainAction]

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

      {requiredSelect && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{requiredSelect.label}</b>
            <MultiSelect
              title={requiredSelect.key}
              defaultValue={roxAppointmentBookingConf?.[requiredSelect.key] ?? null}
              className="btcd-paper-drpdwn w-5"
              options={requiredSelect.options}
              onChange={val => setField(requiredSelect.key, val)}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {CATALOG_SELECTS.filter(select => select.actions.includes(mainAction)).map(select => (
        <div key={select.key}>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{select.label}</b>
            <MultiSelect
              title={select.key}
              defaultValue={roxAppointmentBookingConf?.[select.key] ?? null}
              className="btcd-paper-drpdwn w-5"
              options={(roxAppointmentBookingConf?.[select.listKey] || []).map(item => ({
                label: item.label,
                value: String(item.value)
              }))}
              onChange={val => setField(select.key, val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => select.refresh(setRoxAppointmentBookingConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </div>
      ))}

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

      {mainAction && roxAppointmentBookingConf?.roxAppointmentBookingFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Rox Appointment Booking Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {roxAppointmentBookingConf?.field_map?.map((itm, i) => (
            <RoxAppointmentBookingFieldMap
              key={`rox-m-${i + 9}`}
              i={i}
              field={itm}
              formFields={formFields}
              roxAppointmentBookingConf={roxAppointmentBookingConf}
              setRoxAppointmentBookingConf={setRoxAppointmentBookingConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(
                  roxAppointmentBookingConf.field_map.length,
                  roxAppointmentBookingConf,
                  setRoxAppointmentBookingConf
                )
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {mainAction && hasUtilities.includes(mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <RoxAppointmentBookingActions
            roxAppointmentBookingConf={roxAppointmentBookingConf}
            setRoxAppointmentBookingConf={setRoxAppointmentBookingConf}
            formFields={formFields}
            setSnackbar={setSnackbar}
          />
        </div>
      )}
    </>
  )
}
