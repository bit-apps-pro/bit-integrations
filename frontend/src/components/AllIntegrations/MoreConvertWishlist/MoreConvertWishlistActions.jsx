/* eslint-disable no-param-reassign */

import { create } from 'mutative'
import { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import ConfirmModal from '../../Utilities/ConfirmModal'
import TableCheckBox from '../../Utilities/TableCheckBox'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import {
  refreshMoreConvertWishlistCustomers,
  refreshMoreConvertWishlistUsers,
  refreshMoreConvertWishlistWishlists
} from './MoreConvertWishlistCommonFunc'
import { defaultWishlistOptions, privacyOptions } from './staticData'

export default function MoreConvertWishlistActions({
  moreConvertWishlistConf,
  setMoreConvertWishlistConf
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false })

  const mainAction = moreConvertWishlistConf?.mainAction

  const isUtilitySet = key => {
    const val = moreConvertWishlistConf?.utilities?.[key]
    return val !== undefined && val !== ''
  }

  const actionHandler = (e, type) => {
    setMoreConvertWishlistConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
      })
    )

    setActionMdl({ show: type })

    if (type === 'customerId') {
      refreshMoreConvertWishlistCustomers(setMoreConvertWishlistConf, setIsLoading)
    }
    if (type === 'userId') {
      refreshMoreConvertWishlistUsers(setMoreConvertWishlistConf, setIsLoading)
    }
    if (type === 'wishlistId') {
      refreshMoreConvertWishlistWishlists(setMoreConvertWishlistConf, setIsLoading)
    }
  }

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setAction = (val, name) => {
    setMoreConvertWishlistConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = val
      })
    )
  }

  const optionsFrom = list =>
    Array.isArray(list) ? list.map(item => ({ label: item.label, value: item.value?.toString() })) : []

  const renderStaticModal = (type, title, options, valueName) => (
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
      <div className="mt-2">
        {__('Select', 'bit-integrations')} {title}
      </div>
      <div className="flx flx-between mt-2">
        <MultiSelect
          options={options}
          className="msl-wrp-options"
          singleSelect
          closeOnSelect
          defaultValue={moreConvertWishlistConf?.utilities?.[valueName] ?? null}
          onChange={val => setAction(val, valueName)}
        />
      </div>
    </ConfirmModal>
  )

  const renderDynamicModal = (type, title, list, valueName, refreshFn) => (
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
      <div className="mt-2">
        {__('Select', 'bit-integrations')} {title}
      </div>
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
        <div className="flx mt-2">
          <MultiSelect
            className="btcd-paper-drpdwn"
            singleSelect
            closeOnSelect
            defaultValue={moreConvertWishlistConf?.utilities?.[valueName] ?? null}
            options={optionsFrom(list)}
            onChange={val => setAction(val, valueName)}
          />
          <button
            onClick={() => refreshFn(setMoreConvertWishlistConf, setIsLoading)}
            className="icn-btn sh-sm ml-2 mr-2 tooltip"
            style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
            type="button"
            disabled={isLoading}>
            &#x21BB;
          </button>
        </div>
      )}
    </ConfirmModal>
  )

  return (
    <div className="pos-rel d-flx flx-wrp">
      {mainAction === 'create_wishlist' && (
        <>
          <TableCheckBox
            checked={isUtilitySet('customerId')}
            onChange={e => actionHandler(e, 'customerId')}
            className="wdt-200 mt-4 mr-2"
            value="customerId"
            title={__('Customer', 'bit-integrations')}
            subTitle={__('Assign a customer to the wishlist', 'bit-integrations')}
          />
          <TableCheckBox
            checked={isUtilitySet('userId')}
            onChange={e => actionHandler(e, 'userId')}
            className="wdt-200 mt-4 mr-2"
            value="userId"
            title={__('User', 'bit-integrations')}
            subTitle={__('Assign a WordPress user to the wishlist', 'bit-integrations')}
          />
          <TableCheckBox
            checked={isUtilitySet('privacy')}
            onChange={e => actionHandler(e, 'privacy')}
            className="wdt-200 mt-4 mr-2"
            value="privacy"
            title={__('Privacy', 'bit-integrations')}
            subTitle={__('Set the wishlist privacy', 'bit-integrations')}
          />
          <TableCheckBox
            checked={isUtilitySet('isDefault')}
            onChange={e => actionHandler(e, 'isDefault')}
            className="wdt-200 mt-4 mr-2"
            value="isDefault"
            title={__('Default Wishlist', 'bit-integrations')}
            subTitle={__('Mark as the default wishlist', 'bit-integrations')}
          />
        </>
      )}

      {mainAction === 'update_wishlist' && (
        <>
          <TableCheckBox
            checked={isUtilitySet('privacy')}
            onChange={e => actionHandler(e, 'privacy')}
            className="wdt-200 mt-4 mr-2"
            value="privacy"
            title={__('Privacy', 'bit-integrations')}
            subTitle={__('Set the wishlist privacy', 'bit-integrations')}
          />
          <TableCheckBox
            checked={isUtilitySet('isDefault')}
            onChange={e => actionHandler(e, 'isDefault')}
            className="wdt-200 mt-4 mr-2"
            value="isDefault"
            title={__('Default Wishlist', 'bit-integrations')}
            subTitle={__('Mark as the default wishlist', 'bit-integrations')}
          />
        </>
      )}

      {mainAction === 'create_customer' && (
        <TableCheckBox
          checked={isUtilitySet('userId')}
          onChange={e => actionHandler(e, 'userId')}
          className="wdt-200 mt-4 mr-2"
          value="userId"
          title={__('User', 'bit-integrations')}
          subTitle={__('Link the customer to a WordPress user', 'bit-integrations')}
        />
      )}

      {(mainAction === 'add_product_to_wishlist' || mainAction === 'remove_product_from_wishlist') && (
        <TableCheckBox
          checked={isUtilitySet('wishlistId')}
          onChange={e => actionHandler(e, 'wishlistId')}
          className="wdt-200 mt-4 mr-2"
          value="wishlistId"
          title={__('Wishlist', 'bit-integrations')}
          subTitle={__('Select the target wishlist', 'bit-integrations')}
        />
      )}

      {renderDynamicModal(
        'wishlistId',
        __('Wishlist', 'bit-integrations'),
        moreConvertWishlistConf?.allWishlists,
        'wishlistId',
        refreshMoreConvertWishlistWishlists
      )}
      {renderDynamicModal(
        'customerId',
        __('Customer', 'bit-integrations'),
        moreConvertWishlistConf?.allCustomers,
        'customerId',
        refreshMoreConvertWishlistCustomers
      )}
      {renderDynamicModal(
        'userId',
        __('User', 'bit-integrations'),
        moreConvertWishlistConf?.allUsers,
        'userId',
        refreshMoreConvertWishlistUsers
      )}
      {renderStaticModal('privacy', __('Privacy', 'bit-integrations'), privacyOptions, 'privacy')}
      {renderStaticModal(
        'isDefault',
        __('Default Wishlist', 'bit-integrations'),
        defaultWishlistOptions,
        'isDefault'
      )}
    </div>
  )
}
