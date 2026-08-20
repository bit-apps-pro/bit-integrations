import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import FluentCartActions from './FluentCartActions'
import {
  generateMappedField,
  refreshFluentCartCustomers,
  refreshFluentCartProducts
} from './FluentCartCommonFunc'
import FluentCartFieldMap from './FluentCartFieldMap'
import {
  CouponFields,
  CouponIdField,
  CustomerFields,
  CustomerIdField,
  CustomerUpdateFields,
  modules,
  OrderFields,
  OrderIdField,
  OrderStatusField,
  PaymentStatusField,
  ProductFields,
  ProductSlugField,
  ShippingStatusField
} from './staticData'
import Note from '../../Utilities/Note'

export default function FluentCartIntegLayout({
  formID,
  formFields,
  fluentCartConf,
  setFluentCartConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const handleMainAction = value => {
    setFluentCartConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        // Set fields based on action type
        switch (value) {
          case 'create_order':
            draftConf.fluentCartFields = OrderFields
            break
          case 'delete_order':
            draftConf.fluentCartFields = OrderIdField
            break
          case 'update_order_status':
            draftConf.fluentCartFields = OrderStatusField
            break
          case 'update_payment_status':
            draftConf.fluentCartFields = PaymentStatusField
            break
          case 'update_shipping_status':
            draftConf.fluentCartFields = ShippingStatusField
            break
          case 'create_customer':
            draftConf.fluentCartFields = CustomerFields
            break
          case 'update_customer':
            draftConf.fluentCartFields = CustomerUpdateFields
            break
          case 'delete_customer':
            draftConf.fluentCartFields = CustomerIdField
            break
          case 'create_product':
            draftConf.fluentCartFields = ProductFields
            break
          case 'delete_product':
            draftConf.fluentCartFields = ProductSlugField
            break
          case 'create_coupon':
            draftConf.fluentCartFields = CouponFields
            break
          case 'delete_coupon':
            draftConf.fluentCartFields = CouponIdField
            break
          default:
            draftConf.fluentCartFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.fluentCartFields)
      })
    )

    if (value === 'create_order') {
      refreshFluentCartCustomers(setFluentCartConf, setIsLoading)
      refreshFluentCartProducts(setFluentCartConf, setIsLoading)
    }
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={fluentCartConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: checkIsPro(isPro, action.is_pro) ? false : true
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {['create_order'].includes(fluentCartConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Customers:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedCustomer"
              defaultValue={fluentCartConf?.selectedCustomer ?? null}
              className="btcd-paper-drpdwn w-5"
              options={
                fluentCartConf?.allCustomers &&
                Array.isArray(fluentCartConf.allCustomers) &&
                fluentCartConf.allCustomers.map(customer => ({
                  label: `${customer.email} - ${customer.customer_name}`,
                  value: customer?.customer_id?.toString()
                }))
              }
              onChange={val =>
                setFluentCartConf(prevConf =>
                  create(prevConf, draftConf => {
                    draftConf.selectedCustomer = val
                  })
                )
              }
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshFluentCartCustomers(setFluentCartConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Customers', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Products:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedProduct"
              defaultValue={fluentCartConf?.selectedProduct ?? null}
              className="btcd-paper-drpdwn w-5"
              options={
                fluentCartConf?.allProducts &&
                Array.isArray(fluentCartConf.allProducts) &&
                fluentCartConf.allProducts.map(product => ({
                  label: product.product_name,
                  value: product.product_id.toString()
                }))
              }
              onChange={val =>
                setFluentCartConf(prevConf =>
                  create(prevConf, draftConf => {
                    draftConf.selectedProduct = val
                  })
                )
              }
            />
            <button
              onClick={() => refreshFluentCartProducts(setFluentCartConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Products', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Quantity:', 'bit-integrations')}</b>
            <input
              className="btcd-paper-inp w-5"
              name="productQuantity"
              value={fluentCartConf.productQuantity}
              type="text"
              placeholder={__('Product Quantity...', 'bit-integrations')}
              onChange={e =>
                setFluentCartConf(prevConf =>
                  create(prevConf, draftConf => {
                    draftConf.productQuantity = e.target.value
                  })
                )
              }
            />
          </div>
        </>
      )}

      {fluentCartConf?.mainAction === 'create_coupon' && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Discount Type:', 'bit-integrations')}</b>
            <MultiSelect
              title="discountType"
              defaultValue={fluentCartConf?.discountType ?? null}
              className="btcd-paper-drpdwn w-5"
              options={[
                { label: __('Percentage'), value: 'percentage' },
                { label: __('Fixed Amount'), value: 'fixed' }
              ]}
              onChange={val =>
                setFluentCartConf(prevConf =>
                  create(prevConf, draftConf => {
                    draftConf.discountType = val
                  })
                )
              }
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {fluentCartConf?.mainAction === 'create_product' && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Product Type:', 'bit-integrations')}</b>
            <MultiSelect
              title="productType"
              defaultValue={fluentCartConf?.productType ?? null}
              className="btcd-paper-drpdwn w-5"
              options={[
                { label: __('Physical Product'), value: 'physical' },
                { label: __('Digital Product'), value: 'digital' }
              ]}
              onChange={val =>
                setFluentCartConf(prevConf =>
                  create(prevConf, draftConf => {
                    draftConf.productType = val
                  })
                )
              }
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {isLoading && (
        <Loader
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 100,
            transform: 'scale(0.7)'
          }}
        />
      )}

      {fluentCartConf?.mainAction && fluentCartConf.fluentCartFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('FluentCart Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {fluentCartConf?.field_map?.map((itm, i) => (
            <FluentCartFieldMap
              key={`analytics-m-${i + 9}`}
              i={i}
              field={itm}
              fluentCartConf={fluentCartConf}
              formFields={formFields}
              setFluentCartConf={setFluentCartConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(fluentCartConf.field_map.length, fluentCartConf, setFluentCartConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      <Note
        note={__(
          'Price in dollars. Example: 399.98 for $399.98. Will be automatically converted to cents for storage.',
          'bit-integrations'
        )}
      />

      {fluentCartConf?.mainAction &&
        fluentCartConf.fluentCartFields &&
        ['create_order', 'create_product'].includes(fluentCartConf?.mainAction) && (
          <div className="mt-4">
            <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
            <div className="btcd-hr mt-1" />
            <FluentCartActions
              fluentCartConf={fluentCartConf}
              setFluentCartConf={setFluentCartConf}
              formFields={formFields}
              setSnackbar={setSnackbar}
            />
          </div>
        )}
    </>
  )
}
