/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-mixed-operators */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import { useEffect, useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import WcLineItemsFieldMap from './WcLineItemsFieldMap'
import WooCommerceActions from './WooCommerceActions'
import { refreshFields } from './WooCommerceCommonFunc'
import WooCommerceFieldMap from './WooCommerceFieldMap'
import WooCommerceModuleOptions from './WooCommerceModuleOptions'
import { moduleFields, moduleGroups, moduleUtilities } from './staticData'
import Note from '../../Utilities/Note'

export default function WooCommerceIntegLayout({
  formFields,
  handleInput,
  wcConf,
  setWcConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const addFieldMap = (indx, uploadFields, mod = '') => {
    const newConf = { ...wcConf }
    if (mod === 'line_item') {
      newConf.line_item.field_map.splice(indx, 0, {})
      setWcConf(newConf)
    } else {
      uploadFields
        ? newConf[module]?.upload_field_map.splice(indx, 0, {})
        : newConf[module].field_map.splice(indx, 0, {})
    }

    setWcConf(newConf)
  }

  const [active, setActive] = useState({ customer: false, order: true })
  const [module, setModule] = useState(wcConf.module)
  const { isPro } = useRecoilValue($appConfigState)
  const hasOptionalFields = !moduleFields[module] || moduleFields[module].some(field => !field.required)
  const moduleOptions = moduleGroups.map(group => ({
    type: 'group',
    title: group.title,
    childs: group.modules.map(item => ({
      label: checkIsPro(isPro, item.is_pro) ? item.label : getProLabel(item.label),
      title: item.label,
      value: item.name,
      disabled: !checkIsPro(isPro, item.is_pro)
    }))
  }))

  useEffect(() => {
    setModule(wcConf.module)
  }, [wcConf?.module])

  const handleTabChange = type => {
    setModule(type)
    setActive({ [type]: true, [type === 'customer' ? 'order' : 'customer']: false })
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Module:', 'bit-integrations')}</b>
        <MultiSelect
          defaultValue={wcConf.module ?? null}
          className="btcd-paper-drpdwn w-5"
          options={moduleOptions}
          onChange={value => handleInput({ target: { name: 'module', value } })}
          placeholder={__('Select Module', 'bit-integrations')}
          singleSelect
          closeOnSelect
        />
      </div>
      <WooCommerceModuleOptions
        wcConf={wcConf}
        setWcConf={setWcConf}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setSnackbar={setSnackbar}
      />
      <br />
      <br />

      {wcConf?.taskNote && <Note note={wcConf?.taskNote} />}
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

      {wcConf.module === 'order' && (
        <div className="tab-box">
          <span
            className={`tab-item ${active.order && 'active'}`}
            onClick={() => handleTabChange('order')}>
            Order
          </span>
          <span
            className={`tab-item ${active.customer && 'active'}`}
            onClick={() => handleTabChange('customer')}>
            Customer
          </span>
        </div>
      )}

      {((wcConf.default?.fields?.[module]?.fields && module !== 'changestatus') ||
        (wcConf.default?.fields?.[module]?.fields &&
          module === 'changestatus' &&
          wcConf?.filterstatus !== 'email' &&
          wcConf?.filterstatus) ||
        (wcConf.default?.fields?.[module]?.fields &&
          module === 'changestatus' &&
          wcConf.filterstatus === 'email' &&
          wcConf?.orderchange)) && (
        <>
          <div className="mt-4">
            <b className="wdt-100">{__('Map Fields', 'bit-integrations')}</b>
            {!moduleFields[module] && (
              <button
                onClick={() => refreshFields(wcConf, setWcConf, setIsLoading, setSnackbar)}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh fields', 'bit-integrations')}'` }}
                type="button"
                disabled={isLoading}>
                &#x21BB;
              </button>
            )}
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('WooCommerce Fields', 'bit-integrations')}</b>
            </div>
          </div>
          {wcConf[module].field_map.map((itm, i) => (
            <WooCommerceFieldMap
              key={`wc-m-${i + 9}`}
              i={i}
              field={itm}
              wcConf={wcConf}
              formFields={formFields}
              setWcConf={setWcConf}
              module={module}
            />
          ))}
          {hasOptionalFields && (
            <div className="txt-center btcbi-field-map-button mt-2">
              <button
                onClick={() => addFieldMap(wcConf[module].field_map.length)}
                className="icn-btn sh-sm"
                type="button">
                +
              </button>
            </div>
          )}
        </>
      )}

      {moduleUtilities[wcConf.module] && (
        <div className="mt-4">
          <b className="wdt-100">{__('Utilities', 'bit-integrations')}</b>
          <div className="btcd-hr mt-1" />
          <WooCommerceActions wcConf={wcConf} setWcConf={setWcConf} />
        </div>
      )}

      {wcConf.default?.fields?.[module]?.uploadFields && module === 'product' && (
        <>
          <div className="mt-4">
            <b className="wdt-100">{__('Map File Upload Fields', 'bit-integrations')}</b>
            <button
              onClick={() => refreshFields(wcConf, setWcConf, setIsLoading, setSnackbar)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{ '--tooltip-txt': `'${__('Refresh fields', 'bit-integrations')}'` }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('WooCommerce Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {wcConf[module].upload_field_map.map((itm, i) => (
            <WooCommerceFieldMap
              key={`wc-m-${i + 9}`}
              i={i}
              field={itm}
              wcConf={wcConf}
              formFields={formFields}
              setWcConf={setWcConf}
              uploadFields
              module={module}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(wcConf[module].field_map.length, true)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </>
      )}

      {module === 'order' && (
        <>
          <div className="mt-4">
            <b className="wdt-100">{__('Map Line Items Fields', 'bit-integrations')}</b>
          </div>
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('WooCommerce Line Items Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {wcConf?.line_item?.field_map.map((itm, i) => (
            <WcLineItemsFieldMap
              key={`wc-m-${i + 9}`}
              i={i}
              field={itm}
              wcConf={wcConf}
              formFields={formFields}
              setWcConf={setWcConf}
            />
          ))}
          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(wcConf.line_item.field_map.length, false, 'line_item')}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
        </>
      )}
    </>
  )
}
