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
  refreshFluentCartOrderStatuses,
  refreshFluentCartProductBrands,
  refreshFluentCartProductShippingClasses,
  refreshProductCategories
} from './FluentCartCommonFunc'

export default function FluentCartActions({
  fluentCartConf,
  setFluentCartConf,
  formFields,
  setSnackbar
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionMdl, setActionMdl] = useState({ show: false, action: () => {} })

  const actionHandler = (e, type) => {
    setFluentCartConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }

        setActionMdl({ show: type })
      })
    )

    if (type === 'order_status') {
      refreshFluentCartOrderStatuses(setFluentCartConf, setIsLoading)
    }
    if (type === 'product_categories') {
      refreshProductCategories(setFluentCartConf, setIsLoading)
    }
    if (type === 'product_brands') {
      refreshFluentCartProductBrands(setFluentCartConf, setIsLoading)
    }
    if (type === 'product_shipping_classes') {
      refreshFluentCartProductShippingClasses(setFluentCartConf, setIsLoading)
    }
  }

  const clsActionMdl = () => {
    setActionMdl({ show: false })
  }

  const setAction = (val, name) => {
    setFluentCartConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.utilities) {
          draftConf.utilities = {}
        }
        draftConf.utilities[name] = val
      })
    )
  }

  const renderActionModal = (type, title, options, valueName) => (
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
      <div className="mt-2">{__(`Select ${title}`, 'bit-integrations')}</div>
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
            singleSelect
            defaultValue={fluentCartConf?.utilities?.[valueName] || undefined}
            onChange={val => setAction(val, valueName)}
          />
        </div>
      )}
    </ConfirmModal>
  )

  return (
    <div className="pos-rel d-flx flx-wrp">
      {fluentCartConf?.mainAction === 'create_order' && (
        <>
          <TableCheckBox
            checked={fluentCartConf?.utilities?.selected_order_status || false}
            onChange={e => actionHandler(e, 'order_status')}
            className="wdt-200 mt-4 mr-2"
            value="order_status"
            title={__('Order Status', 'bit-integrations')}
            subTitle={__('Set the order status', 'bit-integrations')}
          />

          <TableCheckBox
            checked={fluentCartConf?.utilities?.selected_payment_status || false}
            onChange={e => actionHandler(e, 'payment_status')}
            className="wdt-200 mt-4 mr-2"
            value="payment_status"
            title={__('Payment Status', 'bit-integrations')}
            subTitle={__('Set the payment status', 'bit-integrations')}
          />
          {renderActionModal(
            'payment_status',
            __('Payment Status', 'bit-integrations'),
            paymentStatusOptions,
            'selected_payment_status'
          )}

          <TableCheckBox
            checked={fluentCartConf?.utilities?.selected_shipping_status || false}
            onChange={e => actionHandler(e, 'shipping_status')}
            className="wdt-200 mt-4 mr-2"
            value="shipping_status"
            title={__('Shipping Status', 'bit-integrations')}
            subTitle={__('Set the shipping status', 'bit-integrations')}
          />
          {renderActionModal(
            'shipping_status',
            __('Shipping Status', 'bit-integrations'),
            shippingStatusOptions,
            'selected_shipping_status'
          )}

          <TableCheckBox
            checked={fluentCartConf?.utilities?.selected_fulfillment_type || false}
            onChange={e => actionHandler(e, 'fulfillment_type')}
            className="wdt-200 mt-4 mr-2"
            value="fulfillment_type"
            title={__('Fulfillment Type', 'bit-integrations')}
            subTitle={__('Set the fulfillment type', 'bit-integrations')}
          />
          {renderActionModal(
            'fulfillment_type',
            __('Fulfillment Type', 'bit-integrations'),
            fulfillmentTypeOptions,
            'selected_fulfillment_type'
          )}
        </>
      )}
      {fluentCartConf?.mainAction === 'create_product' && (
        <>
          <TableCheckBox
            checked={fluentCartConf?.utilities?.selected_product_categories || false}
            onChange={e => actionHandler(e, 'product_categories')}
            className="wdt-200 mt-4 mr-2"
            value="product_categories"
            title={__('Product Categories', 'bit-integrations')}
            subTitle={__('Set the product categories', 'bit-integrations')}
          />
          <TableCheckBox
            checked={fluentCartConf?.utilities?.selected_product_brands || false}
            onChange={e => actionHandler(e, 'product_brands')}
            className="wdt-200 mt-4 mr-2"
            value="product_brands"
            title={__('Product Brands', 'bit-integrations')}
            subTitle={__('Set the product brands', 'bit-integrations')}
          />
          <TableCheckBox
            checked={fluentCartConf?.utilities?.selected_product_shipping_class || false}
            onChange={e => actionHandler(e, 'product_shipping_class')}
            className="wdt-200 mt-4 mr-2"
            value="product_shipping_class"
            title={__('Shipping Class', 'bit-integrations')}
            subTitle={__('Set the product shipping class', 'bit-integrations')}
          />
        </>
      )}

      <ConfirmModal
        className="custom-conf-mdl"
        mainMdlCls="o-v"
        btnClass="purple"
        btnTxt={__('Ok', 'bit-integrations')}
        show={actionMdl.show === 'order_status'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Order Status', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Order Status', 'bit-integrations')}</div>
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
              title="selected_order_status"
              defaultValue={fluentCartConf?.utilities?.selected_order_status ?? null}
              className="btcd-paper-drpdwn"
              options={fluentCartConf?.allStatuses}
              onChange={val => setAction(val, 'selected_order_status')}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshFluentCartOrderStatuses(setFluentCartConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Order Statuses', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
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
        show={actionMdl.show === 'product_categories'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Product Categories', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Product Categories', 'bit-integrations')}</div>
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
              title="selected_product_categories"
              defaultValue={fluentCartConf?.utilities?.selected_product_categories ?? null}
              className="btcd-paper-drpdwn"
              options={
                fluentCartConf?.allProductsCategories &&
                Array.isArray(fluentCartConf.allProductsCategories) &&
                fluentCartConf.allProductsCategories.map(category => ({
                  label: category.label,
                  value: category.value?.toString()
                }))
              }
              onChange={val => setAction(val, 'selected_product_categories')}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshProductCategories(setFluentCartConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Product Categories', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
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
        show={actionMdl.show === 'product_brands'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Product Brands', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Product Brands', 'bit-integrations')}</div>
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
              title="selected_product_brands"
              defaultValue={fluentCartConf?.utilities?.selected_product_brands ?? null}
              className="btcd-paper-drpdwn"
              options={
                fluentCartConf?.allProductBrands &&
                Array.isArray(fluentCartConf.allProductBrands) &&
                fluentCartConf.allProductBrands.map(brand => ({
                  label: brand.label,
                  value: brand.value?.toString()
                }))
              }
              onChange={val => setAction(val, 'selected_product_brands')}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshFluentCartProductBrands(setFluentCartConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Product Brands', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
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
        show={actionMdl.show === 'product_shipping_class'}
        close={clsActionMdl}
        action={clsActionMdl}
        title={__('Shipping Class', 'bit-integrations')}>
        <div className="btcd-hr mt-2 mb-2" />
        <div className="mt-2">{__('Select Shipping Class', 'bit-integrations')}</div>
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
              title="selected_product_shipping_class"
              defaultValue={fluentCartConf?.utilities?.selected_product_shipping_class ?? null}
              className="btcd-paper-drpdwn"
              options={
                fluentCartConf?.allProductShippingClasses &&
                Array.isArray(fluentCartConf.allProductShippingClasses) &&
                fluentCartConf.allProductShippingClasses.map(classItem => ({
                  label: classItem.label,
                  value: classItem.value?.toString()
                }))
              }
              onChange={val => setAction(val, 'selected_product_shipping_class')}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshFluentCartProductShippingClasses(setFluentCartConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{
                '--tooltip-txt': `'${__('Refresh Product Shipping Classes', 'bit-integrations')}'`
              }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        )}
      </ConfirmModal>
    </div>
  )
}

