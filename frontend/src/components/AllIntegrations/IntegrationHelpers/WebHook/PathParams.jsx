import { useEffect, useMemo } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import TrashIcn from '../../../../Icons/TrashIcn'
import { __ } from '../../../../Utils/i18nwrap'
import Button from '../../../Utilities/Button'
import Note from '../../../Utilities/Note'

// matches `{id}` placeholders but keeps `${field}` smart tags out of the way
const PLACEHOLDER_PATTERN = '(\\$?)\\{([^{}\\s/?#]+)\\}'

export const getPathPlaceholders = url => {
  if (!url) return []
  // only the path is resolved server side, so scheme/host placeholders are ignored here too
  const withoutQuery = String(url).split('#')[0].split('?')[0]
  const withoutScheme = withoutQuery.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
  const slashIndex = withoutScheme.indexOf('/')
  const path = slashIndex === -1 ? '' : withoutScheme.slice(slashIndex)
  if (!path) return []
  const regex = new RegExp(PLACEHOLDER_PATTERN, 'g')
  const names = []
  let match = regex.exec(path)
  while (match !== null) {
    if (match[1] !== '$' && !names.includes(match[2])) names.push(match[2])
    match = regex.exec(path)
  }
  return names
}

function PathParams({ formFields, webHooks, setWebHooks, isInfo, setTab }) {
  useEffect(() => {
    setTab(2)
  }, [])

  const placeholders = useMemo(() => getPathPlaceholders(webHooks?.url), [webHooks?.url])

  // keep pathParams in sync with the placeholders currently present in the url
  useEffect(() => {
    const existing = Array.isArray(webHooks?.pathParams) ? webHooks.pathParams : []
    const synced = placeholders.map(
      key => existing.find(param => param?.key === key) || { key, value: '' }
    )
    const isSame =
      existing.length === synced.length && synced.every((param, i) => existing[i]?.key === param.key)

    if (!isSame) setWebHooks({ ...webHooks, pathParams: synced })
  }, [placeholders, webHooks?.pathParams])

  const paramValue = key =>
    (Array.isArray(webHooks?.pathParams) ? webHooks.pathParams : []).find(param => param?.key === key)
      ?.value || ''

  const setParamValue = (key, value) => {
    const existing = Array.isArray(webHooks?.pathParams) ? webHooks.pathParams : []
    const pathParams = existing.some(param => param?.key === key)
      ? existing.map(param => (param?.key === key ? { ...param, value } : param))
      : [...existing, { key, value }]

    setWebHooks({ ...webHooks, pathParams })
  }

  const note = `${__(
    'Write a variable like <b>{id}</b> anywhere in the url path (e.g. <b>https://api.example.com/v1/users/{id}/orders</b>) and map it to a trigger field here. Values are url-encoded before the request, so a mapped value can never add extra path segments. If a mapped value is empty at run time the request is skipped and an error is logged.',
    'bit-integrations'
  )}`

  return (
    <div className="mt-2">
      <div className="f-m">{__('Url Path Variables:', 'bit-integrations')}</div>

      {placeholders.length === 0 ? (
        <Note note={note} />
      ) : (
        <div className="btcd-param-t-wrp mt-1">
          <div className="btcd-param-t">
            <div className="tr">
              <div className="td">{__('Variable', 'bit-integrations')}</div>
              <div className="td">{__('Value', 'bit-integrations')}</div>
            </div>
            {placeholders.map((key, childindx) => (
              <div className="tr" key={`pp-${key}-${childindx * 3}`}>
                <div className="td">
                  <input
                    className="btcd-paper-inp p-i-sm"
                    type="text"
                    value={`{${key}}`}
                    readOnly
                    disabled
                  />
                </div>
                <div className="td">
                  <input
                    className="btcd-paper-inp p-i-sm"
                    onChange={e => setParamValue(key, e.target.value)}
                    type="text"
                    value={paramValue(key)}
                    disabled={isInfo}
                  />
                </div>
                {!isInfo && (
                  <div className="flx p-atn">
                    <Button onClick={() => setParamValue(key, '')} icn>
                      <TrashIcn size={16} />
                    </Button>
                    <MultiSelect
                      options={formFields.map(f => ({ label: f.label, value: `\${${f.name}}` }))}
                      className="btcd-paper-drpdwn wdt-200 ml-2"
                      singleSelect
                      onChange={val => setParamValue(key, val)}
                      defaultValue={paramValue(key)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PathParams
