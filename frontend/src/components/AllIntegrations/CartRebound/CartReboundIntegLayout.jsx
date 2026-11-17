import { useEffect } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import CartReboundActions from './CartReboundActions'
import {
  generateMappedField,
  refreshCartReboundCoupons,
  refreshCartReboundTemplates
} from './CartReboundCommonFunc'
import CartReboundFieldMap from './CartReboundFieldMap'
import {
  actionNotes,
  cartStatusOptions,
  fieldsByAction,
  hasUtilities,
  modules,
  needsCoupon,
  needsStatus,
  needsTemplate
} from './staticData'

export default function CartReboundIntegLayout({
  formFields,
  cartReboundConf,
  setCartReboundConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const loadOptionLists = action => {
    const loaders = []

    if (needsTemplate.includes(action)) {
      loaders.push(refreshCartReboundTemplates)
    }

    if (needsCoupon.includes(action)) {
      loaders.push(refreshCartReboundCoupons)
    }

    if (loaders.length > 0) {
      setIsLoading(true)
      Promise.all(loaders.map(load => load(setCartReboundConf, null, false))).finally(() =>
        setIsLoading(false)
      )
    }
  }

  useEffect(() => {
    if (cartReboundConf?.mainAction) {
      loadOptionLists(cartReboundConf.mainAction)
    }
  }, [])

  const handleMainAction = value => {
    setCartReboundConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.cartReboundFields = fieldsByAction[value] || []
        draftConf.field_map = generateMappedField(draftConf.cartReboundFields)
        draftConf.utilities = {}
        delete draftConf.selectedStatus
        delete draftConf.selectedTemplate
        delete draftConf.selectedCoupon
      })
    )

    loadOptionLists(value)
  }

  const setConfValue = (key, value) => {
    setCartReboundConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const toOptions = items =>
    (items || []).map(item => ({ label: item.label, value: item.value?.toString() }))

  const { mainAction } = cartReboundConf || {}
  const hasFields = (cartReboundConf?.cartReboundFields || []).length > 0
  const hasOptionalFields = (cartReboundConf?.cartReboundFields || []).some(field => !field.required)
  const optionalLabel = label => `${label} ${__('(optional)', 'bit-integrations')}:`

  const refreshButton = (onClick, tooltip) => (
    <button
      onClick={onClick}
      className="icn-btn sh-sm ml-2 mr-2 tooltip"
      style={{ '--tooltip-txt': `'${tooltip}'` }}
      type="button"
      disabled={isLoading}>
      &#x21BB;
    </button>
  )

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

      {needsStatus.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Status:', 'bit-integrations')}</b>
            <MultiSelect
              title="selectedStatus"
              defaultValue={cartReboundConf?.selectedStatus ?? null}
              className="btcd-paper-drpdwn w-5"
              options={cartStatusOptions}
              onChange={val => setConfValue('selectedStatus', val)}
              singleSelect
              closeOnSelect
            />
          </div>
        </>
      )}

      {needsTemplate.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{optionalLabel(__('Template', 'bit-integrations'))}</b>
            <MultiSelect
              key={`template-${(cartReboundConf?.allTemplates || []).length}`}
              title="selectedTemplate"
              defaultValue={cartReboundConf?.selectedTemplate ?? null}
              className="btcd-paper-drpdwn w-5"
              options={toOptions(cartReboundConf?.allTemplates)}
              onChange={val => setConfValue('selectedTemplate', val)}
              singleSelect
              closeOnSelect
            />
            {refreshButton(
              () => refreshCartReboundTemplates(setCartReboundConf, setIsLoading),
              __('Refresh Templates', 'bit-integrations')
            )}
          </div>
          <br />
          <Note note={__('Leave Template empty to use the default template.', 'bit-integrations')} />
        </>
      )}

      {needsCoupon.includes(mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{optionalLabel(__('Coupon', 'bit-integrations'))}</b>
            <MultiSelect
              key={`coupon-${(cartReboundConf?.allCoupons || []).length}`}
              title="selectedCoupon"
              defaultValue={cartReboundConf?.selectedCoupon ?? null}
              className="btcd-paper-drpdwn w-5"
              options={toOptions(cartReboundConf?.allCoupons)}
              onChange={val => setConfValue('selectedCoupon', val)}
              singleSelect
              closeOnSelect
            />
            {refreshButton(
              () => refreshCartReboundCoupons(setCartReboundConf, setIsLoading),
              __('Refresh Coupons', 'bit-integrations')
            )}
          </div>
          <br />
          <Note
            note={__(
              'The email shows this code in place of the {coupon_code} merge tag.',
              'bit-integrations'
            )}
          />
        </>
      )}

      {actionNotes[mainAction] && (
        <>
          <br />
          <Note note={actionNotes[mainAction]} />
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

      {mainAction && hasFields && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Cart Rebound Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {cartReboundConf?.field_map?.map((itm, i) => (
            <CartReboundFieldMap
              key={`cart-rebound-m-${i + 9}`}
              i={i}
              field={itm}
              cartReboundConf={cartReboundConf}
              formFields={formFields}
              setCartReboundConf={setCartReboundConf}
            />
          ))}
          {hasOptionalFields && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() =>
                  addFieldMap(cartReboundConf.field_map.length, cartReboundConf, setCartReboundConf)
                }
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          )}
          <br />
        </div>
      )}

      {mainAction && hasUtilities.includes(mainAction) && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <CartReboundActions
            cartReboundConf={cartReboundConf}
            setCartReboundConf={setCartReboundConf}
          />
        </div>
      )}
    </>
  )
}
