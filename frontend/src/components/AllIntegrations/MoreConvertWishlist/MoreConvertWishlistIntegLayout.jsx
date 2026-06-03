import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import MoreConvertWishlistActions from './MoreConvertWishlistActions'
import { generateMappedField } from './MoreConvertWishlistCommonFunc'
import MoreConvertWishlistFieldMap from './MoreConvertWishlistFieldMap'
import {
  CreateCustomerFields,
  CreateWishlistFields,
  CustomerIdField,
  modules,
  ProductWishlistFields,
  UpdateWishlistFields,
  WishlistIdField
} from './staticData'

const UTILITY_ACTIONS = [
  'create_wishlist',
  'update_wishlist',
  'create_customer',
  'add_product_to_wishlist',
  'remove_product_from_wishlist'
]

export default function MoreConvertWishlistIntegLayout({
  formFields,
  moreConvertWishlistConf,
  setMoreConvertWishlistConf
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const mainAction = moreConvertWishlistConf?.mainAction

  const handleMainAction = value => {
    setMoreConvertWishlistConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value

        switch (value) {
          case 'create_wishlist':
            draftConf.moreConvertWishlistFields = CreateWishlistFields
            break
          case 'update_wishlist':
            draftConf.moreConvertWishlistFields = UpdateWishlistFields
            break
          case 'delete_wishlist':
            draftConf.moreConvertWishlistFields = WishlistIdField
            break
          case 'add_product_to_wishlist':
            draftConf.moreConvertWishlistFields = ProductWishlistFields
            break
          case 'remove_product_from_wishlist':
            draftConf.moreConvertWishlistFields = ProductWishlistFields
            break
          case 'create_customer':
            draftConf.moreConvertWishlistFields = CreateCustomerFields
            break
          case 'subscribe_customer':
            draftConf.moreConvertWishlistFields = CustomerIdField
            break
          case 'unsubscribe_customer':
            draftConf.moreConvertWishlistFields = CustomerIdField
            break
          default:
            draftConf.moreConvertWishlistFields = []
        }

        draftConf.field_map = generateMappedField(draftConf.moreConvertWishlistFields)
      })
    )
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: !checkIsPro(isPro, action.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {mainAction && moreConvertWishlistConf.moreConvertWishlistFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('MoreConvert Wishlist Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {moreConvertWishlistConf?.field_map?.map((itm, i) => (
            <MoreConvertWishlistFieldMap
              key={`mcw-m-${i + 9}`}
              i={i}
              field={itm}
              moreConvertWishlistConf={moreConvertWishlistConf}
              formFields={formFields}
              setMoreConvertWishlistConf={setMoreConvertWishlistConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(
                  moreConvertWishlistConf.field_map.length,
                  moreConvertWishlistConf,
                  setMoreConvertWishlistConf
                )
              }
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          <br />
        </div>
      )}

      {mainAction && UTILITY_ACTIONS.includes(mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <MoreConvertWishlistActions
            moreConvertWishlistConf={moreConvertWishlistConf}
            setMoreConvertWishlistConf={setMoreConvertWishlistConf}
          />
        </div>
      )}
    </>
  )
}
