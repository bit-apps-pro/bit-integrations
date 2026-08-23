import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { refreshCartAbandonmentRecoveryCarts } from './CartAbandonmentRecoveryCommonFunc'
import CartAbandonmentRecoveryFieldMap from './CartAbandonmentRecoveryFieldMap'
import { cartStatusOptions, modules } from './staticData'

const SESSION_ACTIONS = ['delete_abandoned_cart', 'reschedule_recovery_emails', 'update_cart_status']

const SESSION_ID_FIELD = {
  formField: '',
  cartAbandonmentRecoveryField: 'session_id'
}

const sessionIdSourceOptions = [
  { label: __('Select Cart', 'bit-integrations'), value: 'select' },
  { label: __('Map Session ID', 'bit-integrations'), value: 'map' }
]

export default function CartAbandonmentRecoveryIntegLayout({
  formFields,
  cartAbandonmentRecoveryConf,
  setCartAbandonmentRecoveryConf,
  isLoading,
  setIsLoading
}) {
  const { isPro } = useRecoilValue($appConfigState)
  const sessionIdSource = cartAbandonmentRecoveryConf?.sessionIdSource || 'select'

  const setField = (key, value) => {
    setCartAbandonmentRecoveryConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const handleMainAction = value => {
    setCartAbandonmentRecoveryConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.sessionIdSource = 'select'
        draftConf.sessionId = ''
        draftConf.orderStatus = ''
        draftConf.field_map = []
      })
    )

    if (SESSION_ACTIONS.includes(value)) {
      refreshCartAbandonmentRecoveryCarts(setCartAbandonmentRecoveryConf, setIsLoading)
    }
  }

  const handleSessionIdSource = value => {
    setCartAbandonmentRecoveryConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.sessionIdSource = value
        draftConf.sessionId = ''
        draftConf.field_map = value === 'map' ? [{ ...SESSION_ID_FIELD }] : []
      })
    )

    if (value === 'select') {
      refreshCartAbandonmentRecoveryCarts(setCartAbandonmentRecoveryConf, setIsLoading)
    }
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={cartAbandonmentRecoveryConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules.map(action => ({
            label: checkIsPro(isPro, action.is_pro) ? action.label : getProLabel(action.label),
            value: action.name,
            disabled: !checkIsPro(isPro, action.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {SESSION_ACTIONS.includes(cartAbandonmentRecoveryConf?.mainAction) && (
        <>
          <br />
          <div className="flx">
            <b className="wdt-200 d-in-b">{__('Session ID Source:', 'bit-integrations')}</b>
            <MultiSelect
              title="sessionIdSource"
              defaultValue={sessionIdSource}
              className="btcd-paper-drpdwn w-5"
              options={sessionIdSourceOptions}
              onChange={val => handleSessionIdSource(val)}
              singleSelect
              closeOnSelect
            />
          </div>

          {sessionIdSource === 'select' && (
            <>
              <br />
              <div className="flx">
                <b className="wdt-200 d-in-b">{__('Abandoned Cart:', 'bit-integrations')}</b>
                <MultiSelect
                  title="sessionId"
                  defaultValue={cartAbandonmentRecoveryConf?.sessionId ?? null}
                  className="btcd-paper-drpdwn w-5"
                  options={(cartAbandonmentRecoveryConf?.abandonedCarts ?? []).map(cart => ({
                    label: cart.label,
                    value: cart.value?.toString()
                  }))}
                  onChange={val => setField('sessionId', val)}
                  singleSelect
                  closeOnSelect
                />
                <button
                  onClick={() =>
                    refreshCartAbandonmentRecoveryCarts(setCartAbandonmentRecoveryConf, setIsLoading)
                  }
                  className="icn-btn sh-sm ml-2 mr-2 tooltip"
                  style={{ '--tooltip-txt': `'${__('Refresh Abandoned Carts', 'bit-integrations')}'` }}
                  type="button"
                  disabled={isLoading}>
                  &#x21BB;
                </button>
              </div>
            </>
          )}

          {cartAbandonmentRecoveryConf?.mainAction === 'update_cart_status' && (
            <>
              <br />
              <div className="flx">
                <b className="wdt-200 d-in-b">{__('Order Status:', 'bit-integrations')}</b>
                <MultiSelect
                  title="orderStatus"
                  defaultValue={cartAbandonmentRecoveryConf?.orderStatus ?? null}
                  className="btcd-paper-drpdwn w-5"
                  options={cartStatusOptions}
                  onChange={val => setField('orderStatus', val)}
                  singleSelect
                  closeOnSelect
                />
              </div>
            </>
          )}

          {sessionIdSource === 'map' && (
            <>
              <br />
              <div className="mt-4">
                <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
              </div>
              <div className="btcd-hr mt-1" />
              <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
                <div className="txt-dp">
                  <b>{__('Form Fields', 'bit-integrations')}</b>
                </div>
                <div className="txt-dp">
                  <b>{__('Cart Fields', 'bit-integrations')}</b>
                </div>
              </div>
              <CartAbandonmentRecoveryFieldMap
                formFields={formFields}
                cartAbandonmentRecoveryConf={cartAbandonmentRecoveryConf}
                setCartAbandonmentRecoveryConf={setCartAbandonmentRecoveryConf}
              />
            </>
          )}
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
    </>
  )
}
