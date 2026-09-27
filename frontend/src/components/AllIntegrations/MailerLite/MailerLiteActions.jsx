/* eslint-disable max-len */
/* eslint-disable no-param-reassign */

import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { getAllGroups } from './MailerLiteCommonFunc'
import { create } from 'mutative'

export default function MailerLiteActions({ mailerLiteConf, setMailerLiteConf, loading, setLoading }) {
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })

  const actionHandler = (e, type) => {
    if (type === 'group') {
      getAllGroups(mailerLiteConf, setMailerLiteConf, loading, setLoading)
    }

    setActionMdl({ show: type })
    setMailerLiteConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.actions = { ...(draftConf.actions || {}) }

        if (e.target.checked) {
          draftConf.actions[type] = true
        } else {
          delete draftConf.actions[type]
        }
      })
    )
  }

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setChanges = (val, type) => {
    const newConf = { ...mailerLiteConf }
    if (type === 'group_ids' && val.length) {
      newConf.actions.group = true
    } else if (type === 'group_ids' && val.length < 1) {
      delete newConf.actions.group
    }
    if (type === 'mailer_lite_type' && val.length) {
      newConf.actions.mailer_lite_type = true
    } else if (type === 'mailer_lite_type' && val.length < 1) {
      delete newConf.actions.mailer_lite_type
    }
    newConf[type] = val
    setMailerLiteConf({ ...newConf })
  }

  const mailerLiteTypes = [
    {
      label: __('Active', 'bit-integrations'),
      value: 'active'
    },
    {
      label: __('Unsubscribed', 'bit-integrations'),
      value: 'unsubscribed'
    },

    {
      label: __('Bounced', 'bit-integrations'),
      value: 'bounced'
    },
    {
      label: __('Spam Complaints', 'bit-integrations'),
      value: 'junk'
    },
    {
      label: __('Unconfirmed', 'bit-integrations'),
      value: 'unconfirmed'
    }
  ]

  return (
    <>
      <div className="pos-rel d-flx w-8">
        <TableCheckBox
          checked={mailerLiteConf?.group_ids.length || false}
          onChange={e => actionHandler(e, 'group')}
          className="wdt-200 mt-4 mr-2"
          value="group"
          title={__('Groups', 'bit-integrations')}
          subTitle={__('Add Groups', 'bit-integrations')}
        />
        <TableCheckBox
          checked={mailerLiteConf?.mailer_lite_type || false}
          onChange={e => actionHandler(e, 'mailer_lite_type')}
          className="wdt-200 mt-4 mr-2"
          value="type"
          title={__('Type', 'bit-integrations')}
          subTitle={__('Add Type', 'bit-integrations')}
        />
        <TableCheckBox
          checked={mailerLiteConf.actions?.double_opt_in || false}
          onChange={e => actionHandler(e, 'double_opt_in')}
          className="wdt-200 mt-4 mr-2"
          value="double_opt_in"
          title={__('Double Opt-in', 'bit-integrations')}
          subTitle={__('Add Double Opt-in', 'bit-integrations')}
        />
        <TableCheckBox
          checked={mailerLiteConf.actions?.update || false}
          onChange={e => actionHandler(e, 'update')}
          className="wdt-200 mt-4 mr-2"
          value="user_share"
          title={__('Update subscriber', 'bit-integrations')}
          subTitle={__('Update Responses with MailerLite exist Subscriber?', 'bit-integrations')}
        />
      </div>
      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'group'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Groups', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />

        {loading.group ? (
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
              className="msl-wrp-options"
              defaultValue={mailerLiteConf?.group_ids}
              options={mailerLiteConf?.groups?.map(group => ({
                label: group.name,
                value: group.group_id
              }))}
              onChange={val => setChanges(val, 'group_ids')}
              customValue
            />
            <button
              onClick={() => getAllGroups(mailerLiteConf, setMailerLiteConf, loading, setLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `${__('Refresh Groups', 'bit-integrations')}'` }}
              type="button"
              disabled={loading.group}>
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
        show={actionMdl.show === 'mailer_lite_type'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Type', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />

        <div className="flx flx-between mt-2">
          <MultiSelect
            className="msl-wrp-options"
            defaultValue={mailerLiteConf?.mailer_lite_type}
            options={mailerLiteTypes.map(type => ({ label: type.label, value: type.value }))}
            onChange={val => setChanges(val, 'mailer_lite_type')}
            customValue
            singleSelect
          />
        </div>
      </ConfirmModal>
    </>
  )
}
