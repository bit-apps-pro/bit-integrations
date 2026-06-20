import { create } from 'mutative'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import { useRecoilValue } from 'recoil'
import { $appConfigState } from '../../../GlobalStates'
import { __ } from '../../../Utils/i18nwrap'
import Loader from '../../Loaders/Loader'
import Note from '../../Utilities/Note'
import { checkIsPro, getProLabel } from '../../Utilities/ProUtilHelpers'
import { addFieldMap } from './IntegrationHelpers'
import {
  actionNotes,
  actionRequirements,
  dropdownMeta,
  modules,
  privacyOptions,
  trackTypeOptions,
  VimeoStaticData
} from './staticData'
import { handleMainAction, refreshDropdown } from './VimeoCommonFunc'
import VimeoFieldMap from './VimeoFieldMap'

export default function VimeoIntegLayout({
  formFields,
  vimeoConf,
  setVimeoConf,
  loading,
  setLoading,
  setSnackbar
}) {
  const btcbi = useRecoilValue($appConfigState)
  const { isPro } = btcbi

  const action = vimeoConf?.mainAction
  const req = actionRequirements[action] || { dropdowns: [], selects: [] }
  const hasFieldMap = (VimeoStaticData[action] || []).length > 0
  const isFetching = loading.videos || loading.showcases || loading.folders || loading.channels

  const setField = (key, value) => {
    setVimeoConf(prev =>
      create(prev, draft => {
        draft[key] = value
      })
    )
  }

  return (
    <>
      <br />
      <div className="flx">
        <b className="wdt-200 d-in-b">{__('Action:', 'bit-integrations')}</b>
        <MultiSelect
          title="action"
          defaultValue={action || ''}
          className="mt-2 w-5"
          onChange={value =>
            handleMainAction(value, vimeoConf, setVimeoConf, loading, setLoading, setSnackbar)
          }
          options={modules.map(m => ({
            label: checkIsPro(isPro, m.is_pro) ? m.label : getProLabel(m.label),
            value: m.name,
            disabled: !checkIsPro(isPro, m.is_pro)
          }))}
          singleSelect
          closeOnSelect
        />
      </div>

      {action &&
        req.dropdowns.map(type => {
          const meta = dropdownMeta[type]
          const list = vimeoConf?.default?.[meta.dataKey] || []
          return (
            <div className="mt-4 flx" key={type}>
              <b className="wdt-200 d-in-b">{`${meta.label}:`}</b>
              <MultiSelect
                className="w-5 d-in-b"
                defaultValue={vimeoConf?.[meta.confKey] || ''}
                options={list.map(item => ({ label: item.name, value: String(item.id) }))}
                onChange={value => setField(meta.confKey, value)}
                singleSelect
                closeOnSelect
              />
              <button
                onClick={() =>
                  refreshDropdown(type, vimeoConf, setVimeoConf, loading, setLoading, setSnackbar)
                }
                className="icn-btn sh-sm ml-2 tooltip"
                style={{ '--tooltip-txt': `'${__('Refresh', 'bit-integrations')}'` }}
                type="button"
                disabled={loading[meta.dataKey]}>
                &#x21BB;
              </button>
            </div>
          )
        })}

      {action && req.selects.includes('privacy') && (
        <div className="mt-4">
          <b className="wdt-200 d-in-b">{__('Privacy:', 'bit-integrations')}</b>
          <select
            className="btcd-paper-inp w-5"
            name="privacy"
            value={vimeoConf?.privacy || ''}
            onChange={e => setField('privacy', e.target.value)}>
            <option value="">{__('Default', 'bit-integrations')}</option>
            {privacyOptions.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {action && req.selects.includes('trackType') && (
        <div className="mt-4">
          <b className="wdt-200 d-in-b">{__('Track Type:', 'bit-integrations')}</b>
          <select
            className="btcd-paper-inp w-5"
            name="trackType"
            value={vimeoConf?.trackType || 'captions'}
            onChange={e => setField('trackType', e.target.value)}>
            {trackTypeOptions.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {isFetching && (
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

      {action && hasFieldMap && (
        <>
          <div className="mt-5">
            <b className="wdt-100">{__('Field Map', 'bit-integrations')}</b>
          </div>
          <br />
          <div className="btcd-hr mt-1" />
          <div className="flx flx-around mt-2 mb-2 btcbi-field-map-label">
            <div className="txt-dp">
              <b>{__('Form Fields', 'bit-integrations')}</b>
            </div>
            <div className="txt-dp">
              <b>{__('Vimeo Fields', 'bit-integrations')}</b>
            </div>
          </div>

          {vimeoConf?.field_map?.map((itm, i) => (
            <VimeoFieldMap
              key={`rp-m-${i + 9}`}
              i={i}
              field={itm}
              vimeoConf={vimeoConf}
              formFields={formFields}
              setVimeoConf={setVimeoConf}
            />
          ))}

          <div className="txt-center btcbi-field-map-button mt-2">
            <button
              onClick={() => addFieldMap(vimeoConf.field_map.length, vimeoConf, setVimeoConf)}
              className="icn-btn sh-sm"
              type="button">
              +
            </button>
          </div>
          {action && actionNotes[action] && (
            <div className="mt-3">
              <Note note={actionNotes[action]} />
            </div>
          )}
          <br />
          <br />
        </>
      )}
    </>
  )
}
