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
  refreshCharitableCampaignCategories,
  refreshCharitableCampaignTags,
  refreshCharitableDonationStatuses,
  refreshCharitableDonors,
  refreshCharitableUserRoles,
  refreshCharitableUsers
} from './CharitableCommonFunc'
import { campaignStatusOptions, yesNoOptions } from './staticData'

export default function CharitableActions({ charitableConf, setCharitableConf }) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false })

  const actionHandler = (e, type) => {
    setActionMdl({ show: type })

    if (type === 'donation_status') {
      refreshCharitableDonationStatuses(setCharitableConf, setIsLoading)
    }
    if (type === 'donor') {
      refreshCharitableDonors(setCharitableConf, setIsLoading)
    }
    if (type === 'user' || type === 'creator') {
      refreshCharitableUsers(setCharitableConf, setIsLoading)
    }
    if (type === 'categories') {
      refreshCharitableCampaignCategories(setCharitableConf, setIsLoading)
    }
    if (type === 'tags') {
      refreshCharitableCampaignTags(setCharitableConf, setIsLoading)
    }
    if (type === 'role') {
      refreshCharitableUserRoles(setCharitableConf, setIsLoading)
    }
  }

  const clsActionMdl = () => setActionMdl({ show: false })

  const setAction = (val, name) => {
    setCharitableConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = val
      })
    )
  }

  const renderActionModal = (type, title, options, valueName, multiple = false, refresh = null) => (
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
            singleSelect={!multiple}
            closeOnSelect={!multiple}
            defaultValue={charitableConf?.utilities?.[valueName] || undefined}
            onChange={val => setAction(val, valueName)}
          />
          {refresh && (
            <button
              onClick={() => refresh(setCharitableConf, setIsLoading)}
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
  )

  const donationStatusOptions = (charitableConf?.allDonationStatuses || []).map(status => ({
    label: status.label,
    value: status.value
  }))

  const donorOptions = (charitableConf?.allDonors || []).map(donor => ({
    label: `${donor.donor_name} (${donor.email})`,
    value: donor.donor_id?.toString()
  }))

  const userOptions = (charitableConf?.allUsers || []).map(user => ({
    label: user.label,
    value: user.value?.toString()
  }))

  const categoryOptions = (charitableConf?.allCampaignCategories || []).map(category => ({
    label: category.label,
    value: category.value?.toString()
  }))

  const tagOptions = (charitableConf?.allCampaignTags || []).map(tag => ({
    label: tag.label,
    value: tag.value?.toString()
  }))

  const roleOptions = (charitableConf?.allUserRoles || []).map(role => ({
    label: role.label,
    value: role.value
  }))

  const { mainAction } = charitableConf

  return (
    <div className="pos-rel d-flx flx-wrp">
      {mainAction === 'create_donation' && (
        <>
          <TableCheckBox
            checked={charitableConf?.utilities?.selected_donation_status || false}
            onChange={e => actionHandler(e, 'donation_status')}
            className="wdt-200 mt-4 mr-2"
            value="donation_status"
            title={__('Donation Status', 'bit-integrations')}
            subTitle={__('Defaults to Paid', 'bit-integrations')}
          />
          <TableCheckBox
            checked={charitableConf?.utilities?.selected_donor || false}
            onChange={e => actionHandler(e, 'donor')}
            className="wdt-200 mt-4 mr-2"
            value="donor"
            title={__('Donor', 'bit-integrations')}
            subTitle={__('Attach an existing donor', 'bit-integrations')}
          />
          <TableCheckBox
            checked={charitableConf?.utilities?.selected_user || false}
            onChange={e => actionHandler(e, 'user')}
            className="wdt-200 mt-4 mr-2"
            value="user"
            title={__('WordPress User', 'bit-integrations')}
            subTitle={__('Attach an existing user', 'bit-integrations')}
          />
          {renderActionModal(
            'donation_status',
            __('Donation Status', 'bit-integrations'),
            donationStatusOptions,
            'selected_donation_status',
            false,
            refreshCharitableDonationStatuses
          )}
          {renderActionModal(
            'donor',
            __('Donor', 'bit-integrations'),
            donorOptions,
            'selected_donor',
            false,
            refreshCharitableDonors
          )}
          {renderActionModal(
            'user',
            __('WordPress User', 'bit-integrations'),
            userOptions,
            'selected_user',
            false,
            refreshCharitableUsers
          )}
        </>
      )}

      {['create_campaign', 'update_campaign'].includes(mainAction) && (
        <>
          <TableCheckBox
            checked={charitableConf?.utilities?.selected_campaign_status || false}
            onChange={e => actionHandler(e, 'campaign_status')}
            className="wdt-200 mt-4 mr-2"
            value="campaign_status"
            title={__('Campaign Status', 'bit-integrations')}
            subTitle={__('Defaults to Published', 'bit-integrations')}
          />
          <TableCheckBox
            checked={charitableConf?.utilities?.selected_creator || false}
            onChange={e => actionHandler(e, 'creator')}
            className="wdt-200 mt-4 mr-2"
            value="creator"
            title={__('Campaign Creator', 'bit-integrations')}
            subTitle={__('The user who owns the campaign', 'bit-integrations')}
          />
          <TableCheckBox
            checked={charitableConf?.utilities?.selected_categories || false}
            onChange={e => actionHandler(e, 'categories')}
            className="wdt-200 mt-4 mr-2"
            value="categories"
            title={__('Categories', 'bit-integrations')}
            subTitle={__('Assign campaign categories', 'bit-integrations')}
          />
          <TableCheckBox
            checked={charitableConf?.utilities?.selected_tags || false}
            onChange={e => actionHandler(e, 'tags')}
            className="wdt-200 mt-4 mr-2"
            value="tags"
            title={__('Tags', 'bit-integrations')}
            subTitle={__('Assign campaign tags', 'bit-integrations')}
          />
          <TableCheckBox
            checked={charitableConf?.utilities?.selected_allow_custom_donations || false}
            onChange={e => actionHandler(e, 'allow_custom_donations')}
            className="wdt-200 mt-4 mr-2"
            value="allow_custom_donations"
            title={__('Allow Custom Donations', 'bit-integrations')}
            subTitle={__('Let donors enter their own amount', 'bit-integrations')}
          />
          {renderActionModal(
            'campaign_status',
            __('Campaign Status', 'bit-integrations'),
            campaignStatusOptions,
            'selected_campaign_status'
          )}
          {renderActionModal(
            'creator',
            __('Campaign Creator', 'bit-integrations'),
            userOptions,
            'selected_creator',
            false,
            refreshCharitableUsers
          )}
          {renderActionModal(
            'categories',
            __('Categories', 'bit-integrations'),
            categoryOptions,
            'selected_categories',
            true,
            refreshCharitableCampaignCategories
          )}
          {renderActionModal(
            'tags',
            __('Tags', 'bit-integrations'),
            tagOptions,
            'selected_tags',
            true,
            refreshCharitableCampaignTags
          )}
          {renderActionModal(
            'allow_custom_donations',
            __('Allow Custom Donations', 'bit-integrations'),
            yesNoOptions,
            'selected_allow_custom_donations'
          )}
        </>
      )}

      {['delete_donation', 'delete_campaign'].includes(mainAction) && (
        <>
          <TableCheckBox
            checked={charitableConf?.utilities?.selected_force_delete || false}
            onChange={e => actionHandler(e, 'force_delete')}
            className="wdt-200 mt-4 mr-2"
            value="force_delete"
            title={__('Delete Permanently', 'bit-integrations')}
            subTitle={__('Skip the trash', 'bit-integrations')}
          />
          {renderActionModal(
            'force_delete',
            __('Delete Permanently', 'bit-integrations'),
            yesNoOptions,
            'selected_force_delete'
          )}
        </>
      )}

      {['create_donor', 'update_donor'].includes(mainAction) && (
        <>
          <TableCheckBox
            checked={charitableConf?.utilities?.selected_user || false}
            onChange={e => actionHandler(e, 'user')}
            className="wdt-200 mt-4 mr-2"
            value="user"
            title={__('WordPress User', 'bit-integrations')}
            subTitle={__('Link the donor to a user', 'bit-integrations')}
          />
          {renderActionModal(
            'user',
            __('WordPress User', 'bit-integrations'),
            userOptions,
            'selected_user',
            false,
            refreshCharitableUsers
          )}
        </>
      )}

      {mainAction === 'update_donor' && (
        <>
          <TableCheckBox
            checked={charitableConf?.utilities?.selected_contact_consent || false}
            onChange={e => actionHandler(e, 'contact_consent')}
            className="wdt-200 mt-4 mr-2"
            value="contact_consent"
            title={__('Contact Consent', 'bit-integrations')}
            subTitle={__('Set the consent flag', 'bit-integrations')}
          />
          {renderActionModal(
            'contact_consent',
            __('Contact Consent', 'bit-integrations'),
            yesNoOptions,
            'selected_contact_consent'
          )}
        </>
      )}

      {['create_user_profile', 'update_user_profile'].includes(mainAction) && (
        <>
          <TableCheckBox
            checked={charitableConf?.utilities?.selected_role || false}
            onChange={e => actionHandler(e, 'role')}
            className="wdt-200 mt-4 mr-2"
            value="role"
            title={__('User Role', 'bit-integrations')}
            subTitle={__('Set the WordPress role', 'bit-integrations')}
          />
          {renderActionModal(
            'role',
            __('User Role', 'bit-integrations'),
            roleOptions,
            'selected_role',
            false,
            refreshCharitableUserRoles
          )}
        </>
      )}

      {mainAction === 'mark_user_verified' && (
        <>
          <TableCheckBox
            checked={charitableConf?.utilities?.selected_verified || false}
            onChange={e => actionHandler(e, 'verified')}
            className="wdt-200 mt-4 mr-2"
            value="verified"
            title={__('Verified', 'bit-integrations')}
            subTitle={__('Turn the verified flag on or off', 'bit-integrations')}
          />
          {renderActionModal(
            'verified',
            __('Verified', 'bit-integrations'),
            yesNoOptions,
            'selected_verified'
          )}
        </>
      )}
    </div>
  )
}
