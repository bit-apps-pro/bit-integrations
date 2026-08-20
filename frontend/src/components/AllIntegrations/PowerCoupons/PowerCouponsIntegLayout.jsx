import { useEffect } from 'react'
import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from '../IntegrationHelpers/IntegrationHelpers'
import PowerCouponsActions from './PowerCouponsActions'
import { generateMappedField } from './PowerCouponsCommonFunc'
import PowerCouponsFieldMap from './PowerCouponsFieldMap'
import {
  actionUtilityDefaults,
  actionUtilityKeys,
  CouponCreateFields,
  CouponDeleteFields,
  CouponUpdateFields,
  discountTypeOptions,
  getUtilityDefaults,
  modules,
  ToggleFields
} from './staticData'

const FIELD_MAP = {
  create_coupon: CouponCreateFields,
  update_coupon: CouponUpdateFields,
  delete_coupon: CouponDeleteFields,
  toggle_auto_apply: ToggleFields,
  toggle_show_in_slideout: ToggleFields
}

const TRUE_VALUES = ['1', 'yes', 'true', 'on', 'enabled']
const FALSE_VALUES = ['0', 'no', 'false', 'off', 'disabled']

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

    if (discountTypeOptions.some(option => option.value === normalizedValue)) {
      return normalizedValue
    }

    return action === 'create_coupon' ? actionUtilityDefaults.create_coupon.discount_type : ''
  }

  const booleanValue = normalizeBooleanOption(value)

  if (action === 'create_coupon' || key === 'permanent_delete') {
    return booleanValue === 'yes'
  }

  return booleanValue
}

const normalizeUtilities = (action, utilities, fieldMap) => {
  const utilityKeys = actionUtilityKeys[action] || []
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
  const requiredFields = fields.filter(field => field.required === true)
  const requiredFieldKeys = requiredFields.map(field => field.key)
  const mappedFields = (fieldMap || []).filter(
    field => field && (!field.powerCouponsField || allowedFieldKeys.includes(field.powerCouponsField))
  )

  if (!mappedFields.length) {
    return generateMappedField(fields)
  }

  const requiredFieldMap = requiredFields.map(field => {
    const mappedField = mappedFields.find(item => item.powerCouponsField === field.key)

    return mappedField
      ? { ...mappedField, powerCouponsField: field.key }
      : { formField: '', powerCouponsField: field.key }
  })
  const optionalFieldMap = mappedFields.filter(
    field => !requiredFieldKeys.includes(field.powerCouponsField)
  )

  return [...requiredFieldMap, ...optionalFieldMap]
}

export default function PowerCouponsIntegLayout({
  formFields,
  powerCouponsConf,
  setPowerCouponsConf,
  isLoading
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi
  const action = powerCouponsConf?.mainAction

  useEffect(() => {
    if (!action || !FIELD_MAP[action]) {
      return
    }

    setPowerCouponsConf(prevConf =>
      create(prevConf, draftConf => {
        const normalizedFields = FIELD_MAP[action]
        const normalizedFieldMap = normalizeFieldMap(draftConf.field_map, normalizedFields)
        const normalizedUtilities = normalizeUtilities(action, draftConf.utilities, draftConf.field_map)
        const fieldsChanged =
          JSON.stringify(draftConf.powerCouponsFields || []) !== JSON.stringify(normalizedFields)
        const fieldMapChanged =
          JSON.stringify(draftConf.field_map || []) !== JSON.stringify(normalizedFieldMap)
        const utilitiesChanged =
          JSON.stringify(draftConf.utilities || {}) !== JSON.stringify(normalizedUtilities)

        if (!fieldsChanged && !fieldMapChanged && !utilitiesChanged) {
          return
        }

        draftConf.powerCouponsFields = normalizedFields
        draftConf.field_map = normalizedFieldMap
        draftConf.utilities = normalizedUtilities
      })
    )
  }, [action, setPowerCouponsConf])

  const handleMainAction = value => {
    setPowerCouponsConf(prevConf =>
      create(prevConf, draftConf => {
        draftConf.mainAction = value
        draftConf.powerCouponsFields = FIELD_MAP[value] || []
        draftConf.field_map = generateMappedField(draftConf.powerCouponsFields)
        draftConf.utilities = getUtilityDefaults(value)
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

      {action && powerCouponsConf?.powerCouponsFields?.length > 0 && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <PowerCouponsActions
            powerCouponsConf={powerCouponsConf}
            setPowerCouponsConf={setPowerCouponsConf}
          />
        </div>
      )}
    </>
  )
}
