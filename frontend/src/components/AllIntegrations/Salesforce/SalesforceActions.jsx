/* eslint-disable no-param-reassign */

import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import Loader from '../../Loaders/Loader'
import {
  getAllAccountList,
  getAllCampaignList,
  getAllContactList,
  getAllOrigin,
  getAllReason,
  getAllStatus,
  getAllType,
  getAllPriority,
  getAllPotentialLiability,
  getAllSLAViolation,
  getAllLeadSource,
  getAllLeadRatings,
  getAllLeadStatus,
  getAllLeadIndustries
} from './SalesforceCommonFunc'
import {
  eventSubject,
  opportunityLeadSource,
  opportunityStage,
  opportunityType
} from './SalesforceDataStore'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { ProFeatureSubtitle, ProFeatureTitle } from '../IntegrationHelpers/ActionProFeatureLabels'

export default function SalesforceActions({
  salesforceConf,
  setSalesforceConf,
  formID,
  formFields,
  setSnackbar
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false })
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const actionHandler = (val, typ) => {
    const newConf = { ...salesforceConf }
    if (val !== '') {
      newConf.actions[typ] = val
    } else {
      delete newConf.actions[typ]
    }
    setSalesforceConf({ ...newConf })
  }

  const openCampaignModel = () => {
    if (!salesforceConf?.default?.campaignLists) {
      getAllCampaignList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    }
    setActionMdl({ show: 'campaign' })
  }
  const openAccountModel = () => {
    if (!salesforceConf?.default?.accountLists) {
      getAllAccountList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    }
    setActionMdl({ show: 'account' })
  }

  const openContactModel = () => {
    if (!salesforceConf?.default?.contactLists) {
      getAllContactList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    }
    setActionMdl({ show: 'contact' })
  }

  const openActionMdl = modelName => {
    if (modelName === 'caseOrigin') {
      getAllOrigin(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    } else if (modelName === 'caseType') {
      getAllType(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    } else if (modelName === 'caseReason') {
      getAllReason(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    } else if (modelName === 'caseStatus') {
      getAllStatus(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    } else if (modelName === 'casePriority') {
      getAllPriority(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    } else if (modelName === 'potentialLiability') {
      getAllPotentialLiability(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    } else if (modelName === 'slaViolation') {
      getAllSLAViolation(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    } else if (modelName === 'leadSource') {
      getAllLeadSource(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    } else if (modelName === 'leadStatus') {
      getAllLeadStatus(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    } else if (modelName === 'leadRating') {
      getAllLeadRatings(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    } else if (modelName === 'leadIndustry') {
      getAllLeadIndustries(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
    }

    setActionMdl({ show: modelName })
  }

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  return (
    <div className="pos-rel">
      <div className="d-flx flx-wrp">
        {['contact-create', 'lead-create'].includes(salesforceConf.actionName) && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TableCheckBox
              onChange={e => actionHandler(e.target.checked, 'update')}
              checked={salesforceConf?.actions?.update ?? false}
              className="wdt-200 mt-4 mr-2"
              value="update"
              isInfo={!isPro}
              title={<ProFeatureTitle title={__('Update Record', 'bit-integrations')} />}
              subTitle={
                <ProFeatureSubtitle
                  title={__('Update', 'bit-integrations')}
                  subTitle={__('Update existing Record.', 'bit-integrations')}
                  proVersion="2.7.2 or 2.7.3"
                />
              }
            />
          </div>
        )}
        {salesforceConf.actionName === 'opportunity-create' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TableCheckBox
              onChange={openCampaignModel}
              checked={'campaignId' in salesforceConf.actions}
              className="wdt-200 mt-4 mr-2"
              value="campaignId"
              title={__('Campaign', 'bit-integrations')}
              subTitle={__('Campaign of salesforce.', 'bit-integrations')}
            />
          </div>
        )}
        {['opportunity-create', 'event-create', 'case-create'].includes(salesforceConf.actionName) && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TableCheckBox
              onChange={openAccountModel}
              checked={'accountId' in salesforceConf.actions}
              className="wdt-200 mt-4 mr-2"
              value="accountId"
              title={__('Account', 'bit-integrations')}
              subTitle={__('Account of salesforce.', 'bit-integrations')}
            />
          </div>
        )}
        {salesforceConf.actionName === 'opportunity-create' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TableCheckBox
              onChange={() => openActionMdl('opportunityStage')}
              checked={'opportunityStageId' in salesforceConf.actions}
              className="wdt-200 mt-4 mr-2"
              value="opportunityStageId"
              title={__('Opportunity Stage', 'bit-integrations')}
              subTitle={__('Opportunity stage of salesforce.', 'bit-integrations')}
            />
            <small style={{ marginLeft: 30, marginTop: 10, color: 'red' }}>
              {__('This Required', 'bit-integrations')}
            </small>
          </div>
        )}
        {salesforceConf.actionName === 'opportunity-create' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TableCheckBox
              onChange={() => openActionMdl('opportunityType')}
              checked={'opportunityTypeId' in salesforceConf.actions}
              className="wdt-200 mt-4 mr-2"
              value="opportunityTypeId"
              title={__('Opportunity Type', 'bit-integrations')}
              subTitle={__('Opportunity type of salesforce.', 'bit-integrations')}
            />
          </div>
        )}
        {salesforceConf.actionName === 'opportunity-create' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TableCheckBox
              onChange={() => openActionMdl('opportunityLeadSource')}
              checked={'opportunityLeadSourceId' in salesforceConf.actions}
              className="wdt-200 mt-4 mr-2"
              value="opportunityLeadSourceId"
              title={__('Opportunity Lead Source', 'bit-integrations')}
              subTitle={__('Opportunity Lead Source of salesforce.', 'bit-integrations')}
            />
          </div>
        )}
        {['event-create', 'case-create'].includes(salesforceConf.actionName) && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TableCheckBox
              onChange={openContactModel}
              checked={'contactId' in salesforceConf.actions}
              className="wdt-200 mt-4 mr-2"
              value="contactId"
              title={__('Contacts', 'bit-integrations')}
              subTitle={__('Contacts of salesforce.', 'bit-integrations')}
            />
          </div>
        )}
        {salesforceConf.actionName === 'event-create' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TableCheckBox
              onChange={() => openActionMdl('eventSubject')}
              checked={'eventSubjectId' in salesforceConf.actions}
              className="wdt-200 mt-4 mr-2"
              value="eventSubjectId"
              title={__('Event Subject', 'bit-integrations')}
              subTitle={__('Event subject of salesforce.', 'bit-integrations')}
            />
            <small style={{ marginLeft: 30, marginTop: 10, color: 'red' }}>
              {__('This Required', 'bit-integrations')}
            </small>
          </div>
        )}
        {salesforceConf.actionName === 'case-create' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TableCheckBox
                onChange={() => openActionMdl('caseStatus')}
                checked={'caseStatusId' in salesforceConf.actions}
                className="wdt-200 mt-4 mr-2"
                value="caseStatusId"
                title={__('Case Status', 'bit-integrations')}
                subTitle={__('Case Status of salesforce.', 'bit-integrations')}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TableCheckBox
                onChange={() => openActionMdl('caseOrigin')}
                checked={'caseOriginId' in salesforceConf.actions}
                className="wdt-200 mt-4 mr-2"
                value="caseOriginId"
                title={__('Case Origin', 'bit-integrations')}
                subTitle={__('Case Origin of salesforce.', 'bit-integrations')}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TableCheckBox
                onChange={() => openActionMdl('casePriority')}
                checked={'casePriorityId' in salesforceConf.actions}
                className="wdt-200 mt-4 mr-2"
                value="casePriorityId"
                title={__('Case Priority', 'bit-integrations')}
                subTitle={__('Case Priority of salesforce.', 'bit-integrations')}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TableCheckBox
                onChange={() => openActionMdl('potentialLiability')}
                checked={'potentialLiabilityId' in salesforceConf.actions}
                className="wdt-200 mt-4 mr-2"
                value="potentialLiabilityId"
                title={__('Potential liability', 'bit-integrations')}
                subTitle={__('Potential liability of salesforce.', 'bit-integrations')}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TableCheckBox
                onChange={() => openActionMdl('slaViolation')}
                checked={'slaViolationId' in salesforceConf.actions}
                className="wdt-200 mt-4 mr-2"
                value="slaViolationId"
                title={__('SLA Violation', 'bit-integrations')}
                subTitle={__('SLA ViolationId of salesforce.', 'bit-integrations')}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TableCheckBox
                onChange={() => openActionMdl('caseType')}
                checked={'caseType' in salesforceConf.actions}
                className="wdt-200 mt-4 mr-2"
                value="caseType"
                title={__('Type', 'bit-integrations')}
                subTitle={__('Add Case Type', 'bit-integrations')}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TableCheckBox
                onChange={() => openActionMdl('caseReason')}
                checked={'caseReason' in salesforceConf.actions}
                className="wdt-200 mt-4 mr-2"
                value="caseReason"
                title={__('Case Reason', 'bit-integrations')}
                subTitle={__('Add Case Reason', 'bit-integrations')}
              />
            </div>
          </>
        )}
        {salesforceConf.actionName === 'account-create' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TableCheckBox
                onChange={() => openActionMdl('accType')}
                checked={'selectedAccType' in salesforceConf.actions}
                className="wdt-200 mt-4 mr-2"
                value="accType"
                title={__('Type', 'bit-integrations')}
                subTitle={__('Add Account Type', 'bit-integrations')}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TableCheckBox
                onChange={() => openActionMdl('ownership')}
                checked={'selectedOwnership' in salesforceConf.actions}
                className="wdt-200 mt-4 mr-2"
                value="ownership"
                title={__('Ownership', 'bit-integrations')}
                subTitle={__('Add Account Ownership', 'bit-integrations')}
              />
            </div>
          </>
        )}
        {salesforceConf.actionName === 'lead-create' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TableCheckBox
                onChange={() => openActionMdl('leadSource')}
                checked={'selectedLeadSource' in salesforceConf.actions}
                className="wdt-200 mt-4 mr-2"
                value="leadSource"
                isInfo={!isPro}
                title={<ProFeatureTitle title={__('Lead Source', 'bit-integrations')} />}
                subTitle={
                  <ProFeatureSubtitle
                    title={__('Lead Source', 'bit-integrations')}
                    subTitle={__('Add Lead Source', 'bit-integrations')}
                    proVersion="2.5.3"
                  />
                }
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TableCheckBox
                onChange={() => openActionMdl('leadStatus')}
                checked={'selectedLeadStatus' in salesforceConf.actions}
                className="wdt-200 mt-4 mr-2"
                value="leadStatus"
                isInfo={!isPro}
                title={<ProFeatureTitle title={__('Lead Status', 'bit-integrations')} />}
                subTitle={
                  <ProFeatureSubtitle
                    title={__('Lead Status', 'bit-integrations')}
                    subTitle={__('Add Lead Status', 'bit-integrations')}
                    proVersion="2.5.3"
                  />
                }
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TableCheckBox
                onChange={() => openActionMdl('leadRating')}
                checked={'selectedLeadRating' in salesforceConf.actions}
                className="wdt-200 mt-4 mr-2"
                value="leadRating"
                isInfo={!isPro}
                title={<ProFeatureTitle title={__('Rating', 'bit-integrations')} />}
                subTitle={
                  <ProFeatureSubtitle
                    title={__('Rating', 'bit-integrations')}
                    subTitle={__('Add Lead Rating', 'bit-integrations')}
                    proVersion="2.5.3"
                  />
                }
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TableCheckBox
                onChange={() => openActionMdl('leadIndustry')}
                checked={'selectedLeadIndustry' in salesforceConf.actions}
                className="wdt-200 mt-4 mr-2"
                value="leadIndustry"
                isInfo={!isPro}
                title={<ProFeatureTitle title={__('Industry', 'bit-integrations')} />}
                subTitle={
                  <ProFeatureSubtitle
                    title={__('Industry', 'bit-integrations')}
                    subTitle={__('Add Lead Industry', 'bit-integrations')}
                    proVersion="2.5.3"
                  />
                }
              />
            </div>
          </>
        )}
      </div>

      {/* campaign */}
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'campaign'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Campaign', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.campaignId}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'campaignId')}>
              <option value="">{__('Select Campaign', 'bit-integrations')}</option>
              {salesforceConf?.default?.campaignLists &&
                salesforceConf.default.campaignLists.map(item => (
                  <option key={item.Id} value={item.Id}>
                    {item.Name}
                  </option>
                ))}
            </select>
            <button
              onClick={() =>
                getAllCampaignList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': '"Refresh Campaign"' }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>

      {/* account */}
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'account'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Account', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.accountId}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'accountId')}>
              <option value="">{__('Select Account', 'bit-integrations')}</option>
              {salesforceConf?.default?.accountLists &&
                salesforceConf.default.accountLists.map(item => (
                  <option key={item.Id} value={item.Id}>
                    {item.Name}
                  </option>
                ))}
            </select>
            <button
              onClick={() =>
                getAllAccountList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': '"Refresh Account"' }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>

      {/* opportunity stage */}
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'opportunityStage'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Opportunity Stage', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.opportunityStageId}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'opportunityStageId')}>
              <option value="">{__('Select Opportunity Stage', 'bit-integrations')}</option>
              {opportunityStage.map(item => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </ConfirmModal>

      {/* opportunity type */}
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'opportunityType'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Opportunity Type', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.opportunityTypeId}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'opportunityTypeId')}>
              <option value="">{__('Select Opportunity Type', 'bit-integrations')}</option>
              {opportunityType.map(item => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </ConfirmModal>

      {/* opportunity Lead Source */}
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'opportunityLeadSource'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Opportunity Lead Source', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.opportunityLeadSourceId}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'opportunityLeadSourceId')}>
              <option value="">{__('Select Opportunity Lead Source', 'bit-integrations')}</option>
              {opportunityLeadSource.map(item => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </ConfirmModal>

      {/* contact */}
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'contact'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Contact', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.contactId}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'contactId')}>
              <option value="">{__('Select Contact', 'bit-integrations')}</option>
              {salesforceConf?.default?.contactLists &&
                salesforceConf.default.contactLists.map(item => (
                  <option key={item.Id} value={item.Id}>
                    {item.Name}
                  </option>
                ))}
            </select>
            <button
              onClick={() =>
                getAllContactList(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': '"Refresh Contact"' }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>

      {/* event subject */}
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'eventSubject'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Event Subject', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.eventSubjectId}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'eventSubjectId')}>
              <option value="">{__('Select event subject', 'bit-integrations')}</option>
              {eventSubject.map(item => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </ConfirmModal>

      {/* case status */}
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'caseStatus'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Case Status', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.caseStatusId}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'caseStatusId')}>
              <option value="">{__('Select Case status', 'bit-integrations')}</option>
              {salesforceConf?.caseStatus?.map((item, key) => (
                <option key={key} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                getAllStatus(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': '"Refresh Case Status"' }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>

      {/* case origin */}
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'caseOrigin'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Case Origin', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.caseOriginId}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'caseOriginId')}>
              <option value="">{__('Select Case Origin', 'bit-integrations')}</option>
              {salesforceConf?.caseOrigins?.map((item, key) => (
                <option key={key} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                getAllOrigin(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': '"Refresh Case Origin"' }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>

      {/* case priority */}
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'casePriority'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Case Priority', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.casePriorityId}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'casePriorityId')}>
              <option value="">{__('Select Case Priority', 'bit-integrations')}</option>
              {salesforceConf?.casePriority?.map((item, key) => (
                <option key={key} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                getAllPriority(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': '"Refresh Case Priority"' }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>

      {/* case potentialLiability */}
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'potentialLiability'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Potential liability', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.potentialLiabilityId}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'potentialLiabilityId')}>
              <option value="">{__('Select Case potential liability', 'bit-integrations')}</option>
              {salesforceConf?.casePotentialLiability?.map((item, key) => (
                <option key={key} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                getAllPotentialLiability(
                  formID,
                  salesforceConf,
                  setSalesforceConf,
                  setIsLoading,
                  setSnackbar
                )
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': '"Refresh potential liability"' }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>

      {/* case slaViolation */}
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'slaViolation'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('SLA Violation', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.slaViolationId}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'slaViolationId')}>
              <option value="">{__('Select Case SLA violation', 'bit-integrations')}</option>
              {salesforceConf?.caseSLAViolation?.map((item, key) => (
                <option key={key} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                getAllSLAViolation(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': '"Refresh SLA Violation"' }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>

      {/* Account Module */}
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'accType'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Add Account Type', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.selectedAccType}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'selectedAccType')}>
              <option value="">{__('Select type', 'bit-integrations')}</option>
              {accountTypes.map((item, key) => (
                <option key={key} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        )}
      </ConfirmModal>
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'ownership'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Add Account Ownership', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.selectedOwnership}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'selectedOwnership')}>
              <option value="">{__('Select Ownership', 'bit-integrations')}</option>
              {['Public', 'Private', 'Subsidiary', 'Other'].map((item, key) => (
                <option key={key} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        )}
      </ConfirmModal>
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'caseType'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Add Case Type', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.caseType}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'caseType')}>
              <option value="">{__('Select type', 'bit-integrations')}</option>
              {salesforceConf?.caseTypes?.map((item, key) => (
                <option key={key} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                getAllType(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': '"Refresh Case Type"' }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'caseReason'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Add Case Reason', 'bit-integrations')}>
        <div className="btcd-hr mt-2" />
        {isLoading ? (
          <Loader
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 45,
              transform: 'scale(0.5)'
            }}
          />
        ) : (
          <div className="flx flx-between mt-2">
            <select
              value={salesforceConf.actions.caseReason}
              className="btcd-paper-inp"
              onChange={e => actionHandler(e.target.value, 'caseReason')}>
              <option value="">{__('Select Reason', 'bit-integrations')}</option>
              {salesforceConf?.caseReasons?.map((item, key) => (
                <option key={key} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                getAllReason(formID, salesforceConf, setSalesforceConf, setIsLoading, setSnackbar)
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': '"Refresh Case Reason"' }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>

      {isPro && (
        <>
          <ConfirmModal
            className="custom-conf-mdl"
            mainMdlCls="o-v"
            btnClass="purple"
            btnTxt={__('Ok', 'bit-integrations')}
            show={actionMdl.show === 'leadSource'}
            close={clsActionMdl}
            action={clsActionMdl}
            title={__('Add Lead Source', 'bit-integrations')}>
            <div className="btcd-hr mt-2" />
            {isLoading ? (
              <Loader
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 45,
                  transform: 'scale(0.5)'
                }}
              />
            ) : (
              <div className="flx flx-between mt-2">
                <select
                  value={salesforceConf.actions.selectedLeadSource}
                  className="btcd-paper-inp"
                  onChange={e => actionHandler(e.target.value, 'selectedLeadSource')}>
                  <option value="">{__('Select Source', 'bit-integrations')}</option>
                  {salesforceConf?.leadSources?.map((item, key) => (
                    <option key={key} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    getAllLeadSource(
                      formID,
                      salesforceConf,
                      setSalesforceConf,
                      setIsLoading,
                      setSnackbar
                    )
                  }
                  className="icn-btn sh-sm ml-2 mr-2 tooltip"
                  style={{ '--tooltip-txt': '"Refresh Case Reason"' }}
                  type="button"
                  disabled={isLoading}>
                  &#x21BB;
                </button>
              </div>
            )}
          </ConfirmModal>
          <ConfirmModal
            className="custom-conf-mdl"
            mainMdlCls="o-v"
            btnClass="purple"
            btnTxt={__('Ok', 'bit-integrations')}
            show={actionMdl.show === 'leadStatus'}
            close={clsActionMdl}
            action={clsActionMdl}
            title={__('Add Lead Status', 'bit-integrations')}>
            <div className="btcd-hr mt-2" />
            {isLoading ? (
              <Loader
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 45,
                  transform: 'scale(0.5)'
                }}
              />
            ) : (
              <div className="flx flx-between mt-2">
                <select
                  value={salesforceConf.actions.selectedLeadStatus}
                  className="btcd-paper-inp"
                  onChange={e => actionHandler(e.target.value, 'selectedLeadStatus')}>
                  <option value="">{__('Select Status', 'bit-integrations')}</option>
                  {salesforceConf?.leadStatus?.map((item, key) => (
                    <option key={key} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    getAllLeadStatus(
                      formID,
                      salesforceConf,
                      setSalesforceConf,
                      setIsLoading,
                      setSnackbar
                    )
                  }
                  className="icn-btn sh-sm ml-2 mr-2 tooltip"
                  style={{ '--tooltip-txt': '"Refresh Case Reason"' }}
                  type="button"
                  disabled={isLoading}>
                  &#x21BB;
                </button>
              </div>
            )}
          </ConfirmModal>
          <ConfirmModal
            className="custom-conf-mdl"
            mainMdlCls="o-v"
            btnClass="purple"
            btnTxt={__('Ok', 'bit-integrations')}
            show={actionMdl.show === 'leadRating'}
            close={clsActionMdl}
            action={clsActionMdl}
            title={__('Add Lead Rating', 'bit-integrations')}>
            <div className="btcd-hr mt-2" />
            {isLoading ? (
              <Loader
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 45,
                  transform: 'scale(0.5)'
                }}
              />
            ) : (
              <div className="flx flx-between mt-2">
                <select
                  value={salesforceConf.actions.selectedLeadRating}
                  className="btcd-paper-inp"
                  onChange={e => actionHandler(e.target.value, 'selectedLeadRating')}>
                  <option value="">{__('Select Rating', 'bit-integrations')}</option>
                  {salesforceConf?.leadRatings?.map((item, key) => (
                    <option key={key} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    getAllLeadRatings(
                      formID,
                      salesforceConf,
                      setSalesforceConf,
                      setIsLoading,
                      setSnackbar
                    )
                  }
                  className="icn-btn sh-sm ml-2 mr-2 tooltip"
                  style={{ '--tooltip-txt': '"Refresh Case Reason"' }}
                  type="button"
                  disabled={isLoading}>
                  &#x21BB;
                </button>
              </div>
            )}
          </ConfirmModal>
          <ConfirmModal
            className="custom-conf-mdl"
            mainMdlCls="o-v"
            btnClass="purple"
            btnTxt={__('Ok', 'bit-integrations')}
            show={actionMdl.show === 'leadIndustry'}
            close={clsActionMdl}
            action={clsActionMdl}
            title={__('Add Lead Industry', 'bit-integrations')}>
            <div className="btcd-hr mt-2" />
            {isLoading ? (
              <Loader
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 45,
                  transform: 'scale(0.5)'
                }}
              />
            ) : (
              <div className="flx flx-between mt-2">
                <select
                  value={salesforceConf.actions.selectedLeadIndustry}
                  className="btcd-paper-inp"
                  onChange={e => actionHandler(e.target.value, 'selectedLeadIndustry')}>
                  <option value="">{__('Select Industry', 'bit-integrations')}</option>
                  {salesforceConf?.leadIndustries?.map((item, key) => (
                    <option key={key} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    getAllLeadIndustries(
                      formID,
                      salesforceConf,
                      setSalesforceConf,
                      setIsLoading,
                      setSnackbar
                    )
                  }
                  className="icn-btn sh-sm ml-2 mr-2 tooltip"
                  style={{ '--tooltip-txt': '"Refresh Case Reason"' }}
                  type="button"
                  disabled={isLoading}>
                  &#x21BB;
                </button>
              </div>
            )}
          </ConfirmModal>
        </>
      )}
    </div>
  )
}

const accountTypes = [
  'Prospect',
  'Customer - Direct',
  'Customer - Channel',
  'Channel Partner / Reseller',
  'Installation Partner',
  'Technology Partner',
  'Other'
]
