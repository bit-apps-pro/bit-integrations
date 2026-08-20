/* eslint-disable no-param-reassign */

import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import Loader from '../../Loaders/Loader'
import {
  getAllLeads,
  getAllParentOrganizations,
  getAllTeams,
  getAllCurrencies,
  getAllStages
} from './ZendeskCommonFunc'

export default function ZendeskActions({ zendeskConf, setZendeskConf, loading, setLoading }) {
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })

  const followUps = [
    { label: __('Yes', 'bit-integrations'), value: 'yes' },
    { label: __('No', 'bit-integrations'), value: 'no' }
  ]

  const leadTypes = [
    { label: __('New Business', 'bit-integrations'), value: 'New Business' },
    { label: __('Existing Business', 'bit-integrations'), value: 'Existing Business' }
  ]

  const actionHandler = (e, type) => {
    const newConf = { ...zendeskConf }

    if (type === 'lead') {
      if (e.target?.checked) {
        getAllLeads(zendeskConf, setZendeskConf, setLoading)
        newConf.actions.lead = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.lead
      }
    } else if (type === 'parentOrganization') {
      if (e.target?.checked) {
        getAllParentOrganizations(zendeskConf, setZendeskConf, setLoading)
        newConf.actions.parentOrganization = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.parentOrganization
      }
    } else if (type === 'team') {
      if (e.target?.checked) {
        getAllTeams(zendeskConf, setZendeskConf, setLoading)
        newConf.actions.team = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.team
      }
    } else if (type === 'currency') {
      if (e.target?.checked) {
        getAllCurrencies(zendeskConf, setZendeskConf, setLoading)
        newConf.actions.currency = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.currency
      }
    } else if (type === 'stage') {
      if (e.target?.checked) {
        getAllStages(zendeskConf, setZendeskConf, setLoading)
        newConf.actions.stage = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.stage
      }
    } else if (type === 'followUp') {
      if (e.target?.checked) {
        newConf.actions.followUp = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.followUp
      }
    } else if (type === 'leadType') {
      if (e.target?.checked) {
        newConf.actions.leadType = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.leadType
      }
    }

    setActionMdl({ show: type })
    setZendeskConf({ ...newConf })
  }

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setChanges = (val, name) => {
    const newConf = { ...zendeskConf }
    newConf[name] = val
    setZendeskConf({ ...newConf })
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      {zendeskConf.actionName === 'organization' && (
        <TableCheckBox
          checked={zendeskConf?.selectedParentOrganization?.length || false}
          onChange={e => actionHandler(e, 'parentOrganization')}
          className="wdt-200 mt-4 mr-2"
          value="parentOrganization"
          title={__('Add ParentOrganization', 'bit - integrations')}
          subTitle={__('Add an parentOrganization')}
        />
      )}
      {zendeskConf.actionName === 'deal' && (
        <TableCheckBox
          checked={zendeskConf?.selectedStage?.length || false}
          onChange={e => actionHandler(e, 'stage')}
          className="wdt-200 mt-4 mr-2"
          value="stage"
          title={__('Add Stage', 'bit - integrations')}
          subTitle={__('Add a stage')}
        />
      )}

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'lead'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Leads', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Lead', 'bit-integrations')}</div>
        {loading.leads ? (
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
            <MultiSelect
              options={zendeskConf?.leads?.map(lead => ({ label: lead.name, value: lead.id }))}
              className="msl-wrp-options"
              defaultValue={zendeskConf?.selectedLead}
              onChange={val => setChanges(val, 'selectedLead')}
              singleSelect
            />
            <button
              onClick={() => getAllLeads(zendeskConf, setZendeskConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh Leads', 'bit-integrations')}'` }}
              type="button">
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
        show={actionMdl.show === 'parentOrganization'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('ParentOrganizations', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select ParentOrganization', 'bit-integrations')}</div>
        {loading.parentOrganizations ? (
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
            <MultiSelect
              options={zendeskConf?.parentOrganizations?.map(parentOrganization => ({
                label: parentOrganization.name,
                value: parentOrganization.id
              }))}
              className="msl-wrp-options"
              defaultValue={zendeskConf?.selectedParentOrganization}
              onChange={val => setChanges(val, 'selectedParentOrganization')}
              singleSelect
            />
            <button
              onClick={() => getAllParentOrganizations(zendeskConf, setZendeskConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{
                '--tooltip-txt': `${__('Refresh ParentOrganizations', 'bit-integrations')}'`
              }}
              type="button">
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
        show={actionMdl.show === 'team'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Teams', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Team', 'bit-integrations')}</div>
        {loading.teams ? (
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
            <MultiSelect
              options={zendeskConf?.teams?.map(team => ({ label: team.name, value: team.id }))}
              className="msl-wrp-options"
              defaultValue={zendeskConf?.selectedTeam}
              onChange={val => setChanges(val, 'selectedTeam')}
              singleSelect
            />
            <button
              onClick={() => getAllTeams(zendeskConf, setZendeskConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh Teams', 'bit-integrations')}'` }}
              type="button">
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
        show={actionMdl.show === 'currency'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Currencies', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Currency', 'bit-integrations')}</div>
        {loading.currencies ? (
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
            <MultiSelect
              options={zendeskConf?.currencies?.map(currency => ({
                label: currency.name,
                value: currency.id
              }))}
              className="msl-wrp-options"
              defaultValue={zendeskConf?.selectedCurrency}
              onChange={val => setChanges(val, 'selectedCurrency')}
              singleSelect
            />
            <button
              onClick={() => getAllCurrencies(zendeskConf, setZendeskConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh Currencies', 'bit-integrations')}'` }}
              type="button">
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
        show={actionMdl.show === 'stage'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Stages', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Stage', 'bit-integrations')}</div>
        {loading.stages ? (
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
            <MultiSelect
              options={zendeskConf?.stages?.map(stage => ({
                label: stage.name,
                value: stage.id
              }))}
              className="msl-wrp-options"
              defaultValue={zendeskConf?.selectedStage}
              onChange={val => setChanges(val, 'selectedStage')}
              singleSelect
            />
            <button
              onClick={() => getAllStages(zendeskConf, setZendeskConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh Stages', 'bit-integrations')}'` }}
              type="button">
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
        show={actionMdl.show === 'followUp'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Follow Up', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="flx flx-center mt-2">
          <MultiSelect
            options={followUps?.map(followUp => ({
              label: followUp.label,
              value: followUp.value
            }))}
            className="msl-wrp-options"
            defaultValue={zendeskConf?.selectedFollowUp}
            onChange={val => setChanges(val, 'selectedFollowUp')}
            singleSelect
          />
        </div>
      </ConfirmModal>

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'leadType'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Lead types', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="flx flx-center mt-2">
          <MultiSelect
            options={leadTypes?.map(leadType => ({
              label: leadType.label,
              value: leadType.value
            }))}
            className="msl-wrp-options"
            defaultValue={zendeskConf?.selectedLeadType}
            onChange={val => setChanges(val, 'selectedLeadType')}
            singleSelect
          />
        </div>
      </ConfirmModal>
    </div>
  )
}
