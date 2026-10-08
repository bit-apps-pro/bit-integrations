import { create } from 'mutative'
import { useEffect, useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { getAllSubscriptionsProducts } from './WooCommerceCommonFunc'
import {
  filterStatus,
  filterStatusFields,
  moduleSelects,
  orderChange,
  orderChangeFields
} from './staticData'

const toRequiredRows = fieldKeys =>
  fieldKeys.map(wcField => ({ formField: '', wcField, required: true }))

export default function WooCommerceModuleOptions({
  wcConf,
  setWcConf,
  isLoading,
  setIsLoading,
  setSnackbar
}) {
  const [loadingSources, setLoadingSources] = useState({})
  const [sourceOptions, setSourceOptions] = useState({})
  const { module } = wcConf
  const selects = moduleSelects[module] || []

  const loadOptions = source => {
    setLoadingSources(prev => ({ ...prev, [source]: true }))
    bitsFetch({ type: source }, 'wc_refresh_options')
      .then(result => {
        if (!result?.success) {
          throw new Error(result?.data)
        }

        setSourceOptions(prev => ({ ...prev, [source]: result.data }))
      })
      .catch(() =>
        setSnackbar({
          show: true,
          msg: __('Could not load the list. Try the refresh button.', 'bit-integrations')
        })
      )
      .finally(() => setLoadingSources(prev => ({ ...prev, [source]: false })))
  }

  useEffect(() => {
    const sources = [...new Set(selects.map(select => select.source).filter(Boolean))]
    sources.forEach(source => {
      if (!sourceOptions[source]) {
        loadOptions(source)
      }
    })
  }, [module])

  const setSelect = (key, value) =>
    setWcConf(prevConf =>
      create(prevConf, draftConf => {
        if (!draftConf.selects) draftConf.selects = {}
        if (value) {
          draftConf.selects[key] = value
        } else {
          delete draftConf.selects[key]
        }
      })
    )

  const handleFilter = e => {
    const { value } = e.target
    const newConf = { ...wcConf }
    newConf.changestatus.field_map = toRequiredRows(
      filterStatusFields[value] ?? filterStatusFields['date-range']
    )
    if (value === 'email' && newConf?.orderchange) delete newConf.orderchange
    newConf.filterstatus = value
    setWcConf(newConf)
  }

  const handleOrderChange = e => {
    const { value } = e.target
    const newConf = { ...wcConf }
    newConf.changestatus.field_map = toRequiredRows(
      orderChangeFields[value] ?? orderChangeFields['latest-order']
    )
    newConf.orderchange = value
    setWcConf(newConf)
  }

  const setProductId = val => {
    const newConf = { ...wcConf }
    if (val !== '') {
      newConf.productId = val
    } else {
      delete newConf.productId
    }
    setWcConf(newConf)
  }

  const optionalPlaceholder = module?.startsWith('update_')
    ? __('Keep current', 'bit-integrations')
    : __('Optional', 'bit-integrations')

  return (
    <>
      {selects.map(select => {
        const isLoaded = !select.source || !!sourceOptions[select.source]

        return (
          <div key={`${module}-${select.key}`} className="flx mt-3">
            <b className="wdt-200 d-in-b">
              {select.label}
              {select.required && ' *'}
            </b>
            <MultiSelect
              key={isLoaded ? 'loaded' : 'loading'}
              defaultValue={wcConf?.selects?.[select.key] ?? null}
              className="btcd-paper-drpdwn w-5"
              options={select.options ?? sourceOptions[select.source] ?? []}
              onChange={value => setSelect(select.key, value)}
              placeholder={
                isLoaded
                  ? (select.placeholder ??
                    (select.required ? __('Select...', 'bit-integrations') : optionalPlaceholder))
                  : __('Loading...', 'bit-integrations')
              }
              singleSelect={!select.multi}
              closeOnSelect={!select.multi}
            />
            {select.source && (
              <button
                onClick={() => loadOptions(select.source)}
                className="icn-btn sh-sm ml-2 mr-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh list', 'bit-integrations')}'` }}
                type="button"
                disabled={!!loadingSources[select.source]}>
                &#x21BB;
              </button>
            )}
          </div>
        )
      })}

      {module === 'changestatus' && wcConf.default?.fields?.changestatus?.fields && (
        <>
          <br />
          <b className="wdt-200 d-in-b">{__('Filter:', 'bit-integrations')}</b>
          <select
            onChange={handleFilter}
            name="filterstatus"
            value={wcConf.filterstatus}
            className="btcd-paper-inp w-5">
            <option value="">{__('Select Filter Type', 'bit-integrations')}</option>
            {filterStatus.map(f => (
              <option key={`ff-rm-${f.name}`} value={f.name}>
                {f.label}
              </option>
            ))}
          </select>
          <br />
        </>
      )}

      {module === 'changestatus' && wcConf.filterstatus === 'email' && (
        <>
          <br />
          <b className="wdt-200 d-in-b">{__('Order Change:', 'bit-integrations')}</b>
          <select
            onChange={handleOrderChange}
            name="orderchange"
            value={wcConf?.orderchange}
            className="btcd-paper-inp w-5">
            <option value="">{__('Select Order Change Type', 'bit-integrations')}</option>
            {orderChange.map(f => (
              <option key={`ff-rm-${f.name}`} value={f.name}>
                {f.label}
              </option>
            ))}
          </select>
          <br />
        </>
      )}

      {module === 'cancelSubscription' && (
        <>
          <br />
          <div className="flx mt-1">
            <b className="wdt-200 d-in-b">{__('Select Product:', 'bit-integrations')}</b>
            <MultiSelect
              className="w-5"
              defaultValue={wcConf?.productId}
              options={
                wcConf?.default?.allSubscriptionProducts &&
                wcConf.default.allSubscriptionProducts.map(item => ({
                  label: item.product_name,
                  value: item.product_id
                }))
              }
              onChange={setProductId}
              singleSelect
            />
            <button
              onClick={() => getAllSubscriptionsProducts(wcConf, setWcConf, setIsLoading, setSnackbar)}
              className="icn-btn sh-sm ml-2 mr-2 tooltip"
              style={{
                '--tooltip-txt': `'${__('Fetch All Subscription product', 'bit-integrations')}'`
              }}
              type="button"
              disabled={isLoading}>
              &#x21BB;
            </button>
          </div>
        </>
      )}
    </>
  )
}
