import { useEffect } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import TableCheckBox from '../../Utilities/TableCheckBox'
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

const DISCOUNT_TYPE_OPTIONS = [
  { label: __('Percentage discount', 'bit-integrations'), value: 'percent' },
  { label: __('Fixed cart discount', 'bit-integrations'), value: 'fixed_cart' },
  { label: __('Fixed product discount', 'bit-integrations'), value: 'fixed_product' }
]

const UPDATE_DISCOUNT_TYPE_OPTIONS = [
  { label: __('No Change', 'bit-integrations'), value: '' },
  ...DISCOUNT_TYPE_OPTIONS
]

const YES_NO_OPTIONS = [
  { label: __('Yes', 'bit-integrations'), value: 'yes' },
  { label: __('No', 'bit-integrations'), value: 'no' }
]

const UPDATE_YES_NO_OPTIONS = [{ label: __('No Change', 'bit-integrations'), value: '' }, ...YES_NO_OPTIONS]

const BOOLEAN_UTILITY_FIELDS = [
  { key: 'free_shipping', label: __('Free Shipping', 'bit-integrations') },
  { key: 'individual_use', label: __('Individual Use Only', 'bit-integrations') },
  { key: 'exclude_sale_items', label: __('Exclude Sale Items', 'bit-integrations') },
  { key: 'auto_apply', label: __('Auto Apply', 'bit-integrations') },
  { key: 'show_in_slideout', label: __('Show in Slideout', 'bit-integrations') },
  { key: 'rules_enabled', label: __('Rules Enabled', 'bit-integrations') }
]

const ACTION_UTILITY_KEYS = {
  create_coupon: ['discount_type', ...BOOLEAN_UTILITY_FIELDS.map(field => field.key)],
  update_coupon: ['discount_type', ...BOOLEAN_UTILITY_FIELDS.map(field => field.key)],
  delete_coupon: ['permanent_delete'],
  toggle_auto_apply: ['enabled'],
  toggle_show_in_slideout: ['enabled'],
  toggle_rules: ['enabled']
}

const ACTION_UTILITY_DEFAULTS = {
  create_coupon: {
    discount_type: 'percent',
    free_shipping: false,
    individual_use: false,
    exclude_sale_items: false,
    auto_apply: false,
    show_in_slideout: false,
    rules_enabled: false
  },
  update_coupon: {
    discount_type: '',
    free_shipping: '',
    individual_use: '',
    exclude_sale_items: '',
    auto_apply: '',
    show_in_slideout: '',
    rules_enabled: ''
  },
  delete_coupon: {
    permanent_delete: false
  },
  toggle_auto_apply: {
    enabled: 'yes'
  },
  toggle_show_in_slideout: {
    enabled: 'yes'
  },
  toggle_rules: {
    enabled: 'yes'
  }
}

const TRUE_VALUES = ['1', 'yes', 'true', 'on', 'enabled']
const FALSE_VALUES = ['0', 'no', 'false', 'off', 'disabled']

const getUtilityDefaults = action => ({ ...(ACTION_UTILITY_DEFAULTS[action] || {}) })

const normalizeBooleanOption = value => {
  const normalizedValue = String(value ?? '')
    .trim()
    .toLowerCase()

  if (TRUE_VALUES.includes(normalizedValue)) {
    return 'yes'
  }

  if (FALSE_VALUES.includes(normalizedValue)) {
    return 'no'
  }

  return ''
}

const normalizeLegacyUtilityValue = (action, key, value) => {
  if (key === 'discount_type') {
    const normalizedValue = String(value ?? '')
      .trim()
      .toLowerCase()

    if (DISCOUNT_TYPE_OPTIONS.some(option => option.value === normalizedValue)) {
      return normalizedValue
    }

    return action === 'create_coupon' ? ACTION_UTILITY_DEFAULTS.create_coupon.discount_type : ''
  }

  const booleanValue = normalizeBooleanOption(value)

  if (action === 'create_coupon' || key === 'permanent_delete') {
    return booleanValue === 'yes'
  }

  return booleanValue
}

const normalizeUtilities = (action, utilities, fieldMap) => {
  const utilityKeys = ACTION_UTILITY_KEYS[action] || []
  const normalizedUtilities = getUtilityDefaults(action)
  const currentUtilities = utilities || {}
  const mappedFields = fieldMap || []

  utilityKeys.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(currentUtilities, key)) {
      normalizedUtilities[key] = normalizeLegacyUtilityValue(action, key, currentUtilities[key])
    }
  })

  mappedFields.forEach(mappedField => {
    const key = mappedField?.powerCouponsField

    if (
      !utilityKeys.includes(key) ||
      mappedField?.formField !== 'custom' ||
      typeof mappedField?.customValue === 'undefined'
    ) {
      return
    }

    normalizedUtilities[key] = normalizeLegacyUtilityValue(action, key, mappedField.customValue)
  })

  return normalizedUtilities
}

