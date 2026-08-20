/* eslint-disable no-param-reassign */

import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import Loader from '../../Loaders/Loader'
import { getAllParentOrganizations, getAllCRMContacts } from './ClinchPadCommonFunc'

export default function ClinchPadActions({ clinchPadConf, setClinchPadConf, loading, setLoading }) {
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
    const newConf = { ...clinchPadConf }
    if (type === 'parentOrganization') {
      if (e.target?.checked) {
        getAllParentOrganizations(clinchPadConf, setClinchPadConf, setLoading)
        newConf.actions.parentOrganization = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.parentOrganization
      }
    } else if (type === 'contact') {
      if (e.target?.checked) {
        getAllCRMContacts(clinchPadConf, setClinchPadConf, setLoading)
        newConf.actions.contact = true
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.contact
      }
    }

    setActionMdl({ show: type })
    setClinchPadConf({ ...newConf })
  }

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setChanges = (val, name) => {
    const newConf = { ...clinchPadConf }
    newConf[name] = val
    setClinchPadConf({ ...newConf })
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      {clinchPadConf.actionName === 'contact' && (
        <TableCheckBox
          checked={clinchPadConf?.selectedParentOrganization?.length || false}
          onChange={e => actionHandler(e, 'parentOrganization')}
          className="wdt-200 mt-4 mr-2"
          value="parentOrganization"
          title={__('Add ParentOrganization', 'bit - integrations')}
          subTitle={__('Add an parentOrganization')}
        />
      )}
      {clinchPadConf.actionName === 'lead' && (
        <TableCheckBox
          checked={clinchPadConf?.selectedContact?.length || false}
          onChange={e => actionHandler(e, 'contact')}
          className="wdt-200 mt-4 mr-2"
          value="contact"
          title={__('Add Contacts', 'bit - integrations')}
          subTitle={__('Add a contact')}
        />
      )}

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
              options={clinchPadConf?.parentOrganizations?.map(parentOrganization => ({
                label: parentOrganization.name,
                value: parentOrganization.id
              }))}
              className="msl-wrp-options"
              defaultValue={clinchPadConf?.selectedParentOrganization}
              onChange={val => setChanges(val, 'selectedParentOrganization')}
              singleSelect
            />
            <button
              onClick={() => getAllParentOrganizations(clinchPadConf, setClinchPadConf, setLoading)}
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
        show={actionMdl.show === 'contact'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Contacts', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Contact', 'bit-integrations')}</div>
        {loading.CRMContacts ? (
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
              options={clinchPadConf?.CRMContacts?.map(contact => ({
                label: contact.name,
                value: contact.id
              }))}
              className="msl-wrp-options"
              defaultValue={clinchPadConf?.selectedContact}
              onChange={val => setChanges(val, 'selectedContact')}
              singleSelect
            />
            <button
              onClick={() => getAllCRMContacts(clinchPadConf, setClinchPadConf, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh Contacts', 'bit-integrations')}'` }}
              type="button">
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>
    </div>
  )
}
