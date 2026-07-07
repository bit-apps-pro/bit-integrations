import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import {
  generateMappedField,
  refreshModernCartCartItems,
  refreshModernCartProducts,
  refreshModernCartProductVariations
} from './ModernCartCommonFunc'
import ModernCartFieldMap from './ModernCartFieldMap'
import {
  AddProductToCartFields,
  modules,
  RemoveProductFromCartFields,
  UpdateCartQuantityFields
} from './staticData'

export default function ModernCartIntegLayout({
  formFields,
  modernCartConf,
  setModernCartConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const getFieldsByAction = value => {
    switch (value) {
      case 'add_product_to_cart':
        return AddProductToCartFields
      case 'update_cart_quantity':
        return UpdateCartQuantityFields
      case 'remove_product_from_cart':
        return RemoveProductFromCartFields
      default:
        return []
    }
  }

  const handleMainAction = value => {
    const fields = getFieldsByAction(value)

    setModernCartConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.modernCartFields = fields
        draftConf.field_map = generateMappedField(fields)
        draftConf.productId = ''
        draftConf.variationId = ''
        draftConf.cartItemKey = ''
      })
    )

    if (value === 'add_product_to_cart') {
      refreshModernCartProducts(setModernCartConf, setIsLoading)
    }

    if (value === 'update_cart_quantity') {
      refreshModernCartCartItems(setModernCartConf, setIsLoading)
    }
  }

  const setField = (key, value) => {
    setModernCartConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const handleProductChange = value => {
    setModernCartConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.productId = value
        draftConf.variationId = ''
        draftConf.allProductVariations = []
      })
    )

    if (value) {
      refreshModernCartProductVariations(value, setModernCartConf, setIsLoading)
    }
  }

  const hasMappableFields = modernCartConf?.modernCartFields?.length > 0

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={modernCartConf?.mainAction ?? null}
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

      {modernCartConf?.mainAction === 'add_product_to_cart' && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Product:', 'bit-integrations')}</b>
            <MultiSelect
              title="productId"
              defaultValue={modernCartConf?.productId ?? null}
              className="btcd-paper-drpdwn w-5"
              options={(modernCartConf?.allProducts || []).map(product => ({
                label: product.product_name,
                value: product.product_id?.toString()
              }))}
              onChange={handleProductChange}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshModernCartProducts(setModernCartConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Products', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Variation:', 'bit-integrations')}</b>
            <MultiSelect
              title="variationId"
              defaultValue={modernCartConf?.variationId ?? null}
              className="btcd-paper-drpdwn w-5"
              options={(modernCartConf?.allProductVariations || []).map(variation => ({
                label: variation.variation_name,
                value: variation.variation_id?.toString()
              }))}
              onChange={val => setField('variationId', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() =>
                refreshModernCartProductVariations(
                  modernCartConf?.productId,
                  setModernCartConf,
                  setIsLoading
                )
              }
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Variations', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading || !modernCartConf?.productId}>
              &#x21BB;
            </button>
          </div>
        </>
      )}

      {modernCartConf?.mainAction === 'update_cart_quantity' && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Cart Item:', 'bit-integrations')}</b>
            <MultiSelect
              title="cartItemKey"
              defaultValue={modernCartConf?.cartItemKey ?? null}
              className="btcd-paper-drpdwn w-5"
              options={(modernCartConf?.allCartItems || []).map(item => ({
                label: item.cart_item_name,
                value: item.cart_item_key?.toString()
              }))}
              onChange={val => setField('cartItemKey', val)}
              singleSelect
              closeOnSelect
            />
            <button
              onClick={() => refreshModernCartCartItems(setModernCartConf, setIsLoading)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh Cart Items', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
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

      {modernCartConf?.mainAction && hasMappableFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Modern Cart Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {modernCartConf?.field_map?.map((itm, i) => (
            <ModernCartFieldMap
              key={`modern-cart-m-${i + 9}`}
              i={i}
              field={itm}
              modernCartConf={modernCartConf}
              formFields={formFields}
              setModernCartConf={setModernCartConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(modernCartConf.field_map.length, modernCartConf, setModernCartConf)
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}
    </>
  )
}
