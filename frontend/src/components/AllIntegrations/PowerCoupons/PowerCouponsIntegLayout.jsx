import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import { generateMappedField, refreshPowerCouponsCoupons } from './PowerCouponsCommonFunc'
import PowerCouponsFieldMap from './PowerCouponsFieldMap'
import {
  CouponCreateFields,
  CouponDeleteFields,
  CouponUpdateFields,
  modules,
  ToggleFields
} from './staticData'

const FIELD_MAP = {
  create_coupon: CouponCreateFields,
  update_coupon: CouponUpdateFields,
  delete_coupon: CouponDeleteFields,
  toggle_auto_apply: ToggleFields,
  toggle_show_in_slideout: ToggleFields,
  toggle_rules: ToggleFields
}

const COUPON_PICKER_ACTIONS = [
  'update_coupon',
  'delete_coupon',
  'toggle_auto_apply',
  'toggle_show_in_slideout',
  'toggle_rules'
]

export default function PowerCouponsIntegLayout({
  formFields,
  powerCouponsConf,
  setPowerCouponsConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const setConfValue = (key, value) => {
    setPowerCouponsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf[key] = value
      })
    )
  }

  const handleMainAction = value => {
    setPowerCouponsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.powerCouponsFields = FIELD_MAP[value] || []
        draftConf.field_map = generateMappedField(draftConf.powerCouponsFields)
        draftConf.selectedCoupon = ''
      })
    )

    if (COUPON_PICKER_ACTIONS.includes(value)) {
      refreshPowerCouponsCoupons(setPowerCouponsConf, setIsLoading)
    }
  }

  const recordSelect = (label, confKey, optionSource, onRefresh) => (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{label}</b>
        <MultiSelect
          title={confKey}
          defaultValue={powerCouponsConf?.[confKey] ?? null}
          className="btcd-paper-drpdwn w-5"
          options={(powerCouponsConf?.[optionSource] ?? []).map(opt => ({
            label: opt.label,
            value: String(opt.value ?? '')
          }))}
          onChange={val => setConfValue(confKey, val)}
          singleSelect
          closeOnSelect
        />
        <button
          onClick={() => onRefresh(setPowerCouponsConf, setIsLoading)}
          className="icn-btn sh-sm ml-2 mr-2 tooltip"
          style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
          type="button"
          disabled={isLoading}>
          &#x21BB;
        </button>
      </div>
    </>
  )

  const action = powerCouponsConf?.mainAction

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="mainAction"
          defaultValue={powerCouponsConf?.mainAction ?? null}
          className="mt-2 w-5"
          onChange={value => handleMainAction(value)}
          options={modules?.map(act => ({
            label: checkIsPro(isPro, act.is_pro) ? act.label : getProLabel(act.label),
            value: act.name,
            disabled: !checkIsPro(isPro, act.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {COUPON_PICKER_ACTIONS.includes(action) &&
        recordSelect(
          __('Coupon:', 'bit-integrations'),
          'selectedCoupon',
          'allCoupons',
          refreshPowerCouponsCoupons
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

      {action && powerCouponsConf?.powerCouponsFields?.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Power Coupons Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {powerCouponsConf?.field_map?.map((itm, i) => (
            <PowerCouponsFieldMap
              key={`power-coupons-m-${i + 9}`}
              i={i}
              field={itm}
              powerCouponsConf={powerCouponsConf}
              formFields={formFields}
              setPowerCouponsConf={setPowerCouponsConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() =>
                addFieldMap(powerCouponsConf.field_map.length, powerCouponsConf, setPowerCouponsConf)
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
