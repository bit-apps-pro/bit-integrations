import { useEffect } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  getAllAccountList,
  getAllCampaignList,
  getAllContactList,
  getAllCustomActionModules,
  getAllCustomFields,
  getAllLeadList
} from './SalesforceCommonFunc'
import SelesforceFieldMap from './SalesforceFieldMap'
import { taskSubject, taskPriority, taskStatus } from './SalesforceDataStore'
import SalesforceActions from './SalesforceActions'
import Note from '../../Utilities/Note'

export default function SalesforceIntegLayout({
  formID,
  formFields,
  handleInput,
  salesforceConf,
  setSalesforceConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  useEffect(() => {
    if (salesforceConf?.actionName === 'add-campaign-member') {
      getAllCampaignList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
      getAllLeadList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
      getAllContactList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
      getAllAccountList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    }
    if (salesforceConf?.actionName === 'task-create') {
      getAllContactList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
      getAllAccountList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    }
  }, [salesforceConf?.actionName])

  const handleInputP = e => {
    const newConf = { ...salesforceConf }
    const { name, value } = e.target
    newConf[name] = value
    newConf.field_map = []

    if (e.target.value !== '') {
      const actName = value

      if (actName === 'contact-create') {
        getAllCustomFields(
          formID,
          'contact-create',
          newConf,
          setSalesforceConf,
          setIsLoading,
          setSnackbar
        )
      } else if (actName === 'lead-create') {
        getAllCustomFields(formID, 'lead-create', newConf, setSalesforceConf, setIsLoading, setSnackbar)
      } else if (actName === 'account-create') {
        getAllCustomFields(
          formID,
          'account-create',
          newConf,
          setSalesforceConf,
          setIsLoading,
          setSnackbar
        )
      } else if (actName === 'campaign-create') {
        getAllCustomFields(
          formID,
          'campaign-create',
          newConf,
          setSalesforceConf,
          setIsLoading,
          setSnackbar
        )
      } else if (actName === 'add-campaign-member') {
        getAllCustomFields(
          formID,
          'add-campaign-member',
          newConf,
          setSalesforceConf,
          setIsLoading,
          setSnackbar
        )
      } else if (actName === 'opportunity-create') {
        getAllCustomFields(
          formID,
          'opportunity-create',
          newConf,
          setSalesforceConf,
          setIsLoading,
          setSnackbar
        )
      } else if (actName === 'event-create') {
        getAllCustomFields(formID, 'event-create', newConf, setSalesforceConf, setIsLoading, setSnackbar)
      } else if (actName === 'case-create') {
        getAllCustomFields(formID, 'case-create', newConf, setSalesforceConf, setIsLoading, setSnackbar)
      } else if (actName !== 'task-create') {
        getAllCustomFields(formID, actName, newConf, setSalesforceConf, setIsLoading, setSnackbar)
      }
    } else {
      delete newConf[name]
    }
    setSalesforceConf(newConf)
  }
  const changeHandler = (val, status) => {
    const newConf = { ...salesforceConf }
    newConf[status] = val
    setSalesforceConf({ ...newConf })
  }
  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <select
          onChange={handleInputP}
          name="actionName"
          value={salesforceConf?.actionName}
          className="btcd-paper-inp w-5">
          <option value="">{__('Select Action', 'bit-integrations')}</option>
          {salesforceConf?.selesforceActionModules?.map(({ label, value }) => (
            <option key={label} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          onClick={() =>
            getAllCustomActionModules(salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
          }
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh Custom Action', 'bit-integrations')}'` }}
          type="button"
          disabled={isLoading}>
          &#x21BB;
        </button>
      </div>
      <br />

      {['add-campaign-member'].includes(salesforceConf.actionName) && (
        <>
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Campaign:', 'bit-integrations')}</b>

            <MultiSelect
              className="w-5"
              defaultValue={salesforceConf?.campaignId}
              options={
                salesforceConf?.default?.campaignLists &&
                salesforceConf.default.campaignLists.map(item => ({
                  label: item.Name,
                  value: item.Id
                }))
              }
              onChange={val => changeHandler(val, 'campaignId')}
              singleSelect
            />
            <button
              onClick={() =>
                getAllCampaignList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Fetch Campaign lists', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <small style={{ marginLeft: 0, marginTop: 10, color: 'red' }}>
            {__('This is Required', 'bit-integrations')}
          </small>
        </>
      )}

      {['add-campaign-member'].includes(salesforceConf.actionName) && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select Lead:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            defaultValue={salesforceConf?.leadId}
            options={
              salesforceConf?.default?.leadLists &&
              salesforceConf.default.leadLists.map(item => ({ label: item.Name, value: item.Id }))
            }
            onChange={val => changeHandler(val, 'leadId')}
            singleSelect
          />
          <button
            onClick={() =>
              getAllLeadList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
            }
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch Lead lists', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}

      {['add-campaign-member', 'task-create'].includes(salesforceConf.actionName) && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select Contact:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            defaultValue={salesforceConf?.contactId}
            options={
              salesforceConf?.default?.contactLists &&
              salesforceConf.default.contactLists.map(item => ({
                label: item.Name,
                value: item.Id
              }))
            }
            onChange={val => changeHandler(val, 'contactId')}
            singleSelect
          />
          <button
            onClick={() =>
              getAllContactList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
            }
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch Contact lists', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}

      {['add-campaign-member', 'task-create'].includes(salesforceConf.actionName) && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select Account:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            defaultValue={salesforceConf?.accountId}
            options={
              salesforceConf?.default?.accountLists &&
              salesforceConf.default.accountLists.map(item => ({
                label: item.Name,
                value: item.Id
              }))
            }
            onChange={val => changeHandler(val, 'accountId')}
            singleSelect
          />
          <button
            onClick={() =>
              getAllAccountList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
            }
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Fetch Account lists', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}
      {['add-campaign-member'].includes(salesforceConf.actionName) && (
        <div className="flx mt-4">
          <b className="wdt-200 d-in-b">{__('Select Status:', 'bit-integrations')}</b>
          <MultiSelect
            className="w-5"
            defaultValue={salesforceConf?.statusId}
            options={
              salesforceConf?.campaignMemberStatus &&
              salesforceConf.campaignMemberStatus.map(item => ({
                label: item.label,
                value: item.value
              }))
            }
            onChange={val => changeHandler(val, 'statusId')}
            singleSelect
          />
        </div>
      )}
      {['task-create'].includes(salesforceConf.actionName) && (
        <>
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Subject:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={salesforceConf?.subjectId}
              options={taskSubject.map(item => ({ label: item.label, value: item.value }))}
              onChange={val => changeHandler(val, 'subjectId')}
              singleSelect
            />
          </div>
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Priority:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={salesforceConf?.priorityId}
              options={taskPriority.map(item => ({ label: item.label, value: item.value }))}
              onChange={val => changeHandler(val, 'priorityId')}
              singleSelect
            />
          </div>
          <div className="flx mt-4">
            <b className="wdt-200 d-in-b">{__('Select Status:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={salesforceConf?.statusId}
              options={taskStatus.map(item => ({ label: item.label, value: item.value }))}
              onChange={val => changeHandler(val, 'statusId')}
              singleSelect
            />
          </div>
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

      {salesforceConf?.actionName && salesforceConf?.actionName !== 'task-create' && !isLoading && (
        <>
          <br />
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
            <button
              onClick={() =>
                getAllCustomFields(
                  formID,
                  salesforceConf?.actionName,
                  salesforceConf,
                  setSalesforceConf,
                  setIsLoading,
                  setSnackbar
                )
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
              <b>{__('Salesforce Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {salesforceConf?.field_map.map((itm, i) => (
            <SelesforceFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              salesforceConf={salesforceConf}
              formFields={formFields}
              setSalesforceConf={setSalesforceConf}
              setSnackbar={setSnackbar}
              actionName={salesforceConf?.actionName}
              selesforceFields={salesforceConf?.selesforceFields}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(salesforceConf.field_map.length, salesforceConf, setSalesforceConf, false)
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
      <div className="mt-4">
        <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
      </div>
      <div className="btcd-hr mt-1" />
      <SalesforceActions
        salesforceConf={salesforceConf}
        setSalesforceConf={setSalesforceConf}
        formFields={formFields}
      />
      <br />
      <br />
      <Note note={note} maxWidth="900px" />
    </>
  )
}

const note = `
<h3>Salesforce API Date Formatting Guidelines</h3>

  <p>
    Salesforce APIs generally recommend and often require dates to be formatted according to 
    <abbr title="International Organization for Standardization">ISO</abbr> 8601 standards.
  </p>

  <div class="flx" style="align-items: flex-start;">
    <div style="flex: -1;">
      <h2>Date Fields</h2>
      <p>The recommended format is:</p>
      <pre><code>YYYY-MM-DD</code></pre>
      <p>For example: <code>2025-09-20</code></p>
    </div>

    <div class="ml-2" style="flex: 1; text-align: justify;">
      <h2>DateTime Fields</h2>
      <p>
        The recommended formats, which include time and often a timezone indicator, are:
      </p>
      <pre><code>YYYY-MM-DDThh:mm:ssZ</code></pre>
      <pre><code>YYYY-MM-DDThh:mm:ss.sssZ</code></pre>


      <p>
        Here, <code>Z</code> indicates Coordinated Universal Time (UTC), and <code>sss</code> represents milliseconds.
      </p>
      <p>
        For example: <code>2025-09-20T10:30:00Z</code> or 
        <code>2025-09-20T10:30:00.123Z</code>
      </p>
    </div>

    <div class="ml-2" style="flex: 1; text-align: justify;">
      <h2>Other Notes</h2>
      <p>
        While other formats like <code>MM/DD/YYYY</code> might be accepted in certain contexts 
        (such as <em>Data Loader</em> with specific settings), using the ISO 8601 format 
        (<code>YYYY-MM-DD</code> for dates and 
        <code>YYYY-MM-DDThh:mm:ssZ</code> or <code>YYYY-MM-DDThh:mm:ss.sssZ</code> for datetimes) 
        ensures compatibility and avoids potential issues across various Salesforce APIs and tools.
      </p>

      <p>
        When working with <strong>REST API queries</strong>, filtering date fields should also adhere 
        to the <code>YYYY-MM-DD</code> format.
      </p>
    </div>
  </div>
  `
