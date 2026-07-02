/* eslint-disable no-param-reassign */

import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import Loader from '../../Loaders/Loader'
import {
  getAllAccounts,
  getAllLifeCycleStage,
  getAllOwners,
  getAllSources,
  getAllStatuses
} from './AgiledCommonFunc'

export default function AgiledActions({ agiledConf, setAgiledConf, loading, setLoading }) {
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })

  const followUps = [
    { label: __('Yes', 'bit-integrations'), value: 'yes' },
    { label: __('No', 'bit-integrations'), value: 'no' }
  ]

  const dealTypes = [
    { label: __('New Business', 'bit-integrations'), value: 'New Business' },
    { label: __('Existing Business', 'bit-integrations'), value: 'Existing Business' }
  ]

  const actionHandler = (e, type) => {
    const newConf = { ...agiledConf }

    if (type === 'owner') {
      if (e.target?.checked) {
        getAllOwners(agiledConf, setAgiledConf, loading, setLoading)
        newConf.actions.owner = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.owner
      }
    } else if (type === 'account') {
      if (e.target?.checked) {
        getAllAccounts(agiledConf, setAgiledConf, loading, setLoading)
        newConf.actions.account = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.account
      }
    } else if (type === 'source') {
      if (e.target?.checked) {
        getAllSources(agiledConf, setAgiledConf, loading, setLoading)
        newConf.actions.source = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.source
      }
    } else if (type === 'status') {
      if (e.target?.checked) {
        getAllStatuses(agiledConf, setAgiledConf, loading, setLoading)
        newConf.actions.status = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.status
      }
    } else if (type === 'lifeCycleStage') {
      if (e.target?.checked) {
        getAllLifeCycleStage(agiledConf, setAgiledConf, loading, setLoading)
        newConf.actions.lifeCycleStage = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.lifeCycleStage
      }
    } else if (type === 'followUp') {
      if (e.target?.checked) {
        newConf.actions.followUp = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.followUp
      }
    } else if (type === 'dealType') {
      if (e.target?.checked) {
        newConf.actions.dealType = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.dealType
      }
    }

    setActionMdl({ show: type })
    setAgiledConf({ ...newConf })
  }

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setChanges = (val, name) => {
    const newConf = { ...agiledConf }
    newConf[name] = val
    setAgiledConf({ ...newConf })
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      {agiledConf.actionName !== 'deal' && (
        <TableCheckBox
          checked={agiledConf?.selectedOwner?.length || false}
          onChange={e => actionHandler(e, 'owner')}
          className="wdt-200 mt-4 mr-2"
          value="owner"
          title={__('Add Owner', 'bit - integrations')}
          subTitle={__('Add an owner')}
        />
      )}
      {agiledConf.actionName === 'contact' && (
        <TableCheckBox
          checked={agiledConf?.selectedAccount?.length || false}
          onChange={e => actionHandler(e, 'account')}
          className="wdt-200 mt-4 mr-2"
          value="account"
          title={__('Add Account', 'bit - integrations')}
          subTitle={__('Add an account')}
        />
      )}
      {/* {agiledConf.actionName === 'contact' && <TableCheckBox checked={agiledConf?.selectedSource?.length || false} onChange={(e) => actionHandler(e, 'source')} className="wdt-200 mt-4 mr-2" value="source" title={__('Add Source', 'bit - integrations')} subTitle={__('Add a source')} />} */}
      {/* {agiledConf.actionName === 'contact' && <TableCheckBox checked={agiledConf?.selectedStatus?.length || false} onChange={(e) => actionHandler(e, 'status')} className="wdt-200 mt-4 mr-2" value="status" title={__('Add Status', 'bit - integrations')} subTitle={__('Add a status')} />} */}
      {/* {agiledConf.actionName === 'contact' && <TableCheckBox checked={agiledConf?.selectedFollowUp?.length || false} onChange={(e) => actionHandler(e, 'followUp')} className="wdt-200 mt-4 mr-2" value="followUp" title={__('Add Follow Up', 'bit - integrations')} subTitle={__('Select follow up')} />} */}
      {/* {agiledConf.actionName === 'contact' && <TableCheckBox checked={agiledConf?.selectedLifeCycleStage?.length || false} onChange={(e) => actionHandler(e, 'lifeCycleStage')} className="wdt-200 mt-4 mr-2" value="lifeCycleStage" title={__('Add Life Cycle Stage', 'bit - integrations')} subTitle={__('Add a life cycle stage')} />} */}
      {agiledConf.actionName === 'deal' && (
        <TableCheckBox
          checked={agiledConf?.selectedDealType?.length || false}
          onChange={e => actionHandler(e, 'dealType')}
          className="wdt-200 mt-4 mr-2"
          value="dealType"
          title={__('Add Deal Type', 'bit - integrations')}
          subTitle={__('Add a deal type')}
        />
      )}

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
              options={agiledConf?.owners?.map(owner => ({ label: owner.name, value: owner.id }))}
              className="msl-wrp-options"
              defaultValue={agiledConf?.selectedOwner}
              onChange={val => setChanges(val, 'selectedOwner')}
              singleSelect
            />
            <button
              onClick={() => getAllOwners(agiledConf, setAgiledConf, loading, setLoading)}
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
        show={actionMdl.show === 'account'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Accounts', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Account', 'bit-integrations')}</div>
        {loading.accounts ? (
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
              options={agiledConf?.accounts?.map(account => ({
                label: account.name,
                value: account.id
              }))}
              className="msl-wrp-options"
              defaultValue={agiledConf?.selectedAccount}
              onChange={val => setChanges(val, 'selectedAccount')}
              singleSelect
            />
            <button
              onClick={() => getAllAccounts(agiledConf, setAgiledConf, loading, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh Accounts', 'bit-integrations')}'` }}
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
        show={actionMdl.show === 'source'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Sources', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Source', 'bit-integrations')}</div>
        {loading.sources ? (
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
              options={agiledConf?.sources?.map(source => ({
                label: source.name,
                value: source.id
              }))}
              className="msl-wrp-options"
              defaultValue={agiledConf?.selectedSource}
              onChange={val => setChanges(val, 'selectedSource')}
              singleSelect
            />
            <button
              onClick={() => getAllSources(agiledConf, setAgiledConf, loading, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh Sources', 'bit-integrations')}'` }}
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
        show={actionMdl.show === 'status'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Status', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Status', 'bit-integrations')}</div>
        {loading.statuses ? (
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
              options={agiledConf?.statuses?.map(status => ({
                label: status.name,
                value: status.id
              }))}
              className="msl-wrp-options"
              defaultValue={agiledConf?.selectedStatus}
              onChange={val => setChanges(val, 'selectedStatus')}
              singleSelect
            />
            <button
              onClick={() => getAllStatuses(agiledConf, setAgiledConf, loading, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh statuses', 'bit-integrations')}'` }}
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
            defaultValue={agiledConf?.selectedFollowUp}
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
        show={actionMdl.show === 'lifeCycleStage'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Life cycle stages', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select life cycle stage', 'bit-integrations')}</div>
        {loading.lifeCycleStages ? (
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
              options={agiledConf?.lifeCycleStages?.map(lifeCycleStage => ({
                label: lifeCycleStage.name,
                value: lifeCycleStage.id
              }))}
              className="msl-wrp-options"
              defaultValue={agiledConf?.selectedLifeCycleStage}
              onChange={val => setChanges(val, 'selectedLifeCycleStage')}
              singleSelect
            />
            <button
              onClick={() => getAllLifeCycleStage(agiledConf, setAgiledConf, loading, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh life cycle stages', 'bit-integrations')}'` }}
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
        show={actionMdl.show === 'dealType'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Deal types', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="flx flx-center mt-2">
          <MultiSelect
            options={dealTypes?.map(dealType => ({
              label: dealType.label,
              value: dealType.value
            }))}
            className="msl-wrp-options"
            defaultValue={agiledConf?.selectedDealType}
            onChange={val => setChanges(val, 'selectedDealType')}
            singleSelect
          />
        </div>
      </ConfirmModal>
    </div>
  )
}
