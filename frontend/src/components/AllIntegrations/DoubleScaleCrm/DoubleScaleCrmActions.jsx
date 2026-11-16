import { useState } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import {
  refreshDoubleScaleCrmLists,
  refreshDoubleScaleCrmMailboxes,
  refreshDoubleScaleCrmTags,
  refreshDoubleScaleCrmUsers
} from './DoubleScaleCrmCommonFunc'
import {
  emailStatusOptions,
  paymentModeOptions,
  ticketPriorityOptions,
  ticketStatusOptions,
  utilitiesByAction
} from './staticData'

const toOptions = items =>
  (items || []).map(item => ({ label: item.label, value: item.value?.toString() }))

export default function DoubleScaleCrmActions({ doubleScaleCrmConf, setDoubleScaleCrmConf }) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false })

  const { mainAction } = doubleScaleCrmConf
  const isNote = mainAction === 'add_ticket_note'

  const utilities = {
    email_status: {
      title: __('Email Status', 'bit-integrations'),
      subTitle: __('Set the email subscription status', 'bit-integrations'),
      options: emailStatusOptions
    },
    owner_id: {
      title: __('Owner', 'bit-integrations'),
      subTitle: __('Assign the contact to a user', 'bit-integrations'),
      options: toOptions(doubleScaleCrmConf?.allUsers),
      refresh: refreshDoubleScaleCrmUsers
    },
    tag_ids: {
      title: __('Tags', 'bit-integrations'),
      subTitle: __('Add tags to the contact', 'bit-integrations'),
      options: toOptions(doubleScaleCrmConf?.allTags),
      refresh: refreshDoubleScaleCrmTags,
      multiple: true
    },
    list_ids: {
      title: __('Lists', 'bit-integrations'),
      subTitle: __('Add the contact to lists', 'bit-integrations'),
      options: toOptions(doubleScaleCrmConf?.allLists),
      refresh: refreshDoubleScaleCrmLists,
      multiple: true
    },
    priority: {
      title: __('Priority', 'bit-integrations'),
      subTitle: __('Set the ticket priority', 'bit-integrations'),
      options: ticketPriorityOptions
    },
    status: {
      title: __('Status', 'bit-integrations'),
      subTitle: __('Set the ticket status', 'bit-integrations'),
      options: ticketStatusOptions
    },
    agent_user_id: {
      title: __('Agent', 'bit-integrations'),
      subTitle: __('Assign the ticket to an agent', 'bit-integrations'),
      options: toOptions(doubleScaleCrmConf?.allUsers),
      refresh: refreshDoubleScaleCrmUsers
    },
    mailbox_id: {
      title: __('Mailbox', 'bit-integrations'),
      subTitle: __('Use this mailbox instead of the default one', 'bit-integrations'),
      options: toOptions(doubleScaleCrmConf?.allMailboxes),
      refresh: refreshDoubleScaleCrmMailboxes
    },
    author_user_id: {
      title: isNote ? __('Author', 'bit-integrations') : __('Reply As', 'bit-integrations'),
      subTitle: isNote
        ? __('Add the note as this agent', 'bit-integrations')
        : __('Send the reply as this agent', 'bit-integrations'),
      options: toOptions(doubleScaleCrmConf?.allUsers),
      refresh: refreshDoubleScaleCrmUsers
    },
    sale_agent_user_id: {
      title: __('Sales Agent', 'bit-integrations'),
      subTitle: __('Assign the invoice to a sales agent', 'bit-integrations'),
      options: toOptions(doubleScaleCrmConf?.allUsers),
      refresh: refreshDoubleScaleCrmUsers
    },
    assigned_user_id: {
      title: __('Assigned User', 'bit-integrations'),
      subTitle: __('Assign the proposal to a user', 'bit-integrations'),
      options: toOptions(doubleScaleCrmConf?.allUsers),
      refresh: refreshDoubleScaleCrmUsers
    },
    payment_mode: {
      title: __('Payment Mode', 'bit-integrations'),
      subTitle: __('Set how the payment was made', 'bit-integrations'),
      options: paymentModeOptions
    }
  }

  const openModal = key => {
    setActionMdl({ show: key })

    if (utilities[key]?.refresh) {
      utilities[key].refresh(setDoubleScaleCrmConf, setIsLoading)
    }
  }

  const closeModal = () => setActionMdl({ show: false })

  const setUtility = (key, value) => {
    setDoubleScaleCrmConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[`selected_${key}`] = value
      })
    )
  }

  return (
    <div className="pos-rel d-flx flx-wrp">
      {(utilitiesByAction[mainAction] || []).map(key => {
        const utility = utilities[key]
        const selectedKey = `selected_${key}`

        return (
          <div key={key}>
            <TableCheckBox
              checked={!!doubleScaleCrmConf?.utilities?.[selectedKey]}
              onChange={() => openModal(key)}
              className="wdt-200 mt-4 mr-2"
              value={key}
              title={utility.title}
              subTitle={utility.subTitle}
            />
            <ConfirmModal
              className="custom-conf-mdl"
              mainMdlCls="o-v"
              btnClass="purple"
              btnTxt={__('Ok', 'bit-integrations')}
              show={actionMdl.show === key}
              close={closeModal}
              action={closeModal}
              title={utility.title}>
              <div className="btcd-hr mt-2 mb-2" />
              <div className="mt-2">{utility.title}</div>
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
                    key={`${key}-${utility.options.length}`}
                    options={utility.options}
                    className="msl-wrp-options"
                    singleSelect={!utility.multiple}
                    closeOnSelect={!utility.multiple}
                    defaultValue={doubleScaleCrmConf?.utilities?.[selectedKey] || undefined}
                    onChange={value => setUtility(key, value)}
                  />
                  {utility.refresh && (
                    <button
                      onClick={() => utility.refresh(setDoubleScaleCrmConf, setIsLoading)}
                      className="icn-btn sh-sm ml-2 tooltip"
                      style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
                      type="button"
                      disabled={isLoading}>
                      &#x21BB;
                    </button>
                  )}
                </div>
              )}
            </ConfirmModal>
          </div>
        )
      })}
    </div>
  )
}
