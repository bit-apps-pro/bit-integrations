import { create } from 'mutative'
import { useEffect } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  generateMappedField,
  refreshBooklyServices,
  refreshBooklyStaff,
  refreshBooklyStatuses,
} from './BooklyCommonFunc'
import BooklyFieldMap from './BooklyFieldMap'
import {
  CreateAppointmentFields,
  CreateCustomerFields,
  DeleteAppointmentFields,
  DeleteCustomerFields,
  modules,
  UpdateAppointmentStatusFields,
  UpdateCustomerFields,
} from './staticData'

const FIELDS_BY_ACTION = {
  create_appointment: CreateAppointmentFields,
  update_appointment_status: UpdateAppointmentStatusFields,
  delete_appointment: DeleteAppointmentFields,
  create_customer: CreateCustomerFields,
  update_customer: UpdateCustomerFields,
  delete_customer: DeleteCustomerFields,
}

const STATUS_ACTIONS = ['create_appointment', 'update_appointment_status']

export default function BooklyIntegLayout({
  formID,
  formFields,
  booklyConf,
  setBooklyConf,
  dataLoading,
  setDataLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setBooklyConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.booklyFields = FIELDS_BY_ACTION[value] || []
        draftConf.field_map = generateMappedField(draftConf.booklyFields)
        draftConf.utilities = {}
      })
    )

    if (value === 'create_appointment') {
      refreshBooklyStaff(setBooklyConf, setDataLoading)
      refreshBooklyServices(setBooklyConf, setDataLoading)
    }

    if (STATUS_ACTIONS.includes(value)) {
      refreshBooklyStatuses(setBooklyConf, setDataLoading)
    }
  }

  useEffect(() => {
    const action = booklyConf?.mainAction
    if (!action) return

    if (action === 'create_appointment') {
      if (!booklyConf?.allStaff) refreshBooklyStaff(setBooklyConf, setDataLoading)
      if (!booklyConf?.allServices) refreshBooklyServices(setBooklyConf, setDataLoading)
    }

    if (STATUS_ACTIONS.includes(action) && !booklyConf?.allStatuses) {
      refreshBooklyStatuses(setBooklyConf, setDataLoading)
    }
  }, [booklyConf?.mainAction])

  const setUtility = (key, val) =>
    setBooklyConf(prev =>
      create(prev, draft => {
        draft.utilities = { ...(draft.utilities || {}), [key]: val }
      })
    )

  const isLoadingAny = dataLoading?.staff || dataLoading?.services || dataLoading?.statuses

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={booklyConf?.mainAction ?? null}
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

      {booklyConf?.mainAction === 'create_appointment' && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">
              {__('Staff:', 'bit-integrations')}
              <span style={{ color: 'red' }}> *</span>
            </b>
            <MultiSelect
              defaultValue={booklyConf?.utilities?.staffId ?? null}
              className={`btcd-paper-drpdwn w-5${!booklyConf?.utilities?.staffId ? ' btcd-paper-inp-err' : ''}`}
              options={booklyConf?.allStaff || []}
              onChange={val => setUtility('staffId', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshBooklyStaff(setBooklyConf, setDataLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Staff', 'bit-integrations')}'` }}
              type="button"
              disabled={dataLoading?.staff}>
              &#x21BB;
            </button>
          </div>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Service:', 'bit-integrations')}</b>
            <MultiSelect
              defaultValue={booklyConf?.utilities?.serviceId ?? null}
              className="btcd-paper-drpdwn w-5"
              options={booklyConf?.allServices || []}
              onChange={val => setUtility('serviceId', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshBooklyServices(setBooklyConf, setDataLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Services', 'bit-integrations')}'` }}
              type="button"
              disabled={dataLoading?.services}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {STATUS_ACTIONS.includes(booklyConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">
              {__('Status:', 'bit-integrations')}
              <span style={{ color: 'red' }}> *</span>
            </b>
            <MultiSelect
              defaultValue={booklyConf?.utilities?.status ?? null}
              className={`btcd-paper-drpdwn w-5${!booklyConf?.utilities?.status ? ' btcd-paper-inp-err' : ''}`}
              options={booklyConf?.allStatuses || []}
              onChange={val => setUtility('status', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshBooklyStatuses(setBooklyConf, setDataLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Statuses', 'bit-integrations')}'` }}
              type="button"
              disabled={dataLoading?.statuses}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {isLoadingAny && (
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

      {booklyConf?.mainAction && booklyConf?.booklyFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Bookly Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {booklyConf?.field_map?.map((itm, i) => (
            <BooklyFieldMap
              key={`bookly-m-${i + 9}`}
              i={i}
              field={itm}
              booklyConf={booklyConf}
              formFields={formFields}
              setBooklyConf={setBooklyConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(booklyConf.field_map.length, booklyConf, setBooklyConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}
    </>
  )
}
