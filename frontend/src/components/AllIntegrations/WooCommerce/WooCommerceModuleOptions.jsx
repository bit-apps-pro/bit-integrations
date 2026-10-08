import { create } from 'mutative'
import { useEffect, useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import bitsFetch from '../../../Utils/bitsFetch'
import { __ } from '../../../Utils/i18nwrap'
import { moduleSelects } from './staticData'

export function WooCommerceModuleSelects({ wcConf, setWcConf, setSnackbar }) {
  const [loadingSources, setLoadingSources] = useState({})
  const [sourceOptions, setSourceOptions] = useState({})
  const selects = moduleSelects[wcConf?.module] || []

  const loadOptions = source => {
    setLoadingSources(prev => ({ ...prev, [source]: true }))
    bitsFetch({ type: source }, 'wc_refresh_options')
      .then(result => {
        if (result?.success) {
          setSourceOptions(prev => ({ ...prev, [source]: result.data }))
        } else {
          setSnackbar?.({
            show: true,
            msg: __('Could not load the list. Try the refresh button.', 'bit-integrations')
          })
        }
      })
      .catch(() =>
        setSnackbar?.({
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
  }, [wcConf?.module])

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

  if (!selects.length) {
    return null
  }

  const optionalPlaceholder = wcConf.module.startsWith('update_')
    ? __('Keep current', 'bit-integrations')
    : __('Optional', 'bit-integrations')

  return selects.map(select => {
    const isLoaded = !select.source || !!sourceOptions[select.source]

    return (
      <div key={`${wcConf.module}-${select.key}`} className="flx mt-3">
        <b className="wdt-200 d-in-b">
          {select.label}
          {select.required && ' *'}
        </b>
        <MultiSelect
          key={isLoaded ? 'loaded' : 'loading'}
          title={select.key}
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
  })
}
