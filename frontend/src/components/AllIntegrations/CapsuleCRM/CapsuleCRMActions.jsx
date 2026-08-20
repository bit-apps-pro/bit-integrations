/* eslint-disable no-param-reassign */

import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import Loader from '../../Loaders/Loader'
import { getAllOpportunities, getAllOwners, getAllTeams, getAllCurrencies } from './CapsuleCRMCommonFunc'

export default function CapsuleCRMActions({ capsulecrmConf, setCapsuleCRMConf, loading, setLoading }) {
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })

  const followUps = [
    { label: __('Yes', 'bit-integrations'), value: 'yes' },
    { label: __('No', 'bit-integrations'), value: 'no' }
  ]

  const opportunityTypes = [
    { label: __('New Business', 'bit-integrations'), value: 'New Business' },
    { label: __('Existing Business', 'bit-integrations'), value: 'Existing Business' }
  ]

  const actionHandler = (e, type) => {
    const newConf = { ...capsulecrmConf }

    if (type === 'opportunity') {
      if (e.target?.checked) {
        getAllOpportunities(capsulecrmConf, setCapsuleCRMConf, setLoading)
        newConf.actions.opportunity = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.opportunity
      }
    } else if (type === 'owner') {
      if (e.target?.checked) {
        getAllOwners(capsulecrmConf, setCapsuleCRMConf, setLoading)
        newConf.actions.owner = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.owner
      }
    } else if (type === 'team') {
      if (e.target?.checked) {
        getAllTeams(capsulecrmConf, setCapsuleCRMConf, setLoading)
        newConf.actions.team = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.team
      }
    } else if (type === 'currency') {
      if (e.target?.checked) {
        getAllCurrencies(capsulecrmConf, setCapsuleCRMConf, setLoading)
        newConf.actions.currency = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.currency
      }
    } else if (type === 'followUp') {
      if (e.target?.checked) {
        newConf.actions.followUp = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.followUp
      }
    } else if (type === 'opportunityType') {
      if (e.target?.checked) {
        newConf.actions.opportunityType = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.opportunityType
      }
    }

    setActionMdl({ show: type })
    setCapsuleCRMConf({ ...newConf })
  }

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setChanges = (val, name) => {
    const newConf = { ...capsulecrmConf }
    newConf[name] = val
    setCapsuleCRMConf({ ...newConf })
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      {(capsulecrmConf.actionName === 'person' ||
        capsulecrmConf.actionName === 'organisation' ||
        capsulecrmConf.actionName === 'opportunity' ||
        capsulecrmConf.actionName === 'project') && (
        <TableCheckBox
          checked={capsulecrmConf?.selectedOwner?.length || false}
          onChange={e => actionHandler(e, 'owner')}
          className="wdt-200 mt-4 mr-2"
          value="owner"
          title={__('Add Owner', 'bit - integrations')}
          subTitle={__('Add an owner')}
        />
      )}
      {(capsulecrmConf.actionName === 'person' ||
        capsulecrmConf.actionName === 'organisation' ||
        capsulecrmConf.actionName === 'opportunity' ||
        capsulecrmConf.actionName === 'project') && (
        <TableCheckBox
          checked={capsulecrmConf?.selectedTeam?.length || false}
          onChange={e => actionHandler(e, 'team')}
          className="wdt-200 mt-4 mr-2"
          value="team"
          title={__('Add Team', 'bit - integrations')}
          subTitle={__('Add an team')}
        />
      )}
      {capsulecrmConf.actionName === 'opportunity' && (
        <TableCheckBox
          checked={capsulecrmConf?.selectedCurrency?.length || false}
          onChange={e => actionHandler(e, 'currency')}
          className="wdt-200 mt-4 mr-2"
          value="currency"
          title={__('Add Currency', 'bit - integrations')}
          subTitle={__('Add a currency')}
        />
      )}
      {capsulecrmConf.actionName === 'project' && (
        <TableCheckBox
          checked={capsulecrmConf?.selectedOpportunity?.length || false}
          onChange={e => actionHandler(e, 'opportunity')}
          className="wdt-200 mt-4 mr-2"
          value="opportunity"
          title={__('Add Opportunity', 'bit - integrations')}
          subTitle={__('Add a opportunity')}
        />
      )}

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'opportunity'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Opportunities', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Opportunity', 'bit-integrations')}</div>
        {loading.opportunities ? (
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
              options={capsulecrmConf?.opportunities?.map(opportunity => ({
                label: opportunity.name,
                value: opportunity.id
              }))}
              className="msl-wrp-options"
              defaultValue={capsulecrmConf?.selectedOpportunity}
              onChange={val => setChanges(val, 'selectedOpportunity')}
              singleSelect
            />
            <button
              onClick={() => getAllOpportunities(capsulecrmConf, setCapsuleCRMConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh Opportunities', 'bit-integrations')}'` }}
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
        show={actionMdl.show === 'owner'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Owners', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Owner', 'bit-integrations')}</div>
        {loading.owners ? (
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
              options={capsulecrmConf?.owners?.map(owner => ({
                label: owner.name,
                value: owner.id
              }))}
              className="msl-wrp-options"
              defaultValue={capsulecrmConf?.selectedOwner}
              onChange={val => setChanges(val, 'selectedOwner')}
              singleSelect
            />
            <button
              onClick={() => getAllOwners(capsulecrmConf, setCapsuleCRMConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh Owners', 'bit-integrations')}'` }}
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
              options={capsulecrmConf?.teams?.map(team => ({ label: team.name, value: team.id }))}
              className="msl-wrp-options"
              defaultValue={capsulecrmConf?.selectedTeam}
              onChange={val => setChanges(val, 'selectedTeam')}
              singleSelect
            />
            <button
              onClick={() => getAllTeams(capsulecrmConf, setCapsuleCRMConf, setLoading)}
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
              options={capsulecrmConf?.currencies?.map(currency => ({
                label: currency.name,
                value: currency.id
              }))}
              className="msl-wrp-options"
              defaultValue={capsulecrmConf?.selectedCurrency}
              onChange={val => setChanges(val, 'selectedCurrency')}
              singleSelect
            />
            <button
              onClick={() => getAllCurrencies(capsulecrmConf, setCapsuleCRMConf, setLoading)}
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
            defaultValue={capsulecrmConf?.selectedFollowUp}
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
        show={actionMdl.show === 'opportunityType'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Opportunity types', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="flx flx-center mt-2">
          <MultiSelect
            options={opportunityTypes?.map(opportunityType => ({
              label: opportunityType.label,
              value: opportunityType.value
            }))}
            className="msl-wrp-options"
            defaultValue={capsulecrmConf?.selectedOpportunityType}
            onChange={val => setChanges(val, 'selectedOpportunityType')}
            singleSelect
          />
        </div>
      </ConfirmModal>
    </div>
  )
}