const paymentStatusOptions = [
  { label: __('Pending', 'bit-integrations'), value: 'pending' },
  { label: __('Paid', 'bit-integrations'), value: 'paid' },
  { label: __('Partially Paid', 'bit-integrations'), value: 'partially_paid' },
  { label: __('Authorized', 'bit-integrations'), value: 'authorized' },
  { label: __('Refunded', 'bit-integrations'), value: 'refunded' },
  { label: __('Partially Refunded', 'bit-integrations'), value: 'partially_refunded' },
  { label: __('Failed', 'bit-integrations'), value: 'failed' }
]

const shippingStatusOptions = [
  { label: __('Unshipped', 'bit-integrations'), value: 'unshipped' },
  { label: __('Shipped', 'bit-integrations'), value: 'shipped' },
  { label: __('Delivered', 'bit-integrations'), value: 'delivered' },
  { label: __('Unshippable', 'bit-integrations'), value: 'unshippable' }
]

const fulfillmentTypeOptions = [
  { label: __('Physical', 'bit-integrations'), value: 'physical' },
  { label: __('Digital', 'bit-integrations'), value: 'digital' }
]

const productTypeOptions = [
  { label: __('Simple', 'bit-integrations'), value: 'simple' },
  { label: __('Variable', 'bit-integrations'), value: 'variable' },
  { label: __('Digital', 'bit-integrations'), value: 'digital' },
  { label: __('Bundle', 'bit-integrations'), value: 'bundle' }
]

const productStatusOptions = [
  { label: __('Active', 'bit-integrations'), value: 'active' },
  { label: __('Draft', 'bit-integrations'), value: 'draft' },
  { label: __('Archived', 'bit-integrations'), value: 'archived' }
]

const stockStatusOptions = [
  { label: __('In Stock', 'bit-integrations'), value: 'in_stock' },
  { label: __('Out of Stock', 'bit-integrations'), value: 'out_of_stock' },
  { label: __('On Backorder', 'bit-integrations'), value: 'on_backorder' }
]

const customerStatusOptions = [
  { label: __('Active', 'bit-integrations'), value: 'active' },
  { label: __('Inactive', 'bit-integrations'), value: 'inactive' },
  { label: __('Pending', 'bit-integrations'), value: 'pending' }
]

const couponTypeOptions = [
  { label: __('Percentage', 'bit-integrations'), value: 'percentage' },
  { label: __('Fixed Amount', 'bit-integrations'), value: 'fixed_amount' },
  { label: __('Free Shipping', 'bit-integrations'), value: 'free_shipping' }
]
