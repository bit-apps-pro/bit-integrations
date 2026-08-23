/* eslint-disable no-param-reassign */

import React, { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'

export default function FreshdeskActions({ freshdeskConf, setFreshdeskConf, formFields }) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })
  const actionHandler = (e, type) => {
    const newConf = { ...freshdeskConf }
    if (type === 'status') {
      if (e.target?.checked) {
        newConf.actions.status = true
        setActionMdl({ show: 'status' })
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.status
        delete newConf.status
      }
    }
    if (type === 'priority') {
      if (e.target?.checked) {
        newConf.actions.priority = true
        setActionMdl({ show: 'priority' })
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.priority
        delete newConf.priority
      }
    }
    if (type === 'updateContact') {
      if (e.target.checked) {
        newConf.updateContact = true
      } else {
        delete newConf.updateContact
      }
    }
    if (type === 'Attachments') {
      if (e.target.value !== '') {
        newConf.actions.attachments = e.target.value
      } else {
        delete newConf.actions.attachments
      }
    }
    if (type === 'file') {
      if (e.target.value !== '') {
        newConf.actions.file = e.target.value
      } else {
        delete newConf.actions.file
      }
    }

    setFreshdeskConf({ ...newConf })
  }
  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }
  const onSelectStatusHandler = val => {
    const newConf = { ...freshdeskConf }
    newConf.status = val
    setFreshdeskConf(newConf)
  }
  const onSelectPriorityHandler = val => {
    const newConf = { ...freshdeskConf }
    newConf.priority = val
    setFreshdeskConf(newConf)
  }

  const statusOptions = [
    { label: __('Open', 'bit-integrations'), value: '2' },
    { label: __('Pending', 'bit-integrations'), value: '3' },
    { label: __('Resolved', 'bit-integrations'), value: '4' },
    { label: __('Closed', 'bit-integrations'), value: '5' }
  ]
  const priorityOptions = [
    { label: __('Low', 'bit-integrations'), value: '1' },
    { label: __('Medium', 'bit-integrations'), value: '2' },
    { label: __('High', 'bit-integrations'), value: '3' },
    { label: __('Urgent', 'bit-integrations'), value: '4' }
  ]

  return (
    <div className="d-flx wdt-200">
      <div className="pos-rel d-flx flx-col w-8">
        <TableCheckBox
          checked={freshdeskConf?.actions?.status || false}
          onChange={e => actionHandler(e, 'status')}
          className="wdt-200 mt-4 mr-2"
          value="status"
          title={__('Status', 'bit-integrations')}
          subTitle={__('Add Ticket Status', 'bit-integrations')}
        />
        <small style={{ marginLeft: 30, marginTop: 10, color: 'red' }}>
          {__('This Required', 'bit-integrations')}
        </small>
        <ConfirmModal
          className="custom-conf-mdl"
          mainMdlCls="o-v"
          btnClass="purple"
          btnTxt={__('Ok', 'bit-integrations')}
          show={actionMdl.show === 'status'}
          close={clsActionMdl}
          action={clsActionMdl}
          title={__('Position', 'bit-integrations')}>
          <div className="btcd-hr mt-2 mb-2" />
          <div className="mt-2">{__('Select Status', 'bit-integrations')}</div>
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
              <MultiSelect
                options={statusOptions}
                className="msl-wrp-options"
                singleSelect
                defaultValue={freshdeskConf.status}
                onChange={val => onSelectStatusHandler(val)}
              />
            </div>
          )}
        </ConfirmModal>
      </div>
      <div className="pos-rel d-flx flx-col w-8">
        <TableCheckBox
          checked={freshdeskConf?.actions?.priority || false}
          onChange={e => actionHandler(e, 'priority')}
          className="wdt-200 mt-4 mr-2"
          value="priority"
          title={__('Priority', 'bit-integrations')}
          subTitle={__('Add Ticket Priority', 'bit-integrations')}
        />
        <small style={{ marginLeft: 30, marginTop: 10, color: 'red' }}>
          {__('This Required', 'bit-integrations')}
        </small>
        <ConfirmModal
          className="custom-conf-mdl"
          mainMdlCls="o-v"
          btnClass="purple"
          btnTxt={__('Ok', 'bit-integrations')}
          show={actionMdl.show === 'priority'}
          close={clsActionMdl}
          action={clsActionMdl}
          title={__('Position', 'bit-integrations')}>
          <div className="btcd-hr mt-2 mb-2" />
          <div className="mt-2">{__('Select Priority', 'bit-integrations')}</div>
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
              <MultiSelect
                options={priorityOptions}
                className="msl-wrp-options"
                singleSelect
                defaultValue={freshdeskConf.priority}
                onChange={val => onSelectPriorityHandler(val)}
              />
            </div>
          )}
        </ConfirmModal>
      </div>

      <div className="pos-rel d-flx w-8l">
        <div className="d-flx flx-wrp">
          <TableCheckBox
            onChange={() => setActionMdl({ show: 'attachments' })}
            checked={'attachments' in freshdeskConf.actions}
            className="wdt-200 mt-4 mr-2"
            value="Attachment"
            title={__('Photo', 'bit-integrations')}
            subTitle={__('Add Photo on Freshdsk Account.', 'bit-integrations')}
          />
        </div>

        <ConfirmModal
          className="custom-conf-mdl"
          mainMdlCls="o-v"
          btnClass="purple"
          btnTxt="Ok"
          show={actionMdl.show === 'attachments'}
          close={() => setActionMdl({ show: false })}
          action={() => setActionMdl({ show: false })}
          title={__('Select Attachment', 'bit-integrations')}>
          <div className="btcd-hr mt-2" />
          <div className="mt-2">{__('Please select file upload fields', 'bit-integrations')}</div>
          <select
            onChange={e => actionHandler(e, 'Attachments')}
            name="attachments"
            value={freshdeskConf.actions?.attachments}
            className="btcd-paper-inp w-10 mt-2">
            <option value="">{__('Select file upload field', 'bit-integrations')}</option>
            {formFields
              .filter(itm => itm.type === 'file')
              .map(itm => (
                <option key={itm.name + 1} value={itm.name}>
                  {itm.label}
                </option>
              ))}
          </select>
        </ConfirmModal>
      </div>
      <div className="pos-rel d-flx w-8l">
        <div className="d-flx flx-wrp">
          <TableCheckBox
            onChange={() => setActionMdl({ show: 'file' })}
            checked={'file' in freshdeskConf.actions}
            className="wdt-200 mt-4 mr-2"
            value="file"
            title={__('File', 'bit-integrations')}
            subTitle={__('Add File from Bit Integrations to send Freshdsk.', 'bit-integrations')}
          />
        </div>

        <ConfirmModal
          className="custom-conf-mdl"
          mainMdlCls="o-v"
          btnClass="purple"
          btnTxt="Ok"
          show={actionMdl.show === 'file'}
          close={() => setActionMdl({ show: false })}
          action={() => setActionMdl({ show: false })}
          title={__('Select Attachment', 'bit-integrations')}>
          <div className="btcd-hr mt-2" />
          <div className="mt-2">{__('Please select file upload fields', 'bit-integrations')}</div>
          <select
            onChange={e => actionHandler(e, 'file')}
            name="file"
            value={freshdeskConf.actions?.file}
            className="btcd-paper-inp w-10 mt-2">
            <option value="">{__('Select file upload field', 'bit-integrations')}</option>
            {formFields
              .filter(itm => itm.type === 'file')
              .map(itm => (
                <option key={itm.name + 1} value={itm.name}>
                  {itm.label}
                </option>
              ))}
          </select>
        </ConfirmModal>
      </div>

      <div className="pos-rel d-flx w-8">
        <TableCheckBox
          checked={freshdeskConf?.updateContact || false}
          onChange={e => actionHandler(e, 'updateContact')}
          className="wdt-200 mt-4 mr-2"
          value="updateContact"
          title={__('Update', 'bit-integrations')}
          subTitle={__('Update Contact or Create Contact', 'bit-integrations')}
        />
      </div>
    </div>
  )
}
