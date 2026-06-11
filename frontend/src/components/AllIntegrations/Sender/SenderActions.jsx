/* eslint-disable no-param-reassign */

import { create } from 'mutative'
import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import { refreshSenderGroups } from './SenderCommonFunc'
import { subscriberActions } from './staticData'

export default function SenderActions({ senderConf, setSenderConf, isLoading, setIsLoading }) {
  const [actionMdl, setActionMdl] = useState({ show: false })

  const clsActionMdl = () => setActionMdl({ show: false })

  const actionHandler = (e, type) => {
    if (type === 'groups') {
      refreshSenderGroups(senderConf, setSenderConf, setIsLoading)
    }

    setActionMdl({ show: type })

    setSenderConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.actions = { ...(draftConf.actions || {}) }

        if (e.target.checked) {
          draftConf.actions[type] = true
        } else {
          delete draftConf.actions[type]
          if (type === 'groups') {
            draftConf.groups = []
          }
        }
      })
    )
  }

  const setGroups = val => {
    setSenderConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.actions = { ...(draftConf.actions || {}) }
        draftConf.groups = val

        if (val.length) {
          draftConf.actions.groups = true
        } else {
          delete draftConf.actions.groups
        }
      })
    )
  }

  const groupOptions = (senderConf?.allGroups ?? []).map(group => ({
    label: group.title,
    value: String(group.id)
  }))

  return (
    <>
      <div className="pos-rel d-flx w-8">
        {subscriberActions.includes(senderConf?.mainAction) && (
          <TableCheckBox
            checked={senderConf?.groups?.length || false}
            onChange={e => actionHandler(e, 'groups')}
            className="wdt-200 mt-4 mr-2"
            value="groups"
            title={__('Groups', 'bit-integrations')}
            subTitle={__('Add the subscriber to groups', 'bit-integrations')}
          />
        )}

        <TableCheckBox
          checked={senderConf?.actions?.trigger_automation || false}
          onChange={e => actionHandler(e, 'trigger_automation')}
          className="wdt-200 mt-4 mr-2"
          value="trigger_automation"
          title={__('Trigger Automation', 'bit-integrations')}
          subTitle={__('Trigger automations for the selected groups', 'bit-integrations')}
        />
      </div>

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'groups'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Groups', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />

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
              className="msl-wrp-options"
              defaultValue={senderConf?.groups}
              options={groupOptions}
              onChange={val => setGroups(val)}
              customValue
            />
            <button
              onClick={() => refreshSenderGroups(senderConf, setSenderConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Groups', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>
    </>
  )
}
