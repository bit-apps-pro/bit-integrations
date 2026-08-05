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

export default function NextCrmActions({ nextCrmConf, setNextCrmConf }) {
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

  const renderModal = ({ type, title, options, valueName, isMulti = false, refresher }) => (
    <ConfirmModal
      className="custom-conf-mdl"
      mainMdlCls="o-v"
      btnClass="purple"
      btnTxt={__('Ok', 'bit-integrations')}
      show={actionMdl.show === type}
      close={clsActionMdl}
      action={clsActionMdl}
      title={title}>
      <div className="btcd-hr mt-2 mb-2" />
      <div className="mt-2">{title}</div>
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
            options={options}
            className="msl-wrp-options"
            defaultValue={nextCrmConf?.utilities?.[valueName] || undefined}
            onChange={val => setAction(isMulti ? (val ? val.split(',') : []) : val, valueName)}
            singleSelect={!isMulti}
            closeOnSelect={!isMulti}
          />
          {refresher && (
            <button
              onClick={() => refresher(setNextCrmConf, setIsLoading)}
              className="icn-btn sh-sm"
              type="button"
              aria-label={__('Refresh', 'bit-integrations')}>
              &#x21BB;
            </button>
          )}
        </div>
      )}
    </ConfirmModal>
  )

  return (
    <div className="pos-rel d-flx flx-wrp">
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
            checked={nextCrmConf?.utilities?.selected_lists?.length > 0}
            onChange={() => actionHandler('lists')}
            className="wdt-200 mt-4 mr-2"
            value="lists"
            title={__('Lists', 'bit-integrations')}
            subTitle={__('Assign the contact to lists', 'bit-integrations')}
          />
          <TableCheckBox
            checked={nextCrmConf?.utilities?.selected_tags?.length > 0}
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

      {renderModal({
        type: 'contact_type',
        title: __('Contact Type', 'bit-integrations'),
        options: toOptions(nextCrmConf?.allContactTypes),
        valueName: 'selected_contact_type',
        refresher: refreshNextCrmContactTypes
      })}

      {renderModal({
        type: 'status',
        title: __('Contact Status', 'bit-integrations'),
        options: toOptions(nextCrmConf?.allContactStatuses),
        valueName: 'selected_status',
        refresher: refreshNextCrmContactStatuses
      })}

      {renderModal({
        type: 'lists',
        title: __('Lists', 'bit-integrations'),
        options: toOptions(nextCrmConf?.allLists),
        valueName: 'selected_lists',
        isMulti: true,
        refresher: refreshNextCrmLists
      })}

      {renderModal({
        type: 'tags',
        title: __('Tags', 'bit-integrations'),
        options: toOptions(nextCrmConf?.allTags),
        valueName: 'selected_tags',
        isMulti: true,
        refresher: refreshNextCrmTags
      })}

      {renderModal({
        type: 'activity_status',
        title: __('Activity Status', 'bit-integrations'),
        options: activityStatusOptions,
        valueName: 'selected_activity_status'
      })}

      {renderModal({
        type: 'skip_already_sent',
        title: __('Skip If Already Sent', 'bit-integrations'),
        options: yesNoOptions,
        valueName: 'selected_skip_already_sent'
      })}
    </div>
  )
}
