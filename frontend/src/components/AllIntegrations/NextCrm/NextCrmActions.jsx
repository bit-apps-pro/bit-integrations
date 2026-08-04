/* eslint-disable no-param-reassign */

import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import {
  refreshNextCrmContactStatuses,
  refreshNextCrmContactTypes,
  refreshNextCrmLists,
  refreshNextCrmTags
} from './NextCrmCommonFunc'
import { activityStatusOptions, yesNoOptions } from './staticData'

export default function NextCrmActions({ nextCrmConf, setNextCrmConf, setSnackbar }) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false })
  const action = nextCrmConf?.mainAction
  const isContactSave = ['create_contact', 'update_contact', 'create_or_update_contact'].includes(action)

  const actionHandler = type => {
    setActionMdl({ show: type })

    if (type === 'contact_type') refreshNextCrmContactTypes(setNextCrmConf, setIsLoading)
    if (type === 'status') refreshNextCrmContactStatuses(setNextCrmConf, setIsLoading)
    if (type === 'lists') refreshNextCrmLists(setNextCrmConf, setIsLoading)
    if (type === 'tags') refreshNextCrmTags(setNextCrmConf, setIsLoading)
  }

  const clsActionMdl = () => setActionMdl({ show: false })

  const setAction = (val, name) =>
    setNextCrmConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = val
      })
    )

  const toOptions = list => (list ?? []).map(item => ({ label: item.label, value: String(item.value) }))

  return (
    <>
      <br />
      <div className="mt-4">
        <b className="wdt-100 d-in-b">{__('Utilities', 'bit-integrations')}</b>
      </div>
      <div className="btcd-hr mt-1" />

      {isContactSave && (
        <>
          <TableCheckBox
            checked={nextCrmConf?.utilities?.selected_contact_type || false}
            onChange={() => actionHandler('contact_type')}
            className="wdt-200 mt-4 mr-2"
            value="contact_type"
            title={__('Contact Type', 'bit-integrations')}
            subTitle={__('Set the contact type', 'bit-integrations')}
          />
          <TableCheckBox
            checked={nextCrmConf?.utilities?.selected_status || false}
            onChange={() => actionHandler('status')}
            className="wdt-200 mt-4 mr-2"
            value="status"
            title={__('Contact Status', 'bit-integrations')}
            subTitle={__('Set the contact status', 'bit-integrations')}
          />
          <TableCheckBox
            checked={nextCrmConf?.utilities?.selected_lists || false}
            onChange={() => actionHandler('lists')}
            className="wdt-200 mt-4 mr-2"
            value="lists"
            title={__('Lists', 'bit-integrations')}
            subTitle={__('Assign the contact to lists', 'bit-integrations')}
          />
          <TableCheckBox
            checked={nextCrmConf?.utilities?.selected_tags || false}
            onChange={() => actionHandler('tags')}
            className="wdt-200 mt-4 mr-2"
            value="tags"
            title={__('Tags', 'bit-integrations')}
            subTitle={__('Assign tags to the contact', 'bit-integrations')}
          />
        </>
      )}

      {action === 'add_contact_activity' && (
        <TableCheckBox
          checked={nextCrmConf?.utilities?.selected_activity_status || false}
          onChange={() => actionHandler('activity_status')}
          className="wdt-200 mt-4 mr-2"
          value="activity_status"
          title={__('Activity Status', 'bit-integrations')}
          subTitle={__('Set the activity status', 'bit-integrations')}
        />
      )}

      {action === 'send_campaign_email' && (
        <TableCheckBox
          checked={nextCrmConf?.utilities?.selected_skip_already_sent || false}
          onChange={() => actionHandler('skip_already_sent')}
          className="wdt-200 mt-4 mr-2"
          value="skip_already_sent"
          title={__('Skip If Already Sent', 'bit-integrations')}
          subTitle={__('Do not queue a contact twice', 'bit-integrations')}
        />
      )}

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-h"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'contact_type'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Contact Type', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <MultiSelect
          options={toOptions(nextCrmConf?.allContactTypes)}
          className="msl-wrp-options"
          defaultValue={nextCrmConf?.utilities?.selected_contact_type}
          onChange={val => setAction(val, 'selected_contact_type')}
          singleSelect
          closeOnSelect
        />
        {isLoading && (
          <Loader className="pos-abs" style={{ background: '#fff', width: '100%', height: '100%' }} />
        )}
      </ConfirmModal>

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-h"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'status'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Contact Status', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <MultiSelect
          options={toOptions(nextCrmConf?.allContactStatuses)}
          className="msl-wrp-options"
          defaultValue={nextCrmConf?.utilities?.selected_status}
          onChange={val => setAction(val, 'selected_status')}
          singleSelect
          closeOnSelect
        />
        {isLoading && (
          <Loader className="pos-abs" style={{ background: '#fff', width: '100%', height: '100%' }} />
        )}
      </ConfirmModal>

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-h"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'lists'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Lists', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <MultiSelect
          options={toOptions(nextCrmConf?.allLists)}
          className="msl-wrp-options"
          defaultValue={nextCrmConf?.utilities?.selected_lists}
          onChange={val => setAction(val.split(','), 'selected_lists')}
        />
        {isLoading && (
          <Loader className="pos-abs" style={{ background: '#fff', width: '100%', height: '100%' }} />
        )}
      </ConfirmModal>

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-h"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'tags'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Tags', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <MultiSelect
          options={toOptions(nextCrmConf?.allTags)}
          className="msl-wrp-options"
          defaultValue={nextCrmConf?.utilities?.selected_tags}
          onChange={val => setAction(val.split(','), 'selected_tags')}
        />
        {isLoading && (
          <Loader className="pos-abs" style={{ background: '#fff', width: '100%', height: '100%' }} />
        )}
      </ConfirmModal>

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-h"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'activity_status'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Activity Status', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <MultiSelect
          options={activityStatusOptions}
          className="msl-wrp-options"
          defaultValue={nextCrmConf?.utilities?.selected_activity_status}
          onChange={val => setAction(val, 'selected_activity_status')}
          singleSelect
          closeOnSelect
        />
      </ConfirmModal>

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-h"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'skip_already_sent'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Skip If Already Sent', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <MultiSelect
          options={yesNoOptions}
          className="msl-wrp-options"
          defaultValue={nextCrmConf?.utilities?.selected_skip_already_sent}
          onChange={val => setAction(val, 'selected_skip_already_sent')}
          singleSelect
          closeOnSelect
        />
      </ConfirmModal>
    </>
  )
}
