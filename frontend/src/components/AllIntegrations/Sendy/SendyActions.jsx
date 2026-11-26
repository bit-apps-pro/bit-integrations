import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import timeZoneList from '../GoogleCalendar/timeZoneList.json'
import { trackingOptions } from './staticData'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const checkboxUtilities = {
  add_subscriber: [
    {
      key: 'selected_gdpr',
      value: 'true',
      title: __('GDPR Consent', 'bit-integrations'),
      subTitle: __('Mark the signup as GDPR compliant', 'bit-integrations')
    },
    {
      key: 'selected_silent',
      value: 'true',
      title: __('Skip Double Opt-in', 'bit-integrations'),
      subTitle: __('Add the subscriber as single opt-in', 'bit-integrations')
    }
  ],
  create_campaign: [
    {
      key: 'selected_send_campaign',
      value: '1',
      title: __('Send Campaign', 'bit-integrations'),
      subTitle: __('Send or schedule the campaign. If off, Sendy saves a draft.', 'bit-integrations')
    }
  ]
}

const selectUtilities = {
  create_campaign: [
    {
      key: 'selected_track_opens',
      title: __('Track Opens', 'bit-integrations'),
      subTitle: __('Set how Sendy tracks email opens', 'bit-integrations'),
      options: trackingOptions
    },
    {
      key: 'selected_track_clicks',
      title: __('Track Clicks', 'bit-integrations'),
      subTitle: __('Set how Sendy tracks link clicks', 'bit-integrations'),
      options: trackingOptions
    },
    {
      key: 'selected_exclude_list_ids',
      title: __('Exclude Lists', 'bit-integrations'),
      subTitle: __('Do not send the campaign to these lists', 'bit-integrations'),
      listOptions: true,
      multiple: true
    },
    {
      key: 'selected_schedule_timezone',
      title: __('Schedule Time Zone', 'bit-integrations'),
      subTitle: __('Use this time zone for the schedule date and time', 'bit-integrations'),
      options: timeZoneList
    }
  ]
}

export default function SendyActions({ action, sendyConf, setSendyConf }) {
  const [actionMdl, setActionMdl] = useState({ show: false })

  const closeModal = () => setActionMdl({ show: false })

  const setUtility = (name, value) =>
    setSendyConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) draftConf.utilities = {}
        draftConf.utilities[name] = value
      })
    )

  const clearUtility = name =>
    setSendyConf(prevConf =>
      create(prevConf, draftConf => {
        if (draftConf.utilities) delete draftConf.utilities[name]
      })
    )

  const isSet = name => {
    const value = sendyConf?.utilities?.[name]
    return Array.isArray(value) ? value.length > 0 : !!value
  }

  const toggleCheckbox = ({ key, value }) => (isSet(key) ? clearUtility(key) : setUtility(key, value))

  const toggleSelect = ({ key }) => (isSet(key) ? clearUtility(key) : setActionMdl({ show: key }))

  const listOptions = (sendyConf?.default?.lists || []).map(({ listId, listName }) => ({
    label: listName,
    value: String(listId)
  }))

  const selectValue = ({ key, multiple }) => {
    const value = sendyConf?.utilities?.[key]
    if (multiple) return value?.join(',') || undefined
    return value || undefined
  }

  const handleSelect = ({ key, multiple }, value) => {
    if (!value) {
      clearUtility(key)
      return
    }
    setUtility(key, multiple ? value.split(',').filter(Boolean) : value)
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      {(checkboxUtilities[action] || []).map(utility => (
        <TableCheckBox
          key={utility.key}
          checked={isSet(utility.key)}
          onChange={() => toggleCheckbox(utility)}
          className="wdt-200 mt-4 mr-2"
          value={utility.key}
          title={utility.title}
          subTitle={utility.subTitle}
        />
      ))}

      {(selectUtilities[action] || []).map(utility => (
        <TableCheckBox
          key={utility.key}
          checked={isSet(utility.key)}
          onChange={() => toggleSelect(utility)}
          className="wdt-200 mt-4 mr-2"
          value={utility.key}
          title={utility.title}
          subTitle={utility.subTitle}
        />
      ))}

      {(selectUtilities[action] || []).map(utility => (
        <ConfirmModal
          key={`${utility.key}-modal`}
          className="custom-conf-mdl"
          mainMdlCls="o-v"
          btnClass="purple"
          btnTxt={__('Ok', 'bit-integrations')}
          show={actionMdl.show === utility.key}
          close={closeModal}
          action={closeModal}
          title={utility.title}>
          <div className="btcd-hr mt-2 mb-2" />
          <div className="mt-2">{utility.subTitle}</div>
          <div className="flx flx-between mt-2">
            <MultiSelect
              options={utility.listOptions ? listOptions : utility.options}
              className="msl-wrp-options"
              defaultValue={selectValue(utility)}
              onChange={value => handleSelect(utility, value)}
              {...(utility.multiple ? {} : { singleSelect: true, closeOnSelect: true })}
            />
          </div>
        </ConfirmModal>
      ))}
    </div>
  )
}
