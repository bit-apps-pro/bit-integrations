/* eslint-disable no-param-reassign */

import { create } from 'mutative'
import { useState } from 'react'
import toast from 'react-hot-toast'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import {
  refreshDirectoristCategories,
  refreshDirectoristDirectories,
  refreshDirectoristListingStatuses,
  refreshDirectoristLocations,
  refreshDirectoristTags,
  refreshDirectoristUsers
} from './DirectoristCommonFunc'
import { yesNoOptions } from './staticData'

export default function DirectoristActions({ directoristConf, setDirectoristConf }) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false })

  const { mainAction } = directoristConf

  const listingActions = ['create_listing', 'update_listing', 'assign_listing_terms']
  const termActions = ['create_category', 'create_location', 'create_tag']
  const deleteActions = ['delete_listing', 'delete_review']
  const expiryActions = ['create_listing', 'update_listing', 'set_listing_expiry']

  const actionHandler = type => {
    setActionMdl({ show: type })

    if (type === 'categories') refreshDirectoristCategories(setDirectoristConf, setIsLoading)
    if (type === 'locations') refreshDirectoristLocations(setDirectoristConf, setIsLoading)
    if (type === 'tags') refreshDirectoristTags(setDirectoristConf, setIsLoading)
    if (type === 'author' || type === 'parent') {
      if (type === 'author') refreshDirectoristUsers(setDirectoristConf, setIsLoading)
      else if (mainAction === 'create_category')
        refreshDirectoristCategories(setDirectoristConf, setIsLoading)
      else if (mainAction === 'create_location')
        refreshDirectoristLocations(setDirectoristConf, setIsLoading)
      else refreshDirectoristTags(setDirectoristConf, setIsLoading)
    }
    if (type === 'directories') refreshDirectoristDirectories(setDirectoristConf, setIsLoading)
    if (type === 'status') refreshDirectoristListingStatuses(setDirectoristConf, setIsLoading)
  }

  const clsActionMdl = () => setActionMdl({ show: false })

  const setAction = (val, name) => {
    setDirectoristConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = val
      })
    )
  }

  const clearAction = name => {
    setDirectoristConf(prevConf =>
      create(prevConf, draftConf => {
        if (draftConf.utilities) {
          delete draftConf.utilities[name]
        }
      })
    )
    toast.success(__('Option removed', 'bit-integrations'))
  }

  const optionsOf = list => (list ?? []).map(item => ({ label: item.label, value: String(item.value) }))

  const renderActionModal = (type, title, options, valueName, singleSelect = true) => (
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
        <Loader style={{ height: 30, width: 30 }} />
      ) : (
        <MultiSelect
          className="msl-wrp-options btcd-paper-drpdwn w-100 mt-2"
          defaultValue={directoristConf?.utilities?.[valueName] ?? null}
          options={options}
          onChange={val => setAction(val, valueName)}
          singleSelect={singleSelect}
          closeOnSelect={singleSelect}
        />
      )}
    </ConfirmModal>
  )

  const utilityCheckbox = (type, valueName, title, subTitle) => (
    <TableCheckBox
      checked={Boolean(directoristConf?.utilities?.[valueName])}
      onChange={e => (e.target.checked ? actionHandler(type) : clearAction(valueName))}
      className="wdt-200 mt-4 mr-2"
      value={type}
      title={title}
      subTitle={subTitle}
    />
  )

  return (
    <div className="flx flx-wrp">
      {listingActions.includes(mainAction) && (
        <>
          {utilityCheckbox(
            'categories',
            'selected_categories',
            __('Categories', 'bit-integrations'),
            __('Attach categories to the listing', 'bit-integrations')
          )}
          {utilityCheckbox(
            'locations',
            'selected_locations',
            __('Locations', 'bit-integrations'),
            __('Attach locations to the listing', 'bit-integrations')
          )}
          {utilityCheckbox(
            'tags',
            'selected_tags',
            __('Tags', 'bit-integrations'),
            __('Attach tags to the listing', 'bit-integrations')
          )}
          {renderActionModal(
            'categories',
            __('Categories', 'bit-integrations'),
            optionsOf(directoristConf?.allCategories),
            'selected_categories',
            false
          )}
          {renderActionModal(
            'locations',
            __('Locations', 'bit-integrations'),
            optionsOf(directoristConf?.allLocations),
            'selected_locations',
            false
          )}
          {renderActionModal(
            'tags',
            __('Tags', 'bit-integrations'),
            optionsOf(directoristConf?.allTags),
            'selected_tags',
            false
          )}
        </>
      )}

      {['create_listing', 'update_listing'].includes(mainAction) && (
        <>
          {utilityCheckbox(
            'author',
            'selected_author',
            __('Listing Owner', 'bit-integrations'),
            __('Set the user who owns the listing', 'bit-integrations')
          )}
          {utilityCheckbox(
            'status',
            'selected_status',
            __('Listing Status', 'bit-integrations'),
            __('Set the status of the listing', 'bit-integrations')
          )}
          {renderActionModal(
            'author',
            __('Listing Owner', 'bit-integrations'),
            optionsOf(directoristConf?.allUsers),
            'selected_author'
          )}
          {renderActionModal(
            'status',
            __('Listing Status', 'bit-integrations'),
            optionsOf(directoristConf?.allListingStatuses),
            'selected_status'
          )}
        </>
      )}

      {expiryActions.includes(mainAction) &&
        utilityCheckbox(
          'never_expire',
          'selected_never_expire',
          __('Never Expire', 'bit-integrations'),
          __('Keep the listing from expiring', 'bit-integrations')
        )}
      {expiryActions.includes(mainAction) &&
        renderActionModal(
          'never_expire',
          __('Never Expire', 'bit-integrations'),
          yesNoOptions,
          'selected_never_expire'
        )}

      {mainAction === 'assign_listing_terms' && (
        <>
          {utilityCheckbox(
            'append',
            'selected_append',
            __('Keep Existing Terms', 'bit-integrations'),
            __('Append instead of replacing the current terms', 'bit-integrations')
          )}
          {renderActionModal(
            'append',
            __('Keep Existing Terms', 'bit-integrations'),
            yesNoOptions,
            'selected_append'
          )}
        </>
      )}

      {termActions.includes(mainAction) && (
        <>
          {utilityCheckbox(
            'parent',
            'selected_parent',
            __('Parent Term', 'bit-integrations'),
            __('Nest the new term under a parent', 'bit-integrations')
          )}
          {utilityCheckbox(
            'directories',
            'selected_directories',
            __('Directories', 'bit-integrations'),
            __('Link the new term to directories', 'bit-integrations')
          )}
          {renderActionModal(
            'parent',
            __('Parent Term', 'bit-integrations'),
            optionsOf(
              mainAction === 'create_category'
                ? directoristConf?.allCategories
                : mainAction === 'create_location'
                  ? directoristConf?.allLocations
                  : directoristConf?.allTags
            ),
            'selected_parent'
          )}
          {renderActionModal(
            'directories',
            __('Directories', 'bit-integrations'),
            optionsOf(directoristConf?.allDirectories),
            'selected_directories',
            false
          )}
        </>
      )}

      {deleteActions.includes(mainAction) && (
        <>
          {utilityCheckbox(
            'force_delete',
            'selected_force_delete',
            __('Delete Permanently', 'bit-integrations'),
            __('Bypass the trash and delete for good', 'bit-integrations')
          )}
          {renderActionModal(
            'force_delete',
            __('Delete Permanently', 'bit-integrations'),
            yesNoOptions,
            'selected_force_delete'
          )}
        </>
      )}

      {mainAction === 'add_review' && (
        <>
          {utilityCheckbox(
            'approved',
            'selected_approved',
            __('Approved', 'bit-integrations'),
            __('Publish the review right away', 'bit-integrations')
          )}
          {renderActionModal(
            'approved',
            __('Approved', 'bit-integrations'),
            yesNoOptions,
            'selected_approved'
          )}
        </>
      )}
    </div>
  )
}
