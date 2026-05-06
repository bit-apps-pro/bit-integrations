/* eslint-disable no-param-reassign */

import React, { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { create } from 'mutative'
import { getAllTicketFields } from './FreshdeskCommonFunc'

export default function FreshdeskActions({ freshdeskConf, setFreshdeskConf, formFields, setSnackbar }) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })
  const actionHandler = (e, type) => {
    const newConf = { ...freshdeskConf }
    if (type === 'ticket_type') {
      if (e.target?.checked) {
        newConf.actions.ticket_type = true
        setActionMdl({ show: 'ticket_type' })
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.ticket_type
        delete newConf.selected_ticket_type
      }
    }
    if (type === 'source') {
      if (e.target?.checked) {
        newConf.actions.source = true
        setActionMdl({ show: 'source' })
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.source
        delete newConf.selected_ticket_source
      }
    }
    if (type === 'group') {
      if (e.target?.checked) {
        newConf.actions.group = true
        setActionMdl({ show: 'group' })
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.group
        delete newConf.selected_ticket_group
      }
    }
    if (type === 'product') {
      if (e.target?.checked) {
        newConf.actions.product = true
        setActionMdl({ show: 'product' })
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.product
        delete newConf.selected_ticket_product
      }
    }
    if (type === 'agent') {
      if (e.target?.checked) {
        newConf.actions.agent = true
        setActionMdl({ show: 'agent' })
      } else {
        setActionMdl({ show: false })
        delete newConf.actions.agent
        delete newConf.selected_ticket_agent
      }
    }
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

  const setAction = (val, name) => {
    setFreshdeskConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[name] = val
      })
    )
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
    <div className="d-flx flx-wrp">
      <div className="pos-rel d-flx flx-col">
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
      <div className="pos-rel d-flx flx-col">
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

      {/* Ticket Type */}
      <div className="pos-rel d-flx">
        <div className="d-flx flx-wrp">
          <TableCheckBox
            onChange={e => actionHandler(e, 'ticket_type')}
            checked={freshdeskConf?.actions?.ticket_type || false}
            className="wdt-200 mt-4 mr-2"
            value="ticket_type"
            title={__('Ticket Type', 'bit-integrations')}
            subTitle={__('Add Ticket type', 'bit-integrations')}
          />
        </div>

        <ConfirmModal
          className="custom-conf-mdl"
          mainMdlCls="o-v"
          btnClass="purple"
          btnTxt="Ok"
          show={actionMdl.show === 'ticket_type'}
          close={() => setActionMdl({ show: false })}
          action={() => setActionMdl({ show: false })}
          title={__('Select type', 'bit-integrations')}>
          <div className="btcd-hr mt-2" />
          <div className="mt-2">{__('Please select ticket type', 'bit-integrations')}</div>
          {isLoading ? (
            <Loader
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 100,
                transform: 'scale(0.7)'
              }}
            />
          ) : (
            <div className="flx">
              <select
                onChange={e => setAction(e.target.value, 'selected_ticket_type')}
                name="ticket_type"
                value={freshdeskConf.selected_ticket_type}
                className="btcd-paper-inp w-10 mt-2">
                <option value="">{__('Select ticket type', 'bit-integrations')}</option>
                {freshdeskConf?.ticketType?.map((itm, key) => (
                  <option key={key} value={itm}>
                    {itm}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  getAllTicketFields(freshdeskConf, setFreshdeskConf, setIsLoading, setSnackbar)
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{
                  '--tooltip-txt': `'${__('Refresh Ticket Field & Types', 'bit-integrations')}'`
                }}
                type="button"
                disabled={isLoading}>
                &#x21BB;
              </button>
            </div>
          )}
        </ConfirmModal>
      </div>
      {/* Ticket Source */}
      <div className="pos-rel d-flx w-8l">
        <div className="d-flx flx-wrp">
          <TableCheckBox
            onChange={e => actionHandler(e, 'source')}
            checked={freshdeskConf?.actions?.source || false}
            className="wdt-200 mt-4 mr-2"
            value="source"
            title={__('Source', 'bit-integrations')}
            subTitle={__('Add Ticket Source', 'bit-integrations')}
          />
        </div>

        <ConfirmModal
          className="custom-conf-mdl"
          mainMdlCls="o-v"
          btnClass="purple"
          btnTxt="Ok"
          show={actionMdl.show === 'source'}
          close={() => setActionMdl({ show: false })}
          action={() => setActionMdl({ show: false })}
          title={__('Select Source', 'bit-integrations')}>
          <div className="btcd-hr mt-2" />
          <div className="mt-2">{__('Please select ticket source', 'bit-integrations')}</div>
          {isLoading ? (
            <Loader
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 100,
                transform: 'scale(0.7)'
              }}
            />
          ) : (
            <div className="flx">
              <select
                onChange={e => setAction(e.target.value, 'selected_ticket_source')}
                name="source"
                value={freshdeskConf.selected_ticket_source}
                className="btcd-paper-inp w-10 mt-2">
                <option value="">{__('Select ticket source', 'bit-integrations')}</option>
                {freshdeskConf?.sources &&
                  Object.keys(freshdeskConf?.sources)?.map((itm, key) => (
                    <option key={key} value={freshdeskConf?.sources[itm]}>
                      {itm}
                    </option>
                  ))}
              </select>
              <button
                onClick={() =>
                  getAllTicketFields(freshdeskConf, setFreshdeskConf, setIsLoading, setSnackbar)
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{
                  '--tooltip-txt': `'${__('Refresh Ticket Field & Sources', 'bit-integrations')}'`
                }}
                type="button"
                disabled={isLoading}>
                &#x21BB;
              </button>
            </div>
          )}
        </ConfirmModal>
      </div>
      {/* Ticket Groups */}
      <div className="pos-rel d-flx w-8l">
        <div className="d-flx flx-wrp">
          <TableCheckBox
            onChange={e => actionHandler(e, 'group')}
            checked={freshdeskConf?.actions?.group || false}
            className="wdt-200 mt-4 mr-2"
            value="group"
            title={__('Group', 'bit-integrations')}
            subTitle={__('Add Ticket Group', 'bit-integrations')}
          />
        </div>

        <ConfirmModal
          className="custom-conf-mdl"
          mainMdlCls="o-v"
          btnClass="purple"
          btnTxt="Ok"
          show={actionMdl.show === 'group'}
          close={() => setActionMdl({ show: false })}
          action={() => setActionMdl({ show: false })}
          title={__('Select group', 'bit-integrations')}>
          <div className="btcd-hr mt-2" />
          <div className="mt-2">{__('Please select ticket Group', 'bit-integrations')}</div>
          {isLoading ? (
            <Loader
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 100,
                transform: 'scale(0.7)'
              }}
            />
          ) : (
            <div className="flx">
              <select
                onChange={e => setAction(e.target.value, 'selected_ticket_group')}
                name="group"
                value={freshdeskConf.selected_ticket_group}
                className="btcd-paper-inp w-10 mt-2">
                <option value="">{__('Select ticket group', 'bit-integrations')}</option>
                {freshdeskConf?.groups &&
                  Object.keys(freshdeskConf?.groups)?.map((itm, key) => (
                    <option key={key} value={freshdeskConf?.groups[itm]}>
                      {itm}
                    </option>
                  ))}
              </select>
              <button
                onClick={() =>
                  getAllTicketFields(freshdeskConf, setFreshdeskConf, setIsLoading, setSnackbar)
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{
                  '--tooltip-txt': `'${__('Refresh Ticket Field & Groups', 'bit-integrations')}'`
                }}
                type="button"
                disabled={isLoading}>
                &#x21BB;
              </button>
            </div>
          )}
        </ConfirmModal>
      </div>
      {/* Ticket Products */}
      <div className="pos-rel d-flx w-8l">
        <div className="d-flx flx-wrp">
          <TableCheckBox
            onChange={e => actionHandler(e, 'product')}
            checked={freshdeskConf?.actions?.product || false}
            className="wdt-200 mt-4 mr-2"
            value="product"
            title={__('Product', 'bit-integrations')}
            subTitle={__('Add Product in Ticket', 'bit-integrations')}
          />
        </div>

        <ConfirmModal
          className="custom-conf-mdl"
          mainMdlCls="o-v"
          btnClass="purple"
          btnTxt="Ok"
          show={actionMdl.show === 'product'}
          close={() => setActionMdl({ show: false })}
          action={() => setActionMdl({ show: false })}
          title={__('Select Product', 'bit-integrations')}>
          <div className="btcd-hr mt-2" />
          <div className="mt-2">{__('Please select product', 'bit-integrations')}</div>
          {isLoading ? (
            <Loader
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 100,
                transform: 'scale(0.7)'
              }}
            />
          ) : (
            <div className="flx">
              <select
                onChange={e => setAction(e.target.value, 'selected_ticket_product')}
                name="product"
                value={freshdeskConf.selected_ticket_product}
                className="btcd-paper-inp w-10 mt-2">
                <option value="">{__('Select Product', 'bit-integrations')}</option>
                {freshdeskConf?.products &&
                  Object.keys(freshdeskConf?.products)?.map((itm, key) => (
                    <option key={key} value={freshdeskConf?.products[itm]}>
                      {itm}
                    </option>
                  ))}
              </select>
              <button
                onClick={() =>
                  getAllTicketFields(freshdeskConf, setFreshdeskConf, setIsLoading, setSnackbar)
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{
                  '--tooltip-txt': `'${__('Refresh Ticket Field & products', 'bit-integrations')}'`
                }}
                type="button"
                disabled={isLoading}>
                &#x21BB;
              </button>
            </div>
          )}
        </ConfirmModal>
      </div>
      {/* Ticket agent */}
      <div className="pos-rel d-flx w-8l">
        <div className="d-flx flx-wrp">
          <TableCheckBox
            onChange={e => actionHandler(e, 'agent')}
            checked={freshdeskConf?.actions?.agent || false}
            className="wdt-200 mt-4 mr-2"
            value="agent"
            title={__('Agent', 'bit-integrations')}
            subTitle={__('Add Agent in Ticket', 'bit-integrations')}
          />
        </div>

        <ConfirmModal
          className="custom-conf-mdl"
          mainMdlCls="o-v"
          btnClass="purple"
          btnTxt="Ok"
          show={actionMdl.show === 'agent'}
          close={() => setActionMdl({ show: false })}
          action={() => setActionMdl({ show: false })}
          title={__('Select Agent', 'bit-integrations')}>
          <div className="btcd-hr mt-2" />
          <div className="mt-2">{__('Please select agent', 'bit-integrations')}</div>
          {isLoading ? (
            <Loader
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 100,
                transform: 'scale(0.7)'
              }}
            />
          ) : (
            <div className="flx">
              <select
                onChange={e => setAction(e.target.value, 'selected_ticket_agent')}
                name="agent"
                value={freshdeskConf.selected_ticket_agent}
                className="btcd-paper-inp w-10 mt-2">
                <option value="">{__('Select Agent', 'bit-integrations')}</option>
                {freshdeskConf?.agents &&
                  Object.keys(freshdeskConf?.agents)?.map((itm, key) => (
                    <option key={key} value={freshdeskConf?.agents[itm]}>
                      {itm}
                    </option>
                  ))}
              </select>
              <button
                onClick={() =>
                  getAllTicketFields(freshdeskConf, setFreshdeskConf, setIsLoading, setSnackbar)
                }
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{
                  '--tooltip-txt': `'${__('Refresh Ticket Field & agents', 'bit-integrations')}'`
                }}
                type="button"
                disabled={isLoading}>
                &#x21BB;
              </button>
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
      {/* file */}
      <div className="pos-rel d-flx">
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

      <div className="pos-rel d-flx">
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