const normalizeFieldMap = (fieldMap, fields) => {
  const allowedFieldKeys = fields.map(field => field.key)
  const mappedFields = (fieldMap || []).filter(
    field => !field.powerCouponsField || allowedFieldKeys.includes(field.powerCouponsField)
  )

  return mappedFields.length ? mappedFields : generateMappedField(fields)
}

export default function PowerCouponsIntegLayout({
  formFields,
  powerCouponsConf,
  setPowerCouponsConf,
  isLoading,
  setIsLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi
  const action = powerCouponsConf?.mainAction

  useEffect(() => {
    if (!action || !FIELD_MAP[action]) {
      return
    }

    const normalizedFields = FIELD_MAP[action]
    const normalizedFieldMap = normalizeFieldMap(powerCouponsConf?.field_map, normalizedFields)
    const normalizedUtilities = normalizeUtilities(
      action,
      powerCouponsConf?.utilities,
      powerCouponsConf?.field_map
    )
    const fieldsChanged =
      JSON.stringify(powerCouponsConf?.powerCouponsFields || []) !== JSON.stringify(normalizedFields)
    const fieldMapChanged =
      JSON.stringify(powerCouponsConf?.field_map || []) !== JSON.stringify(normalizedFieldMap)
    const utilitiesChanged =
      JSON.stringify(powerCouponsConf?.utilities || {}) !== JSON.stringify(normalizedUtilities)

    if (!fieldsChanged && !fieldMapChanged && !utilitiesChanged) {
      return
    }

    setPowerCouponsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.powerCouponsFields = normalizedFields
        draftConf.field_map = normalizedFieldMap
        draftConf.utilities = normalizedUtilities
      })
    )
  }, [
    action,
    powerCouponsConf?.field_map,
    powerCouponsConf?.powerCouponsFields,
    powerCouponsConf?.utilities,
    setPowerCouponsConf
  ])

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
        draftConf.utilities = getUtilityDefaults(value)
        draftConf.selectedCoupon = ''
      })
    )

    if (COUPON_PICKER_ACTIONS.includes(value)) {
      refreshPowerCouponsCoupons(setPowerCouponsConf, setIsLoading)
    }
  }

  const setUtilityValue = (key, value) => {
    setPowerCouponsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.utilities = draftConf.utilities || {}
        draftConf.utilities[key] = value
      })
    )
  }

  const utilityValue = key => powerCouponsConf?.utilities?.[key]

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

  const renderUtilitySelect = (label, confKey, options) => (
    <div key={confKey} className="flx mt-4">
      <b className="wdt-200 d-in-b">{label}</b>
      <select
        className="btcd-paper-inp w-5"
        name={confKey}
        value={utilityValue(confKey) ?? ''}
        onChange={event => setUtilityValue(confKey, event.target.value)}>
        {options.map(option => (
          <option key={`${confKey}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  const renderUtilityCheckbox = ({ key, label }) => (
    <TableCheckBox
      key={key}
      checked={Boolean(utilityValue(key))}
      onChange={event => setUtilityValue(key, event.target.checked)}
      className="wdt-200 mt-4 mr-2"
      value={key}
      title={label}
    />
  )

  const renderUtilities = () => {
    if (action === 'create_coupon') {
      return (
        <div className="mt-4">
          <b className="wdt-100">{__('Options', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          {renderUtilitySelect(__('Discount Type:', 'bit-integrations'), 'discount_type', DISCOUNT_TYPE_OPTIONS)}
          <div className="pos-rel d-flx w-10 flx-wrp">
            {BOOLEAN_UTILITY_FIELDS.map(field => renderUtilityCheckbox(field))}
          </div>
        </div>
      )
    }

    if (action === 'update_coupon') {
      return (
        <div className="mt-4">
          <b className="wdt-100">{__('Options', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          {renderUtilitySelect(
            __('Discount Type:', 'bit-integrations'),
            'discount_type',
            UPDATE_DISCOUNT_TYPE_OPTIONS
          )}
          {BOOLEAN_UTILITY_FIELDS.map(field =>
            renderUtilitySelect(field.label, field.key, UPDATE_YES_NO_OPTIONS)
          )}
        </div>
      )
    }

    if (action === 'delete_coupon') {
      return (
        <div className="mt-4">
          <b className="wdt-100">{__('Options', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <div className="pos-rel d-flx w-10">
            {renderUtilityCheckbox({
              key: 'permanent_delete',
              label: __('Permanently Delete', 'bit-integrations')
            })}
          </div>
        </div>
      )
    }

    if (['toggle_auto_apply', 'toggle_show_in_slideout', 'toggle_rules'].includes(action)) {
      return (
        <div className="mt-4">
          <b className="wdt-100">{__('Options', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          {renderUtilitySelect(__('Enabled:', 'bit-integrations'), 'enabled', YES_NO_OPTIONS)}
        </div>
      )
    }

    return null
  }

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

      {action && renderUtilities()}

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
