/* eslint-disable no-unused-vars */
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from './IntegrationHelpers'
import PerfexCRMActions from './PerfexCRMActions'
import {
  getAllCustomer,
  getAllStaffs,
  refreshCustomFields,
  toSelectOptions
} from './PerfexCRMCommonFunc'
import PerfexCRMFieldMap from './PerfexCRMFieldMap'

export default function PerfexCRMIntegLayout({
  formFields,
  handleInput,
  perfexCRMConf,
  setPerfexCRMConf,
  loading,
  setLoading,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const handleActionInput = e => {
    setPerfexCRMConf(prevConf =>
      create(prevConf, draftConf => {
        const { name } = e.target

        if (e.target.value !== '') {
          draftConf.actionName = e.target.value

          if (
            e.target.value === 'contact' ||
            e.target.value === 'lead' ||
            e.target.value === 'project'
          ) {
            getAllCustomer(draftConf, setPerfexCRMConf, loading, setLoading)
          }
          if (e.target.value === 'lead') {
            getAllCustomer(draftConf, setPerfexCRMConf, loading, setLoading)
            getAllStaffs(draftConf, setPerfexCRMConf, loading, setLoading)
          }

          if (e.target.value === 'project') {
            draftConf.billingTypes = [
              { id: 1, name: __('Fixed Rate', 'bit-integrations') },
              { id: 2, name: __('Project Hours', 'bit-integrations') },
              { id: 3, name: __('Task Hours', 'bit-integrations') }
            ]
            draftConf.projectStatus = [
              { id: 2, name: __('In Progress', 'bit-integrations') },
              { id: 3, name: __('On Hold', 'bit-integrations') },
              { id: 4, name: __('Finished', 'bit-integrations') },
              { id: 5, name: __('Cancelled', 'bit-integrations') }
            ]
          }

          refreshCustomFields(draftConf, setPerfexCRMConf, setIsLoading, setSnackbar)
        } else {
          delete draftConf[name]
          delete draftConf.actionId
        }
      })
    )
  }

  const setChanges = (val, name) => {
    const newConf = { ...perfexCRMConf }
    newConf[name] = val
    setPerfexCRMConf({ ...newConf })
  }

  return (
    <>
      <br />

      <b className="wdt-200 d-in-b">{__('Select Action:', 'bit-integrations')}</b>
      <select
        onChange={handleActionInput}
        name="actionName"
        value={perfexCRMConf.actionName}
        className="btcd-paper-inp w-5">
        <option value="">{__('Select an action', 'bit-integrations')}</option>
        <option value="customer" data-action_name="customer">
          {__('Create Customer', 'bit-integrations')}
        </option>
        <option value="contact" data-action_name="contact">
          {__('Create Contact', 'bit-integrations')}
        </option>
        <option value="lead" data-action_name="lead">
          {__('Create Lead', 'bit-integrations')}
        </option>
        <option value="project" data-action_name="project">
          {__('Create project', 'bit-integrations')}
        </option>
      </select>
      <br />
      <br />
      {perfexCRMConf.actionName === 'project' && (
        <>
          <br />
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Project Status:', 'bit-integrations')}</b>
            <MultiSelect
              options={perfexCRMConf?.projectStatus.map(status => ({
                label: status.name,
                value: status.id.toString()
              }))}
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={perfexCRMConf?.selectedProjectStatus}
              onChange={val => setChanges(val, 'selectedProjectStatus')}
              disabled={isLoading}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}
      {(perfexCRMConf.actionName === 'contact' ||
        perfexCRMConf.actionName === 'lead' ||
        perfexCRMConf.actionName === 'project') &&
        perfexCRMConf?.customers &&
        !loading.customers && (
          <>
            <br />
            <div className="flx">
              <b className="wdt-200 d-in-b">{__('Select Customer:', 'bit-integrations')}</b>
              <MultiSelect
                options={toSelectOptions(perfexCRMConf?.customers)}
                className="msl-wrp-options dropdown-custom-width"
                defaultValue={perfexCRMConf?.selectedCustomer}
                onChange={val => setChanges(val, 'selectedCustomer')}
                disabled={loading.customers}
                singleSelect
                closeOnSelect
              />
              <button
                onClick={() => getAllCustomer(perfexCRMConf, setPerfexCRMConf, loading, setLoading)}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh Customers', 'bit-integrations')}'` }}
                type="button"
                disabled={loading.customers}>
                &#x21BB;
              </button>
            </div>
          </>
        )}

      {perfexCRMConf.actionName === 'lead' && perfexCRMConf?.staffs && !loading.staffs && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Assigned By:', 'bit-integrations')}</b>
            <MultiSelect
              options={toSelectOptions(perfexCRMConf?.staffs)}
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={perfexCRMConf?.selectedStaff}
              onChange={val => setChanges(val, 'selectedStaff')}
              disabled={loading.staffs}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => getAllStaffs(perfexCRMConf, setPerfexCRMConf, loading, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Staffs', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.staffs}>
              &#x21BB;
            </button>
          </div>
        </>
      )}
      {perfexCRMConf.actionName === 'project' && perfexCRMConf?.billingTypes && (
        <>
          <br />
          <br />
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Select Billing Type:', 'bit-integrations')}</b>
            <MultiSelect
              options={perfexCRMConf?.billingTypes?.map(type => ({
                label: type.name,
                value: type.id.toString()
              }))}
              className="msl-wrp-options dropdown-custom-width"
              defaultValue={perfexCRMConf?.selectedbillingType}
              onChange={val => setChanges(val, 'selectedbillingType')}
              disabled={isLoading}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}
      {perfexCRMConf.actionName === 'project' && perfexCRMConf?.selectedbillingType === '1' && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Total Rate:', 'bit-integrations')}</b>
            <input
              className="btcd-paper-inp w-5 mt-1"
              onChange={e => setChanges(e.target.value, 'totalRate')}
              name="totalRate"
              value={perfexCRMConf.totalRate || ' '}
              type="text"
              placeholder={__('Total Rate...', 'bit-integrations')}
              disabled={isLoading}
            />
          </div>
        </>
      )}
      {perfexCRMConf.actionName === 'project' && perfexCRMConf?.selectedbillingType === '2' && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Rate Per Hour:', 'bit-integrations')}</b>
            <input
              className="btcd-paper-inp w-5 mt-1"
              onChange={e => setChanges(e.target.value, 'ratePerHour')}
              name="ratePerHour"
              value={perfexCRMConf.ratePerHour || ' '}
              type="text"
              placeholder={__('Rate Per Hour...', 'bit-integrations')}
              disabled={isLoading}
            />
          </div>
        </>
      )}

      {(isLoading || loading.customers || loading.staffs) && (
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
      {perfexCRMConf.actionName && !isLoading && (
        <div>
          <br />
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
            <button
              onClick={() =>
                refreshCustomFields(perfexCRMConf, setPerfexCRMConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh custom fields', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>

          <br />
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('PerfexCRM Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {perfexCRMConf?.field_map.map((itm, i) => (
            <PerfexCRMFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              perfexCRMConf={perfexCRMConf}
              formFields={formFields}
              setPerfexCRMConf={setPerfexCRMConf}
              setSnackbar={setSnackbar}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(perfexCRMConf.field_map.length, perfexCRMConf, setPerfexCRMConf, false)
              }
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
          <PerfexCRMActions
            perfexCRMConf={perfexCRMConf}
            setPerfexCRMConf={setPerfexCRMConf}
            formFields={formFields}
            loading={loading}
            setLoading={setLoading}
          />
        </div>
      )}
    </>
  )
}
